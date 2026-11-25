let embeddingPipelinePromise = null;
let qaPipelinePromise = null;

// In-memory LRU-style cache for generated embeddings (fast 0ms cache hits on repeated queries)
const MAX_EMBEDDING_CACHE_SIZE = 600;
const embeddingCache = new Map();

/**
 * Configures @xenova/transformers environment to use local /models/ if available,
 * and cleanly fall back to HuggingFace CDN + IndexedDB cache (for Vercel / cloud hosting).
 */
async function configureTransformersEnv(env) {
  env.allowRemoteModels = true;
  env.useBrowserCache = true;

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/models/Xenova/all-MiniLM-L6-v2/config.json', { method: 'HEAD' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        env.localModelPath = '/models/';
        env.allowLocalModels = true;
        return;
      }
    } catch {
      // Local models not hosted; fall back to remote CDN + IndexedDB browser cache
    }
    env.allowLocalModels = false;
  } else {
    // Node.js runtime: check if ./public/models exists on disk
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const localDir = path.resolve(process.cwd(), 'public', 'models', 'Xenova', 'all-MiniLM-L6-v2');
      if (fs.existsSync(localDir)) {
        env.localModelPath = path.resolve(process.cwd(), 'public', 'models') + path.sep;
        env.allowLocalModels = true;
        return;
      }
    } catch {
      // Ignore fs check failure
    }
    env.allowLocalModels = false;
  }
}

/**
 * Initializes the feature extraction pipeline singleton.
 * Uses promise-locking to avoid concurrent duplicate model instantiations.
 * @returns {Promise<any>}
 */
export async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = (async () => {
      try {
        console.log('Loading embedding model (this may take a moment on first run)...');
        
        // Next.js Turbopack bug: transformers.js tries to check Object.keys(process.versions)
        // which is undefined in the browser, causing a crash. We polyfill it here.
        if (typeof process === 'undefined') {
          globalThis.process = { env: {}, versions: {} };
        } else {
          process.versions = process.versions || {};
          process.env = process.env || {};
        }

        // Dynamic import to prevent Server-Side Rendering (SSR) crashes in Next.js
        const { pipeline, env } = await import('@xenova/transformers');
        
        // Configure transformers.js to load from local /models/ if present, else CDN + IndexedDB
        await configureTransformersEnv(env);

        // Using a small, efficient model for sentence embeddings
        const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
          quantized: true, // Use 8-bit quantized version for smaller download size
        });
        console.log('Embedding model loaded successfully.');
        return pipe;
      } catch (error) {
        console.error('Error loading embedding model:', error);
        embeddingPipelinePromise = null; // Reset so retry is possible
        throw error;
      }
    })();
  }
  return embeddingPipelinePromise;
}

/**
 * Generates a dense vector embedding for a given text with in-memory caching.
 * @param {string} text 
 * @returns {Promise<number[]>} Array of floats representing the embedding
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') return [];
  const cleanText = text.trim();
  if (cleanText.length === 0) return [];
  
  // Fast cache lookup
  if (embeddingCache.has(cleanText)) {
    return embeddingCache.get(cleanText);
  }

  const pipe = await getEmbeddingPipeline();
  
  const output = await pipe(cleanText, {
    pooling: 'mean',
    normalize: true,
  });

  // Extract the raw data array from the tensor
  const vector = Array.from(output.data);

  // Cache vector (evicting oldest entry if cache exceeds limit)
  if (embeddingCache.size >= MAX_EMBEDDING_CACHE_SIZE) {
    const oldestKey = embeddingCache.keys().next().value;
    embeddingCache.delete(oldestKey);
  }
  embeddingCache.set(cleanText, vector);

  return vector;
}

/**
 * Calculates cosine similarity between two vectors.
 * Optimized with fast-path for L2-normalized unit vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} similarity score between 0 and 1
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = vecA.length;
  
  for (let i = 0; i < len; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  
  // Fast path: all-MiniLM-L6-v2 generates normalized unit vectors (|v| ≈ 1.0)
  if (Math.abs(normA - 1.0) < 1e-3 && Math.abs(normB - 1.0) < 1e-3) {
    return Math.max(0, Math.min(1, dotProduct));
  }

  if (normA === 0 || normB === 0) return 0;
  
  return Math.max(0, Math.min(1, dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))));
}

/**
 * Initializes the Question-Answering pipeline singleton.
 * Uses promise-locking to avoid concurrent duplicate model instantiations.
 */
