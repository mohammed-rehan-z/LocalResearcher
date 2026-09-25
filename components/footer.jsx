export function Footer() {
  return (
    <footer className="w-full border-t border-outline bg-background py-12 px-6 md:px-12 mt-auto z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-surface-variant border border-outline">
              <span className="font-serif text-[#38bdf8] font-bold text-xs leading-none">S</span>
            </div>
            <span className="font-sans text-[14px] tracking-tight font-medium text-white">localresearcher</span>
          </div>
          <p className="font-mono text-[10px] text-[#737373] text-on-surface-variant uppercase tracking-[0.1em]">© {new Date().getFullYear()} LocalResearcher Intelligence Systems. Terminal Access v4.0.2</p>
        </div>
        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <a className="font-sans text-[13px] text-[#737373] text-on-surface-variant hover:text-primary transition-colors" href="/docs">Documentation</a>
            <a className="font-sans text-[13px] text-[#737373] text-on-surface-variant hover:text-primary transition-colors" href="/manifesto">Manifesto</a>
          </div>
          <div className="flex flex-col gap-4">
            <a className="font-sans text-[13px] text-[#737373] text-on-surface-variant hover:text-primary transition-colors" href="/architecture">System Architecture</a>
            <a className="font-sans text-[13px] text-[#737373] text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">App Dashboard</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
