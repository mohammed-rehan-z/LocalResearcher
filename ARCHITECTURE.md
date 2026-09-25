# LocalResearcher Architecture Documentation

LocalResearcher is a privacy-first, purely local Research Paper Analysis Tool. It relies entirely on in-browser Deep Learning models to provide Semantic RAG, Extractive Question Answering, and Extractive Summarization—without requiring any LLM API keys or server backends.

This document outlines the core technical architecture, workflows, and algorithmic design choices that power LocalResearcher.

## 1. Tech Stack
*   **Framework:** Next.js (Client-Side Only logic)
*   **UI/Styling:** Tailwind CSS, Lucide Icons, Shadcn UI
*   **Machine Learning:** `@xenova/transformers` (Transformers.js running via WebAssembly)
*   **PDF Parsing:** `pdf.js`

## 2. Document Ingestion Pipeline (`lib/pdf-handler.js`)
When a user uploads a PDF, the document goes through a spatial extraction process:
1.  **Text Extraction:** `pdf.js` extracts raw text and font data (size, weight).
2.  **Metadata Heuristics:** The system identifies the Title and Authors by mathematically finding the largest font blocks on the first page, rather than relying on unstructured text searching.
3.  **Spatial Layout Awareness:** The text is concatenated sequentially based on bounding boxes, ensuring that 2-column formats (like IEEE and Springer papers) are read top-to-bottom per column rather than left-to-right across columns.

## 3. NLP Processing & Indexing (`lib/rag-engine.js`)
Once the text is extracted, it undergoes extensive Natural Language Processing:
1.  **Chunking:** The document is split into overlapping chunks (e.g., 800 chars with 150 char overlap) using sliding windows.
2.  **Section Classification:** A heuristic engine tags chunks based on content indicators (`abstract`, `methodology`, `results`).
3.  **Local Embeddings:** The chunks are passed to `lib/embedding-service.js`, where the **`Xenova/all-MiniLM-L6-v2`** model calculates a 384-dimensional dense vector for each chunk. The model runs locally and is cached in IndexedDB.
4.  **Vocabulary Building:** A TF-IDF vocabulary is built from the document corpus to track word frequencies for later keyword matching and spell correction.

## 4. Query Processing & Chat Engine
When the user asks a question in the chat, it triggers the Semantic RAG (Retrieval-Augmented Generation) pipeline.

### Step A: Query Normalization (Stop Words & Spell Correction)
The user's query is tokenized and cleaned:
*   **Stop Words Removal:** Common English stop words (`the`, `is`, `at`, `which`) are aggressively stripped to leave only high-density search terms.
*   **Context-Aware Spell Correction:** Each word in the query is cross-referenced with the exact Vocabulary of the PDF. If a word is misspelled, a **Levenshtein Distance** algorithm mathematically finds the closest matching term inside the PDF (e.g. correcting "methdology" to "methodology") with a max edit-distance of 2.

### Step B: Hybrid Retrieval
1.  **Semantic Search (Embeddings):** The corrected query is converted into a vector embedding. The engine calculates the **Cosine Similarity** between the query vector and every chunk vector.
2.  **Keyword Search (TF-IDF):** The engine calculates the keyword overlap using Term Frequency-Inverse Document Frequency.
3.  **Alpha Fusion:** The scores are merged (70% Semantic Weight, 30% Keyword Weight).

### Step C: Extractive Question Answering (`lib/embedding-service.js`)
Once the top 5 chunks are retrieved, LocalResearcher performs **Extractive QA** instead of generative LLM answering.
1.  The app uses the **`Xenova/distilbert-base-uncased-distilled-squad`** model (60MB).
2.  To avoid context-window limits, the top 5 chunks are evaluated *individually*.
3.  The model scans the chunks and returns the exact substring (e.g., "Anibal Alviz-Meza") that answers the question. The system picks the substring with the highest confidence score and displays it to the user.

## 5. Machine Learning Summarization (TextRank)
LocalResearcher uses a mathematical **TextRank Summarization** algorithm to summarize sections without using an LLM.
1.  The `local-summarizer.js` splits the document sections into individual sentences.
2.  It generates a dense vector embedding for *every sentence*.
3.  It calculates a **Cosine Similarity Matrix** comparing every sentence against every other sentence in the section.
4.  It assigns a "centrality score" to each sentence based on its total sum of similarities.
5.  The sentences with the highest centrality scores are extracted, sorted back into chronological order, and rendered as the summary.

## 6. Environment Patching & Stability
Next.js Turbopack injects incomplete Node.js `process` polyfills into the browser environment, which causes `transformers.js` to crash when attempting to evaluate `Object.keys(process.versions)`.
*   **The Fix:** LocalResearcher includes aggressive client-side polyfills in `embedding-service.js` to mock `process.env` and `process.versions`. 
*   **Module Patching:** The `isEmpty` utility in `@xenova/transformers/src/env.js` is patched via `patch-package` to fail gracefully when checking `undefined` objects.

## Conclusion
LocalResearcher achieves state-of-the-art document processing entirely within the user's browser, ensuring absolute privacy, zero ongoing API costs, and robust offline capability.
