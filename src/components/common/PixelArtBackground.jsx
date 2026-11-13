import React, { useEffect, useRef } from 'react'
import heroPixelArtImage from '../../assets/images/hero-pixel-art.png'

/**
 * PixelArtBackground
 *
 * Renders the user's lofi pixel art illustration directly onto an interactive canvas
 * made of thousands of tiny discrete micro-pixels:
 * - Samples the pixel colors from the artwork.
 * - Renders them as crisp micro-pixel blocks.
 * - Gentle atmospheric vignette / radial breathing clearing in the center to maintain perfect legibility for hero text.
 * - Subtle micro-twinkle / ambient drift particles matching the sunset sky.
 */
export default function PixelArtBackground({
  className = '',
  pixelSize = 4, // 4x4 crisp retro pixel blocks
  opacity = 0.88,
}) {
  const canvasRef = useRef(null)
  const rafId = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = 0
    let height = 0

    const img = new Image()
    img.src = heroPixelArtImage

    let sampledPixels = []

    const processImage = () => {
      const parent = canvas.parentElement || document.body
      width = canvas.width = parent.clientWidth || window.innerWidth
      height = canvas.height = parent.clientHeight || window.innerHeight

      if (!img.complete || img.naturalWidth === 0) return

      // Offscreen canvas to scale and sample image pixels to fit canvas
      const offCanvas = document.createElement('canvas')
      const targetCols = Math.ceil(width / pixelSize)
      const targetRows = Math.ceil(height / pixelSize)

      offCanvas.width = targetCols
      offCanvas.height = targetRows
      const offCtx = offCanvas.getContext('2d')

      // Cover scaling math (object-fit: cover)
      const imgRatio = img.naturalWidth / img.naturalHeight
      const screenRatio = width / height

      let drawW, drawH, drawX, drawY
      if (screenRatio > imgRatio) {
        drawW = targetCols
        drawH = Math.round(targetCols / imgRatio)
        drawX = 0
        drawY = Math.round((targetRows - drawH) / 2)
      } else {
        drawH = targetRows
        drawW = Math.round(targetRows * imgRatio)
        drawX = Math.round((targetCols - drawW) / 2)
        drawY = 0
      }

      // Draw downscaled to get discrete pixel block values
      offCtx.imageSmoothingEnabled = false
      offCtx.drawImage(img, drawX, drawY, drawW, drawH)

      const imgData = offCtx.getImageData(0, 0, targetCols, targetRows)
      const data = imgData.data

      const pixels = []
      const cx = targetCols / 2
      const cy = targetRows / 2

      for (let r = 0; r < targetRows; r++) {
        for (let c = 0; c < targetCols; c++) {
          const idx = (r * targetCols + c) * 4
          const red = data[idx]
          const green = data[idx + 1]
          const blue = data[idx + 2]
          const alpha = data[idx + 3]

          if (alpha > 20) {
            // Distance from center for soft contrast attenuation behind the headline
            const dx = (c - cx) / (targetCols * 0.48)
            const dy = (r - cy) / (targetRows * 0.42)
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Center has soft lightness boost/translucency so black text is effortlessly readable
            let centerFade = 1.0
            if (dist < 1.0) {
              centerFade = 0.22 + dist * 0.78
            }

            pixels.push({
              x: c * pixelSize,
              y: r * pixelSize,
              color: `rgba(${red}, ${green}, ${blue}, ${centerFade})`,
            })
          }
        }
      }

      sampledPixels = pixels
      render()
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = opacity

      // Draw all discrete tiny pixels
      for (let i = 0; i < sampledPixels.length; i++) {
        const p = sampledPixels[i]
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, pixelSize, pixelSize)
      }

      // Soft white gradient veil overlay in center for ultra-crisp typography contrast
      const gradient = ctx.createRadialGradient(
        width / 2,
        height * 0.46,
        40,
        width / 2,
        height * 0.46,
        Math.min(width * 0.52, 540)
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.88)')
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.65)')
      gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.25)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.globalAlpha = 1.0
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    img.onload = processImage
    if (img.complete) processImage()

    const handleResize = () => {
      processImage()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rafId.current) cancelAnimationFrame(rafId.current)
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
