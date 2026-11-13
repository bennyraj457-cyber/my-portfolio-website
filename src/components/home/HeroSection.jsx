import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'
import ToolsMarquee from './ToolsMarquee'
import PixelAssembledHeading from './PixelAssembledHeading'

/**
 * HeroSection (2-Column Split Layout)
 *
 * - Left Column: Editorial typography, letter-by-letter pixel assembled headline, paragraph bio, status pill, and tools marquee
 * - Right Column: Dedicated interactive canvas displaying the iconic creator-at-CRT pixel artwork in brand colors
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2, bio } = personalInfo

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-[90svh] md:min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 lg:px-16 py-20 sm:py-24 md:py-28 select-none overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ================= LEFT COLUMN: TEXT CONTENT ================= */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8">
          {/* Main Headline assembled from discrete micro-pixels with left alignment */}
          <div className="w-full">
            <PixelAssembledHeading
              line1={headlineLine1}
              line2={headlineLine2}
              pixelSize={3}
              align="left"
              className="w-full"
            />
          </div>

          {/* Responsive Paragraph Bio */}
          <p className="max-w-xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-text-body">
            {bio}
          </p>

          {/* Editorial Minimalist status indicator */}
          <div className="flex items-center gap-3 sm:gap-4 select-none">
            <span className="w-6 sm:w-8 h-[1px] bg-black/15 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 ring-4 ring-red-500/20 animate-pulse shrink-0" />
              <p className="text-xs sm:text-[13px] tracking-tight text-text-body font-sans font-normal">
                <span className="font-heading italic font-normal text-text-heading mr-1">Work in progress:</span>
                Currently designing &amp; crafting this website
              </p>
            </div>
          </div>

          {/* Tools Marquee */}
          <div className="w-full pt-2 flex flex-col items-center lg:items-start">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-text-muted font-medium mb-3 select-none">
              My Skills
            </span>
            <ToolsMarquee className="max-w-xl" />
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PIXEL IMAGE CANVAS ================= */}
        <div className="lg:col-span-5 flex items-center justify-center w-full">
          <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden border border-black/10 bg-white/50 shadow-sm p-2 sm:p-3 group">
            {/* Soft inner vignette and corner accents */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-black/30 z-10 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-black/30 z-10 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-black/30 z-10 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-black/30 z-10 pointer-events-none" />

            {/* Standalone pixel art canvas */}
            <div className="w-full h-full rounded-xl overflow-hidden relative">
              <PixelArtBackground
                className="w-full h-full"
                pixelSize={7}
                interactive={true}
                standAlone={true}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
