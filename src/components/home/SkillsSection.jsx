import React, { useMemo, useState } from 'react'
import { skillCategoryGroups, skillPizzaData } from '../../data/skills'

const CHART_CX = 400
const CHART_CY = 330
const HUB_RADIUS = 38
const OUTER_RADIUS = 214
const RING_STEPS = [25, 50, 75]
const BENCHMARK_RING = 85

const FILTER_OPTIONS = [
  { key: 'All', label: 'All Domains' },
  { key: 'UI/UX & Design', label: 'UI/UX & Design' },
  { key: 'Frontend', label: 'Frontend' },
  { key: 'CMS & E-commerce', label: 'CMS & E-commerce' },
  { key: 'WordPress Dev', label: 'WordPress Dev' },
]

/**
 * Returns official full-color brand SVG viewBox and paths for each skill, tool, and domain.
 */
function renderBrandIconSvg(iconKey) {
  switch (iconKey) {
    case 'ui-ux-figma':
    case 'Figma':
    case 'UI/UX & Design':
      return {
        viewBox: '0 0 38 57',
        content: (
          <>
            <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
            <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
            <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
            <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
            <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
          </>
        ),
      }

    case 'adobe-illustrator':
    case 'Adobe Illustrator':
    case 'Vector Graphics':
    case 'Brand Assets':
      return {
        viewBox: '0 0 240 234',
        content: (
          <>
            <rect width="240" height="234" rx="42" fill="#330000" />
            <rect
              x="7"
              y="7"
              width="226"
              height="220"
              rx="36"
              fill="none"
              stroke="#FF9A00"
              strokeWidth="8"
            />
            <path
              d="M116 164H96.5l-9.2-29.5H54.2L45.3 164H27.2l33.5-103h21.8l33.5 103zM82.8 119L70.8 79.5 58.6 119h24.2zM136 81.5c-5.8 0-10.3-4.3-10.3-10.1 0-5.8 4.5-10.1 10.3-10.1 5.9 0 10.4 4.3 10.4 10.1 0 5.8-4.5 10.1-10.4 10.1zm9.3 82.5h-18.5V93h18.5v71z"
              fill="#FF9A00"
            />
          </>
        ),
      }

    case 'html-css':
    case 'HTML5':
    case 'Semantic Markup':
      return {
        viewBox: '0 0 512 512',
        content: (
          <>
            <path fill="#E34F26" d="M71 460L30 0h452l-41 460-185 52z" />
            <path fill="#EF652A" d="M256 472l149-41 35-394H256v435z" />
            <path
              fill="#EBEBEB"
              d="M256 208h-74l-5-57h79V95H118l15 169h123v-56zm0 148l-65-18-4-47h-56l8 93 117 32v-60z"
            />
            <path
              fill="#FFF"
              d="M256 208v56h70l-7 74-63 17v60l116-32 16-175H256zm0-113v56h134l5-56H256z"
            />
          </>
        ),
      }

    case 'CSS3':
    case 'Modern Layouts':
      return {
        viewBox: '0 0 512 512',
        content: (
          <>
            <path fill="#1572B6" d="M71 460L30 0h452l-41 460-185 52z" />
            <path fill="#33A9DC" d="M256 472l149-41 35-394H256v435z" />
            <path
              fill="#EBEBEB"
              d="M256 208h-74l-5-57h79V95H118l15 169h123v-56zm0 148l-65-18-4-47h-56l8 93 117 32v-60z"
            />
            <path
              fill="#FFF"
              d="M256 208v56h70l-7 74-63 17v60l116-32 16-175H256zm0-113v56h134l5-56H256z"
            />
          </>
        ),
      }

    case 'JavaScript':
      return {
        viewBox: '0 0 512 512',
        content: (
          <>
            <rect width="512" height="512" rx="64" fill="#F7DF1E" />
            <path
              fill="#000"
              d="M324 397c11 18 26 30 52 30 22 0 36-11 36-26 0-18-14-25-39-36l-13-6c-38-16-63-36-63-79 0-39 30-69 77-69 34 0 58 13 74 41l-36 23c-8-14-19-20-38-20-17 0-27 9-27 21 0 15 11 21 33 30l13 6c44 19 69 39 69 83 0 47-37 73-87 73-49 0-80-23-95-55l37-23zm-152 4c8 14 15 26 32 26 17 0 28-7 28-34V216h49v178c0 53-31 77-74 77-40 0-63-21-75-47l40-23z"
            />
          </>
        ),
      }

    case 'js-react':
    case 'React':
    case 'Frontend':
    case 'Interactive UI':
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <rect width="32" height="32" rx="7" fill="#20232A" />
            <g transform="translate(16 16)">
              <circle cx="0" cy="0" r="2.2" fill="#61DAFB" />
              <g stroke="#61DAFB" strokeWidth="1.2" fill="none">
                <ellipse rx="10.5" ry="4" />
                <ellipse rx="10.5" ry="4" transform="rotate(60)" />
                <ellipse rx="10.5" ry="4" transform="rotate(120)" />
              </g>
            </g>
          </>
        ),
      }

    case 'wordpress-elementor':
    case 'WordPress':
    case 'custom-wp-dev':
    case 'WordPress Dev':
    case 'Custom Theme Development':
    case 'Custom Plugin Development':
      return {
        viewBox: '0 0 512 512',
        content: (
          <>
            <circle cx="256" cy="256" r="256" fill="#21759B" />
            <path
              fill="#FFF"
              d="M47 256c0 86 52 161 127 193L69 164c-14 27-22 58-22 92zm369-12c0-33-12-56-22-73-14-22-27-41-27-63 0-24 18-47 44-47 1 0 3 0 4 0-41-37-96-60-157-60-67 0-127 28-169 73 3 0 6 1 8 1 22 0 56-3 56-3 11-1 13 16 2 17 0 0-12 1-24 2l78 232 47-140-33-92c-11-1-22-2-22-2-11-1-10-18 1-17 0 0 35 3 55 3 22 0 56-3 56-3 11-1 13 16 2 17 0 0-12 1-25 2l77 228 22-73c9-32 16-55 16-75zm-155 31l-64 186c20 6 42 9 64 9 26 0 50-5 73-13l-73-182zm191-76c7 18 11 38 11 57 0 69-37 130-92 164l61-175c13-34 20-46 20-46z"
            />
          </>
        ),
      }

    case 'Elementor':
    case 'Elementor Pro':
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <circle cx="16" cy="16" r="16" fill="#92003B" />
            <rect x="9.5" y="9" width="3.2" height="14" rx="0.6" fill="#FFFFFF" />
            <rect x="14.8" y="9" width="7.7" height="3.2" rx="0.6" fill="#FFFFFF" />
            <rect x="14.8" y="14.4" width="7.7" height="3.2" rx="0.6" fill="#FFFFFF" />
            <rect x="14.8" y="19.8" width="7.7" height="3.2" rx="0.6" fill="#FFFFFF" />
          </>
        ),
      }

    case 'WooCommerce':
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <rect x="1" y="4" width="30" height="21" rx="5" fill="#7F54B3" />
            <polygon points="18,24 23,29 24,24" fill="#7F54B3" />
            <path
              d="M6.5 10.5l2.1 8.2 2.4-5.4 2.3 5.4 2.1-8.2"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <ellipse
              cx="19"
              cy="14.6"
              rx="2.3"
              ry="3"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <ellipse
              cx="25.2"
              cy="14.6"
              rx="2.3"
              ry="3"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </>
        ),
      }

    case 'webflow-framer':
    case 'Webflow':
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <rect width="32" height="32" rx="7" fill="#146EF5" />
            <path
              d="M24.2 9.5l-4.2 13h-3.9l1.8-5.7h-.1c-1.4 3.2-4.1 5-7.4 5.7V18c0 0 3.2-.3 4.8-2.8H9.2v-5.7h6.4l.1 4.6h.1l2.1-4.6h6.3z"
              fill="#FFFFFF"
            />
          </>
        ),
      }

    case 'Framer':
    case 'Motion & CMS':
      return {
        viewBox: '0 0 24 24',
        content: (
          <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" fill="#0055FF" />
        ),
      }

    case 'shopify-wix':
    case 'Shopify':
    case 'CMS & E-commerce':
    case 'Storefront Customization':
      return {
        viewBox: '0 0 109 123',
        content: (
          <>
            <path
              d="M79.2 18.8c-.3-.2-3.1-.3-3.1-.3s-2.1-2.1-3.2-3.2c-3.7-3.7-9.5-4.7-14.5-2.6-1.5.7-3 1.7-4.4 3-4.2-3.1-9.7-4.4-15-3.3-8 1.6-14.2 8.4-15.3 16.5l-18.4 6c-3.1 1-3.3 2.1-3.6 4.9C5.3 48.7.2 92.5 0 94.6c-.4 3.7 2.1 4.7 3.9 5.3l50.8 17.6c5.5 1.9 11.4 1.9 16.9 0l33.6-11.6c3.4-1.2 3.8-3.4 3.8-5.3-.2-2.1-20.9-88-29.8-81.8z"
              fill="#95BF47"
            />
            <path
              d="M76.1 18.5s-2.1-2.1-3.2-3.2c-3.7-3.7-9.5-4.7-14.5-2.6l-3.3 110.1 12.8-4.4c5.5-1.9 11.4-1.9 16.9 0l33.6-11.6c3.4-1.2 3.8-3.4 3.8-5.3-.2-2.1-20.9-88-29.8-81.8-.3-.2-3.1-1.2-3.1-1.2z"
              fill="#5E8E3E"
            />
            <path
              d="M54.7 39.5l-6.8 14.8s-6.7-3.5-14.3-3.5c-11.1 0-11.7 7-11.7 8.7 0 9.6 25 13.3 25 35.9 0 17.8-11.2 28.7-26.6 28.7-18.6 0-27.9-11.6-27.9-11.6l4.9-16.2s9.8 8.4 18.2 8.4c5.5 0 7.8-4.4 7.8-7.7 0-13.6-25-14.4-25-36.2 0-17.7 12.8-30.8 32-30.8 10.9 0 16.5 4.3 16.5 4.3z"
              fill="#FFF"
            />
          </>
        ),
      }

    case 'Wix':
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <rect width="32" height="32" rx="7" fill="#0C6EFC" />
            <path
              d="M4.5 11l2.2 10h2.1l1.7-6.3L12.2 21h2.1l2.2-10h-2l-1.3 6.5L11.5 11h-2l-1.7 6.5L6.5 11h-2zm13.3 0v10h2V11h-2zm3.8 0l2.8 5-2.9 5h2.3l1.7-3.2 1.7 3.2h2.3l-2.9-5 2.8-5h-2.3l-1.6 3-1.6-3h-2.3z"
              fill="#FFFFFF"
            />
          </>
        ),
      }

    case 'PHP':
      return {
        viewBox: '0 0 256 136',
        content: (
          <>
            <ellipse cx="128" cy="68" rx="128" ry="68" fill="#777BB4" />
            <path
              d="M64 35H32l-14 66h16l5-24h18c18 0 27-9 27-22 0-13-8-20-20-20zm-2 28H41l4-16h21c6 0 9 2 9 7 0 6-3 9-9 9zm93-28h-32l-14 66h16l6-26h22l-6 26h16l14-66h-16l-5 26h-22l6-26zm88 0h-32l-14 66h16l5-24h18c18 0 27-9 27-22 0-13-8-20-20-20zm-2 28h-21l4-16h21c6 0 9 2 9 7 0 6-3 9-9 9z"
              fill="#FFF"
            />
          </>
        ),
      }

    case 'responsive-design':
    case 'Responsive Design':
    case 'Mobile-First Grid':
    case 'Accessibility':
    case 'Cross-Device UX':
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <rect x="2" y="5" width="19" height="14" rx="2.5" fill="#0EA5E9" />
            <rect x="4.5" y="7.5" width="14" height="9" rx="1" fill="#E0F2FE" />
            <rect x="8.5" y="19" width="6" height="3.5" fill="#0284C7" />
            <rect x="6" y="22.5" width="11" height="2" rx="1" fill="#0369A1" />
            <rect
              x="19.5"
              y="10.5"
              width="10.5"
              height="16.5"
              rx="2.5"
              fill="#10B981"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <rect x="22" y="13.5" width="5.5" height="9.5" rx="1" fill="#D1FAE5" />
            <circle cx="24.75" cy="24.7" r="1" fill="#FFFFFF" />
          </>
        ),
      }

    case 'web-app-ui':
    case 'HRMS':
    case 'CRM':
    case 'Billing':
    case 'Asset & Admin Dashboards':
    case 'UI Design':
    case 'UX Design':
    case 'Wireframing':
    case 'Interactive Prototyping':
    case 'Design Systems':
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <rect x="3" y="3" width="12" height="11" rx="3" fill="#6366F1" />
            <rect x="17" y="3" width="12" height="7" rx="2.5" fill="#EC4899" />
            <rect x="17" y="12" width="12" height="17" rx="3" fill="#10B981" />
            <rect x="3" y="16" width="12" height="13" rx="3" fill="#F59E0B" />
          </>
        ),
      }

    case 'All':
    default:
      return {
        viewBox: '0 0 32 32',
        content: (
          <>
            <circle cx="16" cy="16" r="13" fill="#F59E0B" />
            <path d="M16 16 L16 3 A13 13 0 0 1 29 16 Z" fill="#EF4444" />
            <path d="M16 16 L29 16 A13 13 0 0 1 16 29 Z" fill="#10B981" />
            <path d="M16 16 L16 29 A13 13 0 0 1 3 16 Z" fill="#3B82F6" />
            <circle cx="16" cy="16" r="5" fill="#FFFFFF" />
          </>
        ),
      }
  }
}

