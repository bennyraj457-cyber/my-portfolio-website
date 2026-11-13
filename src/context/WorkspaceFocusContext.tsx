import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ActiveWorkspaceObject =
  | 'about-me-notebook'
  | 'contact-smartphone'
  | 'music-player'
  | 'bookshelf'
  | 'wall-note'
  | 'wall-art'
  | 'bike-showroom'
  | null

export type ActiveSkillBook =
  | 'html'
  | 'css'
  | 'react'
  | 'figma'
  | 'adobe-illustrator'
  | null

interface WorkspaceFocusContextValue {
  /** Currently active desk object experience, or null when in normal workspace exploration */
  activeObject: ActiveWorkspaceObject
  /** Currently selected skill book on the bookshelf, or null */
  activeBook: ActiveSkillBook
  /** Whether the About Me notebook experience is currently open */
  isNotebookOpen: boolean
  /** Whether the Contact smartphone experience is currently open */
  isSmartphoneOpen: boolean
  /** Whether the Music Player experience is currently open */
  isMusicPlayerOpen: boolean
  /** Whether the Pinned Wall Note experience is currently focused */
  isWallNoteOpen: boolean
  /** Whether the Framed Wall Art is currently focused */
  isWallArtOpen: boolean
  /** Whether the Honda CB750 Bike Showroom & Glass Door area is currently focused */
  isBikeShowroomOpen: boolean
  /** Whether the Bookshelf stage is currently focused */
  isBookshelfOpen: boolean
  /** Whether an individual skill book is currently opened */
  isBookOpened: boolean
  /** Whether any interactive desk object experience is currently focused */
  isAnyObjectOpen: boolean
  /** Open the About Me notebook experience and transition the camera toward it */
  openNotebook: () => void
  /** Close the About Me notebook experience */
  closeNotebook: () => void
  /** Open the Contact smartphone experience and transition the camera toward it */
  openSmartphone: () => void
  /** Close the Contact smartphone experience */
  closeSmartphone: () => void
  /** Open the Music Player experience and transition the camera toward it */
  openMusicPlayer: () => void
  /** Close the Music Player experience */
  closeMusicPlayer: () => void
  /** Open the Pinned Wall Note experience and transition camera close up to read */
  openWallNote: () => void
  openWallArt: () => void
  /** Open the Honda CB750 Bike Showroom & Glass Door view */
  openBikeShowroom: () => void
  /** Close the Pinned Wall Note experience */
  closeWallNote: () => void
  /** Open the Bookshelf view and frame all 5 books */
  openBookshelf: () => void
  /** Close the Bookshelf view and return to workspace */
  closeBookshelf: () => void
  /** Select and open a specific skill book */
  openBook: (bookId: 'html' | 'css' | 'react' | 'figma' | 'adobe-illustrator') => void
  /** Close the currently open book and return to bookshelf framing */
  closeBook: () => void
  /** Return from any focused desk object back to the default workspace view */
  returnToWorkspace: () => void
  /** Set any future interactive object focus */
  setActiveObject: (obj: ActiveWorkspaceObject) => void
}

const WorkspaceFocusContext = createContext<WorkspaceFocusContextValue>({
  activeObject: null,
  activeBook: null,
  isNotebookOpen: false,
  isSmartphoneOpen: false,
  isMusicPlayerOpen: false,
  isWallNoteOpen: false,
  isWallArtOpen: false,
  isBikeShowroomOpen: false,
  isBookshelfOpen: false,
  isBookOpened: false,
  isAnyObjectOpen: false,
  openNotebook: () => {},
  closeNotebook: () => {},
  openSmartphone: () => {},
  closeSmartphone: () => {},
  openMusicPlayer: () => {},
  closeMusicPlayer: () => {},
  openWallNote: () => {},
  openWallArt: () => {},
  openBikeShowroom: () => {},
  closeWallNote: () => {},
  openBookshelf: () => {},
  closeBookshelf: () => {},
  openBook: () => {},
  closeBook: () => {},
  returnToWorkspace: () => {},
  setActiveObject: () => {},
})

