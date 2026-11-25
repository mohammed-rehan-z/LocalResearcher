"use client";
import React from "react";
import { m } from "motion/react";
import { MarketingNav } from "../../components/marketing-nav";

export default function SkillPage() {
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

      <main className="relative z-10 w-full pt-48 pb-32 max-w-5xl mx-auto px-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center text-center"
        >
          <h4 className="font-mono text-[13px] uppercase tracking-widest text-[#38bdf8] mb-6">
            AI Agent Integration
          </h4>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-primary mb-8">
            RESEARCH SKILL<br/><span className="text-on-surface-variant font-light italic">by LocalResearcher</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-light mb-12 max-w-2xl">
            A deterministic engineering &amp; retrieval skill for Antigravity, Claude, and Codex enforcing 100% local zero-API inference, layout-aware OCR parsing, Okapi BM25 + dense vector RAG, and strict [Page X] provenance.
          </p>
        </m.div>

        <div className="mt-12 bg-surface-container-low border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent opacity-50" />
          
          <h3 className="text-2xl font-serif text-white mb-6">Installation</h3>
          <p className="text-on-surface-variant font-light mb-6">
            Included directly in <code className="text-[#38bdf8]">.agents/skills/research-skill-localresearcher/SKILL.md</code> to guide AI coding agents across LocalResearcher&apos;s local models, OCR pipeline, and UI standards.
          </p>
          
          <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl font-mono text-[13px] text-on-surface-variant overflow-x-auto">
<pre><code><span className="text-slate-500"># Skill location in this workspace</span>
<span className="text-[#38bdf8]">.agents/skills/research-skill-localresearcher/SKILL.md</span>

<span className="text-slate-500"># Pre-download all 3 local ONNX models (Embeddings, SQuAD QA, LaMini-Flan-T5)</span>
<span className="text-[#38bdf8]">npm run download-models</span>
</code></pre>
          </div>

          <hr className="border-white/10 my-12" />

          <h3 className="text-2xl font-serif text-white mb-6">Core Directives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white mb-3">01. Zero-API Local Execution</h4>
              <p className="text-[15px] text-on-surface-variant font-light leading-relaxed">
                All embeddings (all-MiniLM-L6-v2), QA (DistilBERT SQuAD), GenAI synthesis (LaMini-Flan-T5-77M), and OCR (Tesseract.js) execute locally via WebAssembly/ONNX with zero user API keys.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white mb-3">02. Layout-Aware OCR &amp; Parsing</h4>
              <p className="text-[15px] text-on-surface-variant font-light leading-relaxed">
                PDF extraction segments single-column, 2-column, 3-column, and mixed bands in true reading order, de-hyphenates wrapped words, and falls back to 2x canvas OCR for scanned pages.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white mb-3">03. Hybrid BM25 + Semantic RAG</h4>
              <p className="text-[15px] text-on-surface-variant font-light leading-relaxed">
                Retrieval combines Okapi BM25, morphological stemming, and bigram phrase matching with dense cosine similarity and MMR TextRank summarization.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-white mb-3">04. Clickable [Page X] Provenance</h4>
              <p className="text-[15px] text-on-surface-variant font-light leading-relaxed">
                Every generated claim is strictly grounded in retrieved chunks and post-fixed with clickable [Page X] anchors backed by confidence thresholds to prevent hallucination.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
