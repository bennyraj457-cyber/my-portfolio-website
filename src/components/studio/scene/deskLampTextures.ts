import * as THREE from 'three'

let cachedLampshadeTexture: THREE.CanvasTexture | null = null
let cachedLampBaseTexture: THREE.CanvasTexture | null = null

/**
 * Creates canvas texture matching the user's lamp reference photo:
 * - Natural beige linen / raw woven fabric texture
 * - Embroidered slender dark stems with green leaves and daisy flowers
 */
export function createLampshadeFabricTexture(): THREE.CanvasTexture {
  if (cachedLampshadeTexture) return cachedLampshadeTexture

  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.scale(0.5, 0.5)

  const logicalW = 1024
  const logicalH = 512

  // 1. Natural warm linen beige base (#f4ece1)
  ctx.fillStyle = '#f5eee3'
  ctx.fillRect(0, 0, logicalW, logicalH)

  // 2. Fine linen horizontal & vertical weave fibers
  ctx.fillStyle = 'rgba(0, 0, 0, 0.025)'
  for (let y = 0; y < logicalH; y += 4) {
    ctx.fillRect(0, y, logicalW, 1)
  }
  for (let x = 0; x < logicalW; x += 4) {
    ctx.fillRect(x, 0, 1, logicalH)
  }

  // Subtle organic slub fibers
  ctx.fillStyle = 'rgba(160, 140, 115, 0.04)'
  for (let i = 0; i < 250; i++) {
    const rx = Math.random() * logicalW
    const ry = Math.random() * logicalH
    const rw = Math.random() * 25 + 5
    ctx.fillRect(rx, ry, rw, 1.2)
  }

  // Top and bottom hem borders
  ctx.strokeStyle = '#e2d5c3'
  ctx.lineWidth = 4
  ctx.strokeRect(0, 2, logicalW, logicalH - 4)

  // 3. Embroidered Botanical Illustration (Matched to user reference)
  const drawEmbroideredFlowers = (cx: number) => {
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Tall Central Stem
    ctx.strokeStyle = '#2d3326'
    ctx.lineWidth = 4.5
    ctx.beginPath()
    ctx.moveTo(cx - 30, logicalH - 20)
    ctx.bezierCurveTo(cx - 28, logicalH - 120, cx - 25, logicalH - 220, cx - 20, 180)
    ctx.stroke()

    // Shorter Right Stem
    ctx.beginPath()
    ctx.moveTo(cx + 20, logicalH - 20)
    ctx.bezierCurveTo(cx + 25, logicalH - 90, cx + 28, logicalH - 160, cx + 32, 230)
    ctx.stroke()

    // Foliage / Olive Green Embroidered Leaves
    const drawLeaf = (lx: number, ly: number, angle: number, scale = 1) => {
      ctx.save()
      ctx.translate(lx, ly)
      ctx.rotate(angle)
      ctx.fillStyle = '#445b36'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(14 * scale, -8 * scale, 32 * scale, -4 * scale, 42 * scale, 0)
      ctx.bezierCurveTo(32 * scale, 4 * scale, 14 * scale, 8 * scale, 0, 0)
      ctx.fill()
      ctx.strokeStyle = '#22301c'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()
    }

    // Tall stem leaves
    drawLeaf(cx - 30, logicalH - 80, -Math.PI / 4, 1.1)
    drawLeaf(cx - 24, logicalH - 140, Math.PI / 3.5, 1.0)
    drawLeaf(cx - 28, logicalH - 200, -Math.PI / 3, 0.9)
    drawLeaf(cx - 22, logicalH - 250, Math.PI / 4, 0.8)

    // Right stem leaves
    drawLeaf(cx + 22, logicalH - 70, Math.PI / 3, 0.95)
    drawLeaf(cx + 26, logicalH - 130, -Math.PI / 3.5, 0.9)
    drawLeaf(cx + 30, logicalH - 180, Math.PI / 4, 0.85)

    // Flower Petals
    const drawPetals = (fx: number, fy: number, radius: number) => {
      ctx.fillStyle = '#222920'
      const petalCount = 7
      for (let p = 0; p < petalCount; p++) {
        const theta = (p * 2 * Math.PI) / petalCount
        ctx.beginPath()
        ctx.ellipse(
          fx + Math.cos(theta) * radius * 0.7,
          fy + Math.sin(theta) * radius * 0.7,
          radius * 0.45,
          radius * 0.25,
          theta,
          0,
          2 * Math.PI,
        )
        ctx.fill()
      }
      ctx.fillStyle = '#c8ded2'
      ctx.beginPath()
      ctx.arc(fx, fy, radius * 0.28, 0, Math.PI * 2)
      ctx.fill()
    }

    drawPetals(cx - 20, 175, 26)
    drawPetals(cx + 32, 225, 22)

    ctx.restore()
  }

  drawEmbroideredFlowers(260)
  drawEmbroideredFlowers(770)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  cachedLampshadeTexture = texture
  return texture
}

/**
 * Creates ceramic painted bottom base texture:
 * - Rustic weathered sage green with decorative carved wooden top rings
 */
export function createLampBaseTexture(): THREE.CanvasTexture {
  if (cachedLampBaseTexture) return cachedLampBaseTexture

  const width = 256
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.scale(0.5, 0.5)

  const logicalW = 512
  const logicalH = 512

  // Top 30%: Rich warm walnut wood rings (#63442a)
  ctx.fillStyle = '#68472d'
  ctx.fillRect(0, 0, logicalW, logicalH * 0.32)

  // Wood grain lines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  for (let y = 0; y < logicalH * 0.32; y += 4) {
    ctx.fillRect(0, y, logicalW, 1.5)
  }

  // Middle division groove (black etched border)
  ctx.fillStyle = '#1c1712'
  ctx.fillRect(0, logicalH * 0.3, logicalW, 8)

  // Decorative etched stitch/dash pattern
  ctx.fillStyle = '#e8dcc8'
  for (let x = 8; x < logicalW; x += 16) {
    ctx.fillRect(x, logicalH * 0.32, 6, 8)
  }

  // Lower 68%: Hand-painted distressed sage green (#4d6f5c)
  ctx.fillStyle = '#4c6c5b'
  ctx.fillRect(0, logicalH * 0.34, logicalW, logicalH * 0.66)

  // Painterly brush strokes & patina
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
  for (let y = logicalH * 0.34; y < logicalH; y += 6) {
    ctx.fillRect(0, y, logicalW, 2)
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  for (let i = 0; i < 150; i++) {
    const rx = Math.random() * logicalW
    const ry = logicalH * 0.34 + Math.random() * (logicalH * 0.66)
    ctx.fillRect(rx, ry, Math.random() * 8, Math.random() * 8)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  cachedLampBaseTexture = texture
  return texture
}
