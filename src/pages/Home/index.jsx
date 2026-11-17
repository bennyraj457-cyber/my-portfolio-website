import React, { Suspense, lazy } from 'react'
import HeroSection from '../../components/home/HeroSection'
import AboutSection from '../../components/home/AboutPixelSection'

// Lazy-load the 3D Skills & Tools Studio Section
const SkillsSection = lazy(() => import('../../components/home/SkillsSection'))

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* Full-width edge-to-edge Hero section with retro coder pixel-art */}
      <HeroSection />

      {/* Full-width edge-to-edge About Me section with Thoughts Are Not Real pixel-art */}
      <AboutSection />

      {/* 3D CAD Skills & Tools Workspace Section */}
      <Suspense
        fallback={
          <div className="w-full h-96 flex items-center justify-center bg-[#dce1e6] font-mono text-xs text-[#64748b]">
            INITIALIZING 3D SKILLS WORKSPACE...
          </div>
        }
      >
        <SkillsSection />
      </Suspense>
    </div>
  )
}
