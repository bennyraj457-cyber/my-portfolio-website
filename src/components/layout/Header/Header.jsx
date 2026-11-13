import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { personalInfo } from '../../../data/personalInfo'

/**
 * Floating Header
 *
 * Fixed navigation banner floating seamlessly above the page:
 * - Left: Name Logo ("BENNY.")
 * - Right: "Let's Talk" interactive pill CTA button
 */
export default function Header({
  logo = 'BENNY.',
  className = '',
}) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 40
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300 py-4 sm:py-6 px-4 sm:px-8 md:px-12 ${className}`}
    >
      <div className="w-full flex items-center justify-between">
        {/* Left: Name Logo */}
        <div className="pointer-events-auto">
          <Link
            to="/"
            data-cursor="link"
            className={`text-xl sm:text-2xl font-heading font-bold tracking-tight transition-all duration-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] ${
              isScrolled
                ? 'bg-black/85 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/15 text-white hover:text-[#ffd700]'
                : 'text-black hover:text-[#b45309]'
            }`}
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            {logo}
          </Link>
        </div>

        {/* Right: "Let's Talk" Button */}
        <div className="pointer-events-auto">
          <a
            href={`mailto:${personalInfo.email}?subject=Project%20Inquiry%20-%20Let's%20Talk`}
            data-cursor="link"
            aria-label="Let's Talk - Email Benny"
            className={`group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] select-none ${
              isScrolled
                ? 'bg-black/90 text-white backdrop-blur-md border border-white/20 hover:bg-[#ffd700] hover:text-black hover:border-transparent'
                : 'bg-black text-white hover:bg-[#ffd700] hover:text-black border border-black/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ffd700] group-hover:bg-black transition-colors" />
            <span>Let's Talk</span>
          </a>
        </div>
      </div>
    </header>
  )
}
