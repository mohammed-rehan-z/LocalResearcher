import React from 'react';
import { m } from 'motion/react';

export function Home({ setActiveView }) {
  return (
    <>
      {/* Background glow meshes */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#38bdf8]/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full pt-12 pb-32">
        <m.section 
          className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center justify-center min-h-[60dvh]"
        >
          <m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 mb-8 backdrop-blur-md bg-white/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-medium">
              Scientific output, systematically indexed
            </span>
          </m.div>

          <m.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-5xl font-serif text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tight text-primary mb-8 leading-[1.05]"
          >
            A decentralized academic intelligence platform designed for <i className="font-light italic text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a3a3a3]">deep literature synthesis.</i>
          </m.h1>

          <m.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-[17px] sm:text-[19px] text-on-surface-variant font-light leading-relaxed max-w-2xl mx-auto mb-12"
          >
            Engineered for exact provenance tracking and unbounded archival access. Transform dense equations into deterministic embeddings.
          </m.p>

          <m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <m.button 
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView("scraper")}
              className="group inline-flex items-center justify-center gap-3 pl-6 pr-2 py-2 rounded-full text-[14px] font-medium bg-[#38bdf8] text-black shadow-[0_0_40px_-10px_rgba(56,189,248,0.5)] transition-[transform,opacity,box-shadow]" 
            >
              <span>Search Papers</span>
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 group-hover:translate-x-0.5 transition-[transform,background-color]">
                <span className="font-mono text-sm">&rarr;</span>
              </div>
            </m.button>
            <m.button 
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView("dashboard")}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-[14px] font-medium border border-white/10 text-primary hover:bg-white/5 backdrop-blur-md transition-[transform,background-color]" 
            >
              Open Library
            </m.button>
          </m.div>
        </m.section>

        {/* ASYMMETRICAL BENTO: Core Modules */}
        <section className="max-w-7xl mx-auto px-6 py-32" id="modules">
          <m.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-[0.2em]">Platform Capabilities</span>
            </div>
            <h2 className="text-4xl font-serif font-bold tracking-tight text-primary mb-6 leading-tight">
              Core Modules.
            </h2>
          </m.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {[
              { className: "lg:col-span-6", tag: "Module 01", title: "Literature Search", body: "Search multiple academic databases (arXiv, PubMed, IEEE, etc.) simultaneously and ingest metadata directly into your library." },
              { className: "lg:col-span-6", tag: "Module 02", title: "Local RAG Library", body: "Upload and index your academic PDFs locally. Documents are automatically chunked and embedded for fast semantic retrieval." },
              { className: "lg:col-span-6", tag: "Module 03", title: "AI Chat & Synthesis", body: "Chat directly with your research papers. Generate contextual summaries and extract key insights using local models." },
              { className: "lg:col-span-6", tag: "Module 04", title: "Citation Formatting", body: "Instantly generate and export citations in multiple standard formats including APA, MLA, IEEE, and BibTeX." },
            ].map((card, i) => (
              <m.div 
                key={card.title}
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`${card.className} rounded-[2rem] p-1.5 bg-surface-variant border border-outline`}
              >
                <div className="h-full rounded-[calc(2rem-6px)] p-8 bg-surface-container-low border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#38bdf8]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-110" />
                  
                  <div className="flex flex-col relative z-10 h-full justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#38bdf8] mb-4 block">{card.tag}</span>
                      <h3 className="font-serif text-2xl text-primary mb-3">{card.title}</h3>
                      <p className="font-sans text-[15px] text-on-surface-variant leading-relaxed">{card.body}</p>
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
