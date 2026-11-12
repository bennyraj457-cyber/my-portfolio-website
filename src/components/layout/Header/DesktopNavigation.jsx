import React from 'react'

/**
 * Desktop navigation link list with animated underline and active state indicator
 */
export default function DesktopNavigation({
  items = [],
  activeSection = '',
  onItemClick,
  className = '',
}) {
  const handleClick = (e, item) => {
    if (onItemClick) onItemClick(e, item)
    if (item.href?.startsWith('#')) {
      const target = document.querySelector(item.href)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <nav
      aria-label="Main Navigation"
      className={`hidden md:flex items-center gap-7 lg:gap-9 text-xs uppercase font-medium tracking-widest ${className}`}
    >
      {items.map((item) => {
        const sectionId = item.href?.replace('#', '')
        const isActive = activeSection === sectionId

        return (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => handleClick(e, item)}
            data-cursor="link"
            className={`nav-link py-1 transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
              isActive
                ? 'active text-text-heading font-semibold'
                : 'text-text-body hover:text-text-heading'
            }`}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

