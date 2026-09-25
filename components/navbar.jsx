"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { PenTool, Search, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { id: "scraper",    label: "Research",     alwaysVisible: true },
  { id: "summarizer", label: "Intelligence", alwaysVisible: false },
  { id: "dashboard",  label: "Library",      alwaysVisible: true },
  { id: "tabular",    label: "Archive",      alwaysVisible: true },
  { id: "settings",   label: "Settings",     alwaysVisible: true },
];

export function Navbar({ activeView, setActiveView, activePaper, onUploadClick }) {
  const visibleLinks = NAV_LINKS.filter(
    (l) => l.alwaysVisible || activePaper
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center pointer-events-none p-4">
      <div className="pointer-events-auto /80 bg-surface-container-low/80 backdrop-blur-2xl rounded-full mt-4 mx-auto w-fit px-6 py-2 border border-outline flex items-center gap-8 transition-all duration-300 ease-in-out shadow-sm">
        <span 
          className="font-serif text-xl font-bold tracking-tighter text-primary cursor-pointer"
          onClick={() => setActiveView("overview")}
        >
          LocalResearcher
        </span>
        <div className="hidden md:flex gap-6 items-center">
          {visibleLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                className={`font-sans text-[11px] uppercase tracking-wider transition-colors ${
                  isActive 
                    ? "text-primary font-bold border-b border-black border-white pb-1" 
                    : "text-on-surface-variant hover: hover:text-white"
                }`}
                onClick={() => setActiveView(link.id)}
              >
                {link.label}
              </button>
            );
          })}
        </div>
        <button 
          className="bg-[#38bdf8] text-white font-sans text-[11px] font-bold uppercase tracking-wider px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
          onClick={onUploadClick}
        >
          {activeView === "settings" ? "Connect Identity" : "Upload Document"}
        </button>
      </div>
    </nav>
  );
}

// ─── Animated view wrapper ─────────────────────────────────────────────────
export function ViewTransition({ children, viewKey }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
