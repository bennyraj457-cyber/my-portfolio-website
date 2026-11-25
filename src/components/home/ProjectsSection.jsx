import React, { useMemo, useState } from 'react'
import { projects } from '../../data/projects'

const WORK_FILTERS = [
  { key: 'All', label: 'All Works' },
  { key: 'Websites', label: 'Websites' },
  { key: 'Web Apps', label: 'Web Apps' },
  { key: 'E-Commerce', label: 'E-Commerce' },
]

function matchesWorkFilter(project, filterKey) {
  if (filterKey === 'All') return true
  const cat = project.category.toLowerCase()
  if (filterKey === 'Web Apps') {
    return cat.includes('web app') || cat.includes('crm') || cat.includes('saas')
  }
  if (filterKey === 'E-Commerce') {
    return cat.includes('e-commerce') || project.tags.some((t) => /shopify|woo/i.test(t))
  }
  return !cat.includes('web app')
}

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredProjects = useMemo(
    () => projects.filter((project) => matchesWorkFilter(project, activeFilter)),
    [activeFilter]
  )

  return (
    <section
      id="works"
      aria-label="My Works"
      className="relative w-full bg-white text-black py-16 sm:py-24 px-4 sm:px-8 md:px-14 border-t border-black/10 select-none"
    >
      <div className="max-w-6xl mx-auto flex flex-col">
        {/* Section Header + Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-black/10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-heading italic tracking-tight text-black leading-none">
              Selected Works
            </h2>
            <p className="text-xs sm:text-sm font-mono text-black/60 uppercase tracking-wider">
              25+ Business Websites &amp; 6+ Web Applications Delivered
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter works by type"
          >
            {WORK_FILTERS.map((filter) => {
              const isSelected = activeFilter === filter.key
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-black text-[#ffd700] border-black shadow-sm'
                      : 'bg-white text-black/75 border-black/15 hover:border-black/40 hover:text-black'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Clean Design-System Card Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 select-text">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 transition-all duration-200 hover:border-black hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
            >
              <div>
                {/* Top Meta Row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#ffd700] border border-black/15 text-[11px] font-mono font-bold text-black">
                    {project.id}
                  </span>
                  <span className="text-[11px] font-mono text-black/50">
                    {project.year}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-black leading-snug">
                  {project.title}
                </h3>
                <p className="mt-1 text-xs font-mono text-black/55">
                  {project.subtitle}
                </p>

                {/* Description */}
                <p className="mt-3.5 text-sm font-sans text-black/65 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Bottom Tech Stack Tags */}
              <div className="mt-5 pt-4 border-t border-black/10 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-black/[0.04] border border-black/[0.08] text-[11px] font-mono text-black/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
