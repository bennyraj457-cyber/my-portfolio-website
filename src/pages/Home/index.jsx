import HeroSection from '../../components/home/HeroSection'
import AboutPixelSection from '../../components/home/AboutPixelSection'

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* Full-width edge-to-edge Hero section with retro coder pixel-art */}
      <HeroSection />

      {/* Full-width About Me section with white pixel background */}
      <section
        id="about"
        aria-label="About Me"
        className="relative w-full min-h-[85svh] md:min-h-screen flex flex-col items-center justify-center text-center select-none overflow-hidden"
      >
        <AboutPixelSection
          className="w-full h-full"
          pixelSize={6}
          opacity={0.96}
        />

        {/* Screen-reader accessible markup */}
        <div className="sr-only">
          <h2>About Benny</h2>
          <p>
            Designer & creative engineer crafting intentional digital interfaces.
            Bridging human-centered aesthetics with high-performance production code.
            Based in Thiruvattar.
          </p>
        </div>
      </section>
    </div>
  )
}
