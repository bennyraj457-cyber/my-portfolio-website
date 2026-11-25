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
            <div>
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ffd700] text-black font-semibold mb-1.5">
                {activeSkill.category}
              </span>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-black">
                {activeSkill.title}
              </h3>
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
