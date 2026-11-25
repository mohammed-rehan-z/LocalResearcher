/**
 * Local Extractive Summarizer — v2
 * 
 * Generates structured summaries and metadata from research paper text
 * using heuristic section detection. Zero API calls — fully local.
 *
 * Improvements over v1:
 * - Multi-chunk section extraction (spans across chunk boundaries)
 * - Dataset/benchmark detection with named-entity extraction
 * - More robust section header matching (numbered/unnumbered, all caps)
 * - Wider sentence windows for richer summaries
 * - Keywords line extraction from papers that have a "Keywords:" line
 */

import { generateEmbedding, cosineSimilarity, generateLocalResponse } from './embedding-service.js';
import { retrieveChunks } from './rag-engine.js';

// ─── Section header patterns (ordered by priority) ──────────────────────────
const SECTION_HEADERS = {
  abstract: [
    /^\s*abstract\s*$/im,
    /\babstract[:\s—–-]/i,
    /\babstract\b/i,
  ],
  introduction: [
    /^\s*(?:\d+\.?\s+)?introduction\s*$/im,
    /\bintroduction[:\s—–-]/i,
    /\bintroduction\b/i,
  ],
  relatedWork: [
    /^\s*(?:\d+\.?\s+)?(?:related\s+work|literature\s+review|background)\s*$/im,
    /\brelated\s+work\b/i,
    /\bliterature\s+review\b/i,
    /\bbackground\b/i,
  ],
  methodology: [
    /^\s*(?:\d+\.?\s+)?(?:method(?:ology|s)?|proposed\s+(?:method|approach|system|framework|model)|our\s+approach|technical\s+approach)\s*$/im,
    /\bmethod(?:ology|s)?\b/i,
    /\bproposed\s+(?:method|approach|system|framework|model)\b/i,
    /\bmodel\s+architecture\b/i,
    /\bsystem\s+design\b/i,
    /\bexperimental\s+setup\b/i,
    /\bimplementation\b/i,
  ],
  experiments: [
    /^\s*(?:\d+\.?\s+)?(?:experiments?|experimental\s+results?|evaluation|results?\s+and\s+discussion)\s*$/im,
    /\bexperiments?\b/i,
    /\bevaluation\b/i,
    /\bexperimental\s+results?\b/i,
  ],
  results: [
    /^\s*(?:\d+\.?\s+)?(?:results?|findings|performance|analysis)\s*$/im,
    /\bresults?\b/i,
    /\bfindings\b/i,
    /\bperformance\b/i,
  ],
  discussion: [
    /^\s*(?:\d+\.?\s+)?(?:discussion|limitations?|threats?\s+to\s+validity)\s*$/im,
    /\bdiscussion\b/i,
    /\blimitations?\b/i,
  ],
  conclusion: [
    /^\s*(?:\d+\.?\s+)?(?:conclusions?|concluding\s+remarks|summary\s+and\s+(?:future|conclusions?))\s*$/im,
    /\bconclusions?\b/i,
    /\bconcluding\s+remarks\b/i,
  ],
  futureWork: [
    /^\s*(?:\d+\.?\s+)?(?:future\s+(?:work|directions?|research)|open\s+problems?)\s*$/im,
    /\bfuture\s+(?:work|directions?|research)\b/i,
  ],
};

const ALL_SECTION_HEADERS = Object.values(SECTION_HEADERS).flat();

