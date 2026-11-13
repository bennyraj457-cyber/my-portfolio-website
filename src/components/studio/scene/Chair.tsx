import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Procedural woven cane/rattan mesh texture generator (octagonal cane weave pattern)
 */
function createCaneMeshTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#dec89e'
  ctx.fillRect(0, 0, size, size)

  const cellSize = 32
  const half = cellSize / 2

  ctx.lineWidth = 3
  ctx.strokeStyle = '#bfa575'

  for (let x = 0; x < size; x += cellSize) {
    for (let y = 0; y < size; y += cellSize) {
      ctx.fillStyle = '#3a2d1d'
      ctx.beginPath()
      ctx.arc(x + half, y + half, 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#cbaf7c'
      ctx.strokeRect(x + 3, y + 3, cellSize - 6, cellSize - 6)

      ctx.strokeStyle = '#e7d5ad'
      ctx.beginPath()
      ctx.moveTo(x, y + half)
      ctx.lineTo(x + half, y)
      ctx.lineTo(x + cellSize, y + half)
      ctx.lineTo(x + half, y + cellSize)
      ctx.closePath()
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2.5, 1.6)
  texture.anisotropy = 4
  return texture
}

/**
 * Procedural subtle wood grain texture generator
 */
function createWoodTexture(): THREE.CanvasTexture {
  const width = 256
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#7a4823'
  ctx.fillRect(0, 0, width, height)

  for (let y = 0; y < height; y += 2) {
    const n = Math.sin(y * 0.16) * Math.cos(y * 0.04)
    const val = 0.5 + 0.5 * Math.sin(y * 0.5 + n * 4)
    ctx.fillStyle = val > 0.6 ? 'rgba(55, 30, 12, 0.22)' : 'rgba(145, 90, 48, 0.15)'
    ctx.fillRect(0, y, width, 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 4
  return texture
}

/**
 * Procedural linen / woven upholstery fabric texture generator
 */
function createFabricTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ece5d8'
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = 'rgba(180, 168, 145, 0.25)'
  for (let x = 0; x < size; x += 4) {
    ctx.fillRect(x, 0, 1, size)
  }
  ctx.fillStyle = 'rgba(150, 138, 115, 0.22)'
  for (let y = 0; y < size; y += 4) {
    ctx.fillRect(0, y, size, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  texture.anisotropy = 2
  return texture
}

export function Chair() {
  const caneTexture = useMemo(() => createCaneMeshTexture(), [])
  const woodTexture = useMemo(() => createWoodTexture(), [])
  const fabricTexture = useMemo(() => createFabricTexture(), [])

  return (
    <group name="Chair" position={[0, 0, -0.5]} rotation={[0, Math.PI, 0]} raycast={() => null}>
      {/* 1. SEAT CUSHION & SUPPORT FRAME */}
      <RoundedBox
        args={[0.54, 0.045, 0.52]}
        position={[0, 0.435, 0.01]}
        radius={0.008}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={woodTexture}
          color="#854d27"
          roughness={0.42}
          metalness={0.06}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.49, 0.075, 0.48]}
        position={[0, 0.48, 0.01]}
        radius={0.035}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={fabricTexture}
          color="#efe9dd"
          roughness={0.88}
          metalness={0.02}
        />
      </RoundedBox>

      {/* 2. CHARACTERISTIC INVERTED-V "COMPASS" SIDE LEGS */}
      {[-0.265, 0.265].map((xSide, i) => (
        <group key={`leg-assembly-${i}`} position={[xSide, 0, 0]}>
          <mesh
            position={[0, 0.22, 0.20]}
            rotation={[0.16, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.042, 0.46, 0.045]} />
            <meshStandardMaterial
              map={woodTexture}
              color="#854d27"
              roughness={0.4}
              metalness={0.06}
            />
          </mesh>

          <mesh
            position={[0, 0.21, -0.19]}
            rotation={[-0.24, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.042, 0.45, 0.045]} />
            <meshStandardMaterial
              map={woodTexture}
              color="#854d27"
              roughness={0.4}
              metalness={0.06}
            />
          </mesh>

          <mesh
            position={[0, 0.54, 0.05]}
            rotation={[-0.04, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.038, 0.25, 0.042]} />
            <meshStandardMaterial
              map={woodTexture}
              color="#854d27"
              roughness={0.4}
              metalness={0.06}
            />
          </mesh>

          <mesh
            position={[0, 0.42, 0.01]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.04, 0.04, 0.44]} />
            <meshStandardMaterial
              map={woodTexture}
              color="#7c4622"
              roughness={0.4}
              metalness={0.06}
            />
          </mesh>

          <RoundedBox
            args={[0.065, 0.032, 0.48]}
            position={[0, 0.655, 0.03]}
            radius={0.008}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={woodTexture}
              color="#8a512a"
              roughness={0.38}
              metalness={0.06}
            />
          </RoundedBox>
        </group>
      ))}

      <mesh position={[0, 0.16, -0.05]} castShadow>
        <boxGeometry args={[0.49, 0.024, 0.032]} />
        <meshStandardMaterial map={woodTexture} color="#7c4622" roughness={0.45} />
      </mesh>

      {/* 3. WOVEN CANE & SOLID WOOD RECTANGULAR BACKREST */}
      <group position={[0, 0.72, -0.21]} rotation={[-0.22, 0, 0]}>
        <RoundedBox
          args={[0.48, 0.046, 0.032]}
          position={[0, 0.16, 0]}
          radius={0.005}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial map={woodTexture} color="#854d27" roughness={0.4} />
        </RoundedBox>

        <RoundedBox
          args={[0.48, 0.046, 0.032]}
          position={[0, -0.16, 0]}
          radius={0.005}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial map={woodTexture} color="#854d27" roughness={0.4} />
        </RoundedBox>

        <RoundedBox
          args={[0.046, 0.36, 0.032]}
          position={[-0.217, 0, 0]}
          radius={0.005}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial map={woodTexture} color="#854d27" roughness={0.4} />
        </RoundedBox>

        <RoundedBox
          args={[0.046, 0.36, 0.032]}
          position={[0.217, 0, 0]}
          radius={0.005}
          smoothness={2}
          castShadow
        >
          <meshStandardMaterial map={woodTexture} color="#854d27" roughness={0.4} />
        </RoundedBox>

        <mesh position={[0, 0, 0.002]} castShadow receiveShadow>
          <planeGeometry args={[0.39, 0.28]} />
          <meshStandardMaterial
            map={caneTexture}
            color="#ebd8b5"
            roughness={0.75}
            metalness={0.03}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh position={[0, 0, 0.005]}>
          <ringGeometry args={[0.13, 0.134, 4]} />
          <meshBasicMaterial color="#bfa575" wireframe />
        </mesh>

        {[-0.18, 0.18].map((xB, idx) => (
          <mesh key={`bracket-${idx}`} position={[xB, -0.21, 0.04]} rotation={[0.22, 0, 0]} castShadow>
            <boxGeometry args={[0.028, 0.14, 0.032]} />
            <meshStandardMaterial map={woodTexture} color="#7c4622" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
