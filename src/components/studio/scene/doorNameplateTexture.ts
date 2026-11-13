import * as THREE from 'three'

let cachedDoorNameplateTex: THREE.CanvasTexture | null = null

/**
 * Creates sharp architectural brass/matte-black door nameplate:
 * "BENNY R"
 * "UI/UX Designer & Web Designer"
 */
export function createDoorNameplateTexture(): THREE.CanvasTexture {
  if (cachedDoorNameplateTex) return cachedDoorNameplateTex

  const width = 512
  const height = 180
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.scale(0.5, 0.5)

  const logicalW = 1024
  const logicalH = 360

  ctx.fillStyle = '#161714'
  ctx.fillRect(0, 0, logicalW, logicalH)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)'
  for (let x = 0; x < logicalW; x += 4) {
    ctx.fillRect(x, 0, 1.5, logicalH)
  }

  ctx.strokeStyle = '#f5d000'
  ctx.lineWidth = 6
  ctx.strokeRect(20, 20, logicalW - 40, logicalH - 40)

  ctx.strokeStyle = 'rgba(245, 208, 0, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(32, 32, logicalW - 64, logicalH - 64)

  const rivetOffset = 38
  const rivetRadius = 6
  const rivets = [
    [rivetOffset, rivetOffset],
    [logicalW - rivetOffset, rivetOffset],
    [rivetOffset, logicalH - rivetOffset],
    [logicalW - rivetOffset, logicalH - rivetOffset],
  ]

  rivets.forEach(([rx, ry]) => {
    ctx.fillStyle = '#f5d000'
    ctx.beginPath()
    ctx.arc(rx, ry, rivetRadius, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#161714'
    ctx.beginPath()
    ctx.arc(rx, ry, 2.5, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = '#f5d000'
  ctx.font = '800 20px "Space Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('• STUDIO 01 •', logicalW / 2, 70)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 68px sans-serif'
  ctx.fillText('BENNY R', logicalW / 2, 145)

  ctx.strokeStyle = '#f5d000'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(logicalW / 2 - 140, 200)
  ctx.lineTo(logicalW / 2 + 140, 200)
  ctx.stroke()

  ctx.fillStyle = '#f5d000'
  ctx.beginPath()
  ctx.arc(logicalW / 2, 200, 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#dcdad4'
  ctx.font = '700 32px sans-serif'
  ctx.fillText('UI/UX DESIGNER & WEB DESIGNER', logicalW / 2, 255)

  ctx.fillStyle = '#8e8b82'
  ctx.font = '600 18px "Space Mono", monospace'
  ctx.fillText('WORKSPACE & CREATIVE LAB', logicalW / 2, 298)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  cachedDoorNameplateTex = texture
  return texture
}
