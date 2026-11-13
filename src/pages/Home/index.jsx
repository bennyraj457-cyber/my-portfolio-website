import React, { Suspense, lazy } from 'react'
import HeroSection from '../../components/home/HeroSection'
import AboutSection from '../../components/home/AboutPixelSection'

// Lazy-load the heavy 3D studio workspace below the fold
const StudioSection = lazy(() =>
  import('../../components/studio').then((module) => ({
    default: module.StudioSection,
  }))
)

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* Full-width edge-to-edge Hero section with retro coder pixel-art */}
      <HeroSection />

      {/* Full-width edge-to-edge About Me section with Thoughts Are Not Real pixel-art */}
      <AboutSection />

      {/* Interactive 3D Studio Workspace Section */}
      <div id="works" className="w-full min-h-screen bg-[#f0eee8]">
        <Suspense
          fallback={
            <div className="w-full h-screen flex items-center justify-center bg-[#f0eee8] text-xs font-mono tracking-widest text-[#181917]/60">
              LOADING 3D STUDIO...
            </div>
          }
        >
          <StudioSection />
        </Suspense>
      </div>
    </div>
  )
}
