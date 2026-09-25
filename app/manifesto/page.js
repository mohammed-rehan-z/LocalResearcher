"use client";
import React from "react";
import { motion } from "motion/react";
import { MarketingNav } from "../../components/marketing-nav";

export default function ManifestoPage() {
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

      <main className="relative z-10 w-full pt-48 pb-32 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-primary mb-12">
            The Manifesto.
          </h1>

          <div className="prose prose-invert prose-lg max-w-none text-on-surface-variant space-y-8 font-light">
            <p className="text-2xl text-white font-serif">
              We believe the pursuit of human knowledge is bottlenecked by the very tools built to accelerate it.
            </p>
            
            <p>
              Every day, thousands of groundbreaking papers are published across arXiv, PubMed, and IEEE. Yet, researchers spend 80% of their time simply locating, managing, and cross-referencing PDFs instead of actually synthesizing the ideas within them.
            </p>
            
            <h2 className="text-3xl font-serif text-white mt-16 mb-8">The Broken State of Research.</h2>
            <p>
              Standard AI platforms and chatbots are entirely inadequate for serious academic research. They suffer from catastrophic context overflow, aggressive token limits, and mathematical stochastic degeneration. When you try to upload 50 peer-reviewed papers into a commercial LLM, it collapses under the weight of the context window. Equations are mangled. Citations are hallucinated.
            </p>
            
            <h2 className="text-3xl font-serif text-white mt-16 mb-8">Our Solution.</h2>
            <p>
              LocalResearcher is not just an application; it is a deterministic extraction protocol. We process documents locally on your device, embedding them into a highly scalable vector database that costs absolutely nothing in API fees. 
            </p>
            <p>
              We bypass the token limits of massive models by only sending the most mathematically relevant context chunks to the LLM. The result? Infinite context. Zero hallucinations. True semantic synthesis.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
