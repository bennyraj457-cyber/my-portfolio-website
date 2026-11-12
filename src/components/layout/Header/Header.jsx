import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FullScreenSplitNavigation from './FullScreenSplitNavigation'
import { navigationItems as defaultNavigationItems } from '../../../data/navigation'
import './header.css'

/**
 * Reusable Header with Full-Screen Split Navigation Menu
 */
export default function Header({
  logo = 'BENNY.',
  navigationItems = defaultNavigationItems,
  sticky = true,
  scrollThreshold = 40,
  className = '',
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // 1. Efficient scroll listener for sticky/compact transition
  useEffect(() => {
    if (!sticky) return

    const handleScroll = () => {
      const scrolled = window.scrollY > scrollThreshold
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [sticky, scrollThreshold])

  // 2. IntersectionObserver for active section tracking
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
        className={`w-full z-40 ${
          sticky ? 'sticky top-0 header-transition' : 'relative'
        } ${
          isScrolled
            ? 'py-3.5 bg-bg-main/80 backdrop-blur-md border-b border-border-subtle shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
            : 'py-6 bg-transparent border-b border-transparent'
        } ${className}`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-6">
          {/* Left Section: Brand Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link
              to="/"
              data-cursor="link"
              className="text-xl md:text-2xl font-heading font-bold tracking-tight text-text-heading hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              onClick={() => {
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            >
              {logo}
            </Link>
          </div>

          {/* Right Section: Clean Menu Trigger */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Full-Screen Navigation Menu"
              aria-expanded={isMenuOpen}
              data-cursor="link"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-black/15 bg-black text-white hover:bg-neutral-800 transition-all duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none"
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
