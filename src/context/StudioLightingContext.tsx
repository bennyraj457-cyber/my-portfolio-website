import { createContext, useContext, useState, type ReactNode } from 'react'

interface StudioLightingContextType {
  isNightMode: boolean
  toggleDayNight: () => void
  setNightMode: (night: boolean) => void
}

const StudioLightingContext = createContext<StudioLightingContextType | null>(null)

export function StudioLightingProvider({ children }: { children: ReactNode }) {
  // Always start in bright daytime studio lighting on load
  const [isNightMode, setIsNightMode] = useState<boolean>(false)

  const toggleDayNight = () => {
    setIsNightMode((prev) => !prev)
  }

  return (
    <StudioLightingContext.Provider
      value={{
        isNightMode,
        toggleDayNight,
        setNightMode: setIsNightMode,
      }}
    >
      {children}
    </StudioLightingContext.Provider>
  )
}

export function useStudioLighting() {
  const context = useContext(StudioLightingContext)
  if (!context) {
    throw new Error('useStudioLighting must be used within a StudioLightingProvider')
  }
  return context
}
