import React, { useState } from 'react'
import { projects } from '../../data/projects'

/**
 * ProjectsSection ("My Works")
 *
 * Bento-cluster showcase inspired by modern design-studio layouts:
 * - Displays Benny's resume projects one by one
 * - Left: Compact visual badge + clickable 3-item project stack around the active work
 * - Center: Dark #111111 hero showcase card with subtle grid, accent doodles, title, and metadata
 * - Right: Editorial insight note card + compact Prev/Next one-by-one controls
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

  // Show a 3-item window of projects on the left list centered around currentIndex
  const visibleWindow = [0, 1, 2].map((offset) => {
    const idx = (currentIndex + offset) % total
    return { project: projects[idx], idx }
  })

  return (
    <section
      id="works"
      aria-label="My Works"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-8 md:px-14 border-t border-black/10 bg-gradient-to-b from-[#f7f5ff] via-[#ffffff] to-[#fff9eb] select-none overflow-hidden"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Centered Studio Tagline */}
        <p className="text-center text-lg sm:text-2xl font-sans font-normal text-black/75 tracking-tight leading-snug max-w-md mb-10 sm:mb-12">
          Selected works &amp; digital
          <br />
          products built with craft.
        </p>

        {/* Bento Showcase Cluster */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {/* ================= LEFT COLUMN: MINI BADGE + 3-ITEM LIST ================= */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4 order-2 lg:order-1">
            {/* Top-Right Aligned Mini Visual Tile */}
            <div className="flex items-center justify-between lg:justify-end gap-3">
              <div className="lg:hidden text-xs font-mono uppercase tracking-widest text-black/50">
                Work {currentProject.id} / {String(total).padStart(2, '0')}
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-2">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold text-black border border-black/15"
                  style={{ backgroundColor: currentProject.accent || '#ffd700' }}
                >
                  {currentProject.id}
                </span>
                <span className="mt-1.5 text-[10px] font-mono text-black/60">
                  {currentProject.year}
                </span>
              </div>
            </div>

            {/* Stacked Project Selector Pills */}
            <div className="flex flex-col gap-2.5">
              {visibleWindow.map(({ project, idx }) => {
                const isSelected = idx === currentIndex
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full text-left rounded-2xl px-4 py-3.5 transition-all duration-200 border flex items-center gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-black shadow-[0_10px_25px_rgba(0,0,0,0.08)] scale-[1.01]'
                        : 'bg-white/80 border-black/10 hover:bg-white hover:border-black/25'
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-mono font-bold text-black border border-black/15"
                      style={{
                        backgroundColor: isSelected ? '#ffd700' : project.accent,
                      }}
                    >
                      {project.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-sans font-semibold text-black truncate">
                        {project.title}
                      </div>
                      <div className="text-[11px] font-mono text-black/50 truncate">
                        {project.subtitle}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ================= CENTER COLUMN: DARK FEATURE SHOWCASE CARD ================= */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative h-full min-h-[300px] sm:min-h-[340px] rounded-3xl bg-[#111111] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_24px_55px_rgba(0,0,0,0.18)] border border-white/10">
              {/* Subtle Architectural Grid Overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              {/* Top Accent Doodles */}
              <div className="relative z-10 flex items-center justify-between">
                {/* Sunburst / Spark Accent */}
                <svg
                  viewBox="0 0 36 24"
                  className="w-8 h-6 text-[#ffd700]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 18h28M9 14l-3-6M15 12l-1-7M21 12l1-7M27 14l3-6" />
                </svg>

                {/* Folder Outline Accent */}
                <svg
                  viewBox="0 0 36 28"
                  className="w-8 h-7 text-[#38bdf8]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 7a2 2 0 0 1 2-2h8l3 3h15a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                </svg>
              </div>

              {/* Main Project Title */}
              <div className="relative z-10 my-6">
                <div className="inline-flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-3 rounded-full bg-[#38bdf8] -rotate-12" />
                  <span className="w-1.5 h-3.5 rounded-full bg-[#ffd700]" />
                  <span className="w-1.5 h-3 rounded-full bg-[#fb923c] rotate-12" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-white leading-tight">
                  {currentProject.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm font-sans text-white/70">
                  {currentProject.subtitle}
                </p>
              </div>

              {/* Bottom Metadata & Tags */}
              <div className="relative z-10 flex flex-col gap-3 pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-1.5">
                  {currentProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
                  <span>{currentProject.category}</span>
                  <span className="text-[#ffd700] font-semibold">
                    {currentProject.id} / {String(total).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: NOTE CARD + ONE-BY-ONE CONTROLS ================= */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4 order-3">
            {/* Editorial Note Card */}
            <div className="flex-1 rounded-3xl bg-white border border-black/10 p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)] flex flex-col justify-between select-text">
              <p className="text-xs sm:text-sm font-sans text-black/80 leading-relaxed">
                {currentProject.note}
              </p>
              <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-black/50">
                <span>@benny_r</span>
                <span>{currentProject.year}</span>
              </div>
            </div>

            {/* Bottom-Left Aligned Compact Stepper Card */}
            <div className="rounded-2xl bg-white border border-black/10 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={prevProject}
                aria-label="Previous Work"
                className="w-9 h-9 rounded-full border border-black/15 bg-white hover:bg-black hover:text-[#ffd700] transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>

              {/* 3-Dot Accent Indicator */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700]" />
              </div>

              <button
                type="button"
                onClick={nextProject}
                aria-label="Next Work"
                className="w-9 h-9 rounded-full bg-black text-[#ffd700] hover:bg-[#ffd700] hover:text-black border border-black transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
