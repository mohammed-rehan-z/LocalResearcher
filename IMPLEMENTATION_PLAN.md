# LocalResearcher: Advanced RAG Implementation Plan

This document outlines the step-by-step implementation plan for upgrading LocalResearcher to support complex PDF layout extraction (e.g., IEEE/Springer multi-column), Local Deep Learning Embeddings via Transformers.js, Hybrid Search, and Accurate Summarization.

## Phase 1: Complex PDF Layout Extraction (IEEE/Springer)

Currently, `pdf-handler.js` extracts text linearly. This causes issues with IEEE and Springer papers which use two-column layouts, resulting in mixed-up sentences across columns.

**Implementation Steps:**
1.  **Upgrade PDF.js Text Extraction:**
    *   Modify `parsePdfFile` in `lib/pdf-handler.js`.
    *   Instead of concatenating text items by simple Y-coordinates, group them into **horizontal bounding boxes (X-coordinates)** to detect columns.
    *   *Algorithm:* 
        *   Group text items by their X-coordinate range (e.g., `x < page_width/2` is Left Column, `x > page_width/2` is Right Column).
        *   Sort items within each column by Y-coordinate descending.
        *   Concatenate the Left Column first, then the Right Column.
2.  **Section & Header Detection Enhancement:**
    *   IEEE and Springer format headers in bold or specific fonts.
    *   Extract font weight and size from `textContent.items` (using `transform` matrices and font dictionaries).
    *   Tag chunks not just by content heuristics, but by identifying bold/large text directly preceding them as the "Section Header".

## Phase 2: Local Deep Learning Embeddings (Transformers.js)

We will introduce `@xenova/transformers` to run the embedding model directly in the browser (WebAssembly) with zero API keys.

**Implementation Steps:**
1.  **Install Dependencies:**
    *   `npm install @xenova/transformers`
2.  **Create `lib/embedding-service.js`:**
    *   Initialize the `pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')`.
    *   Implement a caching mechanism so the model weights (approx. ~20-80MB) are downloaded only once and cached in the browser's IndexedDB.
    *   Create a function `generateEmbedding(text)` that returns a dense vector (array of floats).
3.  **Update Document Ingestion (`app/page.js`):**
    *   After `chunkPageText` runs, pass the chunks to `embedding-service.js`.
    *   Store the generated vector alongside the text content in the `paper.chunks` object.

## Phase 3: Hybrid Search Implementation

Combine our existing TF-IDF (Sparse) retrieval with the new Local Embeddings (Dense) retrieval for maximum accuracy.

**Implementation Steps:**
1.  **Modify `retrieveChunks` in `lib/rag-engine.js`:**
    *   *Step A:* Run the existing TF-IDF scoring on the query and chunks. Normalize scores between 0 and 1.
    *   *Step B:* Generate the embedding vector for the user's `query`.
    *   *Step C:* Calculate **Cosine Similarity** between the query vector and every chunk's vector. Normalize between 0 and 1.
2.  **Score Fusion (Alpha Fusion):**
    *   Combine the scores: `Final_Score = (Alpha * Semantic_Score) + ((1 - Alpha) * Keyword_Score)`
    *   Recommended Alpha: `0.7` (Favor semantic meaning, but respect exact keyword matches).
3.  **Return top-K chunks** sorted by `Final_Score`.

## Phase 4: Accurate Generation & Summarization

To generate a highly accurate summary and response using the retrieved chunks, we applied local summarization techniques and Extractive QA models.

**Implementation Steps:**
1.  **Extractive Question Answering (`distilbert-squad`):**
    *   [x] Implemented `distilbert-base-uncased-distilled-squad` in `embedding-service.js`.
    *   [x] Replaced chat fallbacks to evaluate top chunks independently and extract precise factual answers without hallucinations.
2.  **Extractive Local Summarization (TextRank):**
    *   [x] Enhanced `local-summarizer.js` to compute TextRank centrality scores for sentences based on cosine similarity matrices.
    *   [x] Summary extraction mathematically selects the top central sentences for maximum accuracy.
3.  **NLP Pipeline Enhancements:**
    *   [x] Stop Word Removal logic implemented for query parsing.
    *   [x] Context-aware Spelling Correction via Levenshtein Distance against document vocabulary.

## Status Summary
All core objectives from Phases 1-4 have been successfully implemented. The application runs robustly as a fully local, Zero-API Deep Learning platform.
