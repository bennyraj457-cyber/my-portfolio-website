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
 * Shared 24x24 geometric icon glyphs used in both SVG chart labels and HTML cards/pills.
 */
function renderSkillGlyph(iconKey) {
  switch (iconKey) {
    case 'ui-ux-figma':
    case 'Figma':
      return (
        <>
          <path d="M9 4h3v5H9a2.5 2.5 0 0 1 0-5z" />
          <path d="M12 4h3a2.5 2.5 0 0 1 0 5h-3V4z" />
          <path d="M9 9.5h3v5H9a2.5 2.5 0 0 1 0-5z" />
          <circle cx="14.5" cy="12" r="2.5" />
          <path d="M9 15h3v2.5a2.5 2.5 0 1 1-3-2.5z" />
        </>
      )
    case 'responsive-design':
    case 'Responsive Design':
    case 'Mobile-First Grid':
      return (
        <>
          <rect x="2.5" y="4.5" width="13" height="10" rx="1.8" />
          <path d="M6.5 18.5h5M9 14.5v4" />
          <rect x="16.5" y="8.5" width="5" height="10" rx="1.2" />
        </>
      )
    case 'wordpress-elementor':
    case 'WordPress':
    case 'Elementor':
    case 'Elementor Pro':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M6.5 8.5l3 9 2.5-6.5 2.5 6.5 3-9" />
        </>
      )
    case 'custom-wp-dev':
    case 'WordPress Dev':
    case 'Custom Theme Development':
    case 'Custom Plugin Development':
      return (
        <>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a5 5 0 0 1-6.6 6.6l-6.9 6.9a1.8 1.8 0 0 1-2.5-2.5l6.9-6.9a5 5 0 0 1 6.6-6.6l-3.6 3.6z" />
        </>
      )
    case 'html-css':
    case 'HTML5':
    case 'CSS3':
    case 'Semantic Markup':
    case 'Modern Layouts':
      return (
        <>
          <path d="M4.5 4h15l-1.4 13.5L12 20l-6.1-2.5L4.5 4z" />
          <path d="M8.5 9h7l-.4 4.5L12 14.8l-3.1-1.3" />
        </>
      )
    case 'js-react':
    case 'Frontend':
    case 'JavaScript':
    case 'React':
    case 'Interactive UI':
      return (
        <>
          <polyline points="8 8 3.5 12 8 16" />
          <polyline points="16 8 20.5 12 16 16" />
          <line x1="13.5" y1="6" x2="10.5" y2="18" />
        </>
      )
    case 'webflow-framer':
    case 'Webflow':
    case 'Framer':
    case 'Motion & CMS':
      return (
        <>
          <polygon points="13 2.5 5 13.5 11.5 13.5 10.5 21.5 19 10.5 12.5 10.5 13 2.5" />
        </>
      )
    case 'shopify-wix':
    case 'CMS & E-commerce':
    case 'Shopify':
    case 'Wix':
    case 'WooCommerce':
    case 'Storefront Customization':
      return (
        <>
          <path d="M6 8h12l1 12H5L6 8z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </>
      )
    case 'web-app-ui':
    case 'HRMS':
    case 'CRM':
    case 'Billing':
    case 'Asset & Admin Dashboards':
      return (
        <>
          <rect x="3.5" y="4" width="7.5" height="7" rx="1.5" />
          <rect x="13" y="4" width="7.5" height="4.5" rx="1.5" />
          <rect x="13" y="10.5" width="7.5" height="9.5" rx="1.5" />
          <rect x="3.5" y="13" width="7.5" height="7" rx="1.5" />
        </>
      )
    case 'adobe-illustrator':
    case 'UI/UX & Design':
    case 'Adobe Illustrator':
    case 'Vector Graphics':
    case 'Brand Assets':
    case 'Design Systems':
    case 'UI Design':
    case 'UX Design':
      return (
        <>
          <path d="M12 3l6.5 6.5-8 8L4 20l2.5-6.5 5.5-10.5z" />
          <circle cx="12" cy="11" r="1.4" />
        </>
      )
    case 'Wireframing':
    case 'Interactive Prototyping':
      return (
        <>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
          <line x1="9.5" y1="9.5" x2="9.5" y2="19.5" />
        </>
      )
    case 'Accessibility':
    case 'Cross-Device UX':
      return (
        <>
          <circle cx="12" cy="6.5" r="2" />
          <path d="M5.5 10.5h13M12 10.5v5l-3 4.5M12 15.5l3 4.5" />
        </>
      )
    case 'PHP':
      return (
        <>
          <ellipse cx="12" cy="12" rx="9" ry="5.5" />
          <path d="M9 12h1.5a1 1 0 0 0 0-2H9v4M13.5 10v4M15.5 12h1.5a1 1 0 0 0 0-2h-1.5v4" />
        </>
      )
    case 'All':
    default:
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="3.5" x2="12" y2="6.5" />
          <line x1="12" y1="17.5" x2="12" y2="20.5" />
          <line x1="3.5" y1="12" x2="6.5" y2="12" />
          <line x1="17.5" y1="12" x2="20.5" y2="12" />
        </>
      )
  }
}

function SkillIcon({ iconKey, className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {renderSkillGlyph(iconKey)}
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

      const iconSize = 22
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

        {/* Interactive Domain Filter Pills with Icons */}
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
                <SkillIcon iconKey={option.key} className="w-3.5 h-3.5 shrink-0" />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>

        {/* Polar Area / Nightingale Rose ("Pizza") Chart */}
        <div className="mt-6 w-full max-w-[800px]">
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

            {/* Outer Skill Icons + Titles */}
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

                  return (
                    <g
                      key={`label-${skill.id}`}
                      opacity={matchesFilter ? 1 : 0.35}
                      className="cursor-pointer transition-opacity duration-300"
                      onMouseEnter={() => setSelectedSkillId(skill.id)}
                      onClick={() => setSelectedSkillId(skill.id)}
                    >
                      {/* Icon Badge next to Skill Title */}
                      <rect
                        x={iconX}
                        y={iconY}
                        width={iconSize}
                        height={iconSize}
                        rx="6"
                        fill={isActive ? '#0a0a0a' : '#ffd700'}
                        stroke="#0a0a0a"
                        strokeWidth="1.2"
                      />
                      <svg
                        x={iconX + 4}
                        y={iconY + 4}
                        width={iconSize - 8}
                        height={iconSize - 8}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isActive ? '#ffd700' : '#0a0a0a'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {renderSkillGlyph(skill.id)}
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
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#ffd700] border border-black/20 text-black shrink-0 shadow-xs">
                <SkillIcon iconKey={activeSkill.id} className="w-5 h-5" />
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/5 border border-black/10 text-xs font-mono text-black/80"
              >
                <SkillIcon iconKey={tool} className="w-3.5 h-3.5 text-black/70" />
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
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#ffd700] border border-black/20 text-black shrink-0">
                      <SkillIcon iconKey={group.key} className="w-3.5 h-3.5" />
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
                      className="inline-flex items-center gap-1 text-[11px] font-sans text-black/80 bg-black/[0.04] px-2 py-0.5 rounded"
                    >
                      <SkillIcon
                        iconKey={item}
                        className="w-3 h-3 text-black/65 shrink-0"
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