export function WorkspaceFocusProvider({ children }: { children: ReactNode }) {
  const [activeObject, setActiveObject] = useState<ActiveWorkspaceObject>(null)
  const [activeBook, setActiveBook] = useState<ActiveSkillBook>(null)

  const openNotebook = useCallback(() => {
    setActiveBook(null)
    setActiveObject('about-me-notebook')
  }, [])

  const closeNotebook = useCallback(() => {
    setActiveObject((prev) => (prev === 'about-me-notebook' ? null : prev))
  }, [])

  const openSmartphone = useCallback(() => {
    setActiveBook(null)
    setActiveObject('contact-smartphone')
  }, [])

  const closeSmartphone = useCallback(() => {
    setActiveObject((prev) => (prev === 'contact-smartphone' ? null : prev))
  }, [])

  const openMusicPlayer = useCallback(() => {
    setActiveBook(null)
    setActiveObject('music-player')
  }, [])

  const closeMusicPlayer = useCallback(() => {
    setActiveObject((prev) => (prev === 'music-player' ? null : prev))
  }, [])

  const openWallNote = useCallback(() => {
    setActiveBook(null)
    setActiveObject('wall-note')
  }, [])

  const openWallArt = useCallback(() => {
    setActiveBook(null)
    setActiveObject('wall-art')
  }, [])

  const openBikeShowroom = useCallback(() => {
    setActiveBook(null)
    setActiveObject('bike-showroom')
  }, [])

  const closeWallNote = useCallback(() => {
    setActiveObject((prev) => (prev === 'wall-note' ? null : prev))
  }, [])

  const openBookshelf = useCallback(() => {
    setActiveBook(null)
    setActiveObject('bookshelf')
  }, [])

  const closeBookshelf = useCallback(() => {
    setActiveBook(null)
    setActiveObject((prev) => (prev === 'bookshelf' ? null : prev))
  }, [])

  const openBook = useCallback((bookId: 'html' | 'css' | 'react' | 'figma' | 'adobe-illustrator') => {
    setActiveObject('bookshelf')
    setActiveBook(bookId)
  }, [])

  const closeBook = useCallback(() => {
    setActiveBook(null)
  }, [])

  const returnToWorkspace = useCallback(() => {
    setActiveBook(null)
    setActiveObject(null)
  }, [])

  // Allow pressing Escape at any time:
  // If a book is open -> returns to bookshelf framing
  // If in bookshelf view or other object -> returns to default workspace
  useEffect(() => {
    if (!activeObject) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (activeBook !== null) {
          setActiveBook(null)
        } else {
          setActiveObject(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeObject, activeBook])

  const value = useMemo<WorkspaceFocusContextValue>(
    () => ({
      activeObject,
      activeBook,
      isNotebookOpen: activeObject === 'about-me-notebook',
      isSmartphoneOpen: activeObject === 'contact-smartphone',
      isMusicPlayerOpen: activeObject === 'music-player',
      isWallNoteOpen: activeObject === 'wall-note',
      isWallArtOpen: activeObject === 'wall-art',
      isBikeShowroomOpen: activeObject === 'bike-showroom',
      isBookshelfOpen: activeObject === 'bookshelf',
      isBookOpened: activeObject === 'bookshelf' && activeBook !== null,
      isAnyObjectOpen: activeObject !== null,
      openNotebook,
      closeNotebook,
      openSmartphone,
      closeSmartphone,
      openMusicPlayer,
      closeMusicPlayer,
      openWallNote,
      openWallArt,
      openBikeShowroom,
      closeWallNote,
      openBookshelf,
      closeBookshelf,
      openBook,
      closeBook,
      returnToWorkspace,
      setActiveObject,
    }),
    [
      activeObject,
      activeBook,
      openNotebook,
      closeNotebook,
      openSmartphone,
      closeSmartphone,
      openMusicPlayer,
      closeMusicPlayer,
      openWallNote,
      openWallArt,
      openBikeShowroom,
      closeWallNote,
      openBookshelf,
      closeBookshelf,
      openBook,
      closeBook,
      returnToWorkspace,
    ],
  )

  return (
    <WorkspaceFocusContext.Provider value={value}>
      {children}
    </WorkspaceFocusContext.Provider>
  )
}

export function useWorkspaceFocus(): WorkspaceFocusContextValue {
  return useContext(WorkspaceFocusContext)
}
