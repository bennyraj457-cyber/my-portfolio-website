import { useMemo } from 'react'
import * as THREE from 'three'

export function Floor() {
  // Subtle procedural grid/plank texture for realistic architectural flooring
  const floorMaterial = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#e4e2dd'
      ctx.fillRect(0, 0, 256, 256)

      ctx.strokeStyle = '#dcdad4'
      ctx.lineWidth = 1.5
      for (let i = 0; i <= 256; i += 64) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 256)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(256, i)
        ctx.stroke()
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(8, 8)

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.78,
      metalness: 0.05,
    })
  }, [])

  return (
    <group name="Floor" raycast={() => null}>
      {/* Main Architectural Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        material={floorMaterial}
      >
        <planeGeometry args={[14, 14]} />
      </mesh>

      {/* Low-profile woven architectural floor mat under desk & chair */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.004, -0.45]}
        receiveShadow
      >
        <planeGeometry args={[2.8, 2.2]} />
        <meshStandardMaterial
          color="#dcdad4"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* Subtle border trim around the studio mat */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.003, -0.45]}
        receiveShadow
      >
        <planeGeometry args={[2.86, 2.26]} />
        <meshStandardMaterial
          color="#cfc6ab"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
    </group>
  )
}
