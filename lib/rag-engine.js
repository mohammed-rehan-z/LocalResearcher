/**
 * Client-Side RAG Engine for Research Paper Analysis
 */
import { generateEmbedding, cosineSimilarity } from './embedding-service';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'what', 'who', 'how', 'when', 'where', 'why', 'do', 'does',
  'did', 'can', 'could', 'would', 'should', 'this', 'there', 'their'
]);

/**
 * Lightweight morphological stemmer for academic English terms
 * (e.g., "quantization" -> "quantiz", "embeddings" -> "embed", "evaluating" -> "evaluat").
 */
function stemToken(word) {
  if (!word || word.length <= 4) return word;
  return word
    .replace(/(?:ization|isation)$/i, "iz")
    .replace(/(?:ational|tional)$/i, "t")
    .replace(/(?:ments|ment|ness|ities|ity|ings|ing|ers|ies|ied|ed|ly|es|s)$/i, (m) => {
      if (m === "ies" || m === "ied") return "y";
      return "";
    });
}

/**
 * Clean and tokenize text (Stop words removed, with morphological stemming)
 * @param {string} text 
 * @returns {string[]}
 */
export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\-']/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token))
    .map(stemToken)
    .filter(token => token.length > 1);
}

/**
 * Extract adjacent content-word bigrams for phrase-level NLP matching.
 */
function extractBigrams(tokens) {
  const bigrams = new Set();
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.add(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return bigrams;
}

/**
 * Detect which section a chunk likely belongs to based on content signals
 */
function detectSectionFromContent(text) {
  const t = text.toLowerCase().slice(0, 200); // check start of chunk only
  if (/\babstract\b/.test(t)) return 'abstract';
  if (/\bintroduction\b/.test(t)) return 'introduction';
  if (/\bmethod|proposed|our approach|architecture\b/.test(t)) return 'methodology';
  if (/\bexperiment|evaluation|benchmark\b/.test(t)) return 'experiments';
  if (/\bresult|finding|performance|accuracy\b/.test(t)) return 'results';
  if (/\bdiscussion|limitation|future work\b/.test(t)) return 'discussion';
  if (/\bconclusion|conclud\b/.test(t)) return 'conclusion';
  if (/\brelated work|literature|prior work\b/.test(t)) return 'related';
  return 'body';
}

/**
 * Creates sliding-window chunks from a document page's text
 * @param {string} pageText Text extracted from a single page
 * @param {number} pageNumber The page number of this text
 * @param {string} paperId The associated paper ID
 * @param {number} chunkSize Maximum characters per chunk
 * @param {number} overlap Characters overlap between chunks
 * @returns {Array<{id: string, paperId: string, page: number, content: string, section: string}>}
 */
export function chunkPageText(pageText, pageNumber, paperId, chunkSize = 800, overlap = 150) {
  const chunks = [];
  if (!pageText || pageText.trim().length === 0) return chunks;

  let start = 0;
  let chunkIndex = 0;

  while (start < pageText.length) {
    const end = Math.min(start + chunkSize, pageText.length);
    let content = pageText.substring(start, end);

    // Try to adjust chunk boundary to end on a complete word
    if (end < pageText.length) {
      const lastSpace = content.lastIndexOf(' ');
      if (lastSpace > chunkSize * 0.7) {
        content = content.substring(0, lastSpace);
        start += lastSpace - overlap;
      } else {
        start += chunkSize - overlap;
      }
    } else {
      start = end; // Finished page
    }

    if (content.trim().length > 20) {
      chunks.push({
        id: `${paperId}-p${pageNumber}-c${chunkIndex++}`,
        paperId,
        page: pageNumber,
        content: content.trim(),
        section: detectSectionFromContent(content)
      });
    }

    if (overlap >= chunkSize) {
      start += chunkSize; // Avoid infinite loop
    }
  }

  return chunks;
}

/**
 * Classify query intent to prioritize relevant section chunks
 * @param {string} query
 * @returns {string} section label or 'general'
 */
export function classifyQueryIntent(query) {
  const q = query.toLowerCase();
  if (/method|approach|architect|algorithm|model|how did|how does|implement|framework|design|propos/i.test(q)) return 'methodology';
  if (/result|finding|performance|accuracy|score|metric|beat|outperform|achiev|improv|f1|bleu|rouge|precision|recall/i.test(q)) return 'results';
  if (/dataset|data|benchmark|train|test|corpus|evaluat|experiment/i.test(q)) return 'experiments';
  if (/limit|weakness|drawback|fail|constrain|future|next step|open problem/i.test(q)) return 'discussion';
  if (/contribut|novelty|new|first|introduc|propos|our work/i.test(q)) return 'contribution';
  if (/abstract|overview|summar|what is this paper/i.test(q)) return 'abstract';
  return 'general';
}

// Chunk analysis cache to eliminate repeated string tokenization & TF maps across queries
const chunkAnalysisCache = new WeakMap();

function getChunkAnalysis(doc) {
  let analysis = chunkAnalysisCache.get(doc);
  if (!analysis) {
    const tokens = tokenize(doc.content || "");
    const uniqueTokens = new Set(tokens);
    const bigrams = extractBigrams(tokens);
    const tf = {};
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      tf[t] = (tf[t] || 0) + 1;
    }
    analysis = { tokens, uniqueTokens, bigrams, tf, docLen: tokens.length };
    try {
      chunkAnalysisCache.set(doc, analysis);
    } catch {
      // In case doc is frozen or primitive
    }
  }
  return analysis;
}

