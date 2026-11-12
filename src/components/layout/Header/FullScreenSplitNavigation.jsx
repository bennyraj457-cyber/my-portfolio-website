import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { personalInfo } from '../../../data/personalInfo'
import './fullScreenNav.css'

/**
 * FullScreenSplitNavigation
 *
 * Premium 50/50 split-screen navigation overlay:
 * - Left Panel: Vibrant primary brand gold (#ffd700), bold editorial headline, and contact details
 * - Right Panel: Dark minimalist charcoal (#1a1a1a / #222222) with large vertical navigation links,
 *   animated expand-line hover indicators, and staggered reveal animation
 */
export default function FullScreenSplitNavigation({
  isOpen = false,
  onClose,
  logo = 'BENNY.',
  items = [],
  activeSection = '',
}) {
  const [isRendered, setIsRendered] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Handle open / closing lifecycle and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      setIsClosing(false)
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleClose()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = originalOverflow
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else if (isRendered) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsRendered(false)
        setIsClosing(false)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isRendered) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose?.()
    }, 320)
  }

  const handleLinkClick = (e, item) => {
    handleClose()
    if (item.href?.startsWith('#')) {
      const target = document.querySelector(item.href)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const { email, location, headlineLine1, headlineLine2, socialLinks } = personalInfo

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-Screen Navigation Menu"
      className={`fixed inset-0 z-50 w-screen h-screen overflow-hidden flex flex-col md:flex-row split-nav-overlay ${
        isClosing ? 'closing' : ''
      }`}
    >
      {/* ================= LEFT PANEL: BRANDING SECTION (50%) ================= */}
      <div className="w-full md:w-1/2 lg:w-[48%] h-full bg-[#ffd700] text-black flex flex-col justify-between p-8 sm:p-12 lg:p-16 split-nav-left select-none relative z-10">
        {/* Top-Left Brand Logo */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={handleClose}
            data-cursor="link"
            className="text-2xl sm:text-3xl font-heading font-bold tracking-tight hover:opacity-80 transition-opacity"
          >
            {logo}
          </Link>
        </div>

        {/* Center Editorial Headline */}
        <div className="my-auto py-8">
          <p className="text-xs uppercase font-semibold tracking-widest text-black/60 mb-3">
            Portfolio & Craft
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading italic font-normal leading-[1.08] tracking-tight">
            <span>{headlineLine1 || 'Designer who'}</span>
            <br />
            <span>{headlineLine2 || 'ships with vision'}</span>
          </h2>

          {/* Thin Horizontal Divider */}
          <div className="w-24 h-[2px] bg-black/20 my-6" />

          <p className="text-sm sm:text-base text-black/75 max-w-md font-sans leading-relaxed">
            Crafting tactile, high-performance web experiences from concept to production.
          </p>
        </div>

        {/* Bottom Contact & Details */}
        <div className="pt-6 border-t border-black/15 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs sm:text-sm font-medium">
          <div>
            <span className="block text-black/50 text-[11px] uppercase tracking-wider mb-1">
              Direct Contact
            </span>
            <a
              href={`mailto:${email}`}
              data-cursor="link"
              className="text-black font-semibold hover:underline"
            >
              {email}
            </a>
          </div>

          <div>
            <span className="block text-black/50 text-[11px] uppercase tracking-wider mb-1">
              Location
            </span>
            <span className="text-black/80">{location}</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL: NAVIGATION SECTION (50%) ================= */}
      <div className="w-full md:w-1/2 lg:w-[52%] h-full bg-[#1b1b1b] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 split-nav-right relative">
        {/* Top-Right Minimalist Close Button */}
        <div className="flex justify-end items-center">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Navigation Menu"
            data-cursor="link"
            className="group inline-flex items-center gap-3 text-white/70 hover:text-[#ffd700] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] rounded-full p-2 cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest font-medium hidden sm:inline">
              Close
            </span>
            <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#ffd700] group-hover:rotate-90 transition-all duration-300 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </button>
        </div>

        {/* Vertically Centered Navigation Links with Horizontal Dash */}
        <nav
          aria-label="Full-Screen Navigation Links"
          className="my-auto py-8 flex flex-col gap-6 sm:gap-8"
        >
          {items.map((item, index) => {
            const sectionId = item.href?.replace('#', '')
            const isActive = activeSection === sectionId

            return (
              <div
                key={item.label}
                className="split-nav-item"
                style={{ animationDelay: `${0.15 + index * 0.08}s` }}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  data-cursor="link"
                  className={`split-nav-link text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight text-white/90 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <span className="nav-dash" />
                  <span>{item.label}</span>
                </a>
              </div>
            )
          })}
        </nav>

        {/* Bottom Socials Bar */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs tracking-wider text-white/50">
          <span className="uppercase">© {new Date().getFullYear()} Benny</span>
          <div className="flex gap-5">
            {socialLinks?.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="hover:text-[#ffd700] transition-colors uppercase"
              >
                GitHub
              </a>
            )}
            {socialLinks?.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="hover:text-[#ffd700] transition-colors uppercase"
              >
                LinkedIn
              </a>
            )}
            {socialLinks?.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="hover:text-[#ffd700] transition-colors uppercase"
              >
                Twitter
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

