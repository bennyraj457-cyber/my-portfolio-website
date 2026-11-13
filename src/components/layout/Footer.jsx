import React from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-20 w-full border-t border-black/10 bg-white/70 backdrop-blur-md py-8 px-6 sm:px-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pill: Working on the other sections */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/[0.04] border border-black/[0.08] text-xs font-mono text-black/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffd700] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffd700]"></span>
          </span>
          <span>I'm currently working on the other sections</span>
        </div>

        {/* Copyright & Details */}
        <div className="text-xs text-black/50 font-sans tracking-tight text-center sm:text-right">
          © {currentYear} Benny. Designed & Crafted with Vision.
        </div>
      </div>
    </footer>
  )
}

