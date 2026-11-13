import React, { useEffect, useRef } from 'react'

/**
 * PixelNatureLandscape
 *
 * Smoothly morphs between two breathtaking nature landscapes in micro-pixels:
 * - Scene 1: Golden Sun & Layered Mountain Ridges (Japanese woodblock sunrise)
 * - Scene 2: Misty Pine Valley & Crescent Moon over Midnight Lake (Cool night reflection)
 * - Morph Timing: Displays for 3 seconds, then performs a fluid 1.8s pointillist dissolve transition.
 */
export default function PixelNatureLandscape({
  className = '',
  pixelSize = 4, // Crisp 4px micro-pixels
  interactive = true,
  displayDuration = 3000, // 3 seconds static hold per scene
  transitionDuration = 1800, // 1.8 seconds smooth morph
}) {
  const canvasRef = useRef(null)
  const rafId = useRef(null)
  const timeRef = useRef(0)
  const startTimeRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const updateSize = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight
    }

    updateSize()
    window.addEventListener('resize', updateSize)

    const handleMouseMove = (e) => {
      if (!interactive) return
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Palette Scene 1: Warm Golden Sunrise Mountains
    const PALETTE_SCENE1 = {
      sunCore: '#ffd700',
      sunGlow1: '#ffe566',
      sunGlow2: '#fff3b0',
      distantPeak: '#ebd88a',
      midRidge: '#d4b745',
      foregroundRidge: '#998124',
      pineTree: '#665415',
    }

    // Palette Scene 2: Moonlit Lake, Misty Pine Forest & Crescent Moon
    const PALETTE_SCENE2 = {
      moonCore: '#ffffff',
      moonGlow: '#e6eaf0',
      waterMist: '#c5d3e0',
      distantPeak: '#8fa0b5',
      midRidge: '#526b85',
      foregroundRidge: '#2f4154',
      pineTree: '#162330',
    }

    const mountainHeight = (x, offset, freq, seed) => {
      return (
        Math.sin(x * freq + seed) * 38 +
        Math.sin(x * freq * 2.3 + seed * 1.5) * 22 +
        Math.cos(x * freq * 0.5 + seed * 0.7) * 45 +
        offset
      )
    }

    const oceanWaveHeight = (x, offset, freq, t) => {
      return (
        Math.sin(x * freq + t * 2.5) * 14 +
        Math.cos(x * freq * 1.8 - t * 1.8) * 8 +
        offset
      )
    }

    const render = () => {
      if (!startTimeRef.current) startTimeRef.current = performance.now()
      const now = performance.now()
      const elapsed = now - startTimeRef.current
      timeRef.current += 0.005
      const t = timeRef.current

      // Calculate Morph Cycle (Hold Scene 1 -> Transition -> Hold Scene 2 -> Transition back)
      const fullCycle = (displayDuration + transitionDuration) * 2
      const cycleTime = elapsed % fullCycle
      let morphT = 0 // 0 = 100% Scene 1, 1 = 100% Scene 2

      if (cycleTime < displayDuration) {
        morphT = 0
      } else if (cycleTime < displayDuration + transitionDuration) {
        const raw = (cycleTime - displayDuration) / transitionDuration
        // Smooth S-curve easing
        morphT = raw * raw * (3 - 2 * raw)
      } else if (cycleTime < displayDuration * 2 + transitionDuration) {
        morphT = 1
      } else {
        const raw = (cycleTime - (displayDuration * 2 + transitionDuration)) / transitionDuration
        morphT = 1 - raw * raw * (3 - 2 * raw)
      }

      // Smooth mouse interpolation for parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, width, height)

      const cols = Math.ceil(width / pixelSize)
      const rows = Math.ceil(height / pixelSize)

      // ================= SCENE 1 GEOMETRY (Golden Mountains) =================
      const sunCenterX = width * 0.5 + mx * 15
      const sunCenterY = height * 0.38 + my * 10
      const sunRadius = Math.min(width * 0.22, 170)

      const s1BaseRidge1 = height * 0.58 + my * 18
      const s1BaseRidge2 = height * 0.72 + my * 26
      const s1BaseRidge3 = height * 0.86 + my * 35

      // ================= SCENE 2 GEOMETRY (Moonlit Lake & Pines) =================
      const moonCenterX = width * 0.68 + mx * 10
      const moonCenterY = height * 0.28 + my * 8
      const moonRadius = Math.min(width * 0.12, 75)

      const s2BaseRidge1 = height * 0.52 + my * 14
      const s2LakeHorizon = height * 0.68 + my * 22

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * pixelSize
          const py = r * pixelSize
          const midX = px + pixelSize / 2
          const midY = py + pixelSize / 2

          const isChecker = (c + r) % 2 === 0
          const isFineChecker = c % 2 === 0 && r % 2 === 0

          // -------- 1. Evaluate Scene 1 Color --------
          let color1 = null
          const dxSun = midX - sunCenterX
          const dySun = midY - sunCenterY
          const distSun = Math.sqrt(dxSun * dxSun + dySun * dySun)

          if (distSun < sunRadius * 0.75) {
            color1 = PALETTE_SCENE1.sunCore
          } else if (distSun < sunRadius * 0.9) {
            color1 = isChecker ? PALETTE_SCENE1.sunCore : PALETTE_SCENE1.sunGlow1
          } else if (distSun < sunRadius * 1.05) {
            color1 = isChecker ? PALETTE_SCENE1.sunGlow1 : PALETTE_SCENE1.sunGlow2
          } else if (distSun < sunRadius * 1.25) {
            if (isFineChecker) color1 = PALETTE_SCENE1.sunGlow2
          }

          const m1Y = mountainHeight(midX + mx * 20, s1BaseRidge1, 0.0022, 1.4)
          if (midY >= m1Y) {
            color1 = midY - m1Y < 6 && isChecker ? PALETTE_SCENE1.sunGlow2 : PALETTE_SCENE1.distantPeak
          }

          const m2Y = mountainHeight(midX + mx * 35, s1BaseRidge2, 0.0035, 3.8)
          if (midY >= m2Y) {
            color1 = midY - m2Y < 8 && isChecker ? PALETTE_SCENE1.distantPeak : PALETTE_SCENE1.midRidge
          }

          const m3Y = mountainHeight(midX + mx * 55, s1BaseRidge3, 0.0048, 7.2)
          if (midY >= m3Y) {
            const isPine = c % 7 === 0 && midY - m3Y < 24
            color1 = isPine ? PALETTE_SCENE1.pineTree : PALETTE_SCENE1.foregroundRidge
          }

          if (!color1) {
            const cloudWave =
              Math.sin((midX + t * 25) * 0.004 + t) * 0.5 + Math.cos(midY * 0.008) * 0.5
            if (cloudWave > 0.65 && isFineChecker && midY < s1BaseRidge1) {
              color1 = 'rgba(255, 235, 140, 0.35)'
            }
          }

          // -------- 2. Evaluate Scene 2 Color --------
          let color2 = null
          const dxMoon = midX - moonCenterX
          const dyMoon = midY - moonCenterY
          const distMoon = Math.sqrt(dxMoon * dxMoon + dyMoon * dyMoon)
          // Crescent moon mask: subtract an offset circle
          const dxCrescent = midX - (moonCenterX - moonRadius * 0.35)
          const dyCrescent = midY - (moonCenterY - moonRadius * 0.2)
          const distCrescent = Math.sqrt(dxCrescent * dxCrescent + dyCrescent * dyCrescent)

          if (distMoon < moonRadius && distCrescent > moonRadius * 0.7) {
            color2 = PALETTE_SCENE2.moonCore
          } else if (distMoon < moonRadius * 1.35 && isFineChecker) {
            color2 = PALETTE_SCENE2.moonGlow
          }

          // Distant Night Peaks
          const s2m1Y = mountainHeight(midX + mx * 22, s2BaseRidge1, 0.0028, 5.1)
          if (midY >= s2m1Y && midY < s2LakeHorizon) {
            color2 = PALETTE_SCENE2.distantPeak
          }

          // Dense Pine Forest Shoreline
          const s2ForestY = mountainHeight(midX + mx * 40, s2LakeHorizon - 20, 0.005, 9.4)
          if (midY >= s2ForestY && midY < s2LakeHorizon) {
            const isPineTree = (c * 3) % 5 === 0
            color2 = isPineTree ? PALETTE_SCENE2.pineTree : PALETTE_SCENE2.midRidge
          }

          // Moonlit Lake Waves with Water Reflection
          if (midY >= s2LakeHorizon) {
            const waveY = oceanWaveHeight(midX, s2LakeHorizon, 0.006, t)
            const isMoonReflect = Math.abs(midX - moonCenterX) < 70 + (midY - s2LakeHorizon) * 0.5
            if (isMoonReflect && isChecker) {
              color2 = PALETTE_SCENE2.waterMist
            } else if ((r + c) % 4 === 0) {
              color2 = PALETTE_SCENE2.midRidge
            } else {
              color2 = PALETTE_SCENE2.foregroundRidge
            }
          }

          // -------- 3. Pointillist Dither Dissolve Blend --------
          // Use pixel noise hash to dissolve individual pixels one by one across the transition
          const hash = (Math.sin(c * 19.34 + r * 67.12) * 43758.5453) % 1
          const threshold = (hash + 1) / 2 // 0 to 1

          let finalColor = null
          if (morphT <= 0.001) {
            finalColor = color1
          } else if (morphT >= 0.999) {
            finalColor = color2
          } else {
            // Smooth pixel handover: each pixel switches based on threshold
            finalColor = morphT > threshold ? color2 : color1
          }

          if (finalColor) {
            ctx.fillStyle = finalColor
            ctx.fillRect(px, py, pixelSize, pixelSize)
          }
        }
      }

      rafId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', updateSize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [pixelSize, interactive, displayDuration, transitionDuration])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full opacity-85 ${className}`}
      aria-hidden="true"
    />
  )
}
