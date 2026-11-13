import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { PixelArtBackground } from '../common'

/**
 * HeroSection
 *
 * Full-screen responsive viewport hero section:
 * - Full-width background dither canvas with retro coder illustration
 * - Embedded headline and bio directly woven into the pixel matrix
 */
export default function HeroSection() {
  const { headlineLine1, headlineLine2, bio } = personalInfo

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative w-full min-h-[90svh] md:min-h-screen flex flex-col items-center justify-center text-center select-none overflow-hidden"
    >
      {/* Background artwork canvas with embedded headline & bio pixels */}
      <PixelArtBackground
        className="w-full h-full"
        pixelSize={6}
        opacity={0.92}
      />

      {/* Screen-reader accessible semantic heading */}
      <h1 className="sr-only">
        {headlineLine1} {headlineLine2}
      </h1>
      <p className="sr-only">
        {bio}
      </p>
    </section>
  )
}
