import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FullScreenSplitNavigation from './FullScreenSplitNavigation'
import { navigationItems as defaultNavigationItems } from '../../../data/navigation'
import './header.css'

/**
 * Floating Header
 *
 * Sits fixed above all sections with a pointer-events-none container:
 * - Left: Floating brand logo ("BENNY.") which turns white on scroll
 * - Right: Floating "Menu" pill button
 */
export default function Header({
  logo = 'BENNY.',
  navigationItems = defaultNavigationItems,
  className = '',
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 40
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const sectionIds = navigationItems
      .map((item) => item.href)
      .filter((href) => href?.startsWith('#'))
      .map((href) => href.slice(1))

    const observedElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (observedElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    )

    observedElements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [navigationItems])

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300 py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-12 ${className}`}
      >
        <div className="w-full flex items-center justify-between">
          {/* Left: Floating Brand Logo (turns white on scroll) */}
          <div className="pointer-events-auto">
            <Link
              to="/"
              data-cursor="link"
              className={`text-xl md:text-2xl font-heading font-bold tracking-tight transition-all duration-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isScrolled
                  ? 'bg-black/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/10 text-white hover:text-primary'
                  : 'text-text-heading hover:text-primary'
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

          {/* Right: Floating Menu Pill Button */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Full-Screen Navigation Menu"
              aria-expanded={isMenuOpen}
              data-cursor="link"
              className={`group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-black/15 bg-black text-white hover:bg-neutral-800 transition-all duration-300 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none active:scale-95 ${
                isScrolled ? 'backdrop-blur-md shadow-lg border-white/10' : ''
              }`}
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-white group-hover:text-primary transition-colors">
                Menu
              </span>
              <div className="w-4 h-3 flex flex-col justify-between py-0.5">
                <span className="w-full h-[1.5px] bg-primary transition-colors" />
                <span className="w-2.5 self-end h-[1.5px] bg-primary group-hover:w-full transition-all duration-300" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Split Navigation Overlay */}
      <FullScreenSplitNavigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        logo={logo}
        items={navigationItems}
        activeSection={activeSection}
      />
    </>
  )
}
