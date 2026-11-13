import { Component, Suspense, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Camera, Lighting, Room } from './scene'
import { WorkspaceFocusProvider, useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { RoomEntranceProvider, useRoomEntrance } from '@/context/RoomEntranceContext'
import { StudioLightingProvider } from '@/context/StudioLightingContext'
import { StoryScrollProvider, useStoryScroll } from '@/context/StoryScrollContext'
import { StoryScrollHUD } from './StoryScrollHUD'
import { StoryScrollBridge } from './StoryScrollBridge'
import { EntranceOverlay } from './EntranceOverlay'
import { STORY_STEPS } from '@/data/storySteps'

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

/**
 * Architectural Fallback View for devices that cannot handle real-time 3D WebGL.
 * Preserves the exact third-person over-the-shoulder workspace composition in SVG/CSS.
 */
export function WorkspaceFallback() {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center bg-surface-container overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-container-low to-surface-container-high" />
      <svg
        viewBox="0 0 800 500"
        className="relative z-10 w-full h-full max-w-3xl opacity-90"
        aria-label="Architectural 3D Workspace Fallback"
      >
        <rect x="80" y="30" width="640" height="310" rx="8" fill="#eae8e2" />
        <polygon points="140,290 660,290 730,360 70,360" fill="#fbf9f3" stroke="#cfc6ab" strokeWidth="2" />
        <rect x="250" y="135" width="300" height="125" rx="6" fill="#30312d" stroke="#dcdad4" strokeWidth="4" />
        <rect x="262" y="145" width="120" height="105" rx="2" fill="#1b1c19" />
        <rect x="275" y="160" width="65" height="6" fill="#f5d000" />
        <rect x="275" y="175" width="90" height="5" fill="#dcdad4" />
        <rect x="275" y="190" width="75" height="5" fill="#cbe6d0" />
        <rect x="392" y="145" width="146" height="105" rx="2" fill="#242521" />
        <circle cx="465" cy="197" r="28" fill="none" stroke="#f5d000" strokeWidth="2" />
        <circle cx="400" cy="235" r="34" fill="#1b1c19" />
        <path d="M335,340 C335,285 465,285 465,340 Z" fill="#dcdad4" />
        <rect x="342" y="310" width="116" height="145" rx="14" fill="#30312d" />
        <rect x="378" y="325" width="44" height="90" rx="6" fill="#dcdad4" />
      </svg>
    </div>
  )
}

function BackToWorkspaceControl({ onBackToHome }: { onBackToHome?: () => void }) {
  const { isAnyObjectOpen, returnToWorkspace } = useWorkspaceFocus()
  const { stage, exitToDoor } = useRoomEntrance()
  const { scrollToStep } = useStoryScroll()

  const handleExitClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    returnToWorkspace()
    exitToDoor()
    scrollToStep(STORY_STEPS.length - 1)
  }

  const handleHomeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onBackToHome) {
      onBackToHome()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Top Left Top/Hero Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 animate-fade-in pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)]">
        <button
          type="button"
          onClick={handleHomeClick}
          className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-black/10 bg-white/80 hover:bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono tracking-wider text-[#181917] shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#f5d000] hover:scale-105 active:scale-95 touch-manipulation"
          title="Scroll back to top Hero section"
        >
          <span className="text-xs sm:text-sm transition-transform group-hover:-translate-y-0.5">↑</span>
          <span className="font-semibold uppercase">HERO</span>
        </button>
      </div>

      {/* Top Right Return to Overview / Exit Room Button */}
      {isAnyObjectOpen ? (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 animate-fade-in pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              returnToWorkspace()
            }}
            className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-black/10 bg-white/85 hover:bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono tracking-wider text-[#181917] shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#f5d000] hover:scale-105 active:scale-95 touch-manipulation"
            title="Return to Room Overview"
          >
            <span className="text-xs sm:text-sm transition-transform group-hover:-translate-x-0.5">←</span>
            <span className="font-semibold uppercase">OVERVIEW</span>
          </button>
        </div>
      ) : (
        stage === 'WORKSPACE' && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 animate-fade-in pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)]">
            <button
              type="button"
              onClick={handleExitClick}
              className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-black/10 bg-white/80 hover:bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono tracking-wider text-[#181917] shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#f5d000] hover:scale-105 active:scale-95 touch-manipulation"
              title="Exit Room back to the Door"
            >
              <span className="text-xs sm:text-sm transition-transform group-hover:translate-x-0.5">→</span>
              <span className="font-semibold uppercase">EXIT ROOM</span>
            </button>
          </div>
        )
      )}
    </>
  )
}

/**
 * Listens to native window scroll across the tall 3D Studio scroll container
 * and maps scroll progress (0..1) to the 10 story steps:
 * 0: Door -> 1: Room Overview -> 2: Bike & Patio -> 3: Notebook -> 4: Bookshelf ->
 * 5: Gramophone -> 6: Smartphone -> 7: Wall Art -> 8: Wall Note -> 9: Exit Door -> Footer
 */
