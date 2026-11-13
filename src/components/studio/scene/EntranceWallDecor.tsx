import { Suspense, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { createStudioWallPlaqueTexture } from './doorWallPlaqueTexture'

const TALL_PLANT_MODEL_PATH = '/models/tall_house_plant.glb'

/**
 * Plant Model Component with shadows and proper materials setup
 */
function TallHousePlantModel() {
  const { scene } = useGLTF(TALL_PLANT_MODEL_PATH)
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = false
        mesh.receiveShadow = false
        // Disable CPU raycasting on high-poly plant leaves
        mesh.raycast = () => null

        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial
          if (mat.name === 'Leaves' || mat.transparent) {
            mat.alphaTest = 0.5
            mat.depthWrite = true
            mat.roughness = 0.35
          }
        }
      }
    })
  }, [clonedScene])

  // Raw model is in centimeter space (y: -50.6 to 436.1, total ~486 units = 4.86m).
  // Scaling by 0.003 brings it to 1.46m tall (perfect floor house plant height).
  // Positioned at X: -0.78 (visible to the left of the door, well inside the entrance camera view),
  // Y: 0.15 (rests pot directly on floor Y=0), Z: 0.22 (in front of wall).
  return (
    <group position={[-0.78, 0.15, 0.22]} scale={[0.003, 0.003, 0.003]}>
      <primitive object={clonedScene} />
    </group>
  )
}

useGLTF.preload(TALL_PLANT_MODEL_PATH)

/**
 * Architectural Vertical Wood Acoustic Slats Feature Wall (Floor to Ceiling)
 * Backed by acoustic charcoal felt with natural warm oak / walnut slats.
 * Uses a single InstancedMesh for all slats to reduce draw calls from 44 to 2.
 */
function AcousticWoodSlats({
  xStart,
  width,
  height,
  slatWidth = 0.024,
  gap = 0.016,
  slatDepth = 0.018,
}: {
  xStart: number
  width: number
  height: number
  slatWidth?: number
  gap?: number
  slatDepth?: number
}) {
  const count = Math.floor(width / (slatWidth + gap))
  const instancedRef = useMemo(() => {
    const geom = new THREE.BoxGeometry(slatWidth, height, slatDepth)
    const mat = new THREE.MeshStandardMaterial({
      color: '#b58a58', // Natural Warm White Oak
      roughness: 0.65,
      metalness: 0.02,
    })
    const mesh = new THREE.InstancedMesh(geom, mat, count)
    mesh.receiveShadow = true
    mesh.raycast = () => null

    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const xOffset = -width / 2 + (i + 0.5) * (slatWidth + gap)
      dummy.position.set(xOffset, 0, 0.003 + slatDepth / 2)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    return mesh
  }, [count, width, height, slatWidth, gap, slatDepth])

  return (
    <group position={[xStart + width / 2, height / 2, 0.052]}>
      {/* 1. Acoustic Charcoal Backing Felt Panel */}
      <mesh receiveShadow position={[0, 0, 0.003]} raycast={() => null}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#1f201d" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* 2. Single-Draw-Call Instanced Warm Oak Wood Slats */}
      <primitive object={instancedRef} />
    </group>
  )
}

/**
 * Modern Creative Studio Entrance Wall Environment:
 * 1. Architectural Vertical Wood Acoustic Slats on both left & right flanking walls
 * 2. Warm Architectural Up/Down Sconce Lamp (Casts dynamic warm light cones onto the slats and wall)
 * 3. Matte Acrylic & Brass Studio Plaque (BENNY RAJ • Creative Developer)
 * 4. Tall House Plant 3D Model (/models/tall_house_plant.glb)
 */
export function EntranceWallDecor() {
  const plaqueTexture = useMemo(() => createStudioWallPlaqueTexture(), [])

  return (
    <group name="EntranceWallDecor">
      {/* ===================================================================
          0. ARCHITECTURAL VERTICAL WOOD ACOUSTIC SLAT WALL ACCENTS
          Floor to ceiling height: 3.4m
         =================================================================== */}
      {/* Left Wall Slats: behind the tall house plant (X: -1.45 to -0.65) */}
      <AcousticWoodSlats xStart={-1.50} width={0.88} height={3.4} />

      {/* Right Wall Slats: behind the wall sconce and studio plaque (X: 0.65 to 1.50) */}
      <AcousticWoodSlats xStart={0.62} width={0.88} height={3.4} />

      {/* ===================================================================
          1. WARM ARCHITECTURAL SCONCE LIGHT (Right side of door, above plaque)
          Mounting position: X: +0.94, Y: 1.88, Z: 0.08
         =================================================================== */}
      <group position={[0.94, 1.88, 0.08]}>
        {/* Wall mounting bracket */}
        <mesh position={[0, 0, 0.015]} castShadow>
          <boxGeometry args={[0.07, 0.16, 0.02]} />
          <meshStandardMaterial color="#222320" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Brushed Brass Cylinder Body */}
        <mesh position={[0, 0, 0.06]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.22, 24]} />
          <meshStandardMaterial color="#c5a059" roughness={0.3} metalness={0.75} />
        </mesh>

        {/* Upper Diffuser Lens */}
        <mesh position={[0, 0.111, 0.06]}>
          <cylinderGeometry args={[0.034, 0.034, 0.012, 24]} />
          <meshBasicMaterial color="#fff0d0" />
        </mesh>
        {/* Lower Diffuser Lens */}
        <mesh position={[0, -0.111, 0.06]}>
          <cylinderGeometry args={[0.034, 0.034, 0.012, 24]} />
          <meshBasicMaterial color="#fff0d0" />
        </mesh>

        {/* Warm Upward Spot/Point Light */}
        <pointLight
          position={[0, 0.14, 0.09]}
          intensity={1.2}
          distance={1.6}
          decay={2}
          color="#ffddaa"
        />
        {/* Warm Downward Spot/Point Light (Illuminates the plaque below) */}
        <pointLight
          position={[0, -0.14, 0.09]}
          intensity={1.8}
          distance={1.8}
          decay={2}
          color="#ffe2ba"
        />
      </group>

      {/* ===================================================================
          2. STUDIO SIGNBOARD PLAQUE (Right side of door, eye level)
          Position: X: +0.94, Y: 1.40, Z: 0.085
         =================================================================== */}
      <group position={[0.94, 1.40, 0.085]}>
        {/* Acrylic / Bronze Plaque Backing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.26, 0.015]} />
          <meshStandardMaterial
            map={plaqueTexture}
            roughness={0.35}
            metalness={0.4}
            envMapIntensity={0.8}
          />
        </mesh>

        {/* 4 Standoff Spacers against the slats */}
        {[-0.18, 0.18].map((sx, i) =>
          [-0.105, 0.105].map((sy, j) => (
            <mesh key={`standoff-${i}-${j}`} position={[sx, sy, -0.012]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.009, 0.009, 0.02, 12]} />
              <meshStandardMaterial color="#c5a059" roughness={0.3} metalness={0.8} />
            </mesh>
          ))
        )}
      </group>

      {/* ===================================================================
          3. TALL HOUSE PLANT 3D MODEL (Left side of door)
         =================================================================== */}
      <Suspense fallback={null}>
        <TallHousePlantModel />
      </Suspense>
    </group>
  )
}
