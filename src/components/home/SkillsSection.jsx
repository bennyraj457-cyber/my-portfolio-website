import React, { useMemo, useState } from 'react'
import { skillCategoryGroups, skillPizzaData } from '../../data/skills'

const CHART_CX = 380
const CHART_CY = 330
const HUB_RADIUS = 38
const OUTER_RADIUS = 222
const RING_STEPS = [25, 50, 75]
const BENCHMARK_RING = 85

const FILTER_OPTIONS = [
  { key: 'All', label: 'All Domains' },
  { key: 'UI/UX & Design', label: 'UI/UX & Design' },
  { key: 'Frontend', label: 'Frontend' },
  { key: 'CMS & E-commerce', label: 'CMS & E-commerce' },
  { key: 'WordPress Dev', label: 'WordPress Dev' },
]

const HUB_PETAL_COLORS = [
  '#A259FF',
  '#FFD700',
  '#21759B',
  '#0ACF83',
  '#E34F26',
  '#00B4D8',
  '#0055FF',
  '#95BF47',
  '#FF7262',
  '#FF9A00',
]

function renderSkillIcon(skillId) {
  switch (skillId) {
    case 'ui-ux-figma':
      return (
        <g transform="translate(4 0) scale(0.42)">
          <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
          <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
          <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
          <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
          <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
        </g>
      )
    case 'responsive-design':
      return (
        <g>
          <rect x="2" y="4" width="14" height="10" rx="1.8" fill="#0a0a0a" />
          <rect x="3.5" y="5.5" width="11" height="7" rx="0.8" fill="#ffd700" />
          <path d="M6 16h6M9 14v2" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="15.5" y="9" width="6.5" height="11" rx="1.4" fill="#0a0a0a" stroke="#ffffff" strokeWidth="0.8" />
          <rect x="17" y="10.8" width="3.5" height="6.2" rx="0.4" fill="#ffd700" />
          <circle cx="18.75" cy="18.5" r="0.6" fill="#ffd700" />
        </g>
      )
    case 'wordpress-elementor':
      return (
        <g transform="scale(0.046875)">
          <circle cx="256" cy="256" r="248" fill="#21759B" />
          <path
            fill="#FFF"
            d="M47 256c0 86 52 161 127 193L69 164c-14 27-22 58-22 92zm369-12c0-33-12-56-22-73-14-22-27-41-27-63 0-24 18-47 44-47 1 0 3 0 4 0-41-37-96-60-157-60-67 0-127 28-169 73 3 0 6 1 8 1 22 0 56-3 56-3 11-1 13 16 2 17 0 0-12 1-24 2l78 232 47-140-33-92c-11-1-22-2-22-2-11-1-10-18 1-17 0 0 35 3 55 3 22 0 56-3 56-3 11-1 13 16 2 17 0 0-12 1-25 2l77 228 22-73c9-32 16-55 16-75zm-155 31l-64 186c20 6 42 9 64 9 26 0 50-5 73-13l-73-182zm191-76c7 18 11 38 11 57 0 69-37 130-92 164l61-175c13-34 20-46 20-46z"
          />
        </g>
      )
    case 'custom-wp-dev':
      return (
        <g>
          <rect x="2.5" y="3.5" width="19" height="17" rx="3.5" fill="#0a0a0a" />
          <path
            d="M8.5 9L5.2 12l3.3 3M15.5 9l3.3 3-3.3 3M13.2 8.2l-2.4 7.6"
            fill="none"
            stroke="#21759B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18.5" cy="5.5" r="3.2" fill="#21759B" stroke="#ffffff" strokeWidth="1" />
        </g>
      )
    case 'html-css':
      return (
        <g>
          <path d="M2 3h9l-1 13.5L6.5 18 3 16.5 2 3z" fill="#E34F26" />
          <path d="M4.3 6.5h4.4l-.2 2H6.3l.2 2h2l-.3 3.2-1.7.6-1.7-.6-.1-1.3h1.3l.1.5.4.2.5-.2.1-1.2H5l-.7-5.2z" fill="#FFF" />
          <path d="M13 6h9l-1 13.5L17.5 21 14 19.5 13 6z" fill="#1572B6" />
          <path d="M15.3 9.5h4.4l-.2 2h-2.2l.2 2h2l-.3 3.2-1.7.6-1.7-.6-.1-1.3H17l.1.5.4.2.5-.2.1-1.2H16l-.7-5.2z" fill="#FFF" />
        </g>
      )
    case 'js-react':
      return (
        <g>
          <rect x="1.5" y="1.5" width="10" height="10" rx="2" fill="#F7DF1E" />
          <text x="6.5" y="9" textAnchor="middle" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" fill="#0a0a0a">
            JS
          </text>
          <g transform="translate(15 15)">
            <circle cx="0" cy="0" r="1.4" fill="#00b4d8" />
            <g stroke="#00b4d8" strokeWidth="0.9" fill="none">
              <ellipse rx="7" ry="2.7" />
              <ellipse rx="7" ry="2.7" transform="rotate(60)" />
              <ellipse rx="7" ry="2.7" transform="rotate(120)" />
            </g>
          </g>
        </g>
      )
    case 'webflow-framer':
      return (
        <g transform="translate(2 1) scale(0.88)">
          <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" fill="#0055FF" />
        </g>
      )
    case 'shopify-wix':
      return (
        <g transform="translate(1.5 1) scale(0.18)">
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
        </g>
      )
    case 'web-app-ui':
      return (
        <g>
          <rect x="2" y="3" width="20" height="18" rx="2.5" fill="#0a0a0a" />
          <rect x="4" y="6" width="6" height="6" rx="1" fill="#ffd700" />
          <rect x="12" y="6" width="8" height="3" rx="1" fill="#ffffff" />
          <rect x="12" y="10.5" width="8" height="1.5" rx="0.7" fill="#ffd700" />
          <rect x="4" y="14" width="16" height="4.5" rx="1" fill="#ffd700" fillOpacity="0.85" />
        </g>
      )
    case 'adobe-illustrator':
      return (
        <g>
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#330000" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="800"
            fontFamily="sans-serif"
            fill="#FF9A00"
          >
            Ai
          </text>
        </g>
      )
    default:
      return <circle cx="12" cy="12" r="6" fill="#0a0a0a" />
  }
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

      // Icon medallion centered inside the middle of each wedge
      const iconRadius = HUB_RADIUS + (wedgeRadius - HUB_RADIUS) * 0.5
      const iconPos = polarToCartesian(CHART_CX, CHART_CY, iconRadius, midAngle)

      // Badge anchored near outer arc of the wedge
      const badgeRadius = Math.max(HUB_RADIUS + 46, wedgeRadius - 14)
      const badgePos = polarToCartesian(CHART_CX, CHART_CY, badgeRadius, midAngle)

      // Spoke endpoints from hub to 100% ring
      const spokeInner = polarToCartesian(CHART_CX, CHART_CY, HUB_RADIUS, startAngle)
      const spokeOuter = polarToCartesian(CHART_CX, CHART_CY, OUTER_RADIUS, startAngle)

      // Outer perimeter label position
      const labelPos = polarToCartesian(
        CHART_CX,
        CHART_CY,
        OUTER_RADIUS + 28,
        midAngle
      )
      const cosMid = Math.cos(midAngle)
      const textAnchor =
        Math.abs(cosMid) < 0.22 ? 'middle' : cosMid > 0 ? 'start' : 'end'

      return {
        skill,
        path,
        iconPos,
        badgePos,
        spokeInner,
        spokeOuter,
        labelPos,
        textAnchor,
        midAngle,
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

        {/* Interactive Domain Filter Pills */}
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-black text-[#ffd700] border-black shadow-sm'
                    : 'bg-white text-black/75 border-black/15 hover:border-black/40 hover:text-black'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        {/* Polar Area / Nightingale Rose ("Pizza") Chart */}
        <div className="mt-6 w-full max-w-[760px]">
          <svg
            viewBox="0 0 760 660"
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

            {/* Skill Icon Medallions inside each Wedge */}
            <g>
              {sliceGeometry.map(({ skill, iconPos }) => {
                const isActive = skill.id === selectedSkillId
                const matchesFilter =
                  activeFilter === 'All' ||
                  skill.filterKey === activeFilter ||
                  skill.category === activeFilter

                return (
                  <g
                    key={`icon-${skill.id}`}
                    transform={`translate(${iconPos.x.toFixed(2)}, ${iconPos.y.toFixed(2)})`}
                    className="cursor-pointer transition-opacity duration-300"
                    opacity={matchesFilter ? 1 : 0.28}
                    onMouseEnter={() => setSelectedSkillId(skill.id)}
                    onClick={() => setSelectedSkillId(skill.id)}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill="#ffffff"
                      stroke={isActive ? '#ffd700' : '#0a0a0a'}
                      strokeWidth="1.5"
                    />
                    <svg x="-10" y="-10" width="20" height="20" viewBox="0 0 24 24">
                      {renderSkillIcon(skill.id)}
                    </svg>
                  </g>
                )
              })}
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

            {/* Outer Skill Labels */}
            <g>
              {sliceGeometry.map(({ skill, labelPos, textAnchor }) => {
                const isActive = skill.id === selectedSkillId
                const matchesFilter =
                  activeFilter === 'All' ||
                  skill.filterKey === activeFilter ||
                  skill.category === activeFilter

                return (
                  <text
                    key={`label-${skill.id}`}
                    x={labelPos.x}
                    y={labelPos.y - (skill.label.length > 1 ? 6 : 0)}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    fontSize="12.5"
                    fontWeight={isActive ? '700' : '600'}
                    fill={isActive ? '#000000' : '#333333'}
                    opacity={matchesFilter ? 1 : 0.35}
                    className="cursor-pointer font-sans transition-opacity duration-300"
                    onMouseEnter={() => setSelectedSkillId(skill.id)}
                    onClick={() => setSelectedSkillId(skill.id)}
                  >
                    {skill.label.map((line, i) => (
                      <tspan
                        key={line}
                        x={labelPos.x}
                        dy={i === 0 ? 0 : 15}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                )
              })}
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
              {HUB_PETAL_COLORS.map((color, idx) => {
                const angle = -Math.PI / 2 + idx * ((Math.PI * 2) / HUB_PETAL_COLORS.length) + Math.PI / 10
                const petalPos = polarToCartesian(CHART_CX, CHART_CY, HUB_RADIUS - 7.5, angle)
                return (
                  <circle
                    key={`hub-petal-${idx}`}
                    cx={petalPos.x}
                    cy={petalPos.y}
                    r="3.2"
                    fill={color}
                    stroke="#0a0a0a"
                    strokeWidth="0.7"
                  />
                )
              })}
              <circle
                cx={CHART_CX}
                cy={CHART_CY}
                r={HUB_RADIUS - 15}
                fill="#0a0a0a"
                stroke="#ffd700"
                strokeWidth="1.5"
              />
              <path
                d={`M ${CHART_CX - 9} ${CHART_CY - 3} L ${CHART_CX - 12.5} ${CHART_CY} L ${CHART_CX - 9} ${CHART_CY + 3} M ${CHART_CX + 9} ${CHART_CY - 3} L ${CHART_CX + 12.5} ${CHART_CY} L ${CHART_CX + 9} ${CHART_CY + 3}`}
                fill="none"
                stroke="#ffd700"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x={CHART_CX}
                y={CHART_CY + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fontFamily="monospace"
                fill="#ffffff"
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
              <div className="w-11 h-11 rounded-full bg-white border border-black/15 shadow-xs flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                  {renderSkillIcon(activeSkill.id)}
                </svg>
              </div>
              <div>
                <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ffd700] text-black font-semibold mb-1">
                  {activeSkill.category}
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-black">
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
                className="px-2.5 py-1 rounded-md bg-black/5 border border-black/10 text-xs font-mono text-black/80"
              >
                {tool}
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
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-black">
                    {group.title}
                  </h4>
                  <span className="w-2 h-2 rounded-full bg-[#ffd700] border border-black/30" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="text-[11px] font-sans text-black/75 bg-black/[0.04] px-2 py-0.5 rounded"
                    >
                      {item}
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
