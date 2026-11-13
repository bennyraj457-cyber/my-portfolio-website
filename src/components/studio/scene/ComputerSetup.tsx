import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { MonitorScreenSurface } from './monitor'

const KEY_ROWS = [-0.038, -0.018, 0.002, 0.022, 0.042]
const KEY_COLS = [
  -0.14, -0.115, -0.09, -0.065, -0.04, -0.015, 0.01, 0.035, 0.06, 0.085, 0.11,
  0.135,
]

export function ComputerSetup() {
  // Single InstancedMesh for all 60 keycaps (reduces 60 draw calls to 1!)
  const keycapsInstanced = useMemo(() => {
    const totalKeys = KEY_ROWS.length * KEY_COLS.length
    const geom = new THREE.BoxGeometry(0.019, 0.007, 0.016)
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.5 })
    const mesh = new THREE.InstancedMesh(geom, mat, totalKeys)
    mesh.raycast = () => null

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    let idx = 0

    KEY_ROWS.forEach((z, rIdx) => {
      KEY_COLS.forEach((x, cIdx) => {
        dummy.position.set(x, 0, z)
        dummy.updateMatrix()
        mesh.setMatrixAt(idx, dummy.matrix)

        const isEsc = rIdx === 0 && cIdx === 0
        const isEnter = rIdx === 2 && cIdx === KEY_COLS.length - 1
        const hex = isEsc
          ? '#f5d000'
          : isEnter
            ? '#4c6452'
            : cIdx === 0 || cIdx === KEY_COLS.length - 1
              ? '#cfc6ab'
              : '#fbf9f3'

        color.set(hex)
        mesh.setColorAt(idx, color)
        idx++
      })
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    return mesh
  }, [])

  return (
    <group name="ComputerSetup" position={[0, 0.76, -0.9]} raycast={() => null}>
      {/* Dual-Tier Walnut & White Monitor Riser Shelf */}
      <group position={[0, 0, -0.18]}>
        <RoundedBox
          args={[0.96, 0.016, 0.22]}
          position={[0, 0.075, 0]}
          radius={0.004}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#eae8e2" roughness={0.45} metalness={0.08} />
        </RoundedBox>
        {/* Riser Supports */}
        <mesh position={[-0.38, 0.036, 0]}>
          <boxGeometry args={[0.02, 0.072, 0.18]} />
          <meshStandardMaterial color="#30312d" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0.38, 0.036, 0]}>
          <boxGeometry args={[0.02, 0.072, 0.18]} />
          <meshStandardMaterial color="#30312d" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* Ultra-Wide 34" Pro Studio Display */}
      <group position={[0, 0.083, -0.19]}>
        {/* Anodized Silver Stand Base */}
        <RoundedBox
          args={[0.24, 0.008, 0.16]}
          position={[0, 0.004, 0]}
          radius={0.003}
          smoothness={2}
        >
          <meshStandardMaterial color="#dcdad4" roughness={0.25} metalness={0.8} />
        </RoundedBox>

        {/* Vertical Stand Neck */}
        <mesh position={[0, 0.16, -0.03]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.065, 0.31, 0.016]} />
          <meshStandardMaterial color="#dcdad4" roughness={0.25} metalness={0.82} />
        </mesh>

        {/* Display Chassis (Anodized Silver Rear + Slim Matte Bezel) */}
        <group position={[0, 0.31, 0.01]}>
          {/* Silver Unibody Enclosure */}
          <RoundedBox
            args={[0.88, 0.38, 0.022]}
            radius={0.008}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#e4e2dd"
              roughness={0.28}
              metalness={0.78}
            />
          </RoundedBox>

          {/* Front Matte Bezel */}
          <mesh position={[0, 0, 0.0115]}>
            <planeGeometry args={[0.865, 0.365]} />
            <meshStandardMaterial color="#1b1c19" roughness={0.9} metalness={0.05} />
          </mesh>

          {/* Native 3D Split-Screen VS Code + Figma Surface */}
          <MonitorScreenSurface />

          {/* Monitor Top Lightbar (BenQ ScreenBar style) */}
          <group position={[0, 0.2, 0.025]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.009, 0.009, 0.44, 12]} />
              <meshStandardMaterial color="#30312d" roughness={0.35} metalness={0.7} />
            </mesh>
            {/* Warm Downward Screenbar Glow */}
            <mesh position={[0, -0.008, 0.004]}>
              <boxGeometry args={[0.4, 0.003, 0.008]} />
              <meshStandardMaterial
                color="#fbf9f3"
                emissive="#ffe167"
                emissiveIntensity={2.2}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Compact 65% Custom Mechanical Keyboard (Single InstancedMesh!) */}
      <group position={[-0.04, 0.006, 0.08]}>
        <RoundedBox
          args={[0.32, 0.016, 0.115]}
          position={[0, 0.008, 0]}
          rotation={[0.06, 0, 0]}
          radius={0.004}
          smoothness={2}
          receiveShadow
        >
          <meshStandardMaterial color="#eae8e2" roughness={0.35} metalness={0.5} />
        </RoundedBox>

        <group position={[0, 0.018, 0]} rotation={[0.06, 0, 0]}>
          <primitive object={keycapsInstanced} />
        </group>
      </group>

      {/* Ergonomic Wireless Precision Mouse (Right of Keyboard) */}
      <group position={[0.24, 0.005, 0.09]} rotation={[0, -0.08, 0]}>
        <RoundedBox
          args={[0.062, 0.032, 0.105]}
          position={[0, 0.016, 0]}
          radius={0.015}
          smoothness={2}
        >
          <meshStandardMaterial color="#fbf9f3" roughness={0.35} metalness={0.1} />
        </RoundedBox>
        <mesh position={[0, 0.031, -0.024]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.007, 0.007, 0.006, 12]} />
          <meshStandardMaterial color="#30312d" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
