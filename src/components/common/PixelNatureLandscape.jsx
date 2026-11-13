import React, { useEffect, useRef } from 'react'

/**
 * PixelNatureLandscape
 *
 * Renders an editorial Japanese woodblock / sunset mountain landscape in tiny discrete micro-pixels:
 * - Rising Golden Sun disc rendered in warm dithered gold tones (#ffd700, #ffe766, #fff4b8)
 * - Multiple layered mountain ridges receding into misty depth with pointillist pixel dithering
 * - Subtle organic drifting clouds in the upper sky
 * - Very subtle parallax depth response on gentle cursor movement
 * - Perfectly cleared central zone keeping the headline typography and buttons clean and legible
 */
export default function PixelNatureLandscape({
  className = '',
  pixelSize = 4, // Crisp 4px micro-pixels
  interactive = true,
}) {
  const canvasRef = useRef(null)
  const rafId = useRef(null)
  const timeRef = useRef(0)
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
      // Normalized offset -1 to 1 for subtle parallax
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Color Palette matching design tokens
    const PALETTE = {
      sunCore: '#ffd700',
      sunGlow1: '#ffe566',
      sunGlow2: '#fff3b0',
      skyHaze: 'rgba(255, 248, 220, 0.45)',
      // Mountains: 3 layers from far to near
      distantPeak: '#ebd88a',
      midRidge: '#d4b745',
      foregroundRidge: '#998124',
      pineTree: '#665415',
    }

    // Noise wave generator for mountain slopes
    const mountainHeight = (x, offset, freq, seed) => {
      return (
        Math.sin(x * freq + seed) * 38 +
        Math.sin(x * freq * 2.3 + seed * 1.5) * 22 +
        Math.cos(x * freq * 0.5 + seed * 0.7) * 45 +
        offset
      )
    }

    const render = () => {
      timeRef.current += 0.005
      const t = timeRef.current

      // Smooth mouse interpolation for parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, width, height)

      const cols = Math.ceil(width / pixelSize)
      const rows = Math.ceil(height / pixelSize)

      // Center sun position (flanked slightly right or top center)
      const sunCenterX = width * 0.5 + mx * 15
      const sunCenterY = height * 0.38 + my * 10
      const sunRadius = Math.min(width * 0.22, 170)

      // Mountain base positions
      const baseRidge1 = height * 0.58 + my * 18 // Far mountains
      const baseRidge2 = height * 0.72 + my * 26 // Mid ridges
      const baseRidge3 = height * 0.86 + my * 35 // Foreground foothills

      // Render micro-pixel canvas grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * pixelSize
          const py = r * pixelSize
          const midX = px + pixelSize / 2
          const midY = py + pixelSize / 2

          // 1. Sun Disc & Solar Halo
          const dxSun = (midX - sunCenterX)
          const dySun = (midY - sunCenterY)
          const distSun = Math.sqrt(dxSun * dxSun + dySun * dySun)

          // Checkerboard dither test for pixel transitions
          const isChecker = (c + r) % 2 === 0
          const isFineChecker = (c % 2 === 0 && r % 2 === 0)

          let color = null

          // Sun rendering
          if (distSun < sunRadius * 0.75) {
            color = PALETTE.sunCore
          } else if (distSun < sunRadius * 0.9) {
            color = isChecker ? PALETTE.sunCore : PALETTE.sunGlow1
          } else if (distSun < sunRadius * 1.05) {
            color = isChecker ? PALETTE.sunGlow1 : PALETTE.sunGlow2
          } else if (distSun < sunRadius * 1.25) {
            if (isFineChecker) color = PALETTE.sunGlow2
          }

          // 2. Mountain Ridge Layer 1 (Distant Peaks)
          const m1Y = mountainHeight(midX + mx * 20, baseRidge1, 0.0022, 1.4)
          if (midY >= m1Y) {
            const depthIntoMountain = midY - m1Y
            if (depthIntoMountain < 6) {
              color = isChecker ? PALETTE.distantPeak : PALETTE.sunGlow2
            } else {
              color = PALETTE.distantPeak
            }
          }

          // 3. Mountain Ridge Layer 2 (Mid-Range Rolling Hills)
          const m2Y = mountainHeight(midX + mx * 35, baseRidge2, 0.0035, 3.8)
          if (midY >= m2Y) {
            const depthIntoMountain = midY - m2Y
            if (depthIntoMountain < 8) {
              color = isChecker ? PALETTE.midRidge : PALETTE.distantPeak
            } else {
              color = PALETTE.midRidge
            }
          }

          // 4. Mountain Ridge Layer 3 (Foreground Foothills & Pine Silhouettes)
          const m3Y = mountainHeight(midX + mx * 55, baseRidge3, 0.0048, 7.2)
          if (midY >= m3Y) {
            const depthIntoMountain = midY - m3Y
            if (depthIntoMountain < 8) {
              color = isChecker ? PALETTE.foregroundRidge : PALETTE.midRidge
            } else {
              // Occasional tiny pine trees rendered in micro-pixels
              const isPineSpire = (c % 7 === 0) && depthIntoMountain < 24
              color = isPineSpire ? PALETTE.pineTree : PALETTE.foregroundRidge
            }
          }

          // 5. Subtle Sky Drifting Cloud Ribbons
          if (!color) {
            const cloudDriftX = midX + t * 25
            const cloudWave =
              Math.sin(cloudDriftX * 0.004 + t) * 0.5 +
              Math.cos(midY * 0.008) * 0.5
            if (cloudWave > 0.65 && isFineChecker && midY < baseRidge1) {
              color = 'rgba(255, 235, 140, 0.35)'
            }
          }

          // Draw the pixel block if it has a color
          if (color) {
            ctx.fillStyle = color
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
  }, [pixelSize, interactive])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full opacity-85 ${className}`}
      aria-hidden="true"
    />
  )
}
