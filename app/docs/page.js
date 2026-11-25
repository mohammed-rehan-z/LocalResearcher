/* eslint-disable */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MarketingNav } from "../../components/marketing-nav";

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState("");

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(""), 2000);
  };

  return (
    <div className="bg-background text-on-background font-sans min-h-[100dvh] flex flex-col flex-1 w-full relative">
      
      {/* ETHEREAL GLASS BACKGROUND MESH */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#38bdf8]/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'url("/noise.svg")' }} />

      {/* MARKETING NAV */}
      <MarketingNav />

      <main className="relative z-10 w-full pt-48 pb-32 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-32 flex flex-col gap-8">
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#38bdf8] mb-4">Getting Started</h4>
              <ul className="flex flex-col gap-2.5 font-sans text-[14px] text-on-surface-variant">
                <li><a href="#introduction" className="text-white hover:text-[#38bdf8] transition-colors">Introduction</a></li>
                <li><a href="#philosophy" className="hover:text-white transition-colors">Zero-API Architecture</a></li>
                <li><a href="#installation" className="hover:text-white transition-colors">Installation (NPM & Web)</a></li>
                <li><a href="#quickstart" className="hover:text-white transition-colors">Quickstart Example</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#38bdf8] mb-4">NPM Library Reference</h4>
              <ul className="flex flex-col gap-2.5 font-sans text-[14px] text-on-surface-variant">
                <li><a href="#npm-overview" className="hover:text-white transition-colors">Class: LocalResearcher</a></li>
                <li><a href="#method-ingest" className="hover:text-white transition-colors">engine.ingest()</a></li>
                <li><a href="#method-query" className="hover:text-white transition-colors">engine.query()</a></li>
                <li><a href="#standalone-utils" className="hover:text-white transition-colors">Standalone Utilities</a></li>
                <li><a href="#open-scrapers" className="hover:text-white transition-colors">Academic Scrapers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#38bdf8] mb-4">Core Concepts</h4>
              <ul className="flex flex-col gap-2.5 font-sans text-[14px] text-on-surface-variant">
                <li><Link href="/architecture" className="hover:text-white transition-colors">System Architecture &rarr;</Link></li>
                <li><a href="#ast-parsing" className="hover:text-white transition-colors">AST PDF Parser</a></li>
                <li><a href="#rag-summarizer" className="hover:text-white transition-colors">RAG Infill Summarizer</a></li>
                <li><a href="#multitasking" className="hover:text-white transition-colors">Multi-Paper Multitasking</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* MAIN DOCUMENTATION CONTENT */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="prose prose-invert prose-lg max-w-none text-on-surface-variant font-light"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
              <span className="font-mono text-[11px] text-[#38bdf8] uppercase tracking-[0.2em]">Documentation & NPM Manual</span>
            </div>

            <h1 className="font-serif text-5xl font-bold tracking-tight text-primary mb-6">
              LocalResearcher Manual.
            </h1>
            <p className="text-xl text-on-surface-variant font-light mb-12">
              Learn how to integrate LocalResearcher's deterministic extraction protocol into your scientific applications, research pipelines, and data stacks.
            </p>

            <hr className="border-white/10 my-10" />

            {/* INTRODUCTION */}
            <h2 id="introduction" className="text-3xl font-serif text-white mb-4 mt-12">Introduction</h2>
            <p className="leading-relaxed">
              <strong>LocalResearcher</strong> is a research-grade intelligence engine designed for academic scholars, engineers, and machine learning practitioners who require zero-hallucination factual extraction from peer-reviewed PDFs. Unlike standard LLM chatbots which blindly dump entire documents into a context window, LocalResearcher operates entirely on your local machine using WebAssembly.
            </p>

            {/* ZERO API PHILOSOPHY */}
            <h2 id="philosophy" className="text-3xl font-serif text-white mb-4 mt-14">Zero-API Architecture</h2>
            <p className="leading-relaxed">
              Commercial AI tools suffer from strict token caps, paid credit card dependencies, and privacy concerns when uploading proprietary research papers to remote cloud endpoints. LocalResearcher is built on three core zero-API pillars:
            </p>
            <ul className="space-y-3 my-6">
              <li><strong className="text-white">Zero Data Egress:</strong> Documents are parsed in-browser via WebAssembly PDF.js streams. Your proprietary PDFs never leave your device.</li>
              <li><strong className="text-white">Zero Cloud Dependencies:</strong> Embeddings are computed with ONNX WebAssembly models (<code className="text-[#38bdf8]">Xenova/all-MiniLM-L6-v2</code>) directly on local hardware.</li>
              <li><strong className="text-white">Cryptographic Provenance:</strong> Answers are deterministically synthesized using TextRank centrality and SQuAD extractive QA with exact page references.</li>
            </ul>

            {/* INSTALLATION */}
            <h2 id="installation" className="text-3xl font-serif text-white mb-4 mt-14">Installation</h2>
            <p className="leading-relaxed">
              Install the package from npm or clone the open-source repository:
            </p>

            <div className="bg-[#050505] border border-white/10 p-5 rounded-2xl font-mono text-[13px] relative my-6">
              <button 
                onClick={() => handleCopyCode("npm install localresearcher@latest", "npm-install")}
                className="absolute top-4 right-4 text-[11px] uppercase tracking-wider text-on-surface-variant hover:text-white px-2 py-1 rounded border border-white/10"
              >
                {copiedSection === "npm-install" ? "Copied!" : "Copy"}
              </button>
              <span className="text-slate-500"># Install via NPM</span><br/>
              <span className="text-[#38bdf8]">npm install localresearcher@latest</span>
              <br/><br/>
              <span className="text-slate-500"># Or install via pnpm / bun</span><br/>
              <span className="text-[#38bdf8]">pnpm add localresearcher@latest</span>
            </div>

            {/* QUICKSTART */}
            <h2 id="quickstart" className="text-3xl font-serif text-white mb-4 mt-14">Quickstart</h2>
            <p className="leading-relaxed">
              Initialize the deterministic engine, parse an academic preprint, and execute extractive queries with zero API keys:
            </p>

            <div className="bg-[#050505] border border-white/10 p-6 rounded-2xl font-mono text-[13px] leading-relaxed overflow-x-auto my-6">
<pre className="text-white"><code><span className="text-[#a5b4fc]">import</span> {'{'} LocalResearcher {'}'} <span className="text-[#a5b4fc]">from</span> <span className="text-[#38bdf8]">'localresearcher'</span>;

<span className="text-slate-500">// Initialize local engine (no API key required)</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">engine</span> = <span className="text-[#a5b4fc]">new</span> <span className="text-white">LocalResearcher</span>({'{'}
  chunkSize: <span className="text-[#38bdf8]">800</span>,
  chunkOverlap: <span className="text-[#38bdf8]">150</span>
{'}'});

<span className="text-slate-500">// Ingest and vectorize paper client-side</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">paper</span> = <span className="text-[#a5b4fc]">await</span> <span className="text-white">engine.ingest</span>(pdfBuffer, (progress) =&gt; {'{'}
  console.log(<span className="text-[#38bdf8]">`Parsing: ${'{'}progress{'}'}%`</span>);
{'}'});

