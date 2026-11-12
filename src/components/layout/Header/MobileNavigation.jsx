import React, { useEffect } from 'react'
import AvailabilityStatus from './AvailabilityStatus'
import HeaderContactButton from './HeaderContactButton'

/**
 * Full-width responsive mobile navigation drawer with keyboard focus & escape handling
 */
export default function MobileNavigation({
  isOpen = false,
  onClose,
  items = [],
  activeSection = '',
  availabilityText = 'AVAILABLE FOR WORK',
  contactText = "LET'S TALK",
  contactHref = '#contact',
}) {
  // Prevent background scrolling while open & handle escape key
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLinkClick = (e, href) => {
    onClose?.()
    if (href?.startsWith('#')) {
      const target = document.querySelector(href)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 top-[60px] z-50 bg-bg-main/95 backdrop-blur-xl md:hidden flex flex-col justify-between p-6 border-b border-border-subtle overflow-y-auto"
    >
      <nav aria-label="Mobile Navigation" className="flex flex-col gap-6 pt-4">
        {items.map((item) => {
          const sectionId = item.href?.replace('#', '')
          const isActive = activeSection === sectionId

          return (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className={`text-2xl font-heading tracking-wider py-1 border-b border-border-subtle/50 transition-colors ${
                isActive ? 'text-primary' : 'text-text-heading hover:text-primary'
              }`}
            >
              {item.label}
            </a>
          )
        })}
      </nav>

      <div className="flex flex-col gap-5 pt-8 pb-4 border-t border-border-subtle">
        <AvailabilityStatus text={availabilityText} className="w-fit" />
        <HeaderContactButton
          text={contactText}
          href={contactHref}
          onClick={onClose}
          className="w-full text-center justify-center !py-3"
        />
      </div>
    </div>
  )
}

