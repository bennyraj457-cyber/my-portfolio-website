import * as THREE from 'three'

let cachedStudioWallPlaqueTex: THREE.CanvasTexture | null = null

/**
 * Creates canvas texture for an architectural studio wall plaque:
 * "STUDIO 01 // BENNY RAJ"
 * "CREATIVE DEVELOPER & UI/UX"
 */
export function createStudioWallPlaqueTexture(): THREE.CanvasTexture {
  if (cachedStudioWallPlaqueTex) return cachedStudioWallPlaqueTex

  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.scale(0.5, 0.5)

  const logicalW = 1024
  const logicalH = 512

  ctx.fillStyle = '#1c1d1a'
  ctx.fillRect(0, 0, logicalW, logicalH)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
  for (let x = 0; x < logicalW; x += 4) {
    ctx.fillRect(x, 0, 1, logicalH)
  }

  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 4
  ctx.strokeRect(18, 18, logicalW - 36, logicalH - 36)

  ctx.strokeStyle = 'rgba(245, 208, 0, 0.25)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(28, 28, logicalW - 56, logicalH - 56)

  const standoffs = [
    [40, 40],
    [logicalW - 40, 40],
    [40, logicalH - 40],
    [logicalW - 40, logicalH - 40],
  ]
  standoffs.forEach(([sx, sy]) => {
    ctx.fillStyle = '#111210'
    ctx.beginPath()
    ctx.arc(sx, sy, 11, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#d4af37'
    ctx.beginPath()
    ctx.arc(sx, sy, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f5d000'
    ctx.beginPath()
    ctx.arc(sx - 1.5, sy - 1.5, 2.5, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.font = 'bold 24px "Space Mono", monospace'
  ctx.fillStyle = '#f5d000'
  ctx.textAlign = 'center'
  ctx.fillText('• STUDIO 01 • PRIVATE LAB •', logicalW / 2, 90)

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(120, 120)
  ctx.lineTo(logicalW - 120, 120)
  ctx.stroke()

  ctx.font = '900 64px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.letterSpacing = '8px'
  ctx.fillText('BENNY RAJ', logicalW / 2, 210)

  ctx.font = '600 26px sans-serif'
  ctx.fillStyle = '#c5c3bc'
  ctx.letterSpacing = '4px'
  ctx.fillText('CREATIVE DEVELOPER & DESIGNER', logicalW / 2, 275)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.beginPath()
  ctx.moveTo(160, 320)
  ctx.lineTo(logicalW - 160, 320)
  ctx.stroke()

  ctx.font = '500 20px "Space Mono", monospace'
  ctx.fillStyle = '#8f8e87'
  ctx.fillText('3D EXPERIENCES • WEB APPS • UI/UX SYSTEMS', logicalW / 2, 375)

  ctx.font = '600 18px "Space Mono", monospace'
  ctx.fillStyle = '#f5d000'
  ctx.fillText('STATUS: AVAILABLE FOR SELECT COMMISSIONS', logicalW / 2, 430)

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  cachedStudioWallPlaqueTex = texture
  return texture
}
