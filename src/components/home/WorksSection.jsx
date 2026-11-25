import React, { useMemo, useState } from 'react'
import { worksShowcaseData } from '../../data/projects'

const WORK_FILTERS = ['All', 'Websites', 'Web Apps']

export default function WorksSection() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedWorkId, setSelectedWorkId] = useState(worksShowcaseData[0].id)

  const filteredWorks = useMemo(() => {
    if (activeFilter === 'Websites') {
      return worksShowcaseData.filter(
        (w) => w.type.includes('Website') || w.type === 'E-Commerce'
      )
    }
    if (activeFilter === 'Web Apps') {
      return worksShowcaseData.filter(
        (w) =>
          w.type.includes('App') ||
          w.type.includes('CRM') ||
          w.type.includes('Admin')
      )
    }
    return worksShowcaseData
  }, [activeFilter])

  const activeWork = useMemo(() => {
    return (
      filteredWorks.find((w) => w.id === selectedWorkId) ||
      filteredWorks[0] ||
      worksShowcaseData[0]
    )
  }, [filteredWorks, selectedWorkId])

  return (
    <section
      id="works"
      aria-label="My Works"
      className="relative w-full bg-white text-black py-20 sm:py-28 px-4 sm:px-8 md:px-14 border-t border-black/10 overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Editorial Header (Reference-Inspired Layout) */}
        <div className="relative flex flex-col items-center text-center max-w-xl mx-auto mb-14 sm:mb-20">
          {/* Playful Geometric Brand Accents */}
          <svg
            viewBox="0 0 60 60"
            className="hidden sm:block absolute -left-24 top-2 w-12 h-12 pointer-events-none"
            aria-hidden="true"
          >
            <path
              d="M12 42 C18 22, 34 18, 48 30 L32 46 Z"
              fill="#ffd700"
              fillOpacity="0.85"
            />
            <circle cx="42" cy="18" r="3" fill="#0a0a0a" />
          </svg>

          <svg
            viewBox="0 0 60 60"
            className="hidden sm:block absolute -right-24 bottom-0 w-12 h-12 pointer-events-none"
            aria-hidden="true"
          >
            <path
              d="M18 42 A14 14 0 0 1 46 34"
              fill="none"
              stroke="#ffd700"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="14" cy="40" r="3.5" fill="#0a0a0a" />
          </svg>

          <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-black">
            Designed, shipped, everywhere
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-black/65 font-sans leading-relaxed max-w-md">
            25+ business websites and 6+ custom web applications crafted across
            healthcare, travel, finance, fashion, SaaS, and e-commerce.
          </p>

          {/* Filter Pill Bar */}
          <div className="mt-6 inline-flex items-center gap-1.5 p-1 rounded-full bg-black/[0.04] border border-black/10">
            {WORK_FILTERS.map((filter) => {
              const isSelected = activeFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-black text-[#ffd700] font-semibold shadow-xs'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>
        </div>

        {/* Flowing Typographic Showcase (Thumbnail + Bold/Outline Title + Pill Counter) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-8">
          {filteredWorks.map((work) => {
            const isSelected = work.id === activeWork.id

            return (
              <button
                key={work.id}
                type="button"
                onClick={() => setSelectedWorkId(work.id)}
                onMouseEnter={() => setSelectedWorkId(work.id)}
                className="group inline-flex items-center gap-3 sm:gap-4 text-left cursor-pointer focus:outline-none"
              >
                {/* Rounded Thumbnail Preview */}
                <span
                  className={`relative w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden border transition-all duration-300 shrink-0 ${
                    isSelected
                      ? 'border-black scale-105 shadow-md ring-2 ring-[#ffd700]'
                      : 'border-black/15 group-hover:border-black/40'
                  }`}
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </span>

                {/* Large Typographic Title (Solid -> Outline Stroke on Active/Hover) */}
                <span
                  className="text-2xl sm:text-4xl md:text-[2.65rem] font-sans font-bold tracking-tight leading-none transition-all duration-300"
                  style={
                    isSelected
                      ? {
                          color: 'transparent',
                          WebkitTextStroke: '1.5px #0a0a0a',
                        }
                      : {
                          color: '#0a0a0a',
                        }
                  }
                >
                  {work.title}
                </span>

                {/* Small Pill Counter Badge */}
                <span
                  className={`inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full text-[11px] font-mono border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#ffd700] text-black border-black font-bold'
                      : 'bg-white text-black/60 border-black/20 group-hover:border-black/50'
                  }`}
                >
                  {work.badge}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Work Detail Strip */}
        <div className="mt-14 sm:mt-16 max-w-3xl mx-auto rounded-2xl border border-black/15 bg-[#fffdf5] p-5 sm:p-6 shadow-xs select-text">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-black text-[#ffd700] text-[10px] font-mono uppercase tracking-wider font-semibold">
                {activeWork.type}
              </span>
              <span className="text-xs font-mono text-black/60">
                {activeWork.industry} • {activeWork.year}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-black">
              {activeWork.title}
            </h3>
          </div>

          <p className="mt-3 text-sm text-black/75 font-sans leading-relaxed">
            {activeWork.summary}
          </p>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {activeWork.stack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-0.5 rounded-md bg-white border border-black/10 text-xs font-mono text-black/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