export async function getQAPipeline() {
  if (!qaPipelinePromise) {
    qaPipelinePromise = (async () => {
      try {
        console.log('Loading QA model (this may take a moment on first run)...');
        if (typeof process === 'undefined') {
          globalThis.process = { env: {}, versions: {} };
        } else {
          process.versions = process.versions || {};
          process.env = process.env || {};
        }

        const { pipeline, env } = await import('@xenova/transformers');
        await configureTransformersEnv(env);

        const pipe = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad', {
          quantized: true,
        });
        console.log('QA model loaded successfully.');
        return pipe;
      } catch (error) {
        console.error('Error loading QA model:', error);
        qaPipelinePromise = null; // Reset so retry is possible
        throw error;
      }
    })();
  }
  return qaPipelinePromise;
}

/**
 * Answers a question based on the provided context using local QA model.
 * @param {string} question 
 * @param {string} context 
 * @returns {Promise<{answer: string, score: number} | null>}
 */
export async function answerQuestion(question, context) {
  if (!question || !context) return null;
  try {
    const pipe = await getQAPipeline();
    const output = await pipe(question, context);
    return output;
  } catch (error) {
    console.error('QA Error:', error);
    return null;
  }
}

let genAIPipelinePromise = null;

/**
 * Initializes the local Seq2Seq GenAI pipeline singleton (Xenova/LaMini-Flan-T5-77M).
 * Loads from /models/ locally first with remote fallback.
 */
export async function getGenAIPipeline() {
  if (!genAIPipelinePromise) {
    genAIPipelinePromise = (async () => {
      try {
        console.log('Loading local GenAI Seq2Seq model (LaMini-Flan-T5-77M)...');
        if (typeof process === 'undefined') {
          globalThis.process = { env: {}, versions: {} };
        } else {
          process.versions = process.versions || {};
          process.env = process.env || {};
        }

        const { pipeline, env } = await import('@xenova/transformers');
        await configureTransformersEnv(env);

        const pipe = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M', {
          quantized: true,
        });
        console.log('Local GenAI model loaded successfully.');
        return pipe;
      } catch (error) {
        console.warn('Local GenAI model unavailable, using extractive fallback:', error?.message || error);
        genAIPipelinePromise = null;
        return null;
      }
    })();
  }
  return genAIPipelinePromise;
}

/**
 * Generates a concise grounded natural-language response using the local Seq2Seq LLM.
 * Includes a safety timeout so UI never blocks on constrained hardware.
 * @param {string} prompt
 * @param {{ maxNewTokens?: number, timeoutMs?: number }} [options]
 * @returns {Promise<string | null>}
 */
export async function generateLocalResponse(prompt, { maxNewTokens = 140, timeoutMs = 8000 } = {}) {
  if (!prompt || prompt.trim().length === 0) return null;
  try {
    const pipe = await getGenAIPipeline();
    if (!pipe) return null;

    const inferencePromise = pipe(prompt, {
      max_new_tokens: maxNewTokens,
      do_sample: false,
      repetition_penalty: 1.2,
    });

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });

    const result = await Promise.race([inferencePromise, timeoutPromise]);
    const generated = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
    return generated ? generated.trim() : null;
  } catch (error) {
    console.warn('Local GenAI generation failed:', error);
    return null;
  }
}
