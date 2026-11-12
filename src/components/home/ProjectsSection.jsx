import React, { useState } from 'react'
import { projects } from '../../data/projects'

/**
 * ProjectsSection
 *
 * Fully Responsive Editorial Split Showcase:
 * - Fluid grid layout: Single column on mobile/tablet, 12-col split on desktop (lg+)
 * - Responsive typography for titles and bottom "Work" wordmark
 * - Touch-friendly navigation controls
 * - No horizontal overflow on smaller screens
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
    <div className="relative w-full py-8 sm:py-12 md:py-16 select-none border-t border-border-subtle">
      {/* Top Control Bar: Navigation Arrows & Index */}
      <div className="flex items-center justify-between pb-6 sm:pb-8">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={prevProject}
            aria-label="Previous Project"
            data-cursor="link"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/15 bg-white hover:bg-black hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
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
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/15 bg-white hover:bg-black hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-text-muted">
          <span className="text-text-heading font-bold text-xs sm:text-sm">{currentProject.id}</span>
          <span className="mx-1">/</span>
          <span>0{total}</span>
        </div>
      </div>

      {/* Main Responsive Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ================= LEFT COLUMN: EDITORIAL SHEET & TITLE ================= */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 sm:space-y-8 order-2 lg:order-1">
          {/* Project Card Preview Sheet */}
          <div
            data-cursor="project"
            className="relative w-full max-w-md bg-white border border-black/10 rounded-lg p-5 sm:p-6 shadow-[0_15px_35px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-500 cursor-pointer group"
          >
            {/* Card Header metadata */}
            <div className="flex justify-between items-start text-[10px] uppercase font-mono tracking-wider text-black/40 pb-3 sm:pb-4 border-b border-black/5">
              <span>FILTER: SHOWCASE</span>
              <span className="font-semibold text-black/70">A3 — {currentProject.id}</span>
            </div>

            {/* Editorial Title */}
            <div className="py-4 sm:py-6">
              <h3 className="text-2xl sm:text-3xl font-heading italic font-normal text-text-heading group-hover:text-primary transition-colors">
                {currentProject.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-text-muted mt-1 font-mono">
                {currentProject.year} / {currentProject.subtitle}
              </p>
            </div>

            {/* Card Paragraph Summary */}
            <p className="text-[11px] sm:text-xs leading-relaxed text-text-body pt-3 sm:pt-4 border-t border-black/5 font-sans">
              {currentProject.cardSnippet.summary}
            </p>
          </div>

          {/* Metadata Line */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-wider text-text-body py-3 sm:py-4 border-b border-border-subtle">
            <span>{currentProject.category}</span>
            <span className="font-semibold text-text-heading">{currentProject.year}</span>
            <span className="font-bold text-xs sm:text-sm text-text-heading">{currentProject.id}</span>
          </div>

          {/* Bottom Wordmark: "Work" */}
          <div className="pt-2 select-none overflow-hidden">
            <h2 className="fluid-giant-wordmark font-bold tracking-tighter text-text-heading">
              Work
            </h2>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PHOTOGRAPHY & FLOATING CARD ================= */}
        <div
          data-cursor="project"
          className="lg:col-span-7 relative h-[42vh] sm:h-[52vh] lg:h-[66vh] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-black/10 shadow-2xl group cursor-pointer order-1 lg:order-2"
        >
          {/* Background Project Photography */}
          <img
            key={currentProject.id}
            src={currentProject.image}
            alt={currentProject.title}
            className="absolute inset-0 w-full h-full object-cover object-center filter saturate-[0.95] contrast-[1.05] group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Subtle Gradient Veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

          {/* Floating Typographic Card Overlay */}
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 left-4 sm:left-auto bg-white/95 backdrop-blur-md border border-black/10 rounded-xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md shadow-2xl transition-transform duration-500 group-hover:-translate-y-1">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 sm:mb-3">
              <span>INTERACTIVE DESIGN</span>
              <span>{currentProject.category}</span>
            </div>

            {/* Typographic Keywords */}
            <div className="text-base sm:text-xl md:text-2xl font-heading font-medium tracking-tight text-text-heading leading-snug">
              {currentProject.heroCard.items.slice(0, 4).join(' — ')}
              <br className="hidden sm:block" />
              {' — ' + currentProject.heroCard.items.slice(4).join(' — ')}
            </div>

            {/* View Project Action Link with Gold Accent */}
            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-black/10 flex items-center justify-between text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-heading group-hover:text-primary transition-colors">
              <span>Explore Project</span>
              <span className="text-xs sm:text-sm">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
