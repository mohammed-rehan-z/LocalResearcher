export * from '../lib/ai-service.js';
export * from '../lib/embedding-service.js';
export * from '../lib/local-summarizer.js';
export * from '../lib/pdf-handler.js';
export * from '../lib/rag-engine.js';
export * from '../lib/scraper.js';

import { analyzePaper, performRagChat } from '../lib/ai-service.js';
import { parsePdfFile, detectTitleFromFontData, detectAuthorsFromFontData } from '../lib/pdf-handler.js';
import { chunkPageText, retrieveChunks } from '../lib/rag-engine.js';
import { generateEmbedding, answerQuestion } from '../lib/embedding-service.js';
import { generateLocalSummary, extractLocalMetadata, synthesizeAnswer } from '../lib/local-summarizer.js';

/**
 * LocalResearcher - Main entry point and orchestrator for deterministic local RAG.
 */
export class LocalResearcher {
  constructor({ 
    provider = 'local', 
    apiKey = null, 
    model = null, 
    embedder = 'Xenova/all-MiniLM-L6-v2', 
    chunkSize = 800, 
    chunkOverlap = 150 
  } = {}) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
    this.embedder = embedder;
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Orchestrates the parsing, embedding, and analysis of a PDF paper.
   * Runs 100% locally by default. If apiKey is provided, optionally uses cloud LLM.
   * @param {File|Buffer|Blob|ArrayBuffer} file - The PDF file to process
   * @param {Function} onProgress - Callback for parsing progress (0 - 100)
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
      const pageChunks = chunkPageText(p.text, p.page, paperId, this.chunkSize, this.chunkOverlap);
      allChunks = [...allChunks, ...pageChunks];
    });

    // Embeddings (generated concurrently)
    await Promise.all(
      allChunks.map(async (chunk) => {
        chunk.embedding = await generateEmbedding(chunk.content);
        chunk.paperTitle = title;
      })
    );

    let metadata;
    let summary;

    if (this.apiKey) {
      try {
        const result = await analyzePaper(this.apiKey, this.model, allChunks, this.provider);
        metadata = result.metadata;
        summary = result.summary;
      } catch (err) {
        console.warn("Cloud LLM analysis failed, falling back to local extraction:", err.message);
        metadata = extractLocalMetadata(allChunks, title);
        summary = await generateLocalSummary(allChunks, title, authors);
      }
    } else {
      // 100% Local Inference & Extraction
      metadata = extractLocalMetadata(allChunks, title);
      summary = await generateLocalSummary(allChunks, title, authors);
    }
    
    return {
      id: paperId,
      title,
      authors,
      year: metadata.year || new Date().getFullYear().toString(),
      pageCount: pdfData.pageCount,
      metadata,
      summary,
      chunks: allChunks
    };
  }

  /**
   * Alias for processPaper.
   */
  async ingest(file, onProgress = () => {}) {
    return this.processPaper(file, onProgress);
  }

  /**
   * Ask a question based on a set of chunks (context).
   * Runs 100% locally using DistilBERT SQuAD and extractive relevance synthesis.
   * @param {string} query - The question to ask
   * @param {Array} targetChunks - The chunk objects containing embeddings and text
   * @param {Array} history - Previous chat history
   * @returns {Promise<string>} The synthesized answer
   */
  async askQuestion(query, targetChunks, history = []) {
    // Retrieve most relevant chunks using hybrid search (Cosine Similarity + TF-IDF)
    const retrieved = await retrieveChunks(query, targetChunks, 5);
    const retrievedChunks = retrieved.map(r => r.chunk);

    if (this.apiKey) {
      try {
        return await performRagChat(
          this.apiKey,
          this.model,
          query,
          retrievedChunks,
          history,
          this.provider
        );
      } catch (err) {
        console.warn("Cloud Q&A failed, falling back to local QA:", err.message);
      }
    }

    // 100% Local QA with early-exit on high confidence
    let bestAnswer = null;
    let bestPage = null;
    let highestScore = -1;

    for (const chunk of retrievedChunks.slice(0, 3)) {
      const qaResult = await answerQuestion(query, chunk.content);
      if (qaResult && qaResult.score > highestScore) {
        highestScore = qaResult.score;
        bestAnswer = qaResult.answer;
        bestPage = chunk.page || null;
        // Early exit if high-confidence extraction is found (> 0.65)
        if (highestScore > 0.65) break;
      }
    }

    if (bestAnswer && highestScore > 0.25) {
      return await synthesizeAnswer(query, retrievedChunks, "", {
        directAnswer: bestAnswer,
        directPage: bestPage,
      });
    }

    return await synthesizeAnswer(query, retrievedChunks);
  }

  /**
   * Alias for askQuestion.
   */
  async query(query, targetChunks, history = []) {
    return this.askQuestion(query, targetChunks, history);
  }
}

// Backward-compatible alias
export const ScholarEngine = LocalResearcher;
