import { useEffect, useState, useCallback, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useWallArt } from '@/hooks/useWallArt'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'

export interface FramedWallArtProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

/**
 * 3D Framed Wall Art with dynamic image loading from Supabase.
 * Features archival museum matting, non-reflective glass, and dynamic texture mapping.
 */
export function FramedWallArt({
  position = [1.55, 1.68, -1.37],
  rotation = [0, 0, 0],
}: FramedWallArtProps) {
  const { imageUrl } = useWallArt()
  const [artTexture, setArtTexture] = useState<THREE.Texture | null>(null)
  const { isWallArtOpen, isAnyObjectOpen, openWallArt } = useWorkspaceFocus()
  const [isHovered, setIsHovered] = useState(false)
  const indicatorRingRef = useRef<THREE.MeshBasicMaterial>(null)

  const isClickable = !isAnyObjectOpen || isWallArtOpen

  const onPointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (!isClickable) return
      setIsHovered(true)
      document.body.style.cursor = 'pointer'
    },
    [isClickable]
  )

  const onPointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setIsHovered(false)
      document.body.style.cursor = 'auto'
    },
    []
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (isWallArtOpen) return
      openWallArt()
    },
    [isWallArtOpen, openWallArt]
  )

  useFrame((state) => {
    if (!indicatorRingRef.current || !isClickable) return
    const t = state.clock.getElapsedTime()
    const pulse = 0.45 + Math.sin(t * 3.5) * 0.35
    indicatorRingRef.current.opacity = isHovered ? 0.95 : pulse
  })

  useEffect(() => {
    if (!imageUrl) return

    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = true
        setArtTexture(tex)
      },
      undefined,
      () => {
        setArtTexture(null)
      },
    )

    return () => {
      if (artTexture) {
        artTexture.dispose()
      }
    }
  }, [imageUrl])

  return (
    <group
      name="FramedWallArt"
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Interactive Electric Yellow Indicator Dot */}
      {isClickable && !isWallArtOpen && (
        <group position={[0, -0.42, 0.04]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.016, 0.032, 24]} />
            <meshBasicMaterial
              ref={indicatorRingRef}
              color="#f5d000"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.008, 0]}>
            <sphereGeometry args={[0.01, 16, 16]} />
            <meshBasicMaterial color="#f5d000" />
          </mesh>
        </group>
      )}

      {/* 1. Outer Frame (#30312d deep anodized charcoal aluminum) */}
      <RoundedBox args={[0.56, 0.74, 0.025]} radius={0.008} smoothness={2} castShadow>
        <meshStandardMaterial color="#262724" roughness={0.35} metalness={0.4} />
      </RoundedBox>

      {/* 2. Archival Museum Matting (#fbf9f3) */}
      <mesh position={[0, 0, 0.014]}>
        <planeGeometry args={[0.5, 0.68]} />
        <meshStandardMaterial color="#fbf9f3" roughness={0.9} />
      </mesh>

      {/* 3. Artwork Surface (Supabase Dynamic Image or Geometric Art Fallback) */}
      {artTexture ? (
        <mesh position={[0, 0.015, 0.016]}>
          <planeGeometry args={[0.38, 0.52]} />
          <meshStandardMaterial
            map={artTexture}
            roughness={0.45}
            metalness={0.02}
            side={THREE.FrontSide}
          />
        </mesh>
      ) : (
        /* Minimalist Bauhaus / Geometric Fallback Art */
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.02, 0.016]}>
            <planeGeometry args={[0.34, 0.46]} />
            <meshStandardMaterial color="#eae8e2" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.02, 0.018]}>
            <circleGeometry args={[0.09, 32]} />
            <meshStandardMaterial color="#30312d" roughness={0.6} />
          </mesh>
          <mesh position={[0.05, -0.05, 0.019]}>
            <circleGeometry args={[0.025, 24]} />
            <meshStandardMaterial color="#f5d000" roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* 4. Protective Museum Glass Front Plate */}
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.49, 0.67]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Title tag below frame when focused */}
      {isWallArtOpen && (
        <mesh position={[0, -0.42, 0.02]}>
          <planeGeometry args={[0.36, 0.06]} />
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
        </mesh>
      )}
    </group>
  )
}
