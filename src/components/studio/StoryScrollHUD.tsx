import { useStoryScroll } from '@/context/StoryScrollContext'
import { STORY_STEPS } from '@/data/storySteps'

/**
 * Clean architectural HUD for scroll-triggered studio storytelling:
 * - Current station badge, title, and step progress dots
 * - Prev / Next buttons that smoothly scroll the page to the corresponding station
 */
export function StoryScrollHUD() {
  const { currentStep, currentStepIndex, totalSteps, nextStep, prevStep, scrollToStep } =
    useStoryScroll()

  const handleNextOrFooter = () => {
    if (currentStepIndex === totalSteps - 1) {
      const footerEl = document.getElementById('portfolio-footer')
      if (footerEl) {
        footerEl.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    nextStep()
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none">
      {/* Bottom Center: Scroll-Synced Station Indicator + Prev/Next Controls */}
      <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex flex-col items-center gap-2 pb-[env(safe-area-inset-bottom,0px)] px-4">
        {/* Step Progress Dots */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#181917]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
          {STORY_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToStep(idx)}
                title={`${step.stepNumber}. ${step.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-5 bg-[#f5d000] shadow-[0_0_8px_#f5d000]'
                    : 'w-1.5 bg-white/35 hover:bg-white/70'
                }`}
              />
            )
          })}
        </div>

        {/* Station Bar + Prev / Next Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-black/10 shadow-lg transition-all duration-300">
          {/* Previous step button */}
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-mono font-semibold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-black/10 bg-black/5 text-[#181917] hover:bg-[#181917] hover:text-white disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all touch-manipulation"
            title="Previous Station"
          >
            <span>↑</span>
            <span>PREV</span>
          </button>

          {/* Active Station Label */}
          <div className="hidden xs:flex flex-col items-center px-2 min-w-[140px] sm:min-w-[185px] text-center">
            <span className="text-[9px] font-mono tracking-[0.18em] text-[#6b6a65] uppercase">
              {String(currentStep.stepNumber).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')} • SCROLL TOUR
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-bold text-[#181917] truncate max-w-[175px] sm:max-w-[220px]">
              {currentStep.title}
            </span>
          </div>

          {/* Next step button */}
          <button
            type="button"
            onClick={handleNextOrFooter}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-mono font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#f5d000] text-[#181917] shadow-sm hover:bg-[#181917] hover:text-[#f5d000] active:scale-95 transition-all touch-manipulation"
            title={
              currentStepIndex === totalSteps - 1
                ? 'Scroll to Portfolio Footer'
                : 'Next Station (or Scroll Down)'
            }
          >
            <span>{currentStepIndex === totalSteps - 1 ? 'FOOTER' : 'NEXT'}</span>
            <span>↓</span>
          </button>
        </div>
      </div>
    </div>
  )
}
