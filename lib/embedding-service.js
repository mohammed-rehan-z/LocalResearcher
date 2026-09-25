let embeddingPipeline = null;

/**
 * Initializes the pipeline only once.
 * @returns {Promise<any>}
 */
export async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
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
      
      // Configure transformers.js to only run locally and use IndexedDB for caching
      env.allowLocalModels = false; 
      env.allowRemoteModels = true; 
      env.useBrowserCache = true; // Cache models in IndexedDB

      // Using a small, efficient model for sentence embeddings
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true, // Use 8-bit quantized version for smaller download size
      });
      console.log('Embedding model loaded successfully.');
    } catch (error) {
      console.error('Error loading embedding model:', error);
      throw error;
    }
  }
  return embeddingPipeline;
}

/**
 * Generates a dense vector embedding for a given text.
 * @param {string} text 
 * @returns {Promise<number[]>} Array of floats representing the embedding
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) return [];
  
  const pipe = await getEmbeddingPipeline();
  
  const output = await pipe(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Extract the raw data array from the tensor
  return Array.from(output.data);
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} similarity score between 0 and 1
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

let qaPipeline = null;

/**
 * Initializes the Question-Answering pipeline.
 */
export async function getQAPipeline() {
  if (!qaPipeline) {
    try {
      console.log('Loading QA model (this may take a moment on first run)...');
      if (typeof process === 'undefined') {
        globalThis.process = { env: {}, versions: {} };
      } else {
        process.versions = process.versions || {};
        process.env = process.env || {};
      }

      const { pipeline, env } = await import('@xenova/transformers');
      env.allowLocalModels = false; 
      env.allowRemoteModels = true; 
      env.useBrowserCache = true;

      qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad', {
        quantized: true,
      });
      console.log('QA model loaded successfully.');
    } catch (error) {
      console.error('Error loading QA model:', error);
      throw error;
    }
  }
  return qaPipeline;
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
