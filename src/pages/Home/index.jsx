import HeroSection from '../../components/home/HeroSection'
import AboutSection from '../../components/home/AboutPixelSection'
import { StudioSection } from '../../components/studio'

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* Full-width edge-to-edge Hero section with retro coder pixel-art */}
      <HeroSection />

      {/* Full-width edge-to-edge About Me section with Thoughts Are Not Real pixel-art */}
      <AboutSection />

      {/* Interactive 3D Studio Workspace Section */}
      <div id="works" className="w-full">
        <StudioSection />
      </div>
    </div>
  )
}
