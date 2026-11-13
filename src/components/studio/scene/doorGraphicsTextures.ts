import * as THREE from 'three'

let cachedWallSignTex: THREE.CanvasTexture | null = null
let cachedGlassDecalTex: THREE.CanvasTexture | null = null
let cachedDoorBottomTex: THREE.CanvasTexture | null = null

/**
 * Creates architectural wall signage plaque placed to the left of the door:
 * "ROOM 01 // BENNY R"
 * "UI/UX DESIGNER & WEB DESIGNER"
 */
export function createWallSignTexture(): THREE.CanvasTexture {
  if (cachedWallSignTex) return cachedWallSignTex

  const width = 512
  const height = 280
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#181917'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#2e302b'
  ctx.lineWidth = 3
  ctx.strokeRect(10, 10, width - 20, height - 20)

  ctx.fillStyle = '#f5d000'
  ctx.beginPath()
  ctx.arc(36, 42, 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#a1a1aa'
  ctx.font = '700 13px "Space Mono", monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('STUDIO 01 • ACTIVE WORKSPACE', 52, 42)

  ctx.strokeStyle = '#30322d'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(30, 70)
  ctx.lineTo(width - 30, 70)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 36px sans-serif'
  ctx.fillText('BENNY R', 30, 114)

  ctx.fillStyle = '#3eb49a'
  ctx.font = '700 18px sans-serif'
  ctx.fillText('UI/UX DESIGNER & WEB DESIGNER', 30, 156)

  ctx.fillStyle = '#a1a1aa'
  ctx.font = '500 13px "Space Mono", monospace'
  ctx.fillText('CREATIVE DIRECTION • FRONTEND • 3D', 30, 192)

  ctx.fillStyle = '#ffffff'
  for (let x = 30; x < 180; x += 4) {
    const barW = Math.random() > 0.5 ? 2.5 : 1
    ctx.fillRect(x, 224, barW, 22)
  }

  ctx.fillStyle = '#71717a'
  ctx.font = '600 11px "Space Mono", monospace'
  ctx.fillText('ID: BNY-2026-DES', 200, 235)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  cachedWallSignTex = texture
  return texture
}

/**
 * Creates glass decal graphic (frosted studio monogram & safety manifestation bands)
 * visible on the rounded glass window pane of the door.
 */
export function createGlassDecalTexture(): THREE.CanvasTexture {
  if (cachedGlassDecalTex) return cachedGlassDecalTex

  const width = 256
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.scale(0.5, 0.5)

  const logicalW = 512
  const logicalH = 512

  ctx.clearRect(0, 0, logicalW, logicalH)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.lineWidth = 3
  ctx.setLineDash([14, 10])
  ctx.beginPath()
  ctx.moveTo(40, logicalH / 2 + 60)
  ctx.lineTo(logicalW - 40, logicalH / 2 + 60)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(40, logicalH / 2 + 80)
  ctx.lineTo(logicalW - 40, logicalH / 2 + 80)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.arc(logicalW / 2, logicalH / 2 - 20, 48, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.font = '800 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('B', logicalW / 2, logicalH / 2 - 18)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  cachedGlassDecalTex = texture
  return texture
}

/**
 * Creates graphic decals for the door bottom / kick-panel:
 * Architectural caution stripes, room coordinates, and entry icons.
 */
export function createDoorBottomDecalTexture(): THREE.CanvasTexture {
  if (cachedDoorBottomTex) return cachedDoorBottomTex

  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(24, 25, 23, 0.25)'
  ctx.fillRect(20, 20, width - 40, 50)

  ctx.fillStyle = '#ffffff'
  ctx.font = '700 16px "Space Mono", monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('ZONE: DESIGN & ARCHITECTURE', 36, 45)

  ctx.fillStyle = '#f5d000'
  ctx.fillRect(width - 110, 30, 75, 30)

  ctx.fillStyle = '#181917'
  ctx.font = '800 13px "Space Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('ROOM 01', width - 72.5, 45)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(20, 100)
  ctx.lineTo(width - 20, 100)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.font = '500 12px "Space Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('SPEC // LAB-CLEAN-ROOM AESTHETIC', 24, 130)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  cachedDoorBottomTex = texture
  return texture
}
