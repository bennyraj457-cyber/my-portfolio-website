import React, { useState } from 'react'
import { projects } from '../../data/projects'

/**
 * ProjectsSection
 *
 * Editorial Split Showcase matching reference:
 * - Left Side:
 *   - Navigation arrows (← →) and counter
 *   - Mini floating project card / sheet with editorial title & archive info
 *   - Category, Year, and numbered index
 *   - Giant bold modern headline: "Work"
 * - Right Side:
 *   - Full-bleed rich photography showcase frame
 *   - Floating typographic card overlay with animated dash keywords
 * - Clean self-contained height (no excess bottom empty scroll space)
 */
export default function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const total = projects.length
  const currentProject = projects[currentIndex] || projects[0]

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % total)
  }

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }

  return (
    <div className="relative w-full py-8 md:py-12 select-none border-t border-border-subtle">
      {/* Top Control Bar: Navigation Arrows & Index */}
      <div className="flex items-center justify-between pb-6 md:pb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevProject}
            aria-label="Previous Project"
            data-cursor="link"
            className="w-10 h-10 rounded-full border border-black/15 bg-white hover:bg-black hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextProject}
            aria-label="Next Project"
            data-cursor="link"
            className="w-10 h-10 rounded-full border border-black/15 bg-white hover:bg-black hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div className="text-xs uppercase tracking-widest font-semibold text-text-muted">
          <span className="text-text-heading font-bold text-sm">{currentProject.id}</span>
          <span className="mx-1">/</span>
          <span>0{total}</span>
        </div>
      </div>

      {/* Main 50/50 Editorial Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ================= LEFT COLUMN: EDITORIAL SHEET & TITLE ================= */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          {/* Top Project Card Preview Sheet */}
          <div
            data-cursor="project"
            className="relative w-full max-w-sm bg-white border border-black/10 rounded-lg p-6 shadow-[0_15px_35px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-500 cursor-pointer group"
          >
            {/* Card Header metadata */}
            <div className="flex justify-between items-start text-[10px] uppercase font-mono tracking-wider text-black/40 pb-4 border-b border-black/5">
              <span>FILTER: SHOWCASE</span>
              <span className="font-semibold text-black/70">A3 — {currentProject.id}</span>
            </div>

            {/* Editorial Title */}
            <div className="py-6">
              <h3 className="text-3xl font-heading italic font-normal text-text-heading group-hover:text-primary transition-colors">
                {currentProject.title}
              </h3>
              <p className="text-xs text-text-muted mt-1 font-mono">
                {currentProject.year} / {currentProject.subtitle}
              </p>
            </div>

            {/* Card Paragraph Summary */}
            <p className="text-[11px] leading-relaxed text-text-body pt-4 border-t border-black/5 font-sans">
              {currentProject.cardSnippet.summary}
            </p>
          </div>

          {/* Middle Metadata Line: Category + Year + Index Number */}
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-body py-4 border-b border-border-subtle">
            <span>{currentProject.category}</span>
            <span className="font-semibold text-text-heading">{currentProject.year}</span>
            <span className="font-bold text-sm text-text-heading">{currentProject.id}</span>
          </div>

          {/* Bottom Giant Editorial Wordmark: "Work" */}
          <div className="pt-2 select-none">
            <h2 className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-bold tracking-tighter leading-none text-text-heading">
              Work
            </h2>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PHOTOGRAPHY & FLOATING CARD ================= */}
        <div
          data-cursor="project"
          className="lg:col-span-7 relative h-[50vh] sm:h-[58vh] lg:h-[68vh] w-full rounded-2xl overflow-hidden border border-black/10 shadow-2xl group cursor-pointer"
        >
          {/* Background Project Photography */}
          <img
            key={currentProject.id}
            src={currentProject.image}
            alt={currentProject.title}
            className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[0.95] contrast-[1.05] group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Subtle Gradient Veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

          {/* Floating Typographic Card Overlay */}
          <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 bg-white/95 backdrop-blur-md border border-black/10 rounded-xl p-6 sm:p-8 max-w-sm sm:max-w-md shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-black/40 mb-3">
              <span>INTERACTIVE DESIGN</span>
              <span>{currentProject.category}</span>
            </div>

            {/* Typographic Keywords with Horizontal Em-Dashes */}
            <div className="text-xl sm:text-2xl md:text-3xl font-heading font-medium tracking-tight text-text-heading leading-snug">
              {currentProject.heroCard.items.slice(0, 4).join(' — ')}
              <br />
              {currentProject.heroCard.items.slice(4).join(' — ')}
            </div>

            {/* View Project Action Link with Gold Accent */}
            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-text-heading group-hover:text-primary transition-colors">
              <span>Explore Project</span>
              <span className="text-sm">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
