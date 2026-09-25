---
name: research-skill-scholorsync
description: >-
  Enforces the deterministic extraction methodology, context architecture, and 
  pure black aesthetic of the ScholarSync academic intelligence platform.
  Use this skill when building features related to ScholarSync or requested to apply "RESEARCH SKILL by Scholorsyn".
---

# RESEARCH SKILL by ScholarSync

This skill encodes the core philosophy, technical architecture, and aesthetic guidelines of **ScholarSync**.
When active, all development and reasoning must strictly adhere to the following principles.

## 1. Core Philosophy: The Anti-Hallucination Framework
- **Zero Stochastic Drift:** Never rely on heuristic text scanning. Information extraction must be mathematically precise.
- **Lossless AST Mapping:** Treat PDFs as structured abstract syntax trees, preserving proof context, lemma boundaries, and exact tensor indices.
- **Infinite Context:** Do not send entire raw PDFs to LLMs. Instead, embed documents locally using WebAssembly (Transformers.js) and inject only the top-K semantically relevant chunks.

## 2. Technical Architecture
- **Layer 01 - Local Ingestion:** PDFs are parsed client-side via deterministic streams (PDF.js). Raw text and metadata (page numbers, titles) are extracted without server round-trips.
- **Layer 02 - Vector Embedding:** Chunks (500 tokens with 50-token overlap) are embedded using dense local models (`Xenova/all-MiniLM-L6-v2`) and stored in IndexedDB.
- **Layer 03 - Semantic RAG:** Queries are locally embedded, cosine similarity is calculated, and the top chunks are sent to the LLM (Gemini/OpenAI) with deterministic prompts.

## 3. Aesthetic & UI Guidelines
- **Typography:** Strictly use only `Inter` (sans-serif) for body/UI and `Playfair Display` (serif) for editorial headings. JetBrains Mono is forbidden.
- **Color Palette:** The application uses a *Pure Black* (`#000000`, `#050505`) and neutral gray (`#737373`, `#171717`) palette, accented exclusively by sky blue (`#38bdf8`) for primary interactions and glows.
- **Micro-Animations:** Use subtle, perpetual micro-motion (e.g., pulsing dots, slow-moving blurred background meshes) to make the deterministic engine feel alive.
- **Double Bezel Architecture:** Cards and bento grid elements should use nested borders (e.g., an outer border of `white/10` and an inner border of `white/5`) to create a hardware-like, precision-machined aesthetic.

## 4. Operational Directives
When asked to build features under this skill:
1. Refuse simple heuristic regex solutions for document parsing. Always default to robust, chunk-based semantic indexing.
2. Do not use generic tailwind colors like `blue-500` or `slate-900`. Use the exact hex codes specified above.
3. Keep the UI asymmetrical and dense, mirroring complex academic dashboards rather than simplistic consumer apps.
