import React from 'react'
import { personalInfo } from '../../data/personalInfo'
import { WhitePixelBackground } from '../common'

/**
 * AboutSection
 *
 * Full-width About section matching your portfolio identity:
 * - Pure white pixel mosaic canvas with editorial headline and personalized bio narrative
 * - Zero gaps, full-bleed design with reactive white pixel physics
 */
export default function AboutSection() {
  const { name } = personalInfo

  return (
    <section
      id="about"
      aria-label={`About ${name}`}
      className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center p-8 sm:p-14 md:p-20 overflow-hidden select-none border-t border-black/10"
    >
      {/* Background interactive pure white pixel canvas */}
      <WhitePixelBackground
        className="w-full h-full"
        pixelSize={6}
        opacity={1.0}
      />

      {/* Foreground Content Card - Paragraph only */}
      <div className="relative z-10 max-w-2xl mx-auto select-text text-center flex flex-col items-center">
        <p className="text-base sm:text-xl md:text-2xl text-black/85 font-sans leading-relaxed text-center font-normal">
          I believe software should feel tactile, fast, and unforgettable. Working at the intersection of design systems and frontend architecture, I take ideas from blank canvas to production code that scales.
        </p>
      </div>
    </section>
  )
}
