import React, { useRef } from 'react'
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
 * - Dual-layer depth: some skill logos & pixel text drift BEHIND the hero text,
 *   while other skill logos drift in FRONT (above) the headline & paragraph!
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2, bio } = personalInfo
  const fgCanvasRef = useRef(null)

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-[90svh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 py-20 sm:py-24 md:py-32 select-none overflow-hidden"
    >
      {/* Background layer (behind hero text): pixel cloud & background skill entities */}
      <PixelCloudBackground
        className="w-full h-full"
        macroSize={28}
        interactive={true}
        contentRepelDistance={80}
        foregroundCanvasRef={fgCanvasRef}
      />

      {/* Hero content sitting at z-10 */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
        {/* Main Headline with responsive fluid sizing */}
        <h1 className="fluid-hero-headline font-heading italic font-normal tracking-tight text-text-heading">
          <span className="block">{headlineLine1}</span>
          <span className="block mt-1 sm:mt-2">{headlineLine2}</span>
        </h1>

        {/* Responsive Paragraph Bio */}
        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed text-text-body px-2 sm:px-0">
          {bio}
        </p>
      </div>

      {/* Foreground canvas layer at z-20 (above hero text & paragraph) */}
      <canvas
        ref={fgCanvasRef}
        className="absolute inset-0 pointer-events-none z-20 w-full h-full"
        aria-hidden="true"
      />
    </section>
  )
}
