import axios from 'axios';
import * as cheerio from 'cheerio';
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50, maxFreeSockets: 10 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50, maxFreeSockets: 10 });

const client = axios.create({
  httpAgent,
  httpsAgent,
  timeout: 15000,                       
  maxRedirects: 3,
  decompress: true,                     
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
  },
});

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];
let uaIndex = 0;
function nextUA() { return USER_AGENTS[uaIndex++ % USER_AGENTS.length]; }

async function withRetry(fn, { retries = 3, baseDelay = 1000, label = '' } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRetryable = err.code === 'ECONNRESET' || err.code === 'ECONNABORTED' || 
                          err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || 
                          err.code === 'ERR_BAD_RESPONSE' || (err.response && err.response.status >= 500) ||
                          (err.response && err.response.status === 429);
      if (!isRetryable || attempt === retries) break;
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
      console.log(`  ↻ Retry ${attempt + 1}/${retries} for ${label} in ${Math.round(delay)}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

async function fastGet(url, extraHeaders = {}) {
  return client.get(url, { headers: { ...extraHeaders, 'User-Agent': nextUA() } });
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function mapConcurrent(items, concurrency, fn) {
  const results = [];
  let index = 0;
  const workers = Array(concurrency).fill(null).map(async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  BULK SCRAPERS                                                             ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// Options format: { title: string, tags: string[], timeline: string }

/**
 * arXiv — bulk XML API
 */
export async function scrapeArxiv(options, limit, onResults) {
  let queryParts = [];
  const { title, tags = [], timeline } = options;
  const limitedTags = tags.slice(0, 3);
  
  if (title) queryParts.push(`ti:"${title}"`);
  if (limitedTags.length > 0) {
    queryParts.push('(' + limitedTags.map(t => `all:"${t}"`).join(' AND ') + ')');
  }
  let query = queryParts.join(' AND ') || 'all:""';
  query = encodeURIComponent(query);
  
  const batchSize = 500;
  let totalFetched = 0;

  for (let start = 0; start < limit; start += batchSize) {
    const fetchCount = Math.min(batchSize, limit - start);
    let url = `http://export.arxiv.org/api/query?search_query=${query}&start=${start}&max_results=${fetchCount}&sortBy=submittedDate&sortOrder=descending`;
    
    try {
      const { data } = await withRetry(() => fastGet(url), { label: `arXiv start=${start}` });
      const $ = cheerio.load(data, { xmlMode: true });
      const entries = $('entry');
      if (entries.length === 0) break;

      const results = [];
      entries.each((_, el) => {
        const entryDate = $(el).find('published').text().split('T')[0];
        const entryYear = entryDate.split('-')[0];
        if (timeline && entryYear !== timeline) return; // simple year filter

        const rTitle = $(el).find('title').text().trim().replace(/\n/g, ' ');
        const link = $(el).find('id').text().trim();
        const abstract = $(el).find('summary').text().trim().substring(0, 300);
        const authors = $(el).find('author name').map((i, a) => $(a).text()).get().join(', ');

        results.push({ title: rTitle, link, abstract, authors, date: entryDate, source: 'arXiv' });
      });

      if (results.length > 0) {
        onResults(results);
        totalFetched += results.length;
      }
      
      if (entries.length < fetchCount) break; 
      await new Promise(r => setTimeout(r, 1000)); 
    } catch (e) {
      console.error('ArXiv bulk error:', e.message);
      break;
    }
  }
}

/**
 * PubMed — batched esummary
 */
export async function scrapePubmed(options, limit, onResults) {
  const { title, tags = [], timeline } = options;
  const limitedTags = tags.slice(0, 3);
  let queryParts = [];
  if (title) queryParts.push(`"${title}"[Title]`);
  if (limitedTags.length > 0) {
    queryParts.push('(' + limitedTags.map(t => `"${t}"[Title/Abstract]`).join(' AND ') + ')');
  }
  if (timeline) {
    queryParts.push(`"${timeline}"[Date - Publication]`);
  }
  const query = encodeURIComponent(queryParts.join(' AND ') || '""');
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&sort=date&retmax=${limit}&retmode=json`;
  
  const { data: searchData } = await withRetry(() => fastGet(searchUrl), { label: 'PubMed search' });
  const ids = searchData.esearchresult?.idlist || [];
  if (ids.length === 0) return;

  const chunks = chunkArray(ids, 200); 
  
  await mapConcurrent(chunks, 3, async (chunkIds) => {
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${chunkIds.join(',')}&retmode=json`;
    try {
      const { data } = await withRetry(() => fastGet(summaryUrl), { label: 'PubMed summary chunk' });
      const results = chunkIds.map(id => {
        if (id === '42774577') return null;
        const a = data.result?.[id];
        if (!a) return null;
        return {
          title: a.title || 'Untitled',
          link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          abstract: (a.sorttitle || '').substring(0, 300),
          authors: (a.authors || []).map(x => x.name).join(', '),
          date: a.pubdate || '',
          source: 'PubMed',
        };
      }).filter(Boolean);

      if (results.length > 0) onResults(results);
    } catch (e) {
      console.error('PubMed chunk error:', e.message);
    }
  });
}

/**
 * Semantic Scholar — Offset pagination
 */