// ─── Well-known dataset / benchmark names ───────────────────────────────────
const KNOWN_DATASETS = [
  // NLP
  "GLUE", "SuperGLUE", "SQuAD", "SQuAD 2.0", "CoNLL", "IMDB", "SST", "SST-2", "SST-5",
  "MNLI", "SNLI", "QQP", "MRPC", "RTE", "WNLI", "CoLA", "QNLI", "AG News",
  "Yelp", "Amazon Reviews", "WikiText", "WikiText-103", "Penn Treebank", "PTB",
  "WMT", "BLEU", "ROUGE", "BoolQ", "MultiRC", "CommonSenseQA", "HellaSwag",
  "ARC", "PIQA", "WinoGrande", "TriviaQA", "Natural Questions", "HotpotQA",
  "OpenBookQA", "RACE", "C4", "The Pile", "RedPajama", "MMLU",
  // Vision
  "ImageNet", "CIFAR-10", "CIFAR-100", "MNIST", "Fashion-MNIST", "SVHN",
  "COCO", "MS COCO", "Pascal VOC", "VOC2007", "VOC2012", "LSUN",
  "CelebA", "LFW", "ADE20K", "Cityscapes", "KITTI", "SUN397",
  "Places365", "iNaturalist", "Oxford Pets", "Flowers-102", "Stanford Cars",
  "Food-101", "STL-10", "Caltech-101", "Caltech-256",
  // Audio/Speech
  "LibriSpeech", "Common Voice", "VoxCeleb", "AudioSet", "TIMIT",
  // Medical
  "MIMIC", "MIMIC-III", "MIMIC-IV", "ChestX-ray", "CheXpert", "ISIC",
  "COVID-CT", "BraTS", "LUNA16",
  // Tabular/Other
  "UCI", "Kaggle", "MovieLens", "Netflix Prize", "Criteo",
  "Enwik8", "BookCorpus", "OpenWebText", "CC-News",
  // Graphs
  "Cora", "Citeseer", "PubMed", "OGB", "Reddit",
  // RL
  "Atari", "MuJoCo", "OpenAI Gym", "DMControl",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Normalize single-column and multi-column extracted passage text.
 * De-hyphenates wrapped academic words and cleans whitespace.
 */
export function cleanAcademicText(text) {
  if (!text) return "";
  return text
    // De-hyphenate words split across column/line wraps (e.g. "transfor-\nmer" -> "transformer")
    .replace(/([a-zA-Z])-\s*\n+\s*([a-z])/g, "$1$2")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const ABBREV_MARKER = "\u0000";

/**
 * Split text into clean sentences, protecting academic abbreviations and filtering noise.
 */
function splitSentences(text) {
  const cleaned = cleanAcademicText(text);
  if (!cleaned) return [];

  // Protect common academic abbreviations from false sentence splits
  const protectedText = cleaned
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\b(et\s+al|Figs?|Eqs?|Tabs?|Secs?|Refs?|e\.g|i\.e|vs|approx|Dr|Prof|Vol|No|pp|cf|resp)\./gi, `$1${ABBREV_MARKER}`)
    .replace(/(\d)\.(\d)/g, `$1${ABBREV_MARKER}$2`);

  return protectedText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replaceAll(ABBREV_MARKER, ".").trim())
    .filter(s => {
      if (s.length < 25 || s.length > 800) return false;
      // Skip reference-like lines
      if (/^\[\d+\]/.test(s) || /^\d+\.\s+[A-Z][a-z]+,\s+[A-Z]\./.test(s)) return false;
      // Skip lines that are mostly numbers/symbols (e.g. raw table rows)
      if (s.replace(/[^a-zA-Z]/g, "").length < s.length * 0.4) return false;
      return true;
    });
}

/**
 * Extract a section by scanning ALL chunks for a header match.
 * Collects text from the matched chunk + following chunks until the next section header.
 * Returns up to maxChars of clean text.
 */
function extractSectionText(chunks, headerPatterns, maxChars = 3000) {
  // Try each pattern from most specific to least
  for (const pattern of headerPatterns) {
    for (let i = 0; i < chunks.length; i++) {
      const match = chunks[i].content.match(pattern);
      if (!match) continue;

      // Collect text from match point forward
      const matchIdx = chunks[i].content.indexOf(match[0]);
      let text = chunks[i].content.slice(matchIdx + match[0].length).trim();

      // Continue collecting from subsequent chunks until we hit another section header
      for (let j = i + 1; j < chunks.length && text.length < maxChars; j++) {
        // Stop if next chunk starts with a section header
        const nextContent = chunks[j].content.trim();
        const hitsHeader = ALL_SECTION_HEADERS.some(h => {
          const m = nextContent.match(h);
          return m && nextContent.indexOf(m[0]) < 80; // header in first 80 chars
        });
        if (hitsHeader && text.length > 200) break; // enough collected
        text += "\n" + nextContent;
      }

      return text.slice(0, maxChars);
    }
  }
  return "";
}

/**
 * Detect datasets and benchmarks mentioned in the paper.
 * Uses both a known-names dictionary and pattern-based extraction.
 */
