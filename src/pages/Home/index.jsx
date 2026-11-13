import HeroSection from '../../components/home/HeroSection'
import AboutPixelSection from '../../components/home/AboutPixelSection'

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Full-width edge-to-edge Hero section with Pixel Retro Coder */}
      <HeroSection />

      {/* Full-width About Me section with Mountain & Jeep pixel artwork */}
      <AboutPixelSection />
    </div>
  )
}
