import { useMemo } from 'react'
import * as THREE from 'three'
import { InteractiveBookshelf } from './InteractiveBookshelf'
import { PinnedWallNote } from './PinnedWallNote'
import { FramedWallArt } from './FramedWallArt'

const SLAT_POSITIONS = [
  -2.4, -2.28, -2.16, -2.04, -1.92, -1.8, -1.68, -1.56, -1.44, -1.32,
]

export function Wall() {
  // Single InstancedMesh for the 10 vertical wall slats
  const slatsInstanced = useMemo(() => {
    const geom = new THREE.BoxGeometry(0.06, 3.5, 0.04)
    const mat = new THREE.MeshStandardMaterial({
      color: '#dcdad4',
      roughness: 0.7,
      metalness: 0.06,
    })
    const mesh = new THREE.InstancedMesh(geom, mat, SLAT_POSITIONS.length)
    mesh.receiveShadow = true
    mesh.raycast = () => null

    const dummy = new THREE.Object3D()
    SLAT_POSITIONS.forEach((x, idx) => {
      dummy.position.set(x, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(idx, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [])

  return (
    <group name="Wall">
      {/* Main Back Wall - Warm Plaster / Archival Surface */}
      <mesh position={[0, 2.2, -1.45]} receiveShadow raycast={() => null}>
        <boxGeometry args={[10, 4.6, 0.12]} />
        <meshStandardMaterial
          color="#f0eee8"
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* Architectural Baseboard / Skirting Board */}
      <mesh position={[0, 0.06, -1.38]} receiveShadow raycast={() => null}>
        <boxGeometry args={[10, 0.12, 0.03]} />
        <meshStandardMaterial
          color="#fbf9f3"
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>

      {/* Recessed Architectural Wall Panel Behind Desk */}
      <mesh position={[0, 1.65, -1.385]} receiveShadow raycast={() => null}>
        <boxGeometry args={[2.5, 2.5, 0.015]} />
        <meshStandardMaterial
          color="#eae8e2"
          roughness={0.82}
          metalness={0.03}
        />
      </mesh>

      {/* Left Architectural Vertical Fluted Slat Paneling (Single InstancedMesh) */}
      <group position={[0, 1.75, -1.37]}>
        <primitive object={slatsInstanced} />
      </group>

      {/* Dynamic Framed Wall Art (Supabase Connected) */}
      <FramedWallArt position={[1.55, 1.68, -1.37]} />

      {/* Floating Minimalist Wall Shelf (Top Left Above Desk) with Interactive Bookshelf */}
      <InteractiveBookshelf />

      {/* Realistic 3D Pinned Construction Memo Note on Wall */}
      <PinnedWallNote position={[0.78, 1.84, -1.37]} rotation={[0, 0, 0.045]} />
    </group>
  )
}
