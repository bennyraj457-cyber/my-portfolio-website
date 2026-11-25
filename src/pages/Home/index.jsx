import React from 'react'
import HeroSection from '../../components/home/HeroSection'
import AboutSection from '../../components/home/AboutPixelSection'
import SkillsSection from '../../components/home/SkillsSection'
import MyWorksSection from '../../components/home/MyWorksSection'

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* Full-width edge-to-edge Hero section with retro coder pixel-art */}
      <HeroSection />

      {/* Full-width edge-to-edge About Me section */}
      <AboutSection />

      {/* Polar Area / Nightingale Rose Chart Skills section */}
      <SkillsSection />

      {/* Interactive Device-Mockup My Works Showcase */}
      <MyWorksSection />
    </div>
  )
}
