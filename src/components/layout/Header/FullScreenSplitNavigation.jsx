import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { personalInfo } from '../../../data/personalInfo'
import './fullScreenNav.css'

/**
 * FullScreenSplitNavigation
 *
 * Fully Responsive Split Navigation:
 * - Desktop/Tablet: Clean 50/50 split panel with left gold branding and right dark minimal nav
 * - Mobile: Uses full viewport height without overlapping panels or clipped text
 * - Clean close button pinned at top-right
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
      className={`fixed inset-0 z-50 w-full h-[100dvh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row split-nav-overlay ${isClosing ? 'closing' : ''
        }`}
    >
      {/* ================= LEFT PANEL: BRANDING (Hidden on small mobile screens to prevent text clashing, visible on md+) ================= */}
      <div className="hidden md:flex md:w-1/2 lg:w-[48%] shrink-0 bg-[#ffd700] text-black flex-col justify-between p-8 md:p-12 lg:p-16 split-nav-left select-none relative z-10">
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
        <div className="py-6 md:py-8 my-auto">
          <p className="text-xs uppercase font-semibold tracking-widest text-black/60 mb-3">
            Portfolio & Craft
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic font-normal leading-[1.08] tracking-tight">
            <span>{headlineLine1 || 'Designer who'}</span>
            <br />
            <span>{headlineLine2 || 'ships with vision'}</span>
          </h2>

          <div className="w-20 h-[2px] bg-black/20 my-6" />

          <p className="text-sm sm:text-base text-black/75 max-w-md font-sans leading-relaxed">
            Crafting tactile, high-performance web experiences from concept to production.
          </p>
        </div>

        {/* Bottom Contact Info */}
        <div className="pt-4 border-t border-black/15 flex items-center justify-between text-xs font-medium">
          <div>
            <span className="block text-black/50 text-[10px] uppercase tracking-wider">
              Email
            </span>
            <a
              href={`mailto:${email}`}
              data-cursor="link"
              className="text-black font-semibold hover:underline"
            >
              {email}
            </a>
          </div>

          <div className="text-right">
            <span className="block text-black/50 text-[10px] uppercase tracking-wider">
              Location
            </span>
            <span className="text-black/80">{location}</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL: NAVIGATION LINKS (Full screen on mobile, 50% on desktop) ================= */}
      <div className="w-full md:w-1/2 lg:w-[52%] flex-1 bg-[#1b1b1b] text-white flex flex-col justify-between p-6 sm:p-8 md:p-12 lg:p-16 split-nav-right relative min-h-screen md:min-h-0">
        {/* Top Bar on Mobile (Logo + Close Button) & Desktop Close Button */}
        <div className="flex items-center justify-between md:justify-end">
          <Link
            to="/"
            onClick={handleClose}
            data-cursor="link"
            className="md:hidden text-2xl font-heading font-bold tracking-tight text-white hover:text-[#ffd700] transition-colors"
          >
            {logo}
          </Link>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Navigation Menu"
            data-cursor="link"
            className="group inline-flex items-center gap-2.5 text-white/70 hover:text-[#ffd700] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] rounded-full p-2 cursor-pointer"
          >
            <span className="text-xs uppercase tracking-widest font-medium hidden sm:inline">
              Close
            </span>
            <div className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#ffd700] group-hover:rotate-90 transition-all duration-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </button>
        </div>

        {/* Navigation Links with Expanding Dash Indicator */}
        <nav
          aria-label="Full-Screen Navigation Links"
          className="my-auto py-8 flex flex-col gap-5 sm:gap-6 md:gap-8"
        >
          {items.map((item, index) => {
            const sectionId = item.href?.replace('#', '')
            const isActive = activeSection === sectionId

            return (
              <div
                key={item.label}
                className="split-nav-item"
                style={{ animationDelay: `${0.1 + index * 0.06}s` }}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  data-cursor="link"
                  className={`split-nav-link text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-medium tracking-tight text-white/90 ${isActive ? 'active' : ''
                    }`}
                >
                  <span className="nav-dash" />
                  <span>{item.label}</span>
                </a>
              </div>
            )
          })}
        </nav>

        {/* Bottom Socials Bar & Contact Info on Mobile */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs tracking-wider text-white/50">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="uppercase text-[11px] sm:text-xs">© {new Date().getFullYear()} Benny</span>
            {/* Show quick contact on mobile */}
            <a
              href={`mailto:${email}`}
              className="md:hidden text-[#ffd700] hover:underline text-[11px]"
            >
              {email}
            </a>
          </div>
          <div className="flex gap-4 sm:gap-5">
            {socialLinks?.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
                className="hover:text-[#ffd700] transition-colors uppercase text-[11px] sm:text-xs"
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
                className="hover:text-[#ffd700] transition-colors uppercase text-[11px] sm:text-xs"
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
                className="hover:text-[#ffd700] transition-colors uppercase text-[11px] sm:text-xs"
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
