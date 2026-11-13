import React, { useEffect, useRef } from 'react'
import retroCoderImg from '../../assets/images/retro-coder.png'

/**
 * PixelArtBackground
 *
 * Renders the uploaded artwork (coder sitting at a computer desk on a grassy hill)
 * mapped directly to our brand pixel palette:
 * - Brand Primary Gold: #ffd700
 * - Light Yellow: #ffe766
 * - Pastel Cream: #fffadc
 * - Deep Charcoal / Ink: #181818
 * - Clean White: #ffffff
 *
 * Features:
 * - Scaled pixelation (each macro pixel block is rendered with discrete pixel grid or dither)
 * - Crisp retro aesthetic matching the portfolio design system
 * - Soft edge fade to seamlessly blend into the hero background
 */
export default function PixelArtBackground({
  className = '',
  pixelSize = 6, // Size of discrete retro pixels
  opacity = 0.85,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = retroCoderImg

    let isCancelled = false

    img.onload = () => {
      if (isCancelled) return

      const render = () => {
        const parent = canvas.parentElement || document.body
        const width = (canvas.width = parent.clientWidth || window.innerWidth)
        const height = (canvas.height = parent.clientHeight || window.innerHeight)

        ctx.clearRect(0, 0, width, height)

        // Palette mapping definition
        // 0: Deep Ink/Charcoal #141414
        // 1: Primary Gold #ffd700
        // 2: Warm Light Yellow #ffe766
        // 3: Soft Cream #fffadc
        // 4: Pure White #ffffff
        const palette = [
          { r: 20, g: 20, b: 20, hex: '#141414' }, // Shadows, suit, chair legs, outline
          { r: 255, g: 215, b: 0, hex: '#ffd700' }, // Hillside midtones, highlights
          { r: 255, g: 231, b: 102, hex: '#ffe766' }, // Sky base & desk highlights
          { r: 255, g: 250, b: 220, hex: '#fffadc' }, // Sky highlights / monitor glow
          { r: 255, g: 255, b: 255, hex: '#ffffff' }, // Bright white space
        ]

        // Offscreen sampling canvas to downsample the image into discrete pixel grid
        const blockSize = Math.max(4, pixelSize)
        const sampleCols = Math.ceil(width / blockSize)
        const sampleRows = Math.ceil(height / blockSize)

        const offCanvas = document.createElement('canvas')
        offCanvas.width = sampleCols
        offCanvas.height = sampleRows
        const offCtx = offCanvas.getContext('2d')

        // Maintain cover / aspect ratio fit
        const imgRatio = img.width / img.height
        const targetRatio = width / height

        let drawW, drawH, drawX, drawY
        if (targetRatio > imgRatio) {
          drawW = sampleCols
          drawH = sampleCols / imgRatio
          drawX = 0
          drawY = (sampleRows - drawH) / 2
        } else {
          drawH = sampleRows
          drawW = sampleRows * imgRatio
          drawX = (sampleCols - drawW) / 2
          drawY = 0
        }

        offCtx.drawImage(img, drawX, drawY, drawW, drawH)

        const imgData = offCtx.getImageData(0, 0, sampleCols, sampleRows).data

        // Nearest palette color finder with luminance weighting
        const findNearestPaletteColor = (r, g, b) => {
          // Calculate perceived luminance (0 - 255)
          const lum = 0.299 * r + 0.587 * g + 0.114 * b

          // Ink outline & deep darks (suit, hair, dark grass shadows)
          if (lum < 55) {
            return palette[0].hex
          }
          // Mid-dark (clothing, dark grass, chair)
          if (lum < 110) {
            return palette[1].hex
          }
          // Mid-light (grassy hill, desk, computer body)
          if (lum < 175) {
            return palette[2].hex
          }
          // Highlights (sky, monitor screen)
          if (lum < 235) {
            return palette[3].hex
          }
          return palette[4].hex
        }

        ctx.globalAlpha = opacity

        // Draw each pixel square
        for (let r = 0; r < sampleRows; r++) {
          for (let c = 0; c < sampleCols; c++) {
            const idx = (r * sampleCols + c) * 4
            const rVal = imgData[idx]
            const gVal = imgData[idx + 1]
            const bVal = imgData[idx + 2]
            const aVal = imgData[idx + 3]

            if (aVal < 20) continue

            const hex = findNearestPaletteColor(rVal, gVal, bVal)

            ctx.fillStyle = hex
            ctx.fillRect(c * blockSize, r * blockSize, blockSize - 0.5, blockSize - 0.5)
          }
        }

        ctx.globalAlpha = 1.0

        // Vignette fade / soft gradient mask around edges so it seamlessly blends into white
        const gradient = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.35,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.65
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.95)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      render()
      window.addEventListener('resize', render)

      return () => {
        window.removeEventListener('resize', render)
      }
    }

    return () => {
      isCancelled = true
    }
  }, [pixelSize, opacity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  )
}