console.log(<span className="text-white">paper.title</span>);
console.log(<span className="text-white">paper.metadata</span>);

<span className="text-slate-500">// Query the paper's vector index</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">answer</span> = <span className="text-[#a5b4fc]">await</span> <span className="text-white">engine.query</span>(
  <span className="text-[#38bdf8]">'What is the primary architectural contribution?'</span>,
  paper.chunks
);

console.log(<span className="text-white">answer</span>);
</code></pre>
            </div>

            <hr className="border-white/10 my-14" />

            {/* NPM LIBRARY REFERENCE */}
            <h2 id="npm-overview" className="text-3xl font-serif text-white mb-4 mt-14">Class: LocalResearcher</h2>
            <p className="leading-relaxed">
              The primary orchestrator class exported by the library.
            </p>

            <div className="bg-[#050505] border border-white/10 p-5 rounded-xl font-mono text-[12px] my-4 overflow-x-auto">
              <span className="text-[#a5b4fc]">new</span> <span className="text-white">LocalResearcher</span>({'{'}
              <br/>&nbsp;&nbsp;provider?: <span className="text-[#38bdf8]">'local' | 'gemini' | 'openai' | 'anthropic' | 'groq'</span>,
              <br/>&nbsp;&nbsp;apiKey?: <span className="text-[#38bdf8]">string | null</span>,
              <br/>&nbsp;&nbsp;model?: <span className="text-[#38bdf8]">string | null</span>,
              <br/>&nbsp;&nbsp;chunkSize?: <span className="text-[#38bdf8]">number</span>, <span className="text-slate-500">// Default: 800</span>
              <br/>&nbsp;&nbsp;chunkOverlap?: <span className="text-[#38bdf8]">number</span> <span className="text-slate-500">// Default: 150</span>
              <br/>{'}'})
            </div>

            <h3 id="method-ingest" className="text-2xl font-serif text-white mb-3 mt-10">engine.ingest(file, onProgress?)</h3>
            <p className="leading-relaxed">
              Processes a raw PDF stream or file into deterministic AST tokens, groups them into sliding-window text chunks, generates ONNX dense vector embeddings, and infills structured metadata and summaries.
            </p>
            <ul className="space-y-2 my-4">
              <li><strong>file</strong>: <code>File | Buffer | Blob | ArrayBuffer</code></li>
              <li><strong>onProgress</strong> (optional): <code>(progress: number) =&gt; void</code> callback reporting 0 to 100%.</li>
              <li><strong>Returns</strong>: <code>Promise&lt;PaperObject&gt;</code> containing <code>id</code>, <code>title</code>, <code>authors</code>, <code>year</code>, <code>pageCount</code>, <code>metadata</code>, <code>summary</code>, and <code>chunks</code>.</li>
            </ul>

            <h3 id="method-query" className="text-2xl font-serif text-white mb-3 mt-10">engine.query(question, targetChunks, history?)</h3>
            <p className="leading-relaxed">
              Executes hybrid search (70% Cosine Similarity + 30% TF-IDF keyword match), extracts relevant candidate sentences via DistilBERT SQuAD, and returns a cited response.
            </p>

            {/* STANDALONE UTILITIES */}
            <h2 id="standalone-utils" className="text-3xl font-serif text-white mb-4 mt-16">Standalone Utilities</h2>
            <p className="leading-relaxed">
              You can import individual sub-modules directly from the package without instantiating the full orchestrator:
            </p>

            <div className="bg-[#050505] border border-white/10 p-6 rounded-2xl font-mono text-[13px] leading-relaxed overflow-x-auto my-6">
