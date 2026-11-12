import React, { useRef, useState } from 'react'

/**
 * ArrowIcon component with forward-slide animation
 */
const ArrowIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
      clipRule="evenodd"
    />
  </svg>
)

/**
 * Premium Futuristic Animated Button
 *
 * @param {'primary' | 'secondary' | 'outline' | 'icon'} variant - Button styling variant
 * @param {'sm' | 'md' | 'lg'} size - Button size scale
 * @param {boolean} showArrow - Whether to display animated directional arrow
 * @param {React.ReactNode} icon - Optional custom icon
 * @param {'left' | 'right'} iconPosition - Icon placement relative to children
 * @param {string} href - Renders as <a> if provided
 * @param {string} target - Anchor target (e.g. _blank)
 * @param {string} rel - Anchor rel (default noopener noreferrer for target="_blank")
 * @param {boolean} magnetic - Enable subtle cursor magnetic pull effect
 * @param {string} className - Additional custom classes
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  showArrow = false,
  icon = null,
  iconPosition = 'left',
  href,
  target,
  rel,
  magnetic = true,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const buttonRef = useRef(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Subtle magnetic interaction effect
  const handleMouseMove = (e) => {
    if (!magnetic || disabled || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    // subtle dampening (max ~6px movement)
    setCoords({ x: x * 0.15, y: y * 0.15 })
  }

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setCoords({ x: 0, y: 0 })
  }

  // Size configurations
  const sizeStyles = {
    sm: 'text-xs px-4 py-2 gap-2 tracking-wide min-h-[38px]',
    md: 'text-sm px-6 py-3 gap-2.5 tracking-wider min-h-[46px]',
    lg: 'text-base px-8 py-4 gap-3 tracking-widest min-h-[54px]',
  }

  const iconOnlySizes = {
    sm: 'w-[38px] h-[38px] p-0 flex items-center justify-center',
    md: 'w-[46px] h-[46px] p-0 flex items-center justify-center',
    lg: 'w-[54px] h-[54px] p-0 flex items-center justify-center',
  }

  // Variant styling & liquid fill definitions
  // Primary brand color: #ffd700 (cyber gold/yellow)
  const variantStyles = {
    primary: {
      container:
        'bg-neutral-950 text-neutral-100 border border-neutral-800 hover:border-[#ffd700]/70 hover:text-black shadow-[0_0_20px_rgba(0,0,0,0.5)]',
      fill: 'bg-[#ffd700]',
      cornerAccent: 'bg-[#ffd700]',
    },
    secondary: {
      container:
        'bg-neutral-900/90 text-neutral-200 border border-neutral-700/80 hover:border-neutral-400 hover:text-white backdrop-blur-md',
      fill: 'bg-neutral-800',
      cornerAccent: 'bg-neutral-400',
    },
    outline: {
      container:
        'bg-transparent text-neutral-200 border border-[#ffd700]/40 hover:border-[#ffd700] hover:text-black',
      fill: 'bg-[#ffd700]',
      cornerAccent: 'bg-[#ffd700]',
    },
    icon: {
      container:
        'bg-neutral-950 text-neutral-200 border border-neutral-800 hover:border-[#ffd700] hover:text-black shadow-lg',
      fill: 'bg-[#ffd700]',
      cornerAccent: 'bg-[#ffd700]',
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.primary
  const isIconOnly = variant === 'icon' || (!children && Boolean(icon))

  // Base asymmetric structural silhouette with corner cuts / notches
  const shapeStyles =
    'relative inline-flex items-center justify-center font-semibold uppercase select-none overflow-hidden isolate transition-all duration-300'

  // Custom asymmetric corner cuts and futuristic border styling
  const geometryStyles =
    'rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm active:scale-[0.97]'

  const disabledStyles = disabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer'

  const focusStyles =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950'

  const computedClasses = [
    'group',
    shapeStyles,
    geometryStyles,
    isIconOnly ? iconOnlySizes[size] : sizeStyles[size],
    currentVariant.container,
    focusStyles,
    disabledStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const dynamicTransform =
    magnetic && isHovered
      ? { transform: `translate3d(${coords.x}px, ${coords.y}px, 0)` }
      : undefined

  const content = (
    <>
      {/* 1. Futuristic corner notch accents */}
      <span
        aria-hidden="true"
        className={`absolute top-0 right-0 w-2.5 h-[2px] transition-all duration-300 group-hover:w-4 ${currentVariant.cornerAccent}`}
      />
      <span
        aria-hidden="true"
        className={`absolute top-0 right-0 h-2.5 w-[2px] transition-all duration-300 group-hover:h-4 ${currentVariant.cornerAccent}`}
      />
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 w-2.5 h-[2px] transition-all duration-300 group-hover:w-4 ${currentVariant.cornerAccent}`}
      />
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 h-2.5 w-[2px] transition-all duration-300 group-hover:h-4 ${currentVariant.cornerAccent}`}
      />

      {/* 2. Fluid liquid/sliding background animation */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 -z-10 rounded-full scale-0 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[2.4] group-hover:opacity-100 ${currentVariant.fill}`}
      />

      {/* 3. Button content / icons */}
      <span className="relative z-10 inline-flex items-center gap-2.5 transition-colors duration-300">
        {icon && iconPosition === 'left' && (
          <span className="inline-flex shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5">
            {icon}
          </span>
        )}

        {children && <span>{children}</span>}

        {icon && iconPosition === 'right' && (
          <span className="inline-flex shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}

        {showArrow && !isIconOnly && <ArrowIcon />}
      </span>
    </>
  )

  if (href) {
    const computedRel = target === '_blank' && !rel ? 'noopener noreferrer' : rel
    return (
      <a
        ref={buttonRef}
        href={disabled ? undefined : href}
        target={target}
        rel={computedRel}
        className={computedClasses}
        style={dynamicTransform}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={computedClasses}
      style={dynamicTransform}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {content}
    </button>
  )
}

