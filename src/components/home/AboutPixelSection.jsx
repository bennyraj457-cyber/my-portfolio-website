import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { WhitePixelBackground, AboutPixelArtBackground } from '../common'

/**
 * AboutSection
 *
 * Full-width, stacked top-to-bottom About section matching your portfolio identity:
 * - Top Block: Pure white pixel mosaic canvas with editorial headline and personalized bio narrative
 * - Bottom Block: Mind Profile Thoughts pixel-art canvas over living sea water
 * - Zero gaps, full-bleed design
 */
export default function AboutSection() {
  const { name, location } = personalInfo

  return (
    <section
      id="about"
      aria-label={`About ${name}`}
      className="relative w-full min-h-[140vh] md:min-h-[160vh] flex flex-col m-0 p-0 overflow-hidden select-none border-t border-black/10"
    >
      {/* Top Block: Pure White Pixel Mosaic + Tailored Portfolio Bio */}
      <div className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center p-8 sm:p-14 md:p-20 overflow-hidden border-b border-black/10">
        {/* Background interactive pure white pixel canvas */}
        <WhitePixelBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />

        {/* Foreground Content Card */}
        <div className="relative z-10 max-w-xl mx-auto select-text text-center space-y-6 flex flex-col items-center">
          {/* Section Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] border border-black/10 text-xs font-mono uppercase tracking-widest text-black/80">
            <span className="w-2 h-2 rounded-full bg-[#ffd700]"></span>
            About {name}
          </div>

          {/* Main Statement Title */}
          <div className="space-y-2 flex flex-col items-center">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading italic tracking-tight text-black leading-[1.08]">
              Design with intent. <br />
              Code with conviction.
            </h2>

            {/* Accent divider */}
            <div className="w-16 h-0.5 bg-black/20 my-3 rounded-full" />

            {/* Monospace Subtitle */}
            <p className="text-xs sm:text-sm font-mono tracking-widest text-black/60 uppercase">
              Designer & Creative Engineer • {location}
            </p>
          </div>

          {/* Personalized Portfolio Narrative */}
          <div className="space-y-4 text-base sm:text-lg text-black/80 font-sans leading-relaxed max-w-md text-center font-normal">
            <p>
              I believe software should feel tactile, fast, and unforgettable. Working at the intersection of design systems and frontend architecture, I take ideas from blank canvas to production code that scales.
            </p>
            <p className="text-xs sm:text-sm text-black/60 font-mono">
              Crafting fluid web physics, typography-driven layouts, and delightful micro-interactions.
            </p>
          </div>

          {/* Quick Skill/Focus Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <span className="px-3.5 py-1 rounded-full bg-black/5 text-xs font-mono text-black/75 border border-black/5">
              UI/UX Design
            </span>
            <span className="px-3.5 py-1 rounded-full bg-black/5 text-xs font-mono text-black/75 border border-black/5">
              React & Vite
            </span>
            <span className="px-3.5 py-1 rounded-full bg-black/5 text-xs font-mono text-black/75 border border-black/5">
              Motion & Physics
            </span>
            <span className="px-3.5 py-1 rounded-full bg-black/5 text-xs font-mono text-black/75 border border-black/5">
              Design Systems
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Block: Mind Profile Thoughts Artwork in Pixel Art over living sea water */}
      <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[90vh] overflow-hidden flex items-center justify-center">
        <AboutPixelArtBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />
      </div>
    </section>
  )
}
