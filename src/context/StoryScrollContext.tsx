import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { STORY_STEPS, type StoryStep } from '@/data/storySteps'

interface StoryScrollContextValue {
  currentStepIndex: number
  currentStep: StoryStep
  totalSteps: number
  goToStep: (index: number) => void
  nextStep: () => void
  prevStep: () => void
  scrollToStep: (index: number) => void
  isScrollingLocked: boolean
}

const StoryScrollContext = createContext<StoryScrollContextValue | null>(null)

export function StoryScrollProvider({
  children,
  onScrollToStep,
}: {
  children: ReactNode
  onScrollToStep?: (index: number) => void
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)

  const totalSteps = STORY_STEPS.length

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(totalSteps - 1, index))
      setCurrentStepIndex(clamped)
    },
    [totalSteps]
  )

  const scrollToStep = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(totalSteps - 1, index))
      setCurrentStepIndex(clamped)
      onScrollToStep?.(clamped)
    },
    [totalSteps, onScrollToStep]
  )

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = Math.min(totalSteps - 1, prev + 1)
      onScrollToStep?.(next)
      return next
    })
  }, [totalSteps, onScrollToStep])

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = Math.max(0, prev - 1)
      onScrollToStep?.(next)
      return next
    })
  }, [totalSteps, onScrollToStep])

  const currentStep = STORY_STEPS[currentStepIndex]

  return (
    <StoryScrollContext.Provider
      value={{
        currentStepIndex,
        currentStep,
        totalSteps,
        goToStep,
        nextStep,
        prevStep,
        scrollToStep,
        isScrollingLocked: false,
      }}
    >
      {children}
    </StoryScrollContext.Provider>
  )
}

export function useStoryScroll() {
  const context = useContext(StoryScrollContext)
  if (!context) {
    throw new Error('useStoryScroll must be used within a StoryScrollProvider')
  }
  return context
}
