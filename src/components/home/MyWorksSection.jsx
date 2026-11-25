import React, { useEffect, useState } from 'react'
import { projects } from '../../data/projects'

const DEVICES = [
  {
    id: 'laptop',
    label: 'Laptop',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="4" y="2" width="16" height="20" rx="2.5" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
]

const DEVICE_FRAME_CLASSES = {
  laptop: 'w-full max-w-[920px]',
  tablet: 'w-full max-w-[580px]',
  mobile: 'w-full max-w-[330px]',
}

const DEVICE_SCREEN_HEIGHT = {
  laptop: 'h-[360px] sm:h-[480px] md:h-[520px]',
  tablet: 'h-[480px] sm:h-[560px]',
  mobile: 'h-[520px] sm:h-[570px]',
}

export default function MyWorksSection() {
  const [selectedDevice, setSelectedDevice] = useState('laptop')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState('next')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [iframeStatus, setIframeStatus] = useState('loading') // 'loading' | 'loaded' | 'blocked'
  const [reloadKey, setReloadKey] = useState(0)

  const total = projects.length
  const currentProject = projects[currentIndex] || projects[0]

  useEffect(() => {
    setIframeStatus('loading')
  }, [currentIndex, reloadKey])

  const switchProject = (nextIdx, direction) => {
    if (isTransitioning) return
    setSlideDirection(direction)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(nextIdx)
      setIsTransitioning(false)
    }, 220)
  }

  const handleNext = () => {
    switchProject((currentIndex + 1) % total, 'next')
  }

  const handlePrev = () => {
    switchProject((currentIndex - 1 + total) % total, 'prev')
  }

  const handleReload = () => {
    setIframeStatus('loading')
    setReloadKey((k) => k + 1)
  }

  const slideAnimationClass = isTransitioning
    ? slideDirection === 'next'
      ? '-translate-x-8 opacity-0 scale-[0.98]'
      : 'translate-x-8 opacity-0 scale-[0.98]'
    : 'translate-x-0 opacity-100 scale-100'

  return (
    <section
      id="works"
      aria-label="My Works — Interactive Project Showcase"
      className="relative w-full bg-[#fafafa] text-black py-16 sm:py-24 px-4 sm:px-8 md:px-12 border-t border-black/10 overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Project Details & Open Live Project CTA */}
        <div className="w-full max-w-3xl rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 select-text">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-wider text-black/55">
              <span className="font-bold text-black">{currentProject.id}</span>
              <span>•</span>
              <span>{currentProject.category}</span>
              <span>•</span>
              <span>{currentProject.year}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-black">
              {currentProject.title}
            </h3>
            <p className="text-sm text-black/75 font-sans leading-relaxed max-w-xl">
              {currentProject.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentProject.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-black/[0.04] border border-black/10 text-[11px] font-mono text-black/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <a
            href={currentProject.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-black text-[#ffd700] hover:bg-[#ffd700] hover:text-black border border-black font-mono text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm active:scale-95"
          >
            <span>Open Live Project</span>
            <span>↗</span>
          </a>
        </div>

        {/* 2. Showcase Stage with Left/Right Carousel Arrows & Device Mockup */}
        <div className="mt-8 w-full flex items-center justify-center gap-2 sm:gap-5">
          {/* Previous Project Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Project"
            className="hidden sm:inline-flex shrink-0 w-11 h-11 rounded-full border border-black/15 bg-white text-black hover:bg-black hover:text-[#ffd700] hover:border-black transition-all duration-200 items-center justify-center shadow-sm active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Realistic Device Mockup Container */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <div
              className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${DEVICE_FRAME_CLASSES[selectedDevice]}`}
            >
              {/* Outer Device Bezel */}
              <div
                className={`relative bg-[#141414] shadow-[0_28px_70px_rgba(0,0,0,0.22)] border border-black/30 transition-all duration-500 ${
                  selectedDevice === 'laptop'
                    ? 'rounded-t-2xl p-2.5 sm:p-3.5 pb-3'
                    : selectedDevice === 'tablet'
                    ? 'rounded-[26px] p-3.5 sm:p-4'
                    : 'rounded-[38px] p-3'
                }`}
              >
                {/* Device Hardware Top Detail (Webcam / Notch) */}
                {selectedDevice === 'laptop' && (
                  <div className="flex justify-center pb-2">
                    <span className="w-2 h-2 rounded-full bg-[#2b2b2b] ring-1 ring-white/10" />
                  </div>
                )}
                {selectedDevice === 'tablet' && (
                  <div className="flex justify-center pb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2b2b2b]" />
                  </div>
                )}
                {selectedDevice === 'mobile' && (
                  <div className="flex justify-center pb-2.5">
                    <span className="w-20 h-4 rounded-full bg-black border border-white/10 flex items-center justify-end pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e293b]" />
                    </span>
                  </div>
                )}

                {/* Screen Area with Chrome-Style Browser */}
                <div
                  className={`relative w-full bg-white overflow-hidden flex flex-col transition-all duration-500 ${
                    selectedDevice === 'laptop'
                      ? 'rounded-lg'
                      : selectedDevice === 'tablet'
                      ? 'rounded-xl'
                      : 'rounded-[26px]'
                  } ${DEVICE_SCREEN_HEIGHT[selectedDevice]}`}
                >
                  {/* Chrome-Style Browser Toolbar */}
                  <div className="shrink-0 bg-[#f1f3f4] border-b border-black/10 px-3 py-2 flex items-center gap-2.5">
                    {/* Traffic Lights */}
                    <div className="hidden xs:flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>

                    {/* Reload Button */}
                    <button
                      type="button"
                      onClick={handleReload}
                      title="Reload preview"
                      aria-label="Reload website preview"
                      className="p-1 rounded hover:bg-black/5 text-black/60 hover:text-black transition-colors cursor-pointer shrink-0"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    </button>

                    {/* Address Bar */}
                    <div className="flex-1 min-w-0 bg-white border border-black/10 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-black/75 shadow-2xs">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-emerald-600 shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="truncate">{currentProject.liveUrl}</span>
                    </div>

                    {/* External Open Shortcut */}
                    <a
                      href={currentProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in new tab"
                      aria-label={`Open ${currentProject.title} in new tab`}
                      className="p-1 rounded hover:bg-black/5 text-black/60 hover:text-black transition-colors shrink-0"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  {/* Device Switcher Bar inside the Screen */}
                  <div
                    className="shrink-0 bg-[#fafafa] border-b border-black/10 px-2.5 py-1.5 flex items-center justify-center gap-1"
                    role="tablist"
                    aria-label="Select device preview"
                  >
                    {DEVICES.map((device) => {
                      const isActive = selectedDevice === device.id
                      return (
                        <button
                          key={device.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setSelectedDevice(device.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-black text-[#ffd700] shadow-2xs'
                              : 'text-black/65 hover:text-black hover:bg-black/5'
                          }`}
                        >
                          {device.icon}
                          <span>{device.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Animated Project Viewport */}
                  <div
                    className={`relative flex-1 w-full bg-white transition-all duration-300 ease-out ${slideAnimationClass}`}
                  >
                    {/* Loading Progress Bar */}
                    {iframeStatus === 'loading' && (
                      <div className="absolute inset-x-0 top-0 z-20 h-0.5 bg-black/5 overflow-hidden">
                        <div className="h-full w-1/2 bg-[#ffd700] animate-pulse" />
                      </div>
                    )}

                    {/* Blocked / Fallback View */}
                    {iframeStatus === 'blocked' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#fffdf5] space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ffd700] flex items-center justify-center text-black font-mono font-bold text-lg">
                          {currentProject.id}
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="text-lg font-heading font-bold text-black">
                            {currentProject.title}
                          </h4>
                          <p className="text-xs text-black/65 font-sans">
                            Live embedding is restricted by this site&apos;s security headers. Open it directly to experience the full app.
                          </p>
                        </div>
                        <a
                          href={currentProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-[#ffd700] text-xs font-mono font-semibold hover:opacity-90 transition-opacity"
                        >
                          <span>Open Live Project</span>
                          <span>↗</span>
                        </a>
                      </div>
                    ) : (
                      <iframe
                        key={`${currentProject.id}-${reloadKey}`}
                        src={currentProject.liveUrl}
                        title={`${currentProject.title} Live Preview`}
                        className="w-full h-full border-0 bg-white"
                        loading="lazy"
                        onLoad={() => setIframeStatus('loaded')}
                        onError={() => setIframeStatus('blocked')}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    )}
                  </div>
                </div>

                {/* Mobile Home Indicator */}
                {selectedDevice === 'mobile' && (
                  <div className="flex justify-center pt-2.5">
                    <span className="w-24 h-1 rounded-full bg-white/30" />
                  </div>
                )}
              </div>

              {/* Laptop Aluminum Base Lip */}
              {selectedDevice === 'laptop' && (
                <div className="relative mx-auto w-[104%] -ml-[2%] h-3.5 sm:h-4 bg-gradient-to-b from-[#d4d4d8] to-[#a1a1aa] rounded-b-xl shadow-md flex justify-center">
                  <div className="w-20 sm:w-28 h-1.5 bg-[#71717a]/60 rounded-b-md" />
                </div>
              )}
            </div>
          </div>

          {/* Next Project Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Project"
            className="hidden sm:inline-flex shrink-0 w-11 h-11 rounded-full border border-black/15 bg-white text-black hover:bg-black hover:text-[#ffd700] hover:border-black transition-all duration-200 items-center justify-center shadow-sm active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Mobile Carousel Arrows + Dots */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Project"
            className="sm:hidden inline-flex w-9 h-9 rounded-full border border-black/15 bg-white text-black items-center justify-center shadow-sm active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {projects.map((proj, idx) => {
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() =>
                    switchProject(idx, idx > currentIndex ? 'next' : 'prev')
                  }
                  aria-label={`View ${proj.title}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'w-7 bg-black'
                      : 'w-2 bg-black/20 hover:bg-black/45'
                  }`}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Project"
            className="sm:hidden inline-flex w-9 h-9 rounded-full border border-black/15 bg-white text-black items-center justify-center shadow-sm active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  )
}
