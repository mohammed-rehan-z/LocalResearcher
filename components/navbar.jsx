"use client";

import React from "react";
import { m, AnimatePresence } from "motion/react";

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
    <nav aria-label="Primary navigation" className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none p-3 sm:p-4">
      <div className="pointer-events-auto bg-surface-container-low/85 backdrop-blur-2xl rounded-full mt-2 sm:mt-4 mx-auto max-w-[calc(100vw-1.5rem)] w-fit px-4 sm:px-6 py-2 border border-outline flex items-center gap-4 sm:gap-8 transition-[background-color,border-color,box-shadow] duration-300 ease-in-out shadow-sm">
        <button
          type="button"
          className="font-serif text-lg sm:text-xl font-bold tracking-tighter text-primary cursor-pointer hover:text-[#38bdf8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-md px-1"
          onClick={() => setActiveView("overview")}
        >
          LocalResearcher
        </button>
        <div className="hidden md:flex gap-6 items-center">
          {visibleLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                type="button"
                key={link.id}
                aria-current={isActive ? "page" : undefined}
                className={`font-sans text-[11px] uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-sm px-1 ${
                  isActive 
                    ? "text-primary font-bold border-b border-accent pb-1" 
                    : "text-on-surface-variant hover:text-primary"
                }`}
                onClick={() => setActiveView(link.id)}
              >
                {link.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="bg-[#38bdf8] text-black font-sans text-[11px] font-bold uppercase tracking-wider px-4 sm:px-5 py-2 rounded-full hover:opacity-90 active:scale-[0.97] transition-[opacity,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
          onClick={onUploadClick}
        >
          Upload PDF
        </button>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden pointer-events-auto mt-2 bg-surface-container-low/85 backdrop-blur-2xl rounded-full px-3 py-1.5 border border-outline flex items-center gap-3 overflow-x-auto max-w-[calc(100vw-1.5rem)]">
        {visibleLinks.map((link) => {
          const isActive = activeView === link.id;
          return (
            <button
              type="button"
              key={link.id}
              aria-current={isActive ? "page" : undefined}
              className={`font-sans text-[10px] uppercase tracking-wider whitespace-nowrap px-2 py-1 rounded-full transition-colors ${
                isActive
                  ? "bg-white/10 text-primary font-semibold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setActiveView(link.id)}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Animated view wrapper ─────────────────────────────────────────────────
export function ViewTransition({ children, viewKey }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={viewKey}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
