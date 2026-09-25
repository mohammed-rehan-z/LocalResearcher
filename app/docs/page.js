/* eslint-disable */
"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { MarketingNav } from "../../components/marketing-nav";

export default function DocsPage() {
  return (
    <div className="bg-background text-on-background font-sans min-h-[100dvh] flex flex-col flex-1 w-full relative">
      
      {/* ETHEREAL GLASS BACKGROUND MESH */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#38bdf8]/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* MARKETING NAV (Consistent with Manifesto/Architecture) */}
      <MarketingNav />

      <main className="relative z-10 w-full pt-48 pb-32 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-32 flex flex-col gap-8">
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#38bdf8] mb-4">Getting Started</h4>
              <ul className="flex flex-col gap-3 font-sans text-[14px] text-on-surface-variant">
                <li><a href="#introduction" className="text-white hover:text-[#38bdf8] transition-colors">Introduction</a></li>
                <li><a href="#installation" className="hover:text-white transition-colors">Installation</a></li>
                <li><a href="#quickstart" className="hover:text-white transition-colors">Quickstart</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#38bdf8] mb-4">Core Concepts</h4>
              <ul className="flex flex-col gap-3 font-sans text-[14px] text-on-surface-variant">
                <li><a href="/architecture" className="hover:text-white transition-colors">System Architecture &rarr;</a></li>
                <li><a href="#local-rag" className="hover:text-white transition-colors">Local RAG Pipeline</a></li>
                <li><a href="#ast-parsing" className="hover:text-white transition-colors">AST PDF Parsing</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <h1 className="font-serif text-5xl font-bold tracking-tight text-primary mb-6">
              Documentation.
            </h1>
            <p className="text-xl text-on-surface-variant font-light mb-12">
              Learn how to integrate LocalResearcher's deterministic extraction protocol into your own applications.
            </p>

            <hr className="border-white/10 my-12" />

            <h2 id="introduction" className="text-3xl font-serif text-white mb-6 mt-12">Introduction</h2>
            <p className="text-on-surface-variant font-light">
              LocalResearcher is an open-source framework designed for academic researchers and developers who need zero-hallucination semantic extraction from peer-reviewed PDFs. Unlike standard LLM chatbots which blindly stuff text into a context window, LocalResearcher parses PDFs client-side, embeds chunks into a local vector database, and only injects highly relevant contexts into the prompt payload.
            </p>

            <h2 id="installation" className="text-3xl font-serif text-white mb-6 mt-16">Installation</h2>
            <p className="text-on-surface-variant font-light mb-6">
              LocalResearcher can be installed either via npm or directly from GitHub for the latest experimental builds:
            </p>
            <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl font-mono text-[14px] text-on-surface-variant mb-6">
              <span className="text-slate-500"># Option 1: Via NPM</span><br/>
              <span className="text-[#38bdf8]">npm install localresearcher@latest</span>
              <br/><br/>
              <span className="text-slate-500"># Option 2: Via GitHub (Bleeding edge)</span><br/>
              <span className="text-[#38bdf8]">npm install git+https://github.com/your-org/localresearcher.git</span>
            </div>

            <h2 id="quickstart" className="text-3xl font-serif text-white mb-6 mt-16">Quickstart</h2>
            <p className="text-on-surface-variant font-light mb-6">
              Initialize the deterministic vector index and ingest a PDF stream:
            </p>
            <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl font-mono text-[13px] text-on-surface-variant overflow-x-auto">
<pre><code><span className="text-[#a5b4fc]">import</span> {'{'} LocalResearcher {'}'} <span className="text-[#a5b4fc]">from</span> <span className="text-[#38bdf8]">'localresearcher'</span>;

<span className="text-[#a5b4fc]">const</span> <span className="text-white">engine</span> = <span className="text-[#a5b4fc]">new</span> <span className="text-white">LocalResearcher</span>({'{'}
  embedder: <span className="text-[#38bdf8]">'Xenova/all-MiniLM-L6-v2'</span>,
  storage: <span className="text-[#38bdf8]">'indexeddb'</span>
{'}'});

<span className="text-slate-500">// Ingest PDF and build AST mapping</span>
<span className="text-[#a5b4fc]">await</span> <span className="text-white">engine.ingest</span>(<span className="text-[#38bdf8]">'./attention-is-all-you-need.pdf'</span>);

<span className="text-slate-500">// Query against the local index</span>
<span className="text-[#a5b4fc]">const</span> <span className="text-white">results</span> = <span className="text-[#a5b4fc]">await</span> <span className="text-white">engine.query</span>(
  <span className="text-[#38bdf8]">'What is the exact equation for scaled dot-product attention?'</span>
);

console.log(<span className="text-white">results.topChunks</span>);
</code></pre>
            </div>

            <h2 id="local-rag" className="text-3xl font-serif text-white mb-6 mt-16">Local Pipeline</h2>
            <p className="text-on-surface-variant font-light mb-6">
              The Local Pipeline is the beating heart of LocalResearcher. It bypasses traditional cloud API bottlenecks by computing embeddings directly in your browser or Node environment. This relies on WebAssembly compiled transformer models, allowing semantic vectors to be generated on device hardware at sub-50ms speeds without ever sending your sensitive PDFs to a third-party server.
            </p>
            <p className="text-on-surface-variant font-light mb-6">
              Chunks are deterministically matched against your query tensor, generating a strict subset of information that prevents AI hallucinations by ensuring the model only references the explicitly retrieved semantic blocks.
            </p>

            <h2 id="ast-parsing" className="text-3xl font-serif text-white mb-6 mt-16">PDF Parsing</h2>
            <p className="text-on-surface-variant font-light mb-6">
              LocalResearcher utilizes an advanced AST (Abstract Syntax Tree) PDF Parser instead of standard OCR. Traditional OCR often collapses mathematical equations, superscripts, and bounding boxes into unreadable gibberish.
            </p>
            <p className="text-on-surface-variant font-light mb-6">
              Our parser isolates font-dictionary metrics and mapping arrays to reconstruct lossless formula trees and tensor indices. This creates a cryptographic audit lineage linking every semantic chunk back to its precise X/Y coordinate bounding box on the original PDF page.
            </p>

            <div className="mt-16 p-8 bg-[#38bdf8]/5 border border-[#38bdf8]/10 rounded-[2rem]">
              <h3 className="text-2xl font-serif text-white mb-4">Dive into the Architecture</h3>
              <p className="text-on-surface-variant font-light mb-6">
                Want to understand exactly how the local embedding and zero-hallucination chunking works under the hood?
              </p>
              <a href="/architecture" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#38bdf8] text-black font-medium hover:scale-105 transition-transform">
                Read the Architecture Guide &rarr;
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
