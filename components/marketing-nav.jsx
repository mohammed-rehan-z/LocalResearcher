import React from "react";
import { motion } from "motion/react";
import Link from "next/link";

export function MarketingNav() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[max-content] rounded-full bg-surface-container/80 backdrop-blur-2xl border border-outline p-2 shadow-2xl"
    >
      <div className="flex items-center gap-6 px-4">
        <Link className="flex items-center gap-3 group" href="/">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-surface-variant border border-outline">
            <span className="font-serif text-[#38bdf8] font-bold text-lg leading-none">S</span>
          </div>
          <span className="font-medium text-[14px] tracking-tight text-primary group-hover:text-[#38bdf8] transition-colors">localresearcher</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-[13px] text-on-surface-variant">
          <Link className="hover:text-primary transition-colors" href="/manifesto">Manifesto</Link>
          <Link className="hover:text-primary transition-colors" href="/architecture">Architecture</Link>
          <Link className="hover:text-primary transition-colors" href="/docs">Docs</Link>
          <Link className="hover:text-primary transition-colors" href="/skill">Skill</Link>
        </nav>
        <div className="flex items-center pl-4 border-l border-white/10 gap-2">
          <Link className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium bg-[#38bdf8]  shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)] hover:scale-[0.97] transition-all" href="/dashboard">
            Open App
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
