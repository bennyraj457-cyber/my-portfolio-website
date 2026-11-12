import React from 'react'
import { tools } from '../../data/skills'
import './toolsMarquee.css'

/**
 * ToolsMarquee
 *
 * Clean, minimal marquee showing pure logos with no circular background or card shadows:
 * Figma, HTML, CSS, JavaScript, React, PHP, Laravel, PostgreSQL,
 * WordPress, Shopify, Framer, Git & GitHub, VS Code, Google Antigravity, Codex.
 */
export default function ToolsMarquee({ className = '' }) {
  const duplicatedTools = [...tools, ...tools]

  return (
    <div className={`w-full max-w-4xl mx-auto overflow-hidden py-3 select-none relative ${className}`}>
      {/* Soft gradient edge masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-bg-main to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-bg-main to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="tools-marquee-track flex items-center gap-6 sm:gap-8 w-max">
        {duplicatedTools.map((tool, index) => (
          <div
            key={`${tool.name}-${index}`}
            data-cursor="link"
            title={tool.name}
            className="group relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 hover:scale-125 transition-transform duration-300 cursor-pointer bg-transparent"
          >
            <img
              src={tool.icon}
              alt={tool.name}
              loading="lazy"
              onError={(e) => {
                if (tool.name === 'Shopify') {
                  e.currentTarget.src = 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shopify.svg'
                } else if (tool.name === 'Framer') {
                  e.currentTarget.src = 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/framer.svg'
                }
              }}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Hover Tooltip */}
            <span className="absolute -bottom-7 scale-0 group-hover:scale-100 transition-transform duration-200 text-[10px] uppercase font-mono tracking-wider font-semibold bg-black text-white px-2 py-0.5 rounded shadow whitespace-nowrap z-20 pointer-events-none">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
