import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { personalInfo } from '../../../data/personalInfo'

/**
 * Floating Header
 *
 * Fixed navigation banner floating seamlessly above the page:
 * - Left: Name Logo ("BENNY.")
 * - Center: Nav links ("About", "Skills", "Works") with smooth scroll & glass pill capsule
 * - Right: "Let's Talk" interactive CTA pill
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

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Works', href: '#works' },
  ]

  const handleNavClick = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300 py-4 sm:py-6 px-4 sm:px-8 md:px-12 ${className}`}
    >
      <div className="w-full flex items-center justify-between">
        {/* Left: Name Logo */}
        <div className="pointer-events-auto flex-shrink-0">
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

        {/* Center: Nav links (About, Skills, Works) */}
        <nav
          aria-label="Primary Navigation"
          className="pointer-events-auto hidden sm:flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-black/10 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              data-cursor="link"
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-sans font-medium text-black/80 hover:text-black hover:bg-black/5 active:scale-95 transition-all duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: "Let's Talk" Button */}
        <div className="pointer-events-auto flex-shrink-0">
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
