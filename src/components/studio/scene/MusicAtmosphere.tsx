import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  getBuiltInLyricsForTrack,
  parseLrcLyrics,
  type LyricLine,
} from '@/data/songLyrics'

interface MusicAtmosphereProps {
  isPlaying: boolean
  currentTime: number
  trackTitle: string
  artist: string
  isMusicPlayerOpen: boolean
}

const PARTICLE_SYMBOLS = ['♪', '♫', '♬', '♩', '✦']

interface NoteParticleData {
  id: number
  symbol: string
  phaseOffset: number
  speed: number
  swayRadius: number
  swayFreq: number
  color: string
  scale: number
}

const NOTE_PARTICLES: NoteParticleData[] = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  symbol: PARTICLE_SYMBOLS[i % PARTICLE_SYMBOLS.length],
  phaseOffset: i / 6,
  speed: 0.28 + (i % 3) * 0.06,
  swayRadius: 0.032 + (i % 4) * 0.012,
  swayFreq: 2.2 + (i % 3) * 0.6,
  color: i % 2 === 0 ? '#f5d000' : i % 3 === 0 ? '#ffb703' : '#ffffff',
  scale: 0.85 + (i % 3) * 0.2,
}))

/**
 * Renders:
 * 1. Continuous 3D musical note particles rising from the music player ONLY when playing
 * 2. Active song lyric line floating in mid-air with white text and an electric yellow text outline/border
 */
