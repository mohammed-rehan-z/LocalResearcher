/* eslint-disable */
"use client";
import React from "react";
import { motion } from "motion/react";
import { MarketingNav } from "../../components/marketing-nav";

export default function ArchitecturePage() {
  return (
    <div className="bg-background text-on-background font-sans min-h-[100dvh] flex flex-col flex-1 overflow-x-hidden w-full relative">
      
      {/* ETHEREAL GLASS BACKGROUND MESH */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#38bdf8]/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* FLOATING FLUID ISLAND NAV */}
      <MarketingNav />

      <main className="relative z-10 w-full pt-48 pb-32 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-primary mb-16 text-center">
            Core Architecture.
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            
            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <div className="font-mono text-[#38bdf8] text-[10px] tracking-widest uppercase mb-6">Layer 01</div>
              <h3 className="text-3xl font-serif text-white mb-4">Local Ingestion Pipeline</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">
                PDFs are parsed entirely client-side using deterministic PDF.js streams. We extract raw text, identify header structures, and cleanly separate reference blocks from core methodology text without ever sending raw files over the wire.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <div className="font-mono text-[#38bdf8] text-[10px] tracking-widest uppercase mb-6">Layer 02</div>
              <h3 className="text-3xl font-serif text-white mb-4">Vector Embedding</h3>
              <p className="text-on-surface-variant font-light leading-relaxed">
                Parsed text is chunked into 500-token blocks with a 50-token semantic overlap. We use Transformers.js to generate dense embedding vectors (e.g., Xenova/all-MiniLM-L6-v2) directly inside the browser using WebAssembly.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-white/5 relative overflow-hidden md:col-span-2">
              <div className="absolute top-0 left-1/2 w-[600px] h-[300px] bg-[#38bdf8]/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
              <div className="font-mono text-[#38bdf8] text-[10px] tracking-widest uppercase mb-6">Layer 03</div>
              <h3 className="text-3xl font-serif text-white mb-4">Semantic Synthesis (RAG)</h3>
              <p className="text-on-surface-variant font-light leading-relaxed max-w-3xl">
                When a user queries the intelligence module, the query is embedded locally. We perform a cosine similarity search across the local IndexedDB vector store. The top-K mathematically relevant chunks are retrieved and packed into a deterministic prompt payload, which is then fed into the LLM (Google Gemini or OpenAI) for final synthesis.
              </p>
              <div className="mt-8 font-mono text-[13px] text-on-background bg-black/60 p-5 rounded-xl border border-white/10 leading-relaxed overflow-x-auto">
                 <span className="text-slate-500">// Top-K Context Injection</span><br/>
                 <span className="text-[#a5b4fc]">const</span> <span className="text-white">contextPayload</span> = <span className="text-white">topChunks.map</span>(c =&gt; <span className="text-[#38bdf8]">`
                   [Paper: ${'{'}c.metadata.title{'}'}, Page: ${'{'}c.metadata.page{'}'}]
                   ${'{'}c.text{'}'}
                 `</span>).<span className="text-white">join</span>(<span className="text-[#38bdf8]">'\\n---\\n'</span>);
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
