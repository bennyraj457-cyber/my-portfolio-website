import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type EntranceStage =
  | 'LOADING'
  | 'ENTRANCE'
  | 'VISITOR_SELECTION'
  | 'DOOR_OPENING'
  | 'ENTERING_ROOM'
  | 'WORKSPACE'
  | 'EXITING_ROOM'

export type VisitorType = 'friend' | 'business' | null

interface RoomEntranceContextValue {
  stage: EntranceStage
  visitorType: VisitorType
  isReducedMotion: boolean
  hasEntered: boolean
  handleDoorClick: () => void
  selectVisitor: (type: 'friend' | 'business') => void
  completeEntrance: () => void
  skipEntrance: () => void
  exitToDoor: () => void
  completeExit: () => void
}

const RoomEntranceContext = createContext<RoomEntranceContextValue>({
  stage: 'ENTRANCE',
  visitorType: null,
  isReducedMotion: false,
  hasEntered: false,
  handleDoorClick: () => {},
  selectVisitor: () => {},
  completeEntrance: () => {},
  skipEntrance: () => {},
  exitToDoor: () => {},
  completeExit: () => {},
})

export function RoomEntranceProvider({ children }: { children: ReactNode }) {
  const [visitorType, setVisitorType] = useState<VisitorType>(null)
  const [hasEntered, setHasEntered] = useState<boolean>(false)

  // Reduced motion preference detection
  const isReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // ALWAYS start at 'ENTRANCE' so visitors always experience the 3D door on first load / refresh
  const [stage, setStage] = useState<EntranceStage>('ENTRANCE')

  // Door click opens door and enters workspace directly
  const handleDoorClick = useCallback(() => {
    if (stage === 'ENTRANCE') {
      setVisitorType('friend')
      setStage('DOOR_OPENING')
    }
  }, [stage])

  // Visitor selects option
  const selectVisitor = useCallback((type: 'friend' | 'business') => {
    setVisitorType(type)
    setStage('DOOR_OPENING')
  }, [])

  // Once door open animation triggers camera flight into room
  const completeEntrance = useCallback(() => {
    setHasEntered(true)
    setStage('WORKSPACE')
  }, [])

  const skipEntrance = useCallback(() => {
    setVisitorType('friend')
    setHasEntered(true)
    setStage('WORKSPACE')
  }, [])

  // Exit back to door outside: initiates smooth cinematic exit traversal
  const exitToDoor = useCallback(() => {
    setHasEntered(false)
    setStage('EXITING_ROOM')
  }, [])

  // Once camera has fully traveled through doorway and door has closed
  const completeExit = useCallback(() => {
    setStage('ENTRANCE')
  }, [])

  const value = useMemo(
    () => ({
      stage,
      visitorType,
      isReducedMotion,
      hasEntered,
      handleDoorClick,
      selectVisitor,
      completeEntrance,
      skipEntrance,
      exitToDoor,
      completeExit,
    }),
    [
      stage,
      visitorType,
      isReducedMotion,
      hasEntered,
      handleDoorClick,
      selectVisitor,
      completeEntrance,
      skipEntrance,
      exitToDoor,
      completeExit,
    ],
  )

  return (
    <RoomEntranceContext.Provider value={value}>
      {children}
    </RoomEntranceContext.Provider>
  )
}

export function useRoomEntrance(): RoomEntranceContextValue {
  return useContext(RoomEntranceContext)
}
