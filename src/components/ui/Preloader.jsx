import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * PixelDissolvePreloader
 *
 * Requirements:
 * - Full solid yellow (#ffd700) pixel screen initially covering the viewport
 * - Center progress percentage (1% -> 100%) in bold brand typography
 * - After 100%, the yellow screen dissolves block by block (like our background pixel dither grid)
 *   expanding outward from the center into the edges
 * - As the pixels dissolve one-by-one from the center, the hero text and paragraph are revealed
 */
export default function Preloader({ onComplete }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const contentRef = useRef(null)
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const pixelBlockSize = 28 // Exact matching macroSize of our background pixels
    let cols = Math.ceil(width / pixelBlockSize)
    let rows = Math.ceil(height / pixelBlockSize)
    const cx = width / 2
    const cy = height / 2
    const maxDist = Math.sqrt(cx * cx + cy * cy)

    // Build the grid of pixel blocks
    // Each block has a normalized radial distance from center
    const createBlocks = () => {
      const list = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * pixelBlockSize
          const y = r * pixelBlockSize
          const midX = x + pixelBlockSize / 2
          const midY = y + pixelBlockSize / 2
          const dx = midX - cx
          const dy = midY - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          const normDist = dist / maxDist // 0 at center, 1 at farthest corner

          // Small random noise to make the dissolve organic & dithered like our clouds
          const noise = (((c * 17 + r * 31) % 19) / 19) * 0.18

          list.push({
            x,
            y,
            threshold: normDist + noise, // determines when this pixel dissolves
            alpha: 1,
          })
        }
      }
      return list
    }

    let blocks = createBlocks()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      cols = Math.ceil(width / pixelBlockSize)
      rows = Math.ceil(height / pixelBlockSize)
      blocks = createBlocks()
    }
    window.addEventListener('resize', handleResize)

    // Dissolve parameter: 0 = full yellow coverage, 1.35 = all pixels dissolved
    const dissolveAnim = { value: 0 }
    let isDissolving = false
    let rafId = null

    // Draw loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      if (!isDissolving) {
        // Solid yellow screen while counting 1 -> 100
        ctx.fillStyle = '#ffd700'
        ctx.fillRect(0, 0, width, height)
      } else {
        const currentDissolve = dissolveAnim.value
        // Draw each pixel block based on radial wave from center
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i]
          // If dissolve progress passed this block's threshold, it starts fading away
          const diff = currentDissolve - b.threshold
          if (diff < 0) {
            // Still solid
            ctx.fillStyle = '#ffd700'
            ctx.fillRect(b.x, b.y, pixelBlockSize, pixelBlockSize)
          } else if (diff < 0.2) {
            // Dither dissolving phase: checkerboard or fading alpha
            const alpha = 1 - diff / 0.2
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha.toFixed(3)})`
            ctx.fillRect(b.x, b.y, pixelBlockSize, pixelBlockSize)
          }
          // diff >= 0.2 -> completely dissolved (transparent)
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    draw()

    // GSAP Timeline Sequence
    const progressObj = { val: 1 }
    const tl = gsap.timeline()

    // 1. Run progress count 1% to 100%
    tl.to(progressObj, {
      val: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        const rounded = Math.round(progressObj.val)
        setProgress(rounded)
      },
    })

    // 2. Center counter fades out gently right at 100%
    tl.to(contentRef.current, {
      opacity: 0,
      scale: 1.08,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        isDissolving = true
        // Trigger page reveal event early so text starts emerging through the center hole
        onComplete?.()
      },
    })

    // 3. Pixel dissolve wave expands outward from the center to edges
    tl.to(dissolveAnim, {
      value: 1.35,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        cancelAnimationFrame(rafId)
        if (containerRef.current) {
          containerRef.current.style.display = 'none'
        }
      },
    })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      tl.kill()
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] w-full h-[100dvh] flex items-center justify-center select-none overflow-hidden pointer-events-none"
    >
      {/* Pixel Dissolve Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />

      {/* Center Counter Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center text-black pointer-events-none"
      >
        <span className="text-xs uppercase font-mono tracking-[0.35em] text-black/60 mb-2">
          Loading Portfolio
        </span>

        {/* Large Percentage */}
        <div className="flex items-baseline font-heading tracking-tight">
          <span className="text-7xl sm:text-8xl md:text-9xl font-bold leading-none">
            {progress}
          </span>
          <span className="text-3xl sm:text-4xl md:text-5xl font-mono text-black/70 ml-1">
            %
          </span>
        </div>

        {/* Clean Micro Dot Accent */}
        <div className="flex items-center gap-1.5 mt-4">
          <span className="w-2 h-2 rounded-full bg-black/80 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
          <span className="w-1 h-1 rounded-full bg-black/20" />
        </div>
      </div>
    </div>
  )
}
