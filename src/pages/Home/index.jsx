import HeroSection from '../../components/home/HeroSection'
import AboutSection from '../../components/home/AboutPixelSection'

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* Full-width edge-to-edge Hero section with retro coder pixel-art */}
      <HeroSection />

      {/* Full-width edge-to-edge About Me section with Thoughts Are Not Real pixel-art */}
      <AboutSection />
    </div>
  )
}
