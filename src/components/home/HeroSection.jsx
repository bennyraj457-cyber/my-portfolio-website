import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelCloudBackground } from '../common'
import ToolsMarquee from './ToolsMarquee'

/**
 * HeroSection
 *
 * Full-screen responsive viewport hero section:
 * - Fluid typography scaling seamlessly from mobile (320px) to 4K displays
 * - Responsive padding and breathing room
 * - Full-width background dither canvas with zero horizontal overflow
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2, bio } = personalInfo

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-[90svh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 py-20 sm:py-24 md:py-32 select-none overflow-hidden"
    >
      {/* Edge-to-edge pixel cloud effect */}
      <PixelCloudBackground
        className="w-full h-full"
        macroSize={28}
        interactive={true}
        contentRepelDistance={80}
      />

      {/* Hero content sitting cleanly in z-10 above canvas */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
        {/* Subtle "Work in Progress" pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] border border-black/10 backdrop-blur-xs text-[11px] sm:text-xs font-mono text-text-muted select-none">
          <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse shadow-[0_0_8px_#ffd700]" />
          <span>Currently crafting & iterating on this portfolio</span>
        </div>

        {/* Main Headline with responsive fluid sizing */}
        <h1 className="fluid-hero-headline font-heading italic font-normal tracking-tight text-text-heading">
          <span className="block">{headlineLine1}</span>
          <span className="block mt-1 sm:mt-2">{headlineLine2}</span>
        </h1>

        {/* Responsive Paragraph Bio */}
        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed text-text-body px-2 sm:px-0">
          {bio}
        </p>

        {/* Tools Marquee immediately after paragraph bio */}
        <div className="w-full pt-4 sm:pt-6 flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-text-muted font-medium mb-3 select-none">
            My Skills
          </span>
          <ToolsMarquee />
        </div>
      </div>
    </section>
  )
}