function WindowScrollStepTracker({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const { currentStepIndex, totalSteps, goToStep } = useStoryScroll()
  const stepIndexRef = useRef(currentStepIndex)
  stepIndexRef.current = currentStepIndex

  useEffect(() => {
    let rafId: number | null = null

    const updateStepFromScroll = () => {
      rafId = null
      const el = containerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const viewportH = window.innerHeight
      const scrollableDistance = Math.max(1, rect.height - viewportH)

      // Before reaching the 3D section (user is in Hero section)
      if (rect.top > viewportH * 0.25) {
        if (stepIndexRef.current !== 0) {
          goToStep(0)
        }
        return
      }

      // Past the 3D section (user scrolled into Footer)
      if (rect.bottom < viewportH * 0.75) {
        if (stepIndexRef.current !== totalSteps - 1) {
          goToStep(totalSteps - 1)
        }
        return
      }

      // Inside the sticky 3D scroll track: map progress [0, 1] -> [0, totalSteps - 1]
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(0.9999, scrolled / scrollableDistance))
      const targetIndex = Math.floor(progress * totalSteps)

      if (targetIndex !== stepIndexRef.current) {
        goToStep(targetIndex)
      }
    }

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateStepFromScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateStepFromScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [containerRef, goToStep, totalSteps])

  return null
}

/**
 * Signals when the 3D scene has rendered its first frames on the GPU.
 */
function SceneReadyNotifier({ onReady }: { onReady: () => void }) {
  const frameCountRef = useRef(0)
  const signaledRef = useRef(false)

  useFrame(() => {
    if (signaledRef.current) return
    frameCountRef.current += 1

    if (frameCountRef.current >= 2) {
      signaledRef.current = true
      onReady()
    }
  })

  return null
}

interface WorkspaceCanvasProps {
  onBackToHome?: () => void
  onSceneReady?: () => void
}

export function WorkspaceCanvas({ onBackToHome, onSceneReady }: WorkspaceCanvasProps) {
  const [webglSupported, setWebglSupported] = useState<boolean>(true)
  const [isCanvasInView, setIsCanvasInView] = useState<boolean>(true)
  const scrollTrackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supported = checkWebGLSupport()
    setWebglSupported(supported)
    if (!supported) {
      onSceneReady?.()
    }
  }, [onSceneReady])

  // Pause WebGL frameloop when user is viewing the Hero section or Footer section outside the 3D viewport!
  useEffect(() => {
    const trackEl = scrollTrackRef.current
    if (!trackEl || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsCanvasInView(entry.isIntersecting)
        }
      },
      { rootMargin: '200px 0px' },
    )

    observer.observe(trackEl)
    return () => observer.disconnect()
  }, [])

  // Smoothly scroll the window to a specific story step's vertical position
  const handleScrollToStep = useCallback((stepIndex: number) => {
    const el = scrollTrackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const containerTop = window.scrollY + rect.top
    const viewportH = window.innerHeight
    const scrollableDistance = Math.max(1, el.offsetHeight - viewportH)
    const totalSteps = STORY_STEPS.length

    // Aim for the middle of the step's scroll band
    const stepFraction = (stepIndex + 0.35) / totalSteps
    const targetY = containerTop + stepFraction * scrollableDistance
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }, [])

  if (!webglSupported) {
    return <WorkspaceFallback />
  }

  return (
    <SceneErrorBoundary fallback={<WorkspaceFallback />}>
      <StudioLightingProvider>
        <RoomEntranceProvider>
          <WorkspaceFocusProvider>
            <StoryScrollProvider onScrollToStep={handleScrollToStep}>
              <WindowScrollStepTracker containerRef={scrollTrackRef} />

              {/* Tall Scroll-Triggered Container (1000vh = 100vh per interactive station) */}
              <div
                ref={scrollTrackRef}
                id="studio-workspace"
                className="relative w-full h-[1000vh] bg-[#f0eee8]"
              >
                {/* Sticky 100vh 3D Viewport that stays pinned while scrolling through all 10 stations */}
                <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#f0eee8]">
                  <Canvas
                    shadows
                    frameloop={isCanvasInView ? 'always' : 'never'}
                    dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25)]}
                    performance={{ min: 0.5 }}
                    gl={{
                      antialias: true,
                      powerPreference: 'high-performance',
                      alpha: false,
                      stencil: false,
                      depth: true,
                    }}
                  >
                    <color attach="background" args={['#f0eee8']} />
                    <Camera />
                    <Lighting />
                    <Suspense fallback={null}>
                      <Room />
                    </Suspense>
                    <SceneReadyNotifier onReady={() => onSceneReady?.()} />
                  </Canvas>

                  <EntranceOverlay />
                  <BackToWorkspaceControl onBackToHome={onBackToHome} />
                  <StoryScrollHUD />
                  <StoryScrollBridge />
                </div>
              </div>
            </StoryScrollProvider>
          </WorkspaceFocusProvider>
        </RoomEntranceProvider>
      </StudioLightingProvider>
    </SceneErrorBoundary>
  )
}
