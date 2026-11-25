---
name: research-skill-localresearcher
description: Use for building, extending, debugging, or auditing LocalResearcher features — including 100% local PDF/OCR parsing, single- and multi-column text reconstruction, Okapi BM25 + dense vector RAG retrieval, local GenAI/NLP synthesis, academic literature search, and privacy-first research UI workflows.
---

# LocalResearcher Engineering & Research Skill

Use this skill whenever working on the LocalResearcher platform, its Next.js web studio, its local WASM/ONNX inference pipeline, or its Node.js SDK (`src/index.js`). Act first as a deterministic information-retrieval systems architect, then as a senior full-stack engineer implementing verifiable, zero-API research software.

## Core Standard

The two priorities of this skill outrank everything else:

1. **Zero Cloud APIs & Strict Grounding**: Every ingestion, embedding, retrieval, summarization, OCR, and Q&A path must execute 100% locally with zero user API keys or external LLM dependencies. Every generated claim must be anchored to retrieved source chunks with explicit `[Page X]` provenance.
2. **End-to-End Verification**: Never stop at code edits. Verify with `npm run lint`, `npm run build` (`next build --webpack`), and React/UI inspection until there are zero lint errors, zero hydration/runtime errors, and clean browser behavior.

## Hard Rules

1. **Zero User API Keys**: Never introduce required API keys, cloud provider sign-in walls, or external LLM calls for core document analysis, summarization, or chat. Local ONNX models (`Xenova/all-MiniLM-L6-v2`, `Xenova/distilbert-base-uncased-distilled-squad`, `Xenova/LaMini-Flan-T5-77M`) pre-cached in `public/models/` are the primary execution engine.
2. **Absolute Grounding & Anti-Hallucination**: Never fabricate citations, author names, metrics, sample sizes, or benchmark claims. If retrieved chunks fall below confidence thresholds, state clearly that the indexed passages do not directly answer the query and present only the closest retrieved evidence.
3. **Clickable `[Page X]` Provenance**: All chat answers and evidence excerpts must format page references as `[Page X]` (and `[Paper Title, Page X]` for cross-paper scope) so `renderMessageTextWithCitations` turns them into interactive context-extractor badges.
4. **Layout-Aware Single & Multi-Column Parsing**: PDF extraction in `lib/pdf-handler.js` must preserve reading order across single-column, 2-column, 3-column, and mixed-band pages, de-hyphenate soft line wraps, filter margin page-number artifacts, and fall back to local `tesseract.js` OCR when a page lacks an embedded text layer.
5. **Next.js 16 + Webpack Compatibility**: This repository uses custom Webpack fallbacks in `next.config.mjs` for browser WASM/ONNX polyfills. Always keep `"dev": "next dev --webpack"` and `"build": "next build --webpack"` working, and never run `npm audit fix --force` (which breaks `@xenova/transformers` by downgrading to legacy native `canvas` builds).
6. **Promise-Locked Model Singletons**: Always initialize `@xenova/transformers` pipelines and `tesseract.js` workers through cached singleton promises (`embeddingPipelinePromise`, `qaPipelinePromise`, `genAIPipelinePromise`, `ocrWorkerPromise`) so concurrent calls never trigger duplicate 20–80 MB WASM downloads.
7. **LazyMotion & Accessibility Discipline**: Use `m` from `motion/react` (backed by `<LazyMotion features={domAnimation}>` in `app/motion-provider.js`), semantic `<dialog open>` for modals, explicit `htmlFor`/`id` or `aria-label` on all form controls, `Set`/`Map` for repeated ID lookups, and `URL.revokeObjectURL()` after blob downloads.
8. **Never Mask Unverified Results**: Do not claim lint, build, or model checks passed unless observed after the final edit.

## Coordinate With Other Installed Skills

- Use `redesign-existing-projects` or `design-taste-frontend` when performing major visual overhauls of marketing or dashboard surfaces while preserving LocalResearcher's obsidian (`#09090b`) and sky-cyan (`#38bdf8`) design tokens.
- Keep `AGENTS.md` Next.js 16 conventions in mind before modifying App Router routes, `next.config.mjs`, or server/client boundaries.

## Local AI & RAG Workflow

Follow this layered architecture when modifying document ingestion, retrieval, or chat:

### 1. PDF & OCR Ingestion (`lib/pdf-handler.js`)
- Extract pages concurrently via `pdfjs-dist` (`parsePdfFile`).
- If a page has `items.length === 0` or fewer than `40` characters, render it at `2.0x` scale onto an offscreen canvas and extract text locally with `extractTextWithOCR` (`tesseract.js`).
- Segment embedded text pages via XY-cut horizontal bands (`single` vs `multi` column), detect 2-column vs 3-column gutters, de-hyphenate wrapped words (`transfor-\nmer` -> `transformer`), and emit `{ page, text, layout }`.

