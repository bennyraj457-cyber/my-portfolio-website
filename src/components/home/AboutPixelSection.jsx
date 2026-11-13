import React from 'react'
import { WhitePixelBackground, AboutPixelArtBackground } from '../common'

/**
 * AboutSection
 *
 * Full-width, stacked top-to-bottom About section:
 * - Top Block: Pure white pixel mosaic canvas with editorial headline, subheadline, and bio narrative
 * - Bottom Block: Mind/Thoughts profile illustration pixel-art canvas (interactive spring physics)
 * - Zero gaps, zero margins, full-bleed vertical layout
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About Benny"
      className="relative w-full min-h-[140vh] md:min-h-[160vh] flex flex-col m-0 p-0 overflow-hidden select-none border-t border-black/10"
    >
      {/* Top Block: Pure White Pixel Mosaic + Editorial Narrative */}
      <div className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center p-8 sm:p-14 md:p-20 overflow-hidden border-b border-black/10">
        {/* Background interactive pure white pixel canvas */}
        <WhitePixelBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />

        {/* Foreground Content Card styled like the reference editorial poster */}
        <div className="relative z-10 max-w-xl mx-auto select-text text-center space-y-5 sm:space-y-6 flex flex-col items-center">
          {/* Main Statement Title */}
          <div className="space-y-2 flex flex-col items-center">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-black tracking-tight text-black leading-[0.96] uppercase">
              Thoughts <br />
              are <br />
              n o t <br />
              real
            </h2>

            {/* Accent divider */}
            <div className="w-16 h-1 bg-black rounded-full my-4" />

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-mono tracking-widest text-black/70 uppercase">
              But they are <span className="font-bold text-black border-b border-black/30 pb-0.5">Loud</span>
            </p>
          </div>

          {/* Bio Story Narrative */}
          <div className="space-y-3 text-sm sm:text-base md:text-lg text-black/75 font-sans leading-relaxed max-w-md font-normal text-center">
            <p>
              I turn overwhelming digital noise into calm, intuitive software. As a designer who codes, I bridge the gap between abstract thinking and crisp execution.
            </p>
            <p className="text-xs sm:text-sm text-black/60 font-mono">
              Obsessed with tactile micro-interactions, responsive typography, and shipping real products.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Block: Mind Profile Thoughts Artwork in Pixel Art */}
      <div className="relative w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden">
        <AboutPixelArtBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />
      </div>
    </section>
  )
}
