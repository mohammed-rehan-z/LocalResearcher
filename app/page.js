/* eslint-disable */
"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { MarketingNav } from "../components/marketing-nav";

export default function PackagePage() {
  const [pkg, setPkg] = useState('npm');
  const [isCopied, setIsCopied] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const commands = {
    npm: 'npm install localresearcher@latest',
    pnpm: 'pnpm add localresearcher@latest',
    bun: 'bun add localresearcher@latest'
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(commands[pkg]);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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

      <main className="relative z-10 w-full pt-48 pb-32">
        
        {/* HERO ARCHITECTURE */}
        <motion.section 
          style={{ opacity: opacityHero, scale: scaleHero }}
          className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center justify-center min-h-[60vh]"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 /5 mb-8 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-medium">
              The Anti-Hallucination Framework
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-5xl font-serif text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tight text-primary mb-8 leading-[1.05]"
          >
            The research-grade RAG engine for <i className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-white to-[#94a3b8]">scientific literature.</i>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-[17px] sm:text-[19px] text-on-surface-variant font-light leading-relaxed max-w-2xl mx-auto mb-12"
          >
            Transform dense mathematical equations, multi-column arXiv preprints, and complex citation lineages into deterministic embeddings with mathematical proof anchors.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <motion.a 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center justify-center gap-3 pl-6 pr-2 py-2 rounded-full text-[14px] font-medium bg-[#38bdf8] text-[#050505] shadow-[0_0_40px_-10px_rgba(56,189,248,0.5)] transition-all" 
              href="https://github.com" target="_blank" rel="noopener noreferrer"
            >
              <span>Read the Documentation</span>
              <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center group-hover:bg-background/20 group-hover:translate-x-0.5 transition-all">
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-[14px] font-medium border border-white/10 text-primary hover:bg-black/5 hover:/5 backdrop-blur-md transition-all" 
              href="#comparison"
            >
              Explore Architecture
            </motion.a>
          </motion.div>

          {/* MACRO WHITESPACE FACTS GRID */}
          <div className="mt-24 w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 border-t border-white/10 pt-12">
            {[
              { label: "Ground Truth", value: "Zero Stochastic Drift" },
              { label: "Equation Recovery", value: "Bit-Exact LaTeX Tree" },
              { label: "Index Scale", value: "120M+ Scholarly Nodes" },
              { label: "Execution Engine", value: "Sub-50ms SIMD Native" }
            ].map((fact, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-left"
              >
                <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mb-2">{fact.label}</div>
                <div className="text-[15px] font-serif text-white tracking-wide">{fact.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ASYMMETRICAL BENTO: THE CONTEXT BOTTLENECK */}
        <section className="max-w-7xl mx-auto px-6 py-40" id="comparison">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 /5 mb-6">
              <span className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-[0.2em]">Platform Bottlenecks</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-primary mb-6 leading-tight">
              The Token Limit Constraint.
            </h2>
            <p className="text-on-surface-variant text-[18px] font-light leading-relaxed">
              Standard AI platforms fail when synthesizing across dozens of massive research PDFs due to hard token limits. localresearcher bypasses this by embedding your entire library locally and only feeding semantically relevant chunks to the LLM.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* CONVENTIONAL AI CARD (Double Bezel Architecture) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 rounded-[2rem] p-1.5 bg-surface-variant border border-outline"
            >
              <div className="h-full rounded-[calc(2rem-6px)] p-8 bg-surface-container-low border border-red-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-red-200/60">Standard AI Chatbots</span>
                  </div>
                </div>

                <div className="flex-1 relative z-10">
                  <div className="p-6 rounded-[1.5rem] /5 border border-white/5 mb-8 backdrop-blur-md">
                    <span className="font-mono text-[10px] uppercase text-red-400/60 tracking-[0.2em] block mb-4">Context Overflow Error</span>
                    <div className="font-mono text-[13px] text-red-400/90 bg-black/40 p-4 rounded-xl border border-red-500/10 leading-relaxed break-all">
                      &gt; Uploading 12 PDFs...<br/>
                      &gt; Error: 413 Payload Too Large<br/>
                      <br/>
                      <span className="text-red-400/70">"Context length exceeded (128k/128k tokens). Please remove files to continue."</span>
                    </div>
                  </div>

                  <ul className="space-y-4 text-[14px]">
                    {["Hard token caps prevent multi-paper synthesis.", "Exponential API costs for large document ingestion.", "Inability to maintain a persistent library."].map((text, i) => (
                      <li key={i} className="flex items-start gap-4 text-on-surface-variant">
                        <span className="material-symbols-outlined text-red-400/70 text-[16px] shrink-0 mt-0.5">close</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* LOCALRESEARCHER CARD (Double Bezel Architecture) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 rounded-[2rem] p-1.5 bg-[#38bdf8]/10 border border-[#38bdf8]/20"
            >
              <div className="h-full rounded-[calc(2rem-6px)] p-10 bg-[#070a10] border border-[#38bdf8]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#38bdf8]/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/4 transition-transform duration-1000 group-hover:scale-110" />
                
                <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.8)]"></span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#38bdf8]">localresearcher Local Vector Indexing</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#050505] bg-[#38bdf8] px-3 py-1 rounded-full uppercase tracking-widest font-bold">Infinite Context</span>
                </div>

                <div className="flex-1 relative z-10">
                  <div className="p-8 rounded-[1.5rem] bg-[#38bdf8]/5 border border-[#38bdf8]/10 mb-8 backdrop-blur-md">
                    <span className="font-mono text-[10px] uppercase text-[#38bdf8]/80 tracking-[0.2em] block mb-4">Semantic RAG Pipeline</span>
                    <div className="font-mono text-[13px] text-on-background bg-black/60 p-5 rounded-xl border border-white/10 leading-relaxed overflow-x-auto">
                      <span className="text-slate-500">// Local ingestion & retrieval</span><br/>
                      {`{`}<br/>
                      &nbsp;&nbsp;<span className="text-[#38bdf8]">"action"</span>: <span className="text-[#a5b4fc]">"semantic_retrieval"</span>,<br/>
                      &nbsp;&nbsp;<span className="text-[#38bdf8]">"library_size"</span>: <span className="text-[#a5b4fc]">"248 PDFs (Local Store)"</span>,<br/>
                      &nbsp;&nbsp;<span className="text-[#38bdf8]">"tokens_processed"</span>: <span className="text-[#a5b4fc]">"Local Device (0 API cost)"</span>,<br/>
                      &nbsp;&nbsp;<span className="text-[#38bdf8]">"llm_context_sent"</span>: <span className="text-[#a5b4fc]">"Top 5 relevant chunks (3,400 tokens)"</span><br/>
                      {`}`}
                    </div>
                  </div>

                  <ul className="grid sm:grid-cols-2 gap-6 text-[14px]">
                    {[
                      "Endlessly scalable local vector database.",
                      "Bypass external API token limits completely.",
                      "Synthesize insights across your entire library.",
                      "Zero API cost for document storage & embedding."
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-4 text-[#e2e8f0]">
                        <span className="material-symbols-outlined text-[#38bdf8] text-[18px] shrink-0">check_circle</span>
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
            
          </div>
        </section>

        {/* REDESIGNED PACKAGE COMMAND PALETTE CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-40">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full rounded-[3rem] p-1.5 bg-surface-variant border border-outline relative"
          >
            <div className="bg-[#000000] rounded-[calc(3rem-6px)] p-12 md:p-24 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden text-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#38bdf8]/10 rounded-full blur-[120px] pointer-events-none" />
              
              <h2 className="font-serif text-5xl md:text-6xl text-primary font-bold mb-6 tracking-tight relative z-10">Start building the future.</h2>
              <p className="text-on-surface-variant text-[18px] mb-12 max-w-2xl relative z-10 font-sans">Integrate deterministic academic data parsing into your own pipeline with our open-source NPM package.</p>
              
              <div className="flex flex-col items-center gap-4 relative z-10 w-full max-w-[500px]">
                <div className="flex items-center gap-6 mb-2">
                  {['npm', 'pnpm', 'bun'].map(t => (
                    <button 
                      key={t} onClick={() => setPkg(t)}
                      className={`relative pb-2 px-2 text-[14px] font-mono tracking-widest uppercase transition-colors ${pkg === t ? 'text-white font-bold' : 'text-on-surface-variant hover:text-white/80'}`}
                    >
                      {t}
                      {pkg === t && (
                        <motion.div layoutId="pkgTabCTA" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38bdf8]" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-between w-full bg-black/50 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
                  <div className="font-mono text-[16px] text-on-background">
                    <span className="text-[#38bdf8] mr-3">$</span>
                    {commands[pkg]}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={copyCommand}
                    className="w-10 h-10 rounded-full bg-surface-variant border border-outline flex items-center justify-center text-white relative overflow-hidden group hover:border-[#38bdf8]/50 transition-colors"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isCopied ? (
                        <motion.span key="check" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }} className="material-symbols-outlined text-[16px] text-[#38bdf8] absolute">check</motion.span>
                      ) : (
                        <motion.span key="copy" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }} className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-white absolute">content_copy</motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.div>
        </section>
</main>
    </div>
  );
}