### 2. Chunking & Hybrid NLP Retrieval (`lib/rag-engine.js`)
- Chunk pages with `chunkPageText(pageText, pageNumber, paperId, chunkSize, overlap)` and tag section hints (`abstract`, `introduction`, `methodology`, `experiments`, `results`, `discussion`, `conclusion`).
- Tokenize with stop-word removal and morphological stemming (`stemToken`), caching token frequencies and adjacent content-word bigrams (`extractBigrams`) in `chunkAnalysisCache` (`WeakMap`).
- Score chunks with **Hybrid Retrieval**:
  - Dense cosine similarity (`all-MiniLM-L6-v2`, unit-vector fast path in `cosineSimilarity`)
  - Sparse **Okapi BM25** ($k_1 = 1.5, b = 0.75$) with bounded Levenshtein typo correction
  - Bigram phrase overlap boost and query-intent section boost (`classifyQueryIntent`).

### 3. Summarization & GenAI Chat (`lib/local-summarizer.js`, `lib/embedding-service.js`)
- **Summarization (`generateLocalSummary`, `summarizePassage`)**:
  - Protect academic abbreviations (`et al.`, `Fig.`, `Eq.`, `Sec.`, `e.g.`, `i.e.`, `vs.`) during sentence splitting.
  - Run section extraction with parallel `Promise.all` semantic RAG fallback (`getSectionTextOrRagFallback`).
  - Rank sentences via **Salience-Weighted TextRank + MMR** ($\lambda = 0.72$) across up to 45 evenly sampled sentences so long multi-column sections are never truncated.
  - Extract datasets, acronyms (`extractAcronyms`), keywords, and quantitative benchmark metrics (`extractNumericalResults`).
- **Semantic Chat (`performLocalQA`, `synthesizeAnswer`)**:
  - Enrich short or pronoun-heavy follow-up queries with prior user turn context before retrieval.
  - For single-paper queries, evaluate metadata + top retrieved chunks with `distilbert-base-uncased-distilled-squad` (early-exit at `score > 0.65`) and pass `{ directAnswer, directPage }` into `synthesizeAnswer`.
  - For multi-paper queries (`all` / `selected`), route directly to `synthesizeAnswer` for cross-paper comparative clustering without redundant SQuAD passes.
  - Rank sentences using dense semantic similarity + lexical overlap, generate a strictly grounded **AI Synthesis** via `LaMini-Flan-T5-77M` (`generateLocalResponse` with 8s timeout), and append clickable `[Page X]` citations and supporting blockquotes.

## Before Editing

Before modifying LocalResearcher code, verify:
- Which layer is affected: Ingestion/OCR (`lib/pdf-handler.js`), Vector/GenAI Models (`lib/embedding-service.js`), Retrieval/NLP (`lib/rag-engine.js`), Summarization/Chat (`lib/local-summarizer.js`), UI (`app/dashboard/page.js`, `components/`), or SDK (`src/index.js`).
- Whether local models in `public/models/` are required (`npm run download-models` downloads `all-MiniLM-L6-v2`, `distilbert-base-uncased-distilled-squad`, and `LaMini-Flan-T5-77M`).
- Whether any React state or modal changes obey `react-doctor` rules (no nested interactive controls, `Set` lookups in loops, `LazyMotion` `m` components, guarded `parseInt`).

## Implementation

- Keep functions modular, single-purpose, and non-blocking on the browser main thread (batch embeddings and yield cleanly).
- Preserve backward compatibility of `LocalResearcher` (`src/index.js`) methods: `processPaper`, `ingest`, `askQuestion`, `query`, and `ScholarEngine` alias.
- Preserve offline-first assets (`/noise.svg`, `/models/...`, `next/font/google` in `app/layout.js`) so the app functions without external network calls after initial build.
- Maintain layered obsidian surfaces (`#09090b`, `#111114`, `#141418`) with `#38bdf8` accent, `Playfair Display` display headings, `Inter` body text, and `JetBrains Mono` (`tabular-nums`) for metrics and code.

## Verification

Run and verify every change against these gates:

1. **Lint Gate**: `npm run lint` must exit `0` with zero errors.
2. **Production Build Gate**: `npm run build` (`next build --webpack`) must compile cleanly and prerender all App Router routes.
3. **React Health Gate**: Run `npx react-doctor@latest . --yes` after major UI refactors and resolve any new bugs, accessibility issues, or performance regressions.
4. **Offline Model Check**: Confirm `public/models/Xenova/` contains the quantized ONNX models when testing local inference.

Hard stops: introducing mandatory user API keys, breaking `next dev --webpack` or `next build --webpack`, unrevoked object URLs, non-clickable citations (missing `[Page X]` brackets), nested interactive elements, or claiming unverified test results.

## Final Response

When reporting completed work in this project, include:
- Exact modified file paths as clickable `file://` links.
- Summary of changes across Ingestion/OCR, NLP/RAG, GenAI/Summarization, or UI layers.
- Observed results from `npm run lint`, `npm run build`, and (when run) `react-doctor` or `download-models`.