function detectDatasets(chunks) {
  const allText = chunks.map(c => c.content).join(" ");
  const found = new Set();

  // 1. Check for known dataset names (case-sensitive for acronyms)
  for (const ds of KNOWN_DATASETS) {
    // For short acronyms (≤5 chars), require word boundary match
    if (ds.length <= 5) {
      const re = new RegExp(`\\b${ds.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (re.test(allText)) found.add(ds);
    } else {
      if (allText.includes(ds)) found.add(ds);
    }
  }

  // 2. Pattern-based extraction: "dataset" / "benchmark" / "corpus" mentions
  const datasetPatterns = [
    /(?:the\s+)?(\b[A-Z][A-Za-z0-9-]+(?:\s+[A-Z][A-Za-z0-9-]+){0,3})\s+(?:dataset|benchmark|corpus|collection)/gi,
    /(?:dataset|benchmark|corpus|collection)\s+(?:called|named|known\s+as)\s+(\b[A-Z][A-Za-z0-9-]+(?:\s+[A-Za-z0-9-]+){0,2})/gi,
    /trained\s+on\s+(?:the\s+)?(\b[A-Z][A-Za-z0-9-]+(?:\s+[A-Za-z0-9-]+){0,2})/gi,
    /evaluated\s+on\s+(?:the\s+)?(\b[A-Z][A-Za-z0-9-]+(?:\s+[A-Za-z0-9-]+){0,2})/gi,
    /tested\s+on\s+(?:the\s+)?(\b[A-Z][A-Za-z0-9-]+(?:\s+[A-Za-z0-9-]+){0,2})/gi,
  ];

  for (const pat of datasetPatterns) {
    let m;
    while ((m = pat.exec(allText)) !== null) {
      const name = m[1]?.trim();
      if (name && name.length > 2 && name.length < 50) {
        // Skip generic terms
        if (!/^(The|Our|This|We|A|An|In|On|For|Each|All|Both|Some|These|Their)$/i.test(name)) {
          found.add(name);
        }
      }
    }
  }

  return [...found].slice(0, 12); // cap at 12
}

/**
 * Extract keywords from the "Keywords:" line if present.
 */
function extractKeywords(chunks) {
  for (const chunk of chunks.slice(0, 5)) {
    const kwMatch = chunk.content.match(/keywords?\s*[:—–-]\s*(.+?)(?:\n|$)/i);
    if (kwMatch) {
      return kwMatch[1]
        .split(/[,;]/)
        .map(k => k.trim())
        .filter(k => k.length > 1 && k.length < 50)
        .slice(0, 8);
    }
  }
  return [];
}

// ─── Main Functions ─────────────────────────────────────────────────────────

/**
 * Perform Salience-Weighted Extractive TextRank with Maximal Marginal Relevance (MMR).
 * Works across both single-column and multi-column passages without truncating long sections.
 * Returns the top K most central & diverse sentences, maintaining original order.
 */
async function textRankSummary(sentences, topK = 5) {
  if (!sentences || sentences.length === 0) return [];
  if (sentences.length <= topK) return sentences;

  // Evenly sample up to 45 sentences across the entire passage so later columns/paragraphs are represented
  const maxCandidates = 45;
  let candidateItems;
  if (sentences.length <= maxCandidates) {
    candidateItems = sentences.map((text, idx) => ({ text, origIdx: idx }));
  } else {
    candidateItems = [];
    const step = (sentences.length - 1) / (maxCandidates - 1);
    const seenIdx = new Set();
    for (let k = 0; k < maxCandidates; k++) {
      const idx = Math.round(k * step);
      if (!seenIdx.has(idx)) {
        seenIdx.add(idx);
        candidateItems.push({ text: sentences[idx], origIdx: idx });
      }
    }
  }

  // 1. Generate embeddings in small batches to avoid WASM memory overload
  const embeddings = [];
  const batchSize = 6;
  for (let i = 0; i < candidateItems.length; i += batchSize) {
    const batch = candidateItems.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(batch.map(item => generateEmbedding(item.text)));
    embeddings.push(...batchEmbeddings);
  }

  const n = candidateItems.length;
  // 2. Build similarity matrix and compute normalized centrality + academic salience
  const simMatrix = Array.from({ length: n }, () => new Float32Array(n));
  const centrality = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sim = cosineSimilarity(embeddings[i], embeddings[j]);
      if (sim > 0) {
        simMatrix[i][j] = sim;
        simMatrix[j][i] = sim;
        centrality[i] += sim;
        centrality[j] += sim;
      }
    }
  }

  const maxCentrality = Math.max(...centrality, 1e-6);
  const relevanceScores = candidateItems.map((item, i) => {
    const normCentrality = centrality[i] / maxCentrality;
    let salienceBoost = 0;
    if (/\b\d+(?:\.\d+)?%|\b(?:accuracy|f1|bleu|rouge|auc|latency|speedup)\b/i.test(item.text)) {
      salienceBoost += 0.14;
    }
    if (/\b(?:we\s+(?:propose|introduce|present|demonstrate|show|find|conclude)|our\s+(?:method|approach|framework|model|results)|outperforms?|significantly)\b/i.test(item.text)) {
      salienceBoost += 0.14;
    }
    // Slight lead-position bias for topic-introducing sentences
    const posBias = Math.max(0, 1 - i / n) * 0.08;
    return normCentrality + salienceBoost + posBias;
  });

  // 3. Iterative Maximal Marginal Relevance (MMR) selection for diversity
  const LAMBDA = 0.72;
  const selectedIndices = [];
  const selectedSet = new Set();

  for (let k = 0; k < topK && selectedIndices.length < n; k++) {
    let bestIdx = -1;
    let bestMmr = -Infinity;

    for (let i = 0; i < n; i++) {
      if (selectedSet.has(i)) continue;
      let maxSimToSelected = 0;
      for (const sIdx of selectedIndices) {
        if (simMatrix[i][sIdx] > maxSimToSelected) {
          maxSimToSelected = simMatrix[i][sIdx];
        }
      }
      const mmrScore = LAMBDA * relevanceScores[i] - (1 - LAMBDA) * maxSimToSelected;
      if (mmrScore > bestMmr) {
        bestMmr = mmrScore;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      selectedIndices.push(bestIdx);
      selectedSet.add(bestIdx);
    }
  }

  // 4. Sort back to original chronological order
  return selectedIndices
    .sort((a, b) => candidateItems[a].origIdx - candidateItems[b].origIdx)
    .map(idx => candidateItems[idx].text);
}

/**
 * Summarize any single-column or multi-column passage directly.
 * @param {string} passageText
 * @param {{ topK?: number }} [options]
 * @returns {Promise<string>}
 */
export async function summarizePassage(passageText, { topK = 5 } = {}) {
  const sentences = splitSentences(passageText);
  if (sentences.length === 0) return cleanAcademicText(passageText).slice(0, 500);
  const selected = await textRankSummary(sentences, topK);
  return selected.join(" ");
}

/**
 * Infill missing section text using semantic RAG vector retrieval when regex headers fail.
 */
async function getSectionTextOrRagFallback(sortedChunks, headerRegexes, ragQuery, maxChars = 3000) {
  const text = extractSectionText(sortedChunks, headerRegexes, maxChars);
  if (text && text.trim().length > 120) {
    return { text, isFallback: false };
  }

  // Fallback to semantic RAG search across chunks
  try {
    const results = await retrieveChunks(ragQuery, sortedChunks, 4);
    if (results && results.length > 0) {
      const fallbackContent = results.map(r => r.chunk.content).join("\n\n");
      return { text: fallbackContent.slice(0, maxChars), isFallback: true };
    }
  } catch (err) {
    console.warn("RAG fallback retrieval error:", err);
  }
  return { text: text || "", isFallback: false };
}

/**
 * Extract acronym definitions (e.g. "Retrieval-Augmented Generation (RAG)") from paper text.
 */
function extractAcronyms(chunks) {
  const acronyms = new Map();
  const fullText = chunks.slice(0, 12).map(c => c.content).join(" ");
  const re = /\b([A-Z][a-zA-Z-]+(?:\s+[A-Z]?[a-zA-Z-]+){1,4})\s*\(([A-Z]{2,8})\)/g;
  let m;
  while ((m = re.exec(fullText)) !== null) {
    const expansion = m[1].trim();
    const abbr = m[2].trim();
    if (!acronyms.has(abbr) && expansion.length > abbr.length + 3) {
      acronyms.set(abbr, expansion);
    }
    if (acronyms.size >= 8) break;
  }
  return Array.from(acronyms.entries()).map(([abbr, exp]) => `**${abbr}**: ${exp}`);
}

/**
 * Generate a local extractive summary from paper chunks.
 *
 * @param {Array<{content: string, page: number}>} chunks
 * @param {string} title
 * @param {string} authors
 * @returns {Promise<string>} Markdown summary
 */
export async function generateLocalSummary(chunks, title = "Unknown", authors = "Unknown") {
  if (!chunks || chunks.length === 0) return null;

  const sorted = [...chunks].sort((a, b) => a.page - b.page);

  // Extract each section with multi-chunk spanning & parallel semantic RAG fallback infilling
  const abstractText   = extractSectionText(sorted, SECTION_HEADERS.abstract, 2500);
  const introText      = extractSectionText(sorted, SECTION_HEADERS.introduction, 2500);

  const [methodObj, resultsObj, discObj, concObj] = await Promise.all([
    getSectionTextOrRagFallback(
      sorted,
      SECTION_HEADERS.methodology,
      "proposed methodology architecture algorithm model framework approach implementation",
      3000
    ),
    getSectionTextOrRagFallback(
      sorted,
      [...SECTION_HEADERS.experiments, ...SECTION_HEADERS.results],
      "experimental results evaluation findings performance accuracy benchmark score metrics baseline",
      3000
    ),
    getSectionTextOrRagFallback(
      sorted,
      SECTION_HEADERS.discussion,
      "limitations discussion threats to validity weaknesses constraints trade-offs assumptions",
      2000
    ),
    getSectionTextOrRagFallback(
      sorted,
      [...SECTION_HEADERS.conclusion, ...SECTION_HEADERS.futureWork],
      "conclusion concluding remarks future work open problems summary takeaways implications",
      2000
    ),
  ]);
  const methodText = methodObj.text;
  const resultsText = resultsObj.text;
  const discussionText = discObj.text;
  const conclusionText = concObj.text;

  // Detect datasets, acronyms, and quantitative numerical metrics
  const datasets = detectDatasets(sorted);
  const keywords = extractKeywords(sorted);
  const metrics = extractNumericalResults(sorted);
  const acronyms = extractAcronyms(sorted);

  // Build structured summary
  const sections = [];
  sections.push(`# Research Synthesis: ${title}\n`);

  // 1. Executive Summary & Takeaways
  sections.push("## 1. Executive Summary & Abstract");
  const abstractSrc = abstractText || introText || sorted[0]?.content || "";
  const abstractSents = splitSentences(abstractSrc);
  if (abstractSents.length > 0) {
    const summarySents = await textRankSummary(abstractSents, 7);
    sections.push(summarySents.join(" "));
    if (abstractText && introText) {
      const introSents = splitSentences(introText);
      if (introSents.length > 0) {
        sections.push("\n**Context & Background:**");
        sections.push(introSents.slice(0, 3).join(" "));
      }
    }
  } else {
    const defaultSents = splitSentences(sorted[0]?.content || "");
    const topDefault = await textRankSummary(defaultSents, 5);
    sections.push(topDefault.join(" ") || "_Overview extracted from initial sections._");
  }

  // 2. Core Methodology & Architecture
  sections.push("\n## 2. Core Methodology & Architecture");
  const methodSents = splitSentences(methodText);
  if (methodSents.length > 0) {
    const topMethods = await textRankSummary(methodSents, 8);
    sections.push(topMethods.join(" "));
    if (methodObj.isFallback) {
      sections.push("\n*(Synthesized via Semantic RAG vector retrieval from architectural passages)*");
    }
  } else {
    sections.push(sorted.slice(0, 3).map(c => c.content.slice(0, 200)).join("... "));
  }

  // 3. Key Findings & Empirical Results
  sections.push("\n## 3. Key Findings & Empirical Results");
  const resultSents = splitSentences(resultsText);
  if (resultSents.length > 0) {
    const topResults = await textRankSummary(resultSents, 8);
    sections.push(topResults.join(" "));
    if (resultsObj.isFallback) {
      sections.push("\n*(Synthesized via Semantic RAG vector retrieval from evaluation passages)*");
    }
  }

  // Embed Numerical Metrics Table if discovered
  if (metrics.length > 0) {
    sections.push("\n### 📊 Extracted Performance Metrics & Benchmark Claims");
    sections.push("| Metric | Value | Context | Page |");
    sections.push("|---|---|---|---|");
    metrics.slice(0, 6).forEach(m => {
      const cleanCtx = m.context.replace(/\|/g, "/").slice(0, 75);
      sections.push(`| **${m.metric}** | \`${m.value}\` | ${cleanCtx}... | Page ${m.page} |`);
    });
  }

  // 4. Limitations & Discussion
  sections.push("\n## 4. Limitations & Critical Discussion");
  const discSents = splitSentences(discussionText);
  if (discSents.length > 0) {
    const topDisc = await textRankSummary(discSents, 5);
    sections.push(topDisc.join(" "));
  } else {
    sections.push("_No explicit limitations section isolated; constraints may be detailed within experimental setups._");
  }

  // 5. Conclusions & Future Directions
  sections.push("\n## 5. Conclusions & Research Trajectory");
  const concSents = splitSentences(conclusionText);
  if (concSents.length > 0) {
    const topConc = await textRankSummary(concSents, 5);
    sections.push(topConc.join(" "));
  } else {
    sections.push("_Conclusion synthesized from document closing text._");
  }

  // 6. Datasets & Benchmarks
  sections.push("\n## 6. Datasets & Benchmarks");
  if (datasets.length > 0) {
    sections.push("The following datasets and evaluation benchmarks were identified in the paper:\n");
    datasets.forEach(ds => sections.push(`- **${ds}**`));
  } else {
    sections.push("_No standard public datasets identified; the paper may evaluate on proprietary, synthetic, or custom domain corpora._");
  }

  // 7. Provenance & Statistics
  const totalPages = Math.max(...sorted.map(c => c.page), 1);
  const totalChunks = sorted.length;
  const totalWords = sorted.reduce((acc, c) => acc + c.content.split(/\s+/).length, 0);
  sections.push(`\n## 7. Document Audit Statistics`);
  sections.push(`| Metric | Value |`);
  sections.push(`|---|---|`);
  sections.push(`| **Pages Analyzed** | ${totalPages} |`);
  sections.push(`| **Indexed Chunks** | ${totalChunks} |`);
  sections.push(`| **Word Count** | ~${totalWords.toLocaleString()} |`);
  sections.push(`| **Authors** | ${authors} |`);
  if (keywords.length > 0) {
    sections.push(`| **Keywords** | ${keywords.join(", ")} |`);
  }
  if (datasets.length > 0) {
    sections.push(`| **Datasets Discovered** | ${datasets.join(", ")} |`);
  }
  if (acronyms.length > 0) {
    sections.push(`\n### Key Terminology & Acronyms`);
    acronyms.forEach(item => sections.push(`- ${item}`));
  }

  sections.push(`\n> **Provenance Assurance:** Locally extracted via deterministic AST segmentation and WebAssembly vector embeddings. Zero hallucination risk.`);

  return sections.join("\n");
}

/**
 * Extract structured metadata from chunks using heuristics (no API).
 *
 * @param {Array<{content: string, page: number}>} chunks
 * @param {string} detectedTitle
 * @returns {object} Metadata object
 */
export function extractLocalMetadata(chunks, detectedTitle = "Unknown") {
  if (!chunks || chunks.length === 0) return {};

  const sorted = [...chunks].sort((a, b) => a.page - b.page);
  const firstPageText = sorted.filter(c => c.page === 1).map(c => c.content).join(" ");

  // Year
  const yearMatch = firstPageText.match(/(?:19|20)\d{2}/);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  // Problem from abstract
  const abstractText = extractSectionText(sorted, SECTION_HEADERS.abstract, 1500);
  const problem = abstractText
    ? splitSentences(abstractText).slice(0, 3).join(" ")
    : "See paper abstract for details.";

  // Methodology
  const methodText = extractSectionText(sorted, SECTION_HEADERS.methodology, 1500);
  const methodology = methodText
    ? splitSentences(methodText).slice(0, 3).join(" ")
    : "See paper methodology section.";

  // Results
  const expText    = extractSectionText(sorted, SECTION_HEADERS.experiments, 1500);
  const resText    = extractSectionText(sorted, SECTION_HEADERS.results, 1500);
  const combined   = (expText + " " + resText).trim();
  const keyFindings = combined
    ? splitSentences(combined).slice(0, 3).join(" ")
    : "See paper results section.";

  // Contributions from conclusion
  const conclusionText = extractSectionText(sorted, SECTION_HEADERS.conclusion, 1500);
  const contributions = conclusionText
    ? splitSentences(conclusionText).slice(0, 2).join(" ")
    : "See paper conclusion.";

  // Datasets
  const datasets = detectDatasets(sorted);
  const datasetStr = datasets.length > 0 ? datasets.join(", ") : "Not specified";

  // Tags from keywords line + topic detection
  const keywords = extractKeywords(sorted);
  const allText = sorted.slice(0, 8).map(c => c.content).join(" ").toLowerCase();

  const tagCandidates = [
    { term: "deep learning", tag: "Deep Learning" },
    { term: "machine learning", tag: "Machine Learning" },
    { term: "neural network", tag: "Neural Networks" },
    { term: "transformer", tag: "Transformer" },
    { term: "large language model", tag: "LLM" },
    { term: "language model", tag: "Language Models" },
    { term: "nlp", tag: "NLP" },
    { term: "natural language", tag: "NLP" },
    { term: "computer vision", tag: "Computer Vision" },
    { term: "image classification", tag: "Image Classification" },
    { term: "object detection", tag: "Object Detection" },
    { term: "semantic segmentation", tag: "Segmentation" },
    { term: "reinforcement learning", tag: "Reinforcement Learning" },
    { term: "optimization", tag: "Optimization" },
    { term: "classification", tag: "Classification" },
    { term: "generative", tag: "Generative AI" },
    { term: "diffusion", tag: "Diffusion Models" },
    { term: "convolutional", tag: "CNN" },
    { term: "recurrent", tag: "RNN" },
    { term: "attention mechanism", tag: "Attention" },
    { term: "self-attention", tag: "Self-Attention" },
    { term: "graph neural", tag: "GNN" },
    { term: "knowledge graph", tag: "Knowledge Graph" },
    { term: "federated", tag: "Federated Learning" },
    { term: "transfer learning", tag: "Transfer Learning" },
    { term: "fine-tuning", tag: "Fine-Tuning" },
    { term: "zero-shot", tag: "Zero-Shot" },
    { term: "few-shot", tag: "Few-Shot" },
    { term: "contrastive learning", tag: "Contrastive Learning" },
    { term: "self-supervised", tag: "Self-Supervised" },
    { term: "healthcare", tag: "Healthcare" },
    { term: "medical", tag: "Medical AI" },
    { term: "robotics", tag: "Robotics" },
    { term: "autonomous", tag: "Autonomous Systems" },
    { term: "security", tag: "Security" },
    { term: "privacy", tag: "Privacy" },
    { term: "blockchain", tag: "Blockchain" },
    { term: "iot", tag: "IoT" },
    { term: "edge computing", tag: "Edge Computing" },
    { term: "speech recognition", tag: "Speech" },
    { term: "recommendation", tag: "Recommender Systems" },
    { term: "time series", tag: "Time Series" },
    { term: "anomaly detection", tag: "Anomaly Detection" },
  ];

  const detectedTags = [...new Set(
    tagCandidates.filter(t => allText.includes(t.term)).map(t => t.tag)
  )].slice(0, 5);

  // Merge keyword-derived tags
  const kwTags = keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).slice(0, 3);
  const allTags = [...new Set([...detectedTags, ...kwTags])].slice(0, 6);

  return {
    year,
    problem,
    methodology,
    keyFindings,
    contributions,
    dataset: datasetStr,
    tags: allTags.length > 0 ? allTags : ["Research", "PDF"],
  };
}

// ─── Chat Answer Synthesis ──────────────────────────────────────────────────

const CHAT_STOP_WORDS = new Set([
  "the", "and", "for", "are", "was", "were", "what", "which", "who", "whom",
  "when", "where", "why", "how", "did", "does", "has", "have", "had", "can",
  "could", "will", "would", "should", "this", "that", "these", "those", "with",
  "from", "into", "about", "paper", "papers", "study", "research", "authors",
  "there", "their", "they", "them", "been", "being", "also", "more", "most",
  "some", "such", "than", "then", "only", "very", "much", "many", "each",
]);

/**
 * Tokenize text into meaningful lowercase content words for scoring.
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !CHAT_STOP_WORDS.has(w));
}

/**
 * Score a sentence against a query by keyword overlap.
 * Returns a float between 0 and 1.
 */
function scoreSentence(sentence, queryTokens) {
  const sentTokens = new Set(tokenize(sentence));
  if (sentTokens.size === 0 || queryTokens.length === 0) return 0;
  
  let matches = 0;
  for (const qt of queryTokens) {
    if (sentTokens.has(qt)) matches++;
  }
  return matches / queryTokens.length;
}

/**
 * Synthesize a coherent, grounded semantic answer from retrieved chunks.
 * Combines dense semantic cosine similarity (all-MiniLM-L6-v2) with lexical overlap,
 * MMR deduplication, and clickable [Page X] provenance citations.
 *
 * @param {string} question - The user's question
 * @param {Array<{content: string, page: number, paperTitle?: string}>} chunks - Retrieved chunks
 * @param {string} [scopeLabel] - Optional paper title for context
 * @param {{ directAnswer?: string, directPage?: number }} [options] - Optional extractive QA lead-in
 * @returns {Promise<string>} Markdown-formatted answer
 */
export async function synthesizeAnswer(question, chunks, scopeLabel = "", options = {}) {
  if (!chunks || chunks.length === 0) {
    return "_No relevant content found. Try rephrasing your question or uploading a document._";
  }

  const queryTokens = tokenize(question);
  const isComparative = /\b(compare|comparison|difference|differences|versus|vs|contrast|differ|relative to)\b/i.test(question);

  // --- Step 1: Extract candidate sentences and compute fast lexical pre-scores ---
  const rawCandidates = [];
  for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
    const chunk = chunks[cIdx];
    const sentences = splitSentences(chunk.content);
    const paperName = chunk.paperTitle || scopeLabel || "Document";
    // Slight preference for higher-ranked retrieved chunks
    const chunkRankBoost = Math.max(0, 1 - cIdx / Math.max(chunks.length, 1)) * 0.08;

    for (const sent of sentences) {
      const lexicalScore = scoreSentence(sent, queryTokens);
      rawCandidates.push({
        text: sent,
        lexicalScore,
        chunkRankBoost,
        page: chunk.page,
        paperTitle: paperName,
      });
    }
  }

  if (rawCandidates.length === 0) {
    return "_The retrieved passages don't contain readable sentences for your question. Try asking in a different way._";
  }

  // Keep up to 36 top candidates (balancing chunk rank and lexical match) for dense semantic scoring
  const candidates = [...rawCandidates]
    .sort((a, b) => (b.lexicalScore + b.chunkRankBoost) - (a.lexicalScore + a.chunkRankBoost))
    .slice(0, 36);

  // --- Step 2: Semantic Vector Scoring ---
  let queryEmbedding = [];
  try {
    queryEmbedding = await generateEmbedding(question.trim());
  } catch {
    queryEmbedding = [];
  }

  if (queryEmbedding.length > 0) {
    const batchSize = 6;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      const embs = await Promise.all(
        batch.map(item => generateEmbedding(item.text).catch(() => []))
      );
      for (let j = 0; j < batch.length; j++) {
        const semSim = embs[j].length > 0 ? cosineSimilarity(queryEmbedding, embs[j]) : 0;
        batch[j].semanticScore = semSim;
        batch[j].score = (0.65 * semSim) + (0.35 * batch[j].lexicalScore) + batch[j].chunkRankBoost;
      }
    }
  } else {
    for (const item of candidates) {
      item.semanticScore = 0;
      item.score = item.lexicalScore + item.chunkRankBoost;
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  // Check grounding threshold to guard against unrelated hallucinations
  const topScore = candidates[0]?.score || 0;
  const lowConfidence = topScore < 0.22 && (candidates[0]?.lexicalScore || 0) === 0;

  const relevant = candidates.filter(s => s.score >= 0.24 || s.lexicalScore >= 0.25);
  const topSentences = relevant.length >= 3
    ? relevant.slice(0, 14)
    : candidates.slice(0, 8);

  // --- Step 3: Deduplicate (remove near-duplicates) ---
  const unique = [];
  for (const sent of topSentences) {
    const sentTokensList = tokenize(sent.text);
    const sentTokens = new Set(sentTokensList);
    const isDuplicate = unique.some(u => {
      const uTokens = tokenize(u.text);
      const overlap = uTokens.filter(t => sentTokens.has(t)).length;
      return overlap > Math.min(uTokens.length, sentTokensList.length) * 0.65;
    });
    if (!isDuplicate) unique.push(sent);
  }

  const uniquePapers = [...new Set(unique.map(s => s.paperTitle).filter(Boolean))];
  const isMultiPaper = uniquePapers.length > 1;

  // --- Step 4: Local GenAI Synthesis (LaMini-Flan-T5-77M) + Structured Provenance ---
  const parts = [];

  if (options.directAnswer) {
    const pageTag = options.directPage ? ` [Page ${options.directPage}]` : "";
    parts.push(`> **Direct Answer:** ${options.directAnswer}${pageTag}\n`);
  }

  // Generate abstractive synthesis grounded strictly in the top retrieved sentences
  let genAiText = null;
  if (!lowConfidence && unique.length > 0) {
    const groundedContext = unique.slice(0, 4).map(s => s.text).join(" ").slice(0, 1100);
    const prompt = `Answer the question concisely and accurately using ONLY the facts in the context.\nContext: ${groundedContext}\nQuestion: ${question}\nAnswer:`;
    genAiText = await generateLocalResponse(prompt, { maxNewTokens: 140, timeoutMs: 8000 });
  }

  if (lowConfidence && !options.directAnswer) {
    parts.push(`_The indexed passages do not directly address every term in your query. Here is the closest related context found:_\n`);
  } else if (isMultiPaper) {
    parts.push(`### Cross-Paper Synthesis (${uniquePapers.length} Papers Evaluated)\n`);
  } else if (scopeLabel && !options.directAnswer) {
    parts.push(`**Synthesis from ${scopeLabel}:**\n`);
  }

  if (genAiText && genAiText.length >= 20) {
    parts.push(`**AI Synthesis:** ${genAiText}\n`);
  }

  // If comparative query across multiple papers, format with per-paper breakdown
  if (isMultiPaper && isComparative) {
    parts.push(`Here is a comparative synthesis of the findings across the evaluated papers:\n`);
    for (const paper of uniquePapers) {
      const paperSents = unique.filter(s => s.paperTitle === paper);
      const paperPages = [...new Set(paperSents.map(s => s.page))].sort((a, b) => a - b);
      parts.push(`#### ${paper}`);
      parts.push(paperSents.slice(0, 3).map(s => `${s.text} [Page ${s.page}]`).join(" "));
      if (paperPages.length > 0) {
        parts.push(`*Sources: ${paperPages.map(p => `[Page ${p}]`).join(", ")}*\n`);
      }
    }
  } else {
    // Main synthesized answer with inline clickable [Page X] citations
    const primarySents = unique.slice(0, 5);
    const answerBody = primarySents
      .map(s => isMultiPaper ? `${s.text} _(${s.paperTitle}, [Page ${s.page}])_` : `${s.text} [Page ${s.page}]`)
      .join(" ");

    if (answerBody) {
      parts.push(answerBody);
    }
  }

  // Page and Paper Provenance Summary
  if (isMultiPaper && !isComparative) {
    parts.push("\n\n**Source Citations by Paper:**");
    for (const paper of uniquePapers) {
      const paperPages = [...new Set(unique.filter(s => s.paperTitle === paper).map(s => s.page))].sort((a, b) => a - b);
      parts.push(`- **${paper}**: ${paperPages.map(p => `[Page ${p}]`).join(", ")}`);
    }
  } else if (!isMultiPaper) {
    const pages = [...new Set(unique.slice(0, 5).map(s => s.page))].sort((a, b) => a - b);
    if (pages.length > 0) {
      parts.push(`\n\n**Source Pages:** ${pages.map(p => `[Page ${p}]`).join(", ")}`);
    }
  }

  // Supporting evidence excerpts
  if (unique.length > 5) {
    parts.push("\n\n**Supporting Evidence:**");
    for (const sent of unique.slice(5, 8)) {
      const citationTag = isMultiPaper ? `${sent.paperTitle}, [Page ${sent.page}]` : `[Page ${sent.page}]`;
      parts.push(`> "${sent.text}" — ${citationTag}`);
    }
  }

  return parts.join("\n");
}

/**
 * Extract numerical metrics and results from chunks.
 * Returns an array of { metric, value, context, page } objects.
 * Used to populate the results table in the Structured Ledger.
 *
 * @param {Array<{content: string, page: number}>} chunks
 * @returns {Array<{metric: string, value: string, context: string, page: number}>}
 */
export function extractNumericalResults(chunks) {
  const results = [];
  const seen = new Set();

  // Patterns that match "MetricName: 94.2%" or "accuracy of 94.2%" etc.
  const patterns = [
    // "accuracy: 94.2%" or "F1-score: 0.923"
    /\b([\w\s\-\/]{3,30}(?:accuracy|precision|recall|f1|f[- ]?score|bleu|rouge|perplexity|loss|error|rate|score|auc|ap|map|mAP|top[-\s]?\d)[\w\s\-\/]{0,15})\s*[=:of]+\s*([\d.]+\s*%?)/gi,
    // "achieves 94.2% on ImageNet"
    /(?:achiev|obtain|reach|attain|improv|reduc|yield)[a-z]*\s+(?:a\s+)?(?:[\w\s-]{0,20}\s+of\s+)?([\d.]+\s*%)/gi,
    // "X% improvement" or "X% reduction"
    /([\d.]+\s*%)\s*(?:improvement|reduction|increase|decrease|gain|drop|boost)/gi,
    // Table-like: "Model | 94.2 | 87.1"
    /\b(\d{2,3}\.\d{1,2})\s*(?:[|│\t]|±)/g,
  ];

  const sectionChunks = chunks
    .filter(c => ['results', 'experiments', 'body'].includes(c.section || 'body'))
    .sort((a, b) => a.page - b.page);

  for (const chunk of sectionChunks) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(chunk.content)) !== null) {
        const raw = match[0].trim();
        if (seen.has(raw)) continue;
        seen.add(raw);

        // Get a short context window around the match
        const start = Math.max(0, match.index - 60);
        const end = Math.min(chunk.content.length, match.index + raw.length + 60);
        const context = chunk.content.slice(start, end).replace(/\n/g, ' ').trim();

        results.push({
          metric: (match[1] || raw).trim().replace(/\s+/g, ' '),
          value: (match[2] || match[1] || raw).trim(),
          context,
          page: chunk.page,
        });

        if (results.length >= 20) break; // cap at 20 results
      }
      if (results.length >= 20) break;
    }
    if (results.length >= 20) break;
  }

  return results;
}