/**
 * Scores and retrieves top-K relevant chunks using Hybrid Search (TF-IDF + Embeddings)
 * @param {string} query The user's question
 * @param {Array<{id: string, content: string, page: number, section: string, embedding?: number[]}>} chunks All chunks for the paper
 * @param {number} topK Number of chunks to return
 * @returns {Promise<Array<{chunk: Object, score: number}>>}
 */
export async function retrieveChunks(query, chunks, topK = 4) {
  if (!query || !chunks || chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    // Fallback: return first few chunks
    return chunks.slice(0, topK).map(chunk => ({ chunk, score: 0 }));
  }

  // Calculate Document Frequency (DF) for IDF calculation and build vocabulary
  const totalDocs = chunks.length;
  const df = {};
  
  chunks.forEach(doc => {
    const { uniqueTokens } = getChunkAnalysis(doc);
    uniqueTokens.forEach(token => {
      df[token] = (df[token] || 0) + 1;
    });
  });

  const vocab = new Set(Object.keys(df));

  // Spelling correction via bounded Levenshtein Distance for sparse keyword matching
  const levenshtein = (a, b) => {
    if (Math.abs(a.length - b.length) > 2) return 99;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
      }
    }
    return matrix[b.length][a.length];
  };

  // Only run spell check for tokens not already in vocab, capped to top candidate words
  const vocabArray = Array.from(vocab);
  const correctedQueryTokens = queryTokens.map(token => {
    if (vocab.has(token) || token.length < 4) return token;
    let bestWord = token;
    let minDist = 3; // Max edit distance to consider
    for (let idx = 0; idx < vocabArray.length; idx++) {
      const v = vocabArray[idx];
      if (Math.abs(v.length - token.length) > 2) continue;
      // First character match heuristic to avoid unnecessary computation
      if (v[0] !== token[0]) continue;
      const dist = levenshtein(token, v);
      if (dist < minDist) {
        minDist = dist;
        bestWord = v;
      }
    }
    return bestWord;
  });

  // 1. Generate Query Embedding for Semantic Search using natural user query
  let queryEmbedding = [];
  try {
     queryEmbedding = await generateEmbedding(query.trim());
  } catch (e) {
     console.warn("Embedding generation failed, falling back to TF-IDF only.", e);
  }

  // Calculate Okapi BM25 scores and Bigram phrase overlap
  const avgDocLen = chunks.reduce((sum, doc) => sum + getChunkAnalysis(doc).docLen, 0) / Math.max(totalDocs, 1);
  const queryBigrams = extractBigrams(correctedQueryTokens);
  const BM25_K1 = 1.5;
  const BM25_B = 0.75;

  // Calculate Hybrid Score (Dense Embeddings + Okapi BM25 + Bigram Phrase Boost)
  const ALPHA = 0.68; // 68% Semantic Vector, 32% Okapi BM25

  const scored = chunks.map(doc => {
    const { tf, docLen, bigrams } = getChunkAnalysis(doc);

    // Okapi BM25 Sparse Score
    let bm25Raw = 0;
    for (let i = 0; i < correctedQueryTokens.length; i++) {
      const token = correctedQueryTokens[i];
      const freq = tf[token] || 0;
      if (freq > 0) {
        const docFreq = df[token] || 0;
        const idf = Math.log(1 + (totalDocs - docFreq + 0.5) / (docFreq + 0.5));
        const tfNorm = (freq * (BM25_K1 + 1)) / (freq + BM25_K1 * (1 - BM25_B + BM25_B * (docLen / Math.max(avgDocLen, 1))));
        bm25Raw += idf * tfNorm;
      }
    }
    const bm25Score = bm25Raw > 0 ? bm25Raw / (bm25Raw + 2.0) : 0;

    // Bigram phrase overlap boost
    let bigramMatches = 0;
    if (queryBigrams.size > 0) {
      queryBigrams.forEach(bg => {
        if (bigrams.has(bg)) bigramMatches++;
      });
    }
    const bigramBoost = queryBigrams.size > 0 ? (bigramMatches / queryBigrams.size) * 0.12 : 0;

    // Semantic Embedding Score
    let semanticScore = 0;
    if (queryEmbedding.length > 0 && doc.embedding && doc.embedding.length > 0) {
       semanticScore = cosineSimilarity(queryEmbedding, doc.embedding);
    }

    // Hybrid Final Score
    const hybridScore = (queryEmbedding.length > 0 && doc.embedding)
      ? (ALPHA * semanticScore) + ((1 - ALPHA) * bm25Score) + bigramBoost
      : bm25Score + bigramBoost;

    return {
      chunk: doc,
      score: hybridScore
    };
  });

  // Boost chunks that match the detected query intent section
  const intent = classifyQueryIntent(query);
  const sectionMap = {
    methodology: ['methodology'],
    results: ['results', 'experiments'],
    experiments: ['experiments', 'results'],
    discussion: ['discussion', 'conclusion'],
    contribution: ['abstract', 'introduction', 'conclusion'],
    abstract: ['abstract', 'introduction'],
    general: [],
  };
  const boostedSections = new Set(sectionMap[intent] || []);

  const boosted = scored.map(item => ({
    ...item,
    score: item.score + (boostedSections.has(item.chunk.section) ? 0.15 : 0)
  }));

  // Sort and return top K
  return boosted
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
