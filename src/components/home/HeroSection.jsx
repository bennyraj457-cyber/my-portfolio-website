import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'
import ToolsMarquee from './ToolsMarquee'
import PixelAssembledHeading from './PixelAssembledHeading'

/**
 * HeroSection (Top-to-Bottom Stacked Layout)
 *
 * - Top Section: Centered editorial typography, letter-by-letter pixel assembled headline, paragraph bio, status pill, and tools marquee
 * - Bottom Section: Edge-to-edge interactive canvas displaying the iconic creator-at-CRT pixel artwork in brand colors
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2, bio } = personalInfo

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-screen flex flex-col p-0 m-0 select-none overflow-hidden"
    >
      {/* ================= TOP SECTION: TEXT CONTENT ================= */}
      <div className="w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 lg:px-16 pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-12 bg-bg-main relative z-10">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
          {/* Main Headline assembled from discrete micro-pixels with centered alignment */}
          <div className="w-full">
            <PixelAssembledHeading
              line1={headlineLine1}
              line2={headlineLine2}
              pixelSize={3}
              align="center"
              className="w-full"
            />
          </div>

          {/* Responsive Paragraph Bio */}
          <p className="max-w-xl mx-auto text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-text-body px-2 sm:px-0">
            {bio}
          </p>

          {/* Editorial Minimalist status indicator */}
          <div className="flex items-center gap-3 sm:gap-4 select-none">
            <span className="w-6 sm:w-10 h-[1px] bg-black/15 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 ring-4 ring-red-500/20 animate-pulse shrink-0" />
              <p className="text-xs sm:text-[13px] tracking-tight text-text-body font-sans font-normal">
                <span className="font-heading italic font-normal text-text-heading mr-1">Work in progress:</span>
                Currently designing &amp; crafting this website
              </p>
            </div>
            <span className="w-6 sm:w-10 h-[1px] bg-black/15 shrink-0" />
          </div>

          {/* Tools Marquee */}
          <div className="w-full pt-2 flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-text-muted font-medium mb-3 select-none">
              My Skills
            </span>
            <ToolsMarquee className="w-full max-w-xl" />
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: PIXEL IMAGE CANVAS (Full Width Edge-to-Edge) ================= */}
      <div className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] relative overflow-hidden bg-white border-t border-black/10">
        <PixelArtBackground
          className="absolute inset-0 w-full h-full object-cover"
          pixelSize={8}
          interactive={true}
          standAlone={true}
        />
      </div>
    </section>
  )
}