function RealColorSkillIcon({ iconKey, className = 'w-4 h-4' }) {
  const { viewBox, content } = renderBrandIconSvg(iconKey)
  return (
    <svg
      viewBox={viewBox}
      className={className}
      aria-hidden="true"
    >
      {content}
    </svg>
  )
}

function polarToCartesian(cx, cy, radius, angleRad) {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function buildWedgePath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle)
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle)
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle)
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

  return [
    `M ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    `A ${innerR.toFixed(2)} ${innerR.toFixed(2)} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

function levelToRadius(level) {
  return HUB_RADIUS + (level / 100) * (OUTER_RADIUS - HUB_RADIUS)
}

export default function SkillsSection() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedSkillId, setSelectedSkillId] = useState(skillPizzaData[0].id)

  const sliceGeometry = useMemo(() => {
    const count = skillPizzaData.length
    const step = (Math.PI * 2) / count
    const startOffset = -Math.PI / 2

    return skillPizzaData.map((skill, idx) => {
      const startAngle = startOffset + idx * step
      const endAngle = startAngle + step
      const midAngle = (startAngle + endAngle) / 2
      const wedgeRadius = levelToRadius(skill.level)

      const path = buildWedgePath(
        CHART_CX,
        CHART_CY,
        HUB_RADIUS,
        wedgeRadius,
        startAngle,
        endAngle
      )

      // Badge anchored near outer arc of the wedge
      const badgeRadius = Math.max(HUB_RADIUS + 34, wedgeRadius - 18)
      const badgePos = polarToCartesian(CHART_CX, CHART_CY, badgeRadius, midAngle)

      // Spoke endpoints from hub to 100% ring
      const spokeInner = polarToCartesian(CHART_CX, CHART_CY, HUB_RADIUS, startAngle)
      const spokeOuter = polarToCartesian(CHART_CX, CHART_CY, OUTER_RADIUS, startAngle)

      // Outer perimeter anchor for icon + text label
      const anchorPos = polarToCartesian(
        CHART_CX,
        CHART_CY,
        OUTER_RADIUS + 26,
        midAngle
      )
      const cosMid = Math.cos(midAngle)
      const textAnchor =
        Math.abs(cosMid) < 0.22 ? 'middle' : cosMid > 0 ? 'start' : 'end'

      const iconSize = 26
      const gap = 8
      let iconX = anchorPos.x
      let iconY = anchorPos.y - iconSize / 2
      let textX = anchorPos.x
      let textY = anchorPos.y - (skill.label.length > 1 ? 7 : 0)

      if (textAnchor === 'start') {
        iconX = anchorPos.x
        textX = anchorPos.x + iconSize + gap
      } else if (textAnchor === 'end') {
        iconX = anchorPos.x - iconSize
        textX = anchorPos.x - iconSize - gap
      } else {
        iconX = anchorPos.x - iconSize / 2
        iconY = anchorPos.y - iconSize - 10
        textX = anchorPos.x
        textY = anchorPos.y + 4
      }

      return {
        skill,
        path,
        badgePos,
        spokeInner,
        spokeOuter,
        iconX,
        iconY,
        iconSize,
        textX,
        textY,
        textAnchor,
      }
    })
  }, [])

  const activeSkill = useMemo(() => {
    const found = skillPizzaData.find((item) => item.id === selectedSkillId)
    return found || skillPizzaData[0]
  }, [selectedSkillId])

  const handleFilterClick = (filterKey) => {
    setActiveFilter(filterKey)
    if (filterKey !== 'All') {
      const firstMatch = skillPizzaData.find(
        (item) => item.filterKey === filterKey || item.category === filterKey
      )
      if (firstMatch) setSelectedSkillId(firstMatch.id)
    }
  }

  return (
    <section
      id="skills"
      aria-label="Skills & Proficiency Chart"
      className="relative w-full bg-white text-black py-16 sm:py-24 px-4 sm:px-8 md:px-14 border-t border-black/10 select-none"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Reference-Inspired Editorial Header */}
        <header className="text-center space-y-2 max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-heading font-bold tracking-tight text-black">
            Benny R. — Core Skills &amp; Proficiency
          </h2>
          <p className="text-xs sm:text-sm font-sans text-black/75 font-medium">
            3+ Years Experience | 25+ Websites &amp; 6+ Web Apps Delivered
          </p>
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-black/55">
            UI/UX Design • Frontend • CMS &amp; E-Commerce • WordPress Development
          </p>
        </header>

        {/* Interactive Domain Filter Pills with Real-Color Icons */}
        <div
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
          role="group"
          aria-label="Filter skills by domain"
        >
          {FILTER_OPTIONS.map((option) => {
            const isSelected = activeFilter === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleFilterClick(option.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-black text-[#ffd700] border-black shadow-sm'
                    : 'bg-white text-black/75 border-black/15 hover:border-black/40 hover:text-black'
                }`}
              >
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-white p-0.5 shrink-0">
                  <RealColorSkillIcon
                    iconKey={option.key}
                    className="w-full h-full"
                  />
                </span>
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>

        {/* Polar Area / Nightingale Rose ("Pizza") Chart */}
        <div className="mt-6 w-full max-w-[820px]">
          <svg
            viewBox="0 0 800 660"
            className="w-full h-auto overflow-visible"
            role="img"
            aria-label="Polar proficiency radar chart of Benny R.'s core skills"
          >
            {/* Outer 100% Perimeter Ring */}
            <circle
              cx={CHART_CX}
              cy={CHART_CY}
              r={OUTER_RADIUS}
              fill="#fffdf5"
              stroke="#111111"
              strokeWidth="1.25"
            />

            {/* Skill Wedges */}
            <g>
              {sliceGeometry.map(({ skill, path }) => {
                const isActive = skill.id === selectedSkillId
                const matchesFilter =
                  activeFilter === 'All' ||
                  skill.filterKey === activeFilter ||
                  skill.category === activeFilter

                const fill = isActive ? '#0a0a0a' : '#ffd700'
                const opacity = matchesFilter ? 1 : 0.22

                return (
                  <path
                    key={skill.id}
                    d={path}
                    fill={fill}
                    fillOpacity={opacity}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setSelectedSkillId(skill.id)}
                    onClick={() => setSelectedSkillId(skill.id)}
                  />
                )
              })}
            </g>

            {/* Concentric Dashed Reference Rings (25%, 50%, 75%, & 85% Benchmark) */}
            <g className="pointer-events-none">
              {RING_STEPS.map((pct) => (
                <circle
                  key={pct}
                  cx={CHART_CX}
                  cy={CHART_CY}
                  r={levelToRadius(pct)}
                  fill="none"
                  stroke="#000000"
                  strokeOpacity="0.18"
                  strokeWidth="1"
                  strokeDasharray="4 5"
                />
              ))}

              {/* 85% Average Benchmark Ring */}
              <circle
                cx={CHART_CX}
                cy={CHART_CY}
                r={levelToRadius(BENCHMARK_RING)}
                fill="none"
                stroke="#000000"
                strokeOpacity="0.4"
                strokeWidth="1.2"
                strokeDasharray="6 4"
              />

              {/* Radial Dashed Divider Spokes extending to 100% Ring */}
              {sliceGeometry.map(({ skill, spokeInner, spokeOuter }) => (
                <line
                  key={`spoke-${skill.id}`}
                  x1={spokeInner.x}
                  y1={spokeInner.y}
                  x2={spokeOuter.x}
                  y2={spokeOuter.y}
                  stroke="#000000"
                  strokeOpacity="0.28"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
            </g>

            {/* Perimeter Percentage Badges on each Wedge */}
            <g>
              {sliceGeometry.map(({ skill, badgePos }) => {
                const isActive = skill.id === selectedSkillId
                const matchesFilter =
                  activeFilter === 'All' ||
                  skill.filterKey === activeFilter ||
                  skill.category === activeFilter

                return (
                  <g
                    key={`badge-${skill.id}`}
                    transform={`translate(${badgePos.x.toFixed(2)}, ${badgePos.y.toFixed(2)})`}
                    className="cursor-pointer transition-opacity duration-300"
                    opacity={matchesFilter ? 1 : 0.3}
                    onMouseEnter={() => setSelectedSkillId(skill.id)}
                    onClick={() => setSelectedSkillId(skill.id)}
                  >
                    <rect
                      x="-20"
                      y="-10"
                      width="40"
                      height="20"
                      rx="5"
                      fill={isActive ? '#ffd700' : '#0a0a0a'}
                      stroke={isActive ? '#0a0a0a' : '#ffffff'}
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="700"
                      fontFamily="monospace"
                      fill={isActive ? '#0a0a0a' : '#ffd700'}
                    >
                      {skill.level}%
                    </text>
                  </g>
                )
              })}
            </g>

            {/* Outer Real-Color Brand Icons + Titles */}
            <g>
              {sliceGeometry.map(
                ({
                  skill,
                  iconX,
                  iconY,
                  iconSize,
                  textX,
                  textY,
                  textAnchor,
                }) => {
                  const isActive = skill.id === selectedSkillId
                  const matchesFilter =
                    activeFilter === 'All' ||
                    skill.filterKey === activeFilter ||
                    skill.category === activeFilter

                  const brandIcon = renderBrandIconSvg(skill.id)

                  return (
                    <g
                      key={`label-${skill.id}`}
                      opacity={matchesFilter ? 1 : 0.35}
                      className="cursor-pointer transition-opacity duration-300"
                      onMouseEnter={() => setSelectedSkillId(skill.id)}
                      onClick={() => setSelectedSkillId(skill.id)}
                    >
                      {/* Clean White Brand Card so Real Colors Pop */}
                      <rect
                        x={iconX}
                        y={iconY}
                        width={iconSize}
                        height={iconSize}
                        rx="7"
                        fill="#ffffff"
                        stroke={isActive ? '#0a0a0a' : '#d4d4d8'}
                        strokeWidth={isActive ? '1.6' : '1'}
                      />
                      <svg
                        x={iconX + 4}
                        y={iconY + 4}
                        width={iconSize - 8}
                        height={iconSize - 8}
                        viewBox={brandIcon.viewBox}
                      >
                        {brandIcon.content}
                      </svg>

                      {/* Multi-line Skill Title */}
                      <text
                        x={textX}
                        y={textY}
                        textAnchor={textAnchor}
                        dominantBaseline="central"
                        fontSize="12"
                        fontWeight={isActive ? '700' : '600'}
                        fill={isActive ? '#000000' : '#262626'}
                        className="font-sans"
                      >
                        {skill.label.map((line, i) => (
                          <tspan key={line} x={textX} dy={i === 0 ? 0 : 14}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  )
                }
              )}
            </g>

            {/* Center Hub Crest Emblem */}
            <g className="pointer-events-none">
              <circle
                cx={CHART_CX}
                cy={CHART_CY}
                r={HUB_RADIUS}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="2"
              />
              <circle
                cx={CHART_CX}
                cy={CHART_CY}
                r={HUB_RADIUS - 6}
                fill="#ffd700"
                stroke="#000000"
                strokeWidth="1.5"
              />
              <circle
                cx={CHART_CX}
                cy={CHART_CY}
                r={HUB_RADIUS - 13}
                fill="#0a0a0a"
              />
              <text
                x={CHART_CX}
                y={CHART_CY + 4}
                textAnchor="middle"
                fontSize="13"
                fontWeight="800"
                fontFamily="monospace"
                letterSpacing="1"
                fill="#ffd700"
              >
                BR
              </text>
            </g>
          </svg>
        </div>

        {/* Selected Skill Inspector Card */}
        <div className="mt-6 w-full max-w-3xl rounded-2xl border border-black/15 bg-[#fffdf5] p-5 sm:p-6 shadow-sm select-text">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3.5">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-black/15 p-2 shrink-0 shadow-xs">
                <RealColorSkillIcon
                  iconKey={activeSkill.id}
                  className="w-full h-full"
                />
              </span>
              <div>
                <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black text-[#ffd700] font-semibold mb-1">
                  {activeSkill.category}
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-black leading-tight">
                  {activeSkill.title}
                </h3>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl sm:text-3xl font-bold text-black">
                {activeSkill.level}%
              </span>
              <span className="text-xs text-black/55 uppercase">Proficiency</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-black/75 font-sans leading-relaxed">
            {activeSkill.summary}
          </p>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {activeSkill.tools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-black/10 text-xs font-mono text-black/85 shadow-2xs"
              >
                <RealColorSkillIcon iconKey={tool} className="w-3.5 h-3.5 shrink-0" />
                <span>{tool}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Resume Core Skills Matrix Breakdown */}
        <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-text">
          {skillCategoryGroups.map((group) => {
            const isHighlighted = activeFilter === group.key
            return (
              <button
                key={group.key}
                type="button"
                onClick={() =>
                  handleFilterClick(isHighlighted ? 'All' : group.key)
                }
                className={`text-left rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                  isHighlighted
                    ? 'border-black bg-[#ffd700]/20 shadow-sm'
                    : 'border-black/10 bg-white hover:border-black/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-black/15 p-1 shrink-0 shadow-2xs">
                      <RealColorSkillIcon
                        iconKey={group.key}
                        className="w-full h-full"
                      />
                    </span>
                    <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-black">
                      {group.title}
                    </h4>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 text-[11px] font-sans text-black/85 bg-black/[0.03] border border-black/[0.06] px-2 py-0.5 rounded"
                    >
                      <RealColorSkillIcon
                        iconKey={item}
                        className="w-3.5 h-3.5 shrink-0"
                      />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
