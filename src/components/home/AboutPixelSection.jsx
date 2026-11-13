import React from 'react'
import { WhitePixelBackground, AboutPixelArtBackground } from '../common'

/**
 * AboutSection
 *
 * Full-width, full-height 2-column split About section matching the Hero design system:
 * - Left Column: Pure white pixel mosaic canvas with editorial headline, subheadline, and structured bio narrative
 * - Right Column: Mind/Thoughts profile illustration pixel-art canvas (interactive spring physics)
 * - Zero gaps, zero margins, 100vw x 100vh full-bleed
 */
export default function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About Benny"
      className="relative w-full min-h-screen h-screen flex flex-col md:flex-row m-0 p-0 overflow-hidden select-none border-t border-black/10"
    >
      {/* Left Column (50% Width, 100% Height): Pure White Pixel Mosaic + Editorial Narrative */}
      <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-6 sm:p-10 md:p-14 overflow-hidden border-b md:border-b-0 md:border-r border-black/10">
        {/* Background interactive pure white pixel canvas */}
        <WhitePixelBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />

        {/* Foreground Content Card styled like the reference editorial poster */}
        <div className="relative z-10 max-w-lg select-text text-center md:text-left space-y-5 sm:space-y-6">
          {/* Main Statement Title */}
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tight text-black leading-[0.98] uppercase">
              Thoughts <br />
              are <br />
              n o t <br />
              real
            </h2>

            {/* Accent divider */}
            <div className="w-12 h-1 bg-black rounded-full my-3" />

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-mono tracking-widest text-black/70 uppercase">
              But they are <span className="font-bold text-black border-b border-black/30 pb-0.5">Loud</span>
            </p>
          </div>

          {/* Bio Story Narrative */}
          <div className="space-y-3 text-sm sm:text-base md:text-lg text-black/75 font-sans leading-relaxed max-w-md font-normal">
            <p>
              I turn overwhelming digital noise into calm, intuitive software. As a designer who codes, I bridge the gap between abstract thinking and crisp execution.
            </p>
            <p className="text-xs sm:text-sm text-black/60 font-mono">
              Obsessed with tactile micro-interactions, responsive typography, and shipping real products.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column (50% Width, 100% Height): Mind Profile Thoughts Artwork in Pixel Art */}
      <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
        <AboutPixelArtBackground
          className="w-full h-full"
          pixelSize={6}
          opacity={1.0}
        />
      </div>
    </section>
  )
}
