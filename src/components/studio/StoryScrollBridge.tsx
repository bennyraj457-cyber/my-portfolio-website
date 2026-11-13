import { useEffect, useRef } from 'react'
import { useStoryScroll } from '@/context/StoryScrollContext'
import { useRoomEntrance } from '@/context/RoomEntranceContext'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { STORY_STEPS, type StoryStepId } from '@/data/storySteps'

/**
 * Synchronizes discrete story steps (driven by page scroll or HUD buttons)
 * with 3D room entrance and object focus states:
 * Step 0 ('door'): Entrance Door view
 * Step 1 ('room-overview'): Opens door and glides inside room to overview camera
 * Step 2 ('bike-showroom'): Focuses 1970 Honda CB750 & Left Glass Patio Door
 * Step 3 ('notebook'): Opens About Me notebook
 * Step 4 ('bookshelf'): Opens Skills bookshelf
 * Step 5 ('music-player'): Opens Vintage Gramophone music player
 * Step 6 ('smartphone'): Opens Contact smartphone
 * Step 7 ('wall-art'): Focuses Framed Wall Art gallery
 * Step 8 ('wall-note'): Focuses Studio Notice wall note
 * Step 9 ('door-exit'): Exits room back through the door to the outside wall door before scrolling to Footer
 */
export function StoryScrollBridge() {
  const { currentStep, currentStepIndex, goToStep } = useStoryScroll()
  const { stage } = useRoomEntrance()
  const {
    activeObject,
    openNotebook,
    openBookshelf,
    openMusicPlayer,
    openSmartphone,
    openWallArt,
    openWallNote,
    openBikeShowroom,
    returnToWorkspace,
  } = useWorkspaceFocus()

  const isProgrammaticStepRef = useRef(false)

  // 1. When currentStep changes via Next/Prev/Dot click, drive the 3D camera
  useEffect(() => {
    const stepId = currentStep.id
    isProgrammaticStepRef.current = true
    const timer = setTimeout(() => {
      isProgrammaticStepRef.current = false
    }, 350)

    if (stepId === 'room-overview') {
      returnToWorkspace()
    } else if (stepId === 'bike-showroom') {
      openBikeShowroom()
    } else if (stepId === 'notebook') {
      openNotebook()
    } else if (stepId === 'bookshelf') {
      openBookshelf()
    } else if (stepId === 'music-player') {
      openMusicPlayer()
    } else if (stepId === 'smartphone') {
      openSmartphone()
    } else if (stepId === 'wall-art') {
      openWallArt()
    } else if (stepId === 'wall-note') {
      openWallNote()
    }

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep.id])

  // 2. When user manually clicks a 3D object directly inside the canvas, keep the step indicator synced
  useEffect(() => {
    if (isProgrammaticStepRef.current) return

    if (stage === 'WORKSPACE') {
      let targetStepId: StoryStepId = 'room-overview'
      if (activeObject === 'bike-showroom') targetStepId = 'bike-showroom'
      else if (activeObject === 'about-me-notebook') targetStepId = 'notebook'
      else if (activeObject === 'bookshelf') targetStepId = 'bookshelf'
      else if (activeObject === 'music-player') targetStepId = 'music-player'
      else if (activeObject === 'contact-smartphone') targetStepId = 'smartphone'
      else if (activeObject === 'wall-art') targetStepId = 'wall-art'
      else if (activeObject === 'wall-note') targetStepId = 'wall-note'

      if (targetStepId !== currentStep.id) {
        const idx = STORY_STEPS.findIndex((s) => s.id === targetStepId)
        if (idx !== -1 && idx !== currentStepIndex) {
          goToStep(idx)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, activeObject])

  return null
}
