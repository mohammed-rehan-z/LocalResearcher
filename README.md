# LocalResearcher

An open-source, deterministic academic intelligence platform designed for deep literature synthesis and zero-hallucination extraction.

LocalResearcher parses peer-reviewed PDFs client-side, embeds document chunks into a local vector database using Transformer models, and strictly injects mathematically relevant contexts into the LLM payload to ensure accurate, non-hallucinated research summaries.

## Key Features

- **Client-Side Document Parsing:** Leverages local WebAssembly pipelines (PDF.js) to parse structure without sending your private PDFs to a cloud server.
- **Deterministic RAG (Retrieval Augmented Generation):** Uses `@xenova/transformers` (`all-MiniLM-L6-v2`) inside the browser for embedding and vectorizing document chunks.
- **Zero-Hallucination Philosophy:** The prompt engineering strictly enforces that the LLM only answers from the explicitly extracted semantic chunks.
- **Performance Optimized:** AI dependencies (like LangChain) are heavily code-split and dynamically imported for instantaneous initial page loads.
- **Offline-First Indexing:** IndexedDB is used for caching embedded AST maps, meaning once a document is vectorized, it remains instantly accessible locally.

## Installation

Install the latest package directly via npm:

```bash
npm install localresearcher@latest
```

Or clone the bleeding-edge repository:

```bash
git clone https://github.com/your-org/localresearcher.git
cd localresearcher
npm install
```

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage (Library Example)

Initialize the deterministic vector index and ingest a PDF stream in your own Node/Next applications:

```javascript
import { LocalResearcher } from 'localresearcher';

const engine = new LocalResearcher({
  embedder: 'Xenova/all-MiniLM-L6-v2',
  storage: 'indexeddb'
});

// Ingest PDF and build AST mapping
await engine.ingest('./attention-is-all-you-need.pdf');
```

## Architecture & Aesthetic

The UI is built strictly with Next.js, TailwindCSS, and Framer Motion. It heavily enforces a "pure black" (#000000) design aesthetic with high-contrast text and a focus on utilitarian typography (Inter + Playfair Display) to reduce sensory noise while doing academic research.

## License

MIT