export function MusicAtmosphere({
  isPlaying,
  currentTime,
  trackTitle,
  artist,
  isMusicPlayerOpen,
}: MusicAtmosphereProps) {
  const [lyrics, setLyrics] = useState<LyricLine[]>(() =>
    getBuiltInLyricsForTrack(trackTitle, artist),
  )

  const particleRefs = useRef<(HTMLDivElement | null)[]>([])
  const particleGroupRefs = useRef<(THREE.Group | null)[]>([])
  const lyricGroupRef = useRef<THREE.Group>(null)
  const lyricDomRef = useRef<HTMLParagraphElement>(null)
  const lyricSpawnClockRef = useRef<number>(0)
  const lastLyricTimeRef = useRef<number>(-1)

  // Load built-in synced lyrics or fetch from LRCLIB API for any future Supabase songs
  useEffect(() => {
    let isMounted = true
    const builtIn = getBuiltInLyricsForTrack(trackTitle, artist)
    setLyrics(builtIn)

    const normalized = `${trackTitle} ${artist}`.toLowerCase()
    const isBuiltInMatch =
      normalized.includes('love again') ||
      normalized.includes('dua lipa') ||
      normalized.includes('dua') ||
      normalized.includes('thug') ||
      normalized.includes('cena')

    if (isBuiltInMatch) return

    async function fetchExternalLyrics() {
      try {
        const q = encodeURIComponent(`${trackTitle} ${artist}`)
        const res = await fetch(`https://lrclib.net/api/search?q=${q}`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const item = data.find((d) => d.syncedLyrics) || data[0]
          if (item?.syncedLyrics && isMounted) {
            const parsed = parseLrcLyrics(item.syncedLyrics)
            if (parsed.length > 0) {
              setLyrics(parsed)
            }
          }
        }
      } catch {
        // Keep built-in fallback
      }
    }

    fetchExternalLyrics()

    return () => {
      isMounted = false
    }
  }, [trackTitle, artist])

  // Determine the single currently active lyric line and its duration window based on currentTime
  const activeLyricInfo = useMemo(() => {
    if (!isPlaying || !lyrics || lyrics.length === 0) return null
    let idx = 0
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        idx = i
      } else {
        break
      }
    }
    const current = lyrics[idx]
    const next = lyrics[idx + 1]
    const windowDuration = next
      ? Math.max(1.2, Math.min(4.2, next.time - current.time))
      : 3.5
    return {
      line: current,
      windowDuration,
    }
  }, [isPlaying, lyrics, currentTime])

  // Animate floating musical notes and rising/fading song lyrics when playing
  useFrame((state) => {
    if (!isPlaying) return
    const t = state.clock.getElapsedTime()

    // 1. Animate musical note particles
    NOTE_PARTICLES.forEach((p, idx) => {
      const grp = particleGroupRefs.current[idx]
      const domEl = particleRefs.current[idx]
      if (!grp || !domEl) return

      const life = (t * p.speed + p.phaseOffset) % 1
      const y = 0.19 + life * 0.36
      const angle = t * p.swayFreq + p.id * 1.4
      const x = Math.cos(angle) * p.swayRadius * (0.4 + life * 0.9)
      const z = Math.sin(angle) * p.swayRadius * (0.4 + life * 0.9)

      grp.position.set(x, y, z)

      const alpha =
        life < 0.18
          ? life / 0.18
          : life > 0.75
            ? (1 - life) / 0.25
            : 1

      const scale = p.scale * (0.7 + life * 0.5)
      domEl.style.opacity = String((alpha * 0.92).toFixed(2))
      domEl.style.transform = `scale(${scale.toFixed(2)}) rotate(${Math.sin(angle) * 16}deg)`
    })

    // 2. Animate active lyric line rising in the air, gently swaying, and fading away
    if (lyricGroupRef.current && lyricDomRef.current && activeLyricInfo) {
      if (lastLyricTimeRef.current !== activeLyricInfo.line.time) {
        lastLyricTimeRef.current = activeLyricInfo.line.time
        lyricSpawnClockRef.current = t
      }

      const elapsed = Math.max(0, t - lyricSpawnClockRef.current)
      const life = Math.min(1, elapsed / activeLyricInfo.windowDuration)

      const y = 0.22 + life * 0.26
      const swayX = Math.sin(t * 2.0 + activeLyricInfo.line.time) * 0.018 * life
      const swayZ = Math.cos(t * 1.6 + activeLyricInfo.line.time) * 0.012 * life

      lyricGroupRef.current.position.set(swayX, y, swayZ)

      const alpha =
        life < 0.18
          ? life / 0.18
          : life > 0.68
            ? Math.max(0, (1 - life) / 0.32)
            : 1

      const scale = 0.88 + Math.sin(life * Math.PI) * 0.14
      const tilt = Math.sin(t * 1.8) * 2.5

      lyricDomRef.current.style.opacity = String(alpha.toFixed(2))
      lyricDomRef.current.style.transform = `scale(${scale.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`
      lyricDomRef.current.style.filter =
        life > 0.72 ? `blur(${((life - 0.72) * 6).toFixed(1)}px)` : 'none'
    }
  })

  // Unmount all <Html> nodes when music is paused so zero DOM projection math runs during camera movement!
  if (!isPlaying) return null

  return (
    <group name="MusicPlayerAtmosphere">
      {/* 1. Floating Musical Note & Sparkle Particles */}
      {NOTE_PARTICLES.map((p, idx) => (
        <group
          key={p.id}
          ref={(el) => {
            particleGroupRefs.current[idx] = el
          }}
          position={[0, 0.2, 0]}
        >
          <Html
            center
            distanceFactor={isMusicPlayerOpen ? 1.15 : 1.8}
            className="pointer-events-none select-none"
            zIndexRange={[35, 0]}
          >
            <div
              ref={(el) => {
                particleRefs.current[idx] = el
              }}
              style={{
                color: p.color,
                opacity: 0,
                textShadow: '0 0 10px rgba(245, 208, 0, 0.85), 0 2px 6px rgba(0,0,0,0.6)',
              }}
              className="font-bold text-lg transition-none will-change-transform"
            >
              {p.symbol}
            </div>
          </Html>
        </group>
      ))}

      {/* 2. Active Lyric Line Rising in Air and Fading Away Like the Music Particles */}
      {activeLyricInfo && (
        <group ref={lyricGroupRef} position={[0, 0.22, 0]}>
          <Html
            center
            distanceFactor={isMusicPlayerOpen ? 0.92 : 1.65}
            className="pointer-events-none select-none"
            zIndexRange={[40, 0]}
          >
            <div className="flex items-center justify-center w-[85vw] max-w-[420px] px-3 text-center">
              <p
                ref={lyricDomRef}
                key={activeLyricInfo.line.time}
                style={{
                  color: '#fffbf0',
                  opacity: 0,
                  textShadow:
                    '0 0 14px rgba(245, 208, 0, 0.95), 0 0 24px rgba(255, 184, 108, 0.65), 0 2px 8px rgba(30, 20, 10, 0.75)',
                }}
                className="font-serif italic text-sm sm:text-base md:text-lg font-bold tracking-wide leading-snug transition-none will-change-transform"
              >
                {activeLyricInfo.line.text}
              </p>
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}
