import React from 'react'
import Button from '../../ui/Button'

/**
 * Reusable contact button linking to the contact section with arrow animation
 */
export default function HeaderContactButton({
  text = "LET'S TALK",
  href = '#contact',
  className = '',
  onClick,
}) {
  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (href.startsWith('#')) {
      const targetElement = document.querySelector(href)
      if (targetElement) {
        e.preventDefault()
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <Button
      href={href}
      onClick={handleClick}
      variant="primary"
      size="sm"
      showArrow={true}
      data-cursor="contact"
      className={`text-xs uppercase font-semibold !px-4 !py-2 !min-h-[38px] ${className}`}
    >
      {text}
    </Button>
  )
}