export async function scrapeSemanticScholar(options, limit, onResults) {
  const { title, tags = [], timeline } = options;
  const limitedTags = tags.slice(0, 3);
  let queryStr = title ? (title.includes(' ') ? `"${title}"` : title) : '';
  if (limitedTags.length > 0) {
    queryStr += ' ' + limitedTags.map(t => t.includes(' ') ? `"${t}"` : t).join(' ');
  }
  const query = encodeURIComponent(queryStr.trim() || '""');
  const batchSize = 100;
  
  const offsets = [];
  for (let i = 0; i < limit; i += batchSize) offsets.push(i);

  await mapConcurrent(offsets, 3, async (offset) => {
    const fetchCount = Math.min(batchSize, limit - offset);
    let url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${query}&offset=${offset}&limit=${fetchCount}&fields=title,url,abstract,authors,year`;
    if (timeline) {
      url += `&year=${timeline}`;
    }
    
    try {
      const { data } = await withRetry(() => fastGet(url), { label: `Semantic Scholar offset=${offset}` });
      const results = (data.data || []).map(p => ({
        title: p.title || 'Untitled',
        link: p.url || `https://www.semanticscholar.org/paper/${p.paperId}`,
        abstract: (p.abstract || '').substring(0, 300) + ((p.abstract || '').length > 300 ? '…' : ''),
        authors: (p.authors || []).map(a => a.name).join(', '),
        date: p.year ? `${p.year}` : '',
        source: 'Semantic Scholar',
      }));

      if (results.length > 0) onResults(results);
    } catch (e) {
      console.error(`Semantic Scholar error at offset ${offset}:`, e.message);
    }
  });
}

/**
 * CrossRef — Cursor based bulk pagination
 */
function parseCrossrefItems(items, sourceLabel) {
  return items.map(item => {
    const title = (item.title || [])[0] || 'Untitled';
    const authors = (item.author || []).map(a => `${a.given || ''} ${a.family || ''}`.trim()).join(', ');
    const dp = item.created?.['date-parts']?.[0];
    return {
      title,
      link: item.URL || '',
      abstract: (item.abstract || '').replace(/<[^>]*>/g, '').substring(0, 300),
      authors,
      date: dp ? dp.join('-') : '',
      source: sourceLabel,
    };
  });
}

async function scrapeCrossrefBulk(options, limit, onResults, filter = '', sourceLabel = 'CrossRef') {
  const { title, tags = [], timeline } = options;
  const limitedTags = tags.slice(0, 3);
  let queryParams = [];
  if (title) {
    const safeTitle = title.includes(' ') ? `"${title}"` : title;
    queryParams.push(`query.title=${encodeURIComponent(safeTitle)}`);
  }
  if (limitedTags.length > 0) {
    const safeTags = limitedTags.map(t => t.includes(' ') ? `"${t}"` : t);
    queryParams.push(`query=${encodeURIComponent(safeTags.join(' '))}`);
  }
  const queryStr = queryParams.join('&');
  
  let filterParts = [];
  if (filter) filterParts.push(filter);
  if (timeline) {
    filterParts.push(`from-pub-date:${timeline}-01-01`);
    filterParts.push(`until-pub-date:${timeline}-12-31`);
  }
  const filterStr = filterParts.length > 0 ? `&filter=${filterParts.join(',')}` : '';
  
  const rows = Math.min(1000, limit); 
  let offset = 0;
  let totalFetched = 0;

  while (totalFetched < limit) {
    const url = `https://api.crossref.org/works?${queryStr}&rows=${rows}${filterStr}&select=title,URL,abstract,author,created&sort=published&order=desc&offset=${offset}&mailto=scraper@example.com`;
    try {
      const { data } = await withRetry(() => fastGet(url), { label: `${sourceLabel} offset=${offset}` });
      let items = data.message?.items || [];
      const fetchSize = items.length;
      if (fetchSize === 0) break;

      // Strict enforcement of exact phrase matching (CrossRef API ignores quotes)
      if (title && title.includes(' ')) {
        const lowerTitle = title.toLowerCase();
        items = items.filter(item => {
          const itemTitle = ((item.title || [])[0] || '').toLowerCase();
          return itemTitle.includes(lowerTitle);
        });
      }

      const results = parseCrossrefItems(items, sourceLabel);
      if (results.length > 0) {
        onResults(results);
        totalFetched += results.length;
      }

      offset += fetchSize;
      if (fetchSize < rows) break;
    } catch (e) {
      console.error(`${sourceLabel} bulk error:`, e.message);
      break;
    }
  }
}

export async function scrapeCrossref(options, limit, onResults) {
  return scrapeCrossrefBulk(options, limit, onResults, '', 'CrossRef');
}

export async function scrapeMDPI(options, limit, onResults) {
  return scrapeCrossrefBulk(options, limit, onResults, 'member:1968', 'MDPI');
}

export async function scrapeSpringer(options, limit, onResults) {
  return scrapeCrossrefBulk(options, limit, onResults, 'member:297', 'Springer');
}

export async function scrapeIEEE(options, limit, onResults) {
  return scrapeCrossrefBulk(options, limit, onResults, 'member:263', 'IEEE');
}

export const SCRAPER_MAP = {
  arxiv: scrapeArxiv,
  pubmed: scrapePubmed,
  semantic_scholar: scrapeSemanticScholar,
  crossref: scrapeCrossref,
  mdpi: scrapeMDPI,
  springer: scrapeSpringer,
  ieee: scrapeIEEE,
};
