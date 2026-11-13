import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground, WhitePixelBackground } from '../common'

/**
 * HeroSection
 *
 * Full-width, full-height 2-column split hero with zero spacing:
 * - Left Column: Pure white pixel mosaic canvas with the title centered in pure italic black
 * - Right Column: Retro coder illustration pixel-art canvas
 * - Both columns react seamlessly to cursor and mobile boat steering
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2 } = personalInfo

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-screen h-screen flex flex-col md:flex-row m-0 p-0 overflow-hidden select-none"
    >
      {/* Left Column (50% Width, 100% Height): White Pixel Mosaic + Title */}
      <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-6 sm:p-10 md:p-14 overflow-hidden border-b md:border-b-0 md:border-r border-black/10">
        {/* Background interactive white pixel tiles */}
        <WhitePixelBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />

        {/* Foreground Title in pure italic black */}
        <div className="relative z-10 max-w-lg select-text text-center md:text-left">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading italic tracking-tight text-black leading-[1.12]">
            {headlineLine1 || 'Designer who'} <br />
            {headlineLine2 || 'ships with Code'}
          </h1>
        </div>
      </div>

      {/* Right Column (50% Width, 100% Height): Pixel-Art Coder Image */}
      <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
        <PixelArtBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />
      </div>
    </section>
  )
}
