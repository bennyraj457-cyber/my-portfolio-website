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
      className="relative w-full min-h-screen h-screen flex flex-col lg:flex-row p-0 m-0 select-none overflow-hidden"
    >
      {/* ================= LEFT COLUMN: TEXT CONTENT (Full Height, 50% Desktop) ================= */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 py-16 sm:py-20 lg:py-0 bg-bg-main relative z-10">
        <div className="w-full max-w-xl mx-auto lg:mx-0 flex flex-col items-start space-y-6 sm:space-y-7">
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
          <p className="text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-text-body">
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
          <div className="w-full pt-2 flex flex-col items-start">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-text-muted font-medium mb-3 select-none">
              My Skills
            </span>
            <ToolsMarquee className="w-full max-w-lg" />
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: PIXEL IMAGE CANVAS (Full Height, 50% Desktop, Edge-to-Edge) ================= */}
      <div className="w-full lg:w-1/2 h-full relative overflow-hidden bg-white">
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