<pre className="text-white"><code><span className="text-[#a5b4fc]">import</span> {'{'}
  parsePdfFile,
  chunkPageText,
  retrieveChunks,
  generateEmbedding,
  generateLocalSummary,
  extractNumericalResults
{'}'} <span className="text-[#a5b4fc]">from</span> <span className="text-[#38bdf8]">'localresearcher'</span>;

<span className="text-slate-500">// 1. Parse raw PDF</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">pdfData</span> = <span className="text-[#a5b4fc]">await</span> <span className="text-white">parsePdfFile</span>(fileBuffer);

<span className="text-slate-500">// 2. Chunk text</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">chunks</span> = <span className="text-white">chunkPageText</span>(pdfData.pages[0].text, 1, 'doc-1', 800, 150);

<span className="text-slate-500">// 3. Generate dense vectors</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">vector</span> = <span className="text-[#a5b4fc]">await</span> <span className="text-white">generateEmbedding</span>(<span className="text-[#38bdf8]">'Attention mechanism'</span>);

<span className="text-slate-500">// 4. Extract numerical SOTA metrics</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">metrics</span> = <span className="text-white">extractNumericalResults</span>(chunks);
</code></pre>
            </div>

            {/* ACADEMIC SCRAPERS */}
            <h2 id="open-scrapers" className="text-3xl font-serif text-white mb-4 mt-16">Open Academic Scrapers</h2>
            <p className="leading-relaxed">
              Query millions of open-access papers across arXiv, PubMed, Semantic Scholar, and CrossRef without registering for API credentials:
            </p>

            <div className="bg-[#050505] border border-white/10 p-6 rounded-2xl font-mono text-[13px] leading-relaxed overflow-x-auto my-6">
<pre className="text-white"><code><span className="text-[#a5b4fc]">import</span> {'{'} scrapeArxiv, scrapePubmed {'}'} <span className="text-[#a5b4fc]">from</span> <span className="text-[#38bdf8]">'localresearcher'</span>;

<span className="text-slate-500">// Stream results directly from arXiv</span>
<span className="text-[#a5b4fc]">await</span> <span className="text-white">scrapeArxiv</span>(
  {'{'} title: <span className="text-[#38bdf8]">'state space models'</span>, tags: [<span className="text-[#38bdf8]">'cs.LG'</span>], timeline: <span className="text-[#38bdf8]">'2024'</span> {'}'},
  <span className="text-[#38bdf8]">25</span>,
  (batch) =&gt; console.log(<span className="text-[#38bdf8]">'Received batch:'</span>, batch.length)
);
</code></pre>
            </div>

            <hr className="border-white/10 my-14" />

            {/* MULTI-PAPER MULTITASKING */}
            <h2 id="multitasking" className="text-3xl font-serif text-white mb-4 mt-14">Multi-Paper Multitasking</h2>
            <p className="leading-relaxed">
              Research rarely involves reading one paper in isolation. LocalResearcher includes first-class multitasking capabilities:
            </p>
            <ul className="space-y-3 my-6">
              <li><strong className="text-white">Batch Summarization:</strong> Select multiple documents in your library and trigger simultaneous local RAG extraction with zero UI freezing.</li>
              <li><strong className="text-white">Comparative Matrix:</strong> Review problems, methodologies, benchmarks, and datasets side-by-side in synchronized columns.</li>
              <li><strong className="text-white">Cross-Paper Q&A:</strong> Scope terminal chat to <code className="text-[#38bdf8]">@selected</code> or <code className="text-[#38bdf8]">@all</code> to synthesize comparative insights across papers.</li>
              <li><strong className="text-white">Batch BibTeX Export:</strong> Aggregate clean citation keys for all selected documents in one click.</li>
            </ul>

            {/* CALLOUT CARD */}
            <div className="mt-16 p-8 bg-[#38bdf8]/5 border border-[#38bdf8]/10 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Explore the System Architecture</h3>
                <p className="text-on-surface-variant font-light text-[15px]">
                  Learn about the 3-layer deterministic retrieval model, AST parser, and WebAssembly compilation pipeline.
                </p>
              </div>
              <Link 
                href="/architecture" 
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#38bdf8] text-black font-medium hover:scale-105 transition-transform"
              >
                Architecture Guide &rarr;
              </Link>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
