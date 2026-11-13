import { WorkspaceCanvas } from './WorkspaceCanvas'

interface HeroWorkspaceProps {
  onBackToHome?: () => void
  onSceneReady?: () => void
}

export function HeroWorkspace({ onBackToHome, onSceneReady }: HeroWorkspaceProps) {
  return (
    <section
      aria-label="3D Creative Workspace Scroll Tour"
      className="relative w-full bg-surface"
    >
      <WorkspaceCanvas onBackToHome={onBackToHome} onSceneReady={onSceneReady} />
    </section>
  )
}
