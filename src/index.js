export * from '../lib/ai-service.js';
export * from '../lib/embedding-service.js';
export * from '../lib/local-summarizer.js';
export * from '../lib/pdf-handler.js';
export * from '../lib/rag-engine.js';
export * from '../lib/scraper.js';

import { analyzePaper, performRagChat } from '../lib/ai-service.js';
import { parsePdfFile, detectTitleFromFontData, detectAuthorsFromFontData } from '../lib/pdf-handler.js';
import { chunkPageText, retrieveChunks } from '../lib/rag-engine.js';
import { generateEmbedding } from '../lib/embedding-service.js';

/**
 * ScholarEngine - A high-level wrapper to orchestrate the RAG pipeline easily.
 */
export class ScholarEngine {
  constructor({ provider = 'google-genai', apiKey = null, model = null } = {}) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Orchestrates the parsing, embedding, and analysis of a PDF paper.
   * @param {File|Buffer|Blob} file - The PDF file to process
   * @param {Function} onProgress - Callback for parsing progress
   * @returns {Promise<Object>} The parsed and analyzed paper object
   */
  async processPaper(file, onProgress = () => {}) {
    const pdfData = await parsePdfFile(file, onProgress);
    const title = detectTitleFromFontData(pdfData.firstPageFontItems, pdfData.title);
    const authors = detectAuthorsFromFontData(pdfData.firstPageFontItems, title);
    
    // Chunking
    let allChunks = [];
    const paperId = `paper-${Date.now()}`;
    pdfData.pages.forEach(p => {
      const pageChunks = chunkPageText(p.text, p.page, paperId, 800, 150);
      allChunks = [...allChunks, ...pageChunks];
    });

    // Embeddings
    for (let idx = 0; idx < allChunks.length; idx++) {
      allChunks[idx].embedding = await generateEmbedding(allChunks[idx].content);
    }

    if (!this.apiKey) {
      throw new Error("API Key is required for LLM analysis. Local fallback available in standard lib functions.");
    }

    // Analysis
    const result = await analyzePaper(this.apiKey, this.model, allChunks, this.provider);
    
    return {
      id: paperId,
      title,
      authors,
      pageCount: pdfData.pageCount,
      metadata: result.metadata,
      summary: result.summary,
      chunks: allChunks
    };
  }

  /**
   * Ask a question based on a set of chunks (context).
   * @param {string} query - The question to ask
   * @param {Array} targetChunks - The chunk objects containing embeddings and text
   * @param {Array} history - Previous chat history
   * @returns {Promise<string>} The LLM's response
   */
  async askQuestion(query, targetChunks, history = []) {
    if (!this.apiKey) {
      throw new Error("API Key is required for Q&A.");
    }

    // Retrieve most relevant chunks
    const retrieved = await retrieveChunks(query, targetChunks, 5);
    const retrievedChunks = retrieved.map(r => r.chunk);

    // Call LLM
    const replyContent = await performRagChat(
      this.apiKey,
      this.model,
      query,
      retrievedChunks,
      history,
      this.provider
    );

    return replyContent;
  }
}
