import React from 'react'
import { personalInfo } from '../../data/personalInfo'

/**
 * AboutSection
 *
 * Full-width About section matching your portfolio identity:
 * - Clean pure white background with editorial personalized statement paragraph
 * - Zero pixel/water background effects outside the Hero section
 */
export default function AboutSection() {
  const { name } = personalInfo

  return (
    <section
      id="about"
      aria-label={`About ${name}`}
      className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center p-8 sm:p-14 md:p-20 overflow-hidden bg-white select-none border-t border-black/10"
    >
      {/* Foreground Content Card - Paragraph only */}
      <div className="relative z-10 max-w-2xl mx-auto select-text text-center flex flex-col items-center">
        <p className="text-base sm:text-xl md:text-2xl text-black/85 font-sans leading-relaxed text-center font-normal">
          I believe websites should feel tactile, fast, and unforgettable. Working at the intersection of design systems and creative web engineering, I take ideas from a blank canvas to living digital experiences that inspire and scale.
        </p>
      </div>
    </section>
  )
}
