import { RoundedBox } from '@react-three/drei'
import { AboutMeNotebook } from './AboutMeNotebook'
import { ContactSmartphone } from './ContactSmartphone'
import { MusicPlayer } from './MusicPlayer'
import { StudioDeskLamp } from './StudioDeskLamp'

export function Desk() {
  return (
    <group name="Desk" position={[0, 0, -0.9]}>
      {/* Static Desk Structure (raycast disabled so pointer events only test interactive items!) */}
      <group raycast={() => null}>
        {/* Main Tabletop — Matte Architectural Warm White (#fbf9f3) */}
        <RoundedBox
          args={[1.9, 0.038, 0.82]}
          position={[0, 0.74, 0]}
          radius={0.01}
          smoothness={2}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#fbf9f3"
            roughness={0.42}
            metalness={0.05}
          />
        </RoundedBox>

        {/* Subtle Brushed Aluminium Edge Trim / Under-Frame */}
        <mesh position={[0, 0.71, 0]} receiveShadow>
          <boxGeometry args={[1.82, 0.022, 0.72]} />
          <meshStandardMaterial
            color="#dcdad4"
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>

        {/* Large Felt / Matte Charcoal Desk Mat (#30312d) */}
        <RoundedBox
          args={[0.92, 0.004, 0.42]}
          position={[0, 0.761, 0.1]}
          radius={0.002}
          smoothness={2}
          receiveShadow
        >
          <meshStandardMaterial
            color="#30312d"
            roughness={0.9}
            metalness={0.05}
          />
        </RoundedBox>

        {/* Left Sleek Sled Leg Assembly (#30312d Matte Dark Slate) */}
        <group position={[-0.82, 0, 0]}>
          <mesh position={[0, 0.36, 0.3]} castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.7, 0.045]} />
            <meshStandardMaterial color="#30312d" roughness={0.35} metalness={0.65} />
          </mesh>
          <mesh position={[0, 0.36, -0.3]} castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.7, 0.045]} />
            <meshStandardMaterial color="#30312d" roughness={0.35} metalness={0.65} />
          </mesh>
          <mesh position={[0, 0.018, 0]} receiveShadow>
            <boxGeometry args={[0.05, 0.028, 0.68]} />
            <meshStandardMaterial color="#30312d" roughness={0.35} metalness={0.65} />
          </mesh>
        </group>

        {/* Right Sleek Sled Leg Assembly (#30312d Matte Dark Slate) */}
        <group position={[0.82, 0, 0]}>
          <mesh position={[0, 0.36, 0.3]} castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.7, 0.045]} />
            <meshStandardMaterial color="#30312d" roughness={0.35} metalness={0.65} />
          </mesh>
          <mesh position={[0, 0.36, -0.3]} castShadow receiveShadow>
            <boxGeometry args={[0.045, 0.7, 0.045]} />
            <meshStandardMaterial color="#30312d" roughness={0.35} metalness={0.65} />
          </mesh>
          <mesh position={[0, 0.018, 0]} receiveShadow>
            <boxGeometry args={[0.05, 0.028, 0.68]} />
            <meshStandardMaterial color="#30312d" roughness={0.35} metalness={0.65} />
          </mesh>
        </group>

        {/* Rear Cable Management Tray Under Desk */}
        <mesh position={[0, 0.66, -0.26]}>
          <boxGeometry args={[1.2, 0.06, 0.12]} />
          <meshStandardMaterial color="#30312d" roughness={0.5} metalness={0.5} />
        </mesh>
      </group>

      {/* Interactive Workspace Accessories */}
      {/* 2. Interactive Black Hardcover "ABOUT ME" Notebook & Pen (Left Desk Area) */}
      <AboutMeNotebook position={[-0.68, 0.759, 0.12]} rotation={[0, 0.22, 0]} />

      {/* 3. Interactive Modern Black "LET'S CONNECT" Smartphone (Right Front Desk Area) */}
      <ContactSmartphone position={[0.56, 0.759, 0.23]} rotation={[0, -0.26, 0]} />

      {/* 4. Realistic Vintage Gramophone Music Player (Right Desk Area) */}
      <MusicPlayer position={[0.62, 0.759, -0.12]} rotation={[0, -0.35, 0]} />

      {/* 5. Interactive Botanical Linen Desk Lamp (Day / Night Studio Lighting Toggle) */}
      <StudioDeskLamp position={[-0.72, 0.759, -0.22]} rotation={[0, 0.35, 0]} />
    </group>
  )
}
