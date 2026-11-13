import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorkspaceFocus } from '@/context/WorkspaceFocusContext'
import { useRoomEntrance } from '@/context/RoomEntranceContext'

const CANVAS_W = 2100
const CANVAS_H = 850
const HALF_W = CANVAS_W / 2 // 1050
const RENDER_SCALE = 0.5 // Renders onto a lightweight 1050x425 buffer (75% less VRAM bandwidth)

const TYPED_SNIPPETS = [
  'className="btn-primary rounded-full px-6 py-2.5"',
  'className="btn-primary rounded-full px-6 py-2.5 shadow-sm"',
  'className="btn-primary rounded-full px-6 py-2.5 hover:bg-primary-fixed"',
]

const TERMINAL_LOGS = [
  '17:19:04 [vite] hmr update /src/components/Hero.tsx, /src/index.css',
  '17:19:08 [vite] hmr update /src/components/Projects.tsx (x2)',
  '17:19:12 [tsc]  0 errors — types synchronized with Figma tokens',
  '17:19:16 [vite] page reload /src/App.tsx (fast refresh 12ms)',
]

interface FigmaNodeTarget {
  name: string
  x: number
  y: number
  w: number
  h: number
  dispW: number
  dispH: number
  radius: number
  pad: number
  fillHex: string
  fillName: string
  cursorX: number
  cursorY: number
}

// Coordinates relative to the Figma Artboard origin
const FIGMA_TARGETS: FigmaNodeTarget[] = [
  {
    name: 'CTA_Button_Primary',
    x: 22,
    y: 232,
    w: 186,
    h: 44,
    dispW: 186,
    dispH: 44,
    radius: 999,
    pad: 20,
    fillHex: '#F5D000',
    fillName: 'primary-container',
    cursorX: 165,
    cursorY: 256,
  },
  {
    name: 'Hero_Typography',
    x: 18,
    y: 88,
    w: 470,
    h: 126,
    dispW: 640,
    dispH: 148,
    radius: 8,
    pad: 16,
    fillHex: '#1B1C19',
    fillName: 'on-surface',
    cursorX: 280,
    cursorY: 160,
  },
  {
    name: 'Projects_Grid_2Col',
    x: 18,
    y: 296,
    w: 470,
    h: 178,
    dispW: 640,
    dispH: 220,
    radius: 16,
    pad: 24,
    fillHex: '#F5F3EE',
    fillName: 'surface-container-low',
    cursorX: 340,
    cursorY: 385,
  },
]

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawSplitWorkspace(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save()
  ctx.scale(RENDER_SCALE, RENDER_SCALE)

  // ============================================================================
  // LEFT 50% (0 .. 1050): VISUAL STUDIO CODE — DARK IDE
  // ============================================================================
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, HALF_W, CANVAS_H)

  // 1. Top Title & Tab Bar (y: 0..46)
  ctx.fillStyle = '#121215'
  ctx.fillRect(0, 0, HALF_W, 46)
  ctx.strokeStyle = '#27272c'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, 46)
  ctx.lineTo(HALF_W, 46)
  ctx.stroke()

  // Window Traffic Lights
  const dots = [
    { x: 20, c: '#ff5f56' },
    { x: 38, c: '#ffbd2e' },
    { x: 56, c: '#27c93f' },
  ]
  dots.forEach((d) => {
    ctx.fillStyle = d.c
    ctx.beginPath()
    ctx.arc(d.x, 23, 5.5, 0, Math.PI * 2)
    ctx.fill()
  })

  // Editor Tabs
  const tabs = [
    { name: 'Hero.tsx', active: true, extColor: '#38bdf8' },
    { name: 'Header.tsx', active: false, extColor: '#38bdf8' },
    { name: 'Projects.tsx', active: false, extColor: '#38bdf8' },
    { name: 'App.tsx', active: false, extColor: '#38bdf8' },
    { name: 'index.css', active: false, extColor: '#c084fc' },
  ]

  let tabX = 250
  tabs.forEach((tab) => {
    const tabW = 148
    ctx.fillStyle = tab.active ? '#1e1e22' : '#141417'
    ctx.fillRect(tabX, 0, tabW, 45)

    if (tab.active) {
      ctx.fillStyle = '#f5d000'
      ctx.fillRect(tabX, 0, tabW, 3)
    }

    // Tab right border
    ctx.fillStyle = '#25252b'
    ctx.fillRect(tabX + tabW - 1, 0, 1, 45)

    // File icon dot
    ctx.fillStyle = tab.extColor
    ctx.font = 'bold 14px "Space Mono", monospace'
    ctx.fillText('TSX', tabX + 12, 28)

    // File name
    ctx.fillStyle = tab.active ? '#fbf9f3' : '#787882'
    ctx.font = tab.active
      ? 'bold 15px "Space Mono", monospace'
      : '15px "Space Mono", monospace'
    ctx.fillText(tab.name, tabX + 46, 28)

    tabX += tabW
  })

  // 2. Left Activity Bar (x: 0..48, y: 46..816)
  ctx.fillStyle = '#141417'
  ctx.fillRect(0, 46, 48, CANVAS_H - 76)
  ctx.fillStyle = '#25252b'
  ctx.fillRect(48, 46, 1.5, CANVAS_H - 76)

  // Active Explorer Indicator
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(0, 62, 3, 34)

  // Activity Bar Icons
  const actIcons = ['❐', '⌕', '⎇', '▷', '⊞']
  actIcons.forEach((ic, idx) => {
    ctx.fillStyle = idx === 0 ? '#fbf9f3' : idx === 2 ? '#cbe6d0' : '#787882'
    ctx.font = '20px "Space Mono", monospace'
    ctx.fillText(ic, 14, 86 + idx * 52)
  })

  // 3. File Explorer Sidebar (x: 49..250, y: 46..816)
  ctx.fillStyle = '#16161a'
  ctx.fillRect(49, 46, 201, CANVAS_H - 76)
  ctx.fillStyle = '#25252b'
  ctx.fillRect(250, 46, 1.5, CANVAS_H - 76)

  ctx.fillStyle = '#787882'
  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillText('EXPLORER', 64, 74)

  ctx.fillStyle = '#d4d4d8'
  ctx.font = 'bold 14px "Space Mono", monospace'
  ctx.fillText('▾ MY-PORTFOLIO', 60, 102)

  const explorerFiles = [
    { label: '▾ src', indent: 12, color: '#f5d000', active: false },
    { label: '▾ components', indent: 26, color: '#cbe6d0', active: false },
    { label: 'Header.tsx', indent: 42, color: '#9ca3af', active: false },
    { label: 'Hero.tsx', indent: 42, color: '#fbf9f3', active: true },
    { label: 'Projects.tsx', indent: 42, color: '#9ca3af', active: false },
    { label: 'App.tsx', indent: 26, color: '#9ca3af', active: false },
    { label: 'index.css', indent: 26, color: '#9ca3af', active: false },
    { label: '▸ public', indent: 12, color: '#787882', active: false },
    { label: 'design-system.md', indent: 12, color: '#787882', active: false },
    { label: 'package.json', indent: 12, color: '#787882', active: false },
  ]

  explorerFiles.forEach((item, i) => {
    const fy = 132 + i * 32
    if (item.active) {
      ctx.fillStyle = '#27272f'
      ctx.fillRect(50, fy - 20, 200, 28)
      ctx.fillStyle = '#f5d000'
      ctx.fillRect(50, fy - 20, 3, 28)
    }
    ctx.fillStyle = item.color
    ctx.font = item.active
      ? 'bold 14px "Space Mono", monospace'
      : '14px "Space Mono", monospace'
    ctx.fillText(item.label, 62 + item.indent, fy)
  })

  // 4. Center Code Editor Area (x: 251..984, y: 46..668)
  ctx.fillStyle = '#1e1e22'
  ctx.fillRect(251, 46, 733, 622)

  // Breadcrumb Bar
  ctx.fillStyle = '#1b1b1f'
  ctx.fillRect(251, 46, 733, 28)
  ctx.fillStyle = '#8e8e98'
  ctx.font = '13px "Space Mono", monospace'
  ctx.fillText('src  ›  components  ›  Hero.tsx  ›  PortfolioHero', 268, 65)

  // Live Typing State Computation
  const cyclePeriod = 6.0
  const snippetIdx = Math.floor(t / cyclePeriod) % TYPED_SNIPPETS.length
  const targetSnippet = TYPED_SNIPPETS[snippetIdx]
  const phase = (t % cyclePeriod) / cyclePeriod
  // Smoothly type out and hold
  const charProgress =
    phase < 0.65
      ? Math.floor((phase / 0.65) * targetSnippet.length)
      : targetSnippet.length
  const currentTyped = targetSnippet.slice(0, Math.max(18, charProgress))

  const activeLine = Math.floor(t / 3.5) % 3 === 0 ? 10 : 11

  // Active Line Highlight
  const highlightY = 82 + (activeLine - 1) * 34
  ctx.fillStyle = '#292932'
  ctx.fillRect(251, highlightY, 733, 32)
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(251, highlightY, 3, 32)

  // Syntax-Highlighted Code Lines
  const codeLines: Array<Array<{ text: string; color: string }>> = [
    [
      { text: 'import ', color: '#c084fc' },
      { text: '{ Header } ', color: '#fbf9f3' },
      { text: 'from ', color: '#c084fc' },
      { text: "'./Header'", color: '#86efac' },
    ],
    [
      { text: 'import ', color: '#c084fc' },
      { text: '{ Projects } ', color: '#fbf9f3' },
      { text: 'from ', color: '#c084fc' },
      { text: "'./Projects'", color: '#86efac' },
    ],
    [
      {
        text: '// Synced with Figma: Aureolin_Portfolio_v2',
        color: '#6b7280',
      },
    ],
    [
      { text: 'export function ', color: '#c084fc' },
      { text: 'PortfolioHero', color: '#fde047' },
      { text: '() {', color: '#fbf9f3' },
    ],
    [
      { text: '  return (', color: '#c084fc' },
    ],
    [
      { text: '    <section ', color: '#38bdf8' },
      { text: 'className', color: '#fcd34d' },
      { text: '=', color: '#fbf9f3' },
      { text: '"bg-surface text-on-surface px-14"', color: '#86efac' },
      { text: '>', color: '#38bdf8' },
    ],
    [
      { text: '      <Header ', color: '#38bdf8' },
      { text: 'status', color: '#fcd34d' },
      { text: '=', color: '#fbf9f3' },
      { text: '"AVAILABLE"', color: '#86efac' },
      { text: ' />', color: '#38bdf8' },
    ],
    [
      { text: '      <span ', color: '#38bdf8' },
      { text: 'className', color: '#fcd34d' },
      { text: '=', color: '#fbf9f3' },
      { text: '"chip-specimen"', color: '#86efac' },
      { text: '>AUREOLIN BOTANICA</span>', color: '#fbf9f3' },
    ],
    [
      { text: '      <h1 ', color: '#38bdf8' },
      { text: 'className', color: '#fcd34d' },
      { text: '=', color: '#fbf9f3' },
      { text: '"font-serif text-display-hero"', color: '#86efac' },
      { text: '>', color: '#38bdf8' },
    ],
    [
      {
        text: '        Digital Craft & Creative Engineering',
        color: '#fbf9f3',
      },
    ],
    [
      { text: '      <button ', color: '#38bdf8' },
      { text: currentTyped, color: '#86efac' },
      { text: '>', color: '#38bdf8' },
    ],
    [
      { text: '        Explore Works', color: '#fbf9f3' },
    ],
    [
      { text: '      </button>', color: '#38bdf8' },
    ],
    [
      { text: '      <Projects ', color: '#38bdf8' },
      { text: 'columns', color: '#fcd34d' },
      { text: '={', color: '#fbf9f3' },
      { text: '2', color: '#f5d000' },
      { text: '} />', color: '#38bdf8' },
    ],
    [
      { text: '    </section>', color: '#38bdf8' },
    ],
    [
      { text: '  )', color: '#c084fc' },
    ],
    [
      { text: '}', color: '#fbf9f3' },
    ],
  ]

  ctx.font = '15.5px "Space Mono", monospace'
  codeLines.forEach((tokens, idx) => {
    const lineNum = idx + 1
    const ly = 104 + idx * 34

    // Line number
    ctx.fillStyle = lineNum === activeLine ? '#f5d000' : '#52525b'
    ctx.fillText(String(lineNum).padStart(2, ' '), 264, ly)

    // Code tokens
    let tx = 306
    tokens.forEach((tok) => {
      ctx.fillStyle = tok.color
      ctx.fillText(tok.text, tx, ly)
      tx += ctx.measureText(tok.text).width
    })

    // Blinking Editor Caret on Line 11
    if (lineNum === 11 && Math.sin(t * 7) > -0.2) {
      const caretX =
        306 + ctx.measureText('      <button ' + currentTyped).width
      ctx.fillStyle = '#f5d000'
      ctx.fillRect(caretX, ly - 16, 8, 20)
    }
  })

  // 5. Right Minimap (x: 984..1050, y: 74..668)
  ctx.fillStyle = '#17171b'
  ctx.fillRect(984, 74, 66, 594)
  ctx.fillStyle = 'rgba(245, 208, 0, 0.14)'
  ctx.fillRect(988, 82, 58, 95)
  for (let m = 0; m < 22; m++) {
    ctx.fillStyle =
      m % 4 === 0 ? '#38bdf8' : m % 3 === 0 ? '#f5d000' : '#52525b'
    ctx.fillRect(992 + (m % 3) * 6, 90 + m * 18, 18 + ((m * 11) % 24), 4)
  }

  // 6. Bottom Integrated Terminal Panel (x: 251..1050, y: 668..818)
  ctx.fillStyle = '#141417'
  ctx.fillRect(251, 668, 799, 150)
  ctx.fillStyle = '#27272c'
  ctx.fillRect(251, 668, 799, 1.5)

  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillStyle = '#787882'
  ctx.fillText('PROBLEMS 0    OUTPUT    DEBUG CONSOLE', 268, 694)
  ctx.fillStyle = '#fbf9f3'
  ctx.fillText('TERMINAL', 595, 694)
  ctx.fillStyle = '#f5d000'
  ctx.fillRect(595, 700, 68, 2)

  ctx.font = '14px "Space Mono", monospace'
  ctx.fillStyle = '#86efac'
  ctx.fillText('➜  Local:   http://localhost:5173/  •  Stitch Design System Ready', 268, 730)

  const logIdx = Math.floor(t / 3.5) % TERMINAL_LOGS.length
  ctx.fillStyle = '#d4d4d8'
  ctx.fillText(`●  ${TERMINAL_LOGS[logIdx]}`, 268, 760)
  ctx.fillStyle = '#cbe6d0'
  ctx.fillText('PS D:\\My Works\\my-portfolio> npm run dev -- --host', 268, 790)

  // 7. Bottom VS Code Status Bar (x: 0..1050, y: 818..850)
  ctx.fillStyle = '#101013'
  ctx.fillRect(0, 818, HALF_W, 32)
  ctx.fillStyle = '#cbe6d0'
  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillText('⎇ main*   ⊗ 0  ⚠ 0', 18, 839)
  ctx.fillStyle = '#d4d4d8'
  ctx.fillText(
    `Ln ${activeLine}, Col ${15 + currentTyped.length}   UTF-8   TypeScript JSX   ✓ Prettier`,
    590,
    839,
  )

  // Center 50/50 Vertical Split Divider
  ctx.fillStyle = '#383842'
  ctx.fillRect(HALF_W - 2, 0, 4, CANVAS_H)

  // ============================================================================
  // RIGHT 50% (1050 .. 2100): FIGMA — DARK UI/UX DESIGN APPLICATION
  // ============================================================================
  const FX = HALF_W // 1050
  ctx.fillStyle = '#1e1e1e'
  ctx.fillRect(FX, 0, HALF_W, CANVAS_H)

  // Active Figma Selection State
  const targetIdx = Math.floor(t / 3.8) % FIGMA_TARGETS.length
  const nextIdx = (targetIdx + 1) % FIGMA_TARGETS.length
  const transitionPhase = THREE.MathUtils.clamp(((t % 3.8) - 2.8) / 1.0, 0, 1)
  const smoothPhase =
    transitionPhase * transitionPhase * (3 - 2 * transitionPhase)

  const activeNode = FIGMA_TARGETS[targetIdx]
  const nextNode = FIGMA_TARGETS[nextIdx]
  const propPulse = Math.round(Math.sin(t * 2.2) * 2)

  // 1. Top Figma Toolbar (y: 0..46)
  ctx.fillStyle = '#2c2c2c'
  ctx.fillRect(FX, 0, HALF_W, 46)
  ctx.fillStyle = '#383838'
  ctx.fillRect(FX, 46, HALF_W, 1.5)

  // Active Move Tool Blue Square
  ctx.fillStyle = '#0d99ff'
  roundRect(ctx, FX + 16, 8, 30, 30, 5)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 15px "Space Mono", monospace'
  ctx.fillText('↖', FX + 24, 28)

  ctx.fillStyle = '#b3b3b3'
  ctx.fillText('#   □   ✒   T   ✋', FX + 60, 28)

  // File Title Center
  ctx.fillStyle = '#999999'
  ctx.font = '14px "Space Mono", monospace'
  ctx.fillText('Drafts /', FX + 365, 28)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 14px "Space Mono", monospace'
  ctx.fillText('Aureolin_Portfolio_v2 ▾', FX + 442, 28)

  // Right Share Button & Zoom
  ctx.fillStyle = '#0d99ff'
  roundRect(ctx, FX + 905, 10, 68, 26, 5)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillText('Share', FX + 918, 28)

  ctx.fillStyle = '#d4d4d8'
  ctx.fillText('75% ▾', FX + 986, 28)

  // 2. Left Figma Sidebar — Pages & Layers (x: FX..FX+210, y: 47..850)
  ctx.fillStyle = '#252525'
  ctx.fillRect(FX, 47, 210, CANVAS_H - 47)
  ctx.fillStyle = '#383838'
  ctx.fillRect(FX + 210, 47, 1.5, CANVAS_H - 47)

  ctx.fillStyle = '#8c8c8c'
  ctx.font = 'bold 12px "Space Mono", monospace'
  ctx.fillText('PAGES', FX + 16, 74)

  ctx.fillStyle = '#383838'
  roundRect(ctx, FX + 10, 84, 190, 26, 4)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = '13px "Space Mono", monospace'
  ctx.fillText('01 // Desktop Web', FX + 20, 102)
  ctx.fillStyle = '#8c8c8c'
  ctx.fillText('02 // Stitch Tokens', FX + 20, 130)

  ctx.fillStyle = '#383838'
  ctx.fillRect(FX, 146, 210, 1)

  ctx.fillStyle = '#8c8c8c'
  ctx.font = 'bold 12px "Space Mono", monospace'
  ctx.fillText('LAYERS', FX + 16, 172)

  ctx.fillStyle = '#0d99ff'
  ctx.font = 'bold 13.5px "Space Mono", monospace'
  ctx.fillText('# Desktop - 1440', FX + 16, 200)

  const figmaLayers = [
    { label: '⊞ Header_Nav', match: '' },
    { label: 'T Hero_Typography', match: 'Hero_Typography' },
    { label: '□ CTA_Button_Primary', match: 'CTA_Button_Primary' },
    { label: '⊞ Projects_Grid_2Col', match: 'Projects_Grid_2Col' },
    { label: '  ▭ Specimen_Card_01', match: '' },
    { label: '  ▭ Specimen_Card_02', match: '' },
    { label: '  ▭ Telemetry_Footer', match: '' },
  ]

  figmaLayers.forEach((layer, idx) => {
    const ly = 232 + idx * 34
    const isSel = layer.match === activeNode.name
    if (isSel) {
      ctx.fillStyle = 'rgba(13, 153, 255, 0.25)'
      ctx.fillRect(FX + 2, ly - 20, 206, 28)
      ctx.fillStyle = '#0d99ff'
      ctx.fillRect(FX + 2, ly - 20, 3, 28)
    }
    ctx.fillStyle = isSel ? '#ffffff' : '#b3b3b3'
    ctx.font = isSel
      ? 'bold 13px "Space Mono", monospace'
      : '13px "Space Mono", monospace'
    ctx.fillText(layer.label, FX + 24, ly)
  })

  // 3. Center Figma Infinite Canvas (x: FX+211..FX+820, y: 47..850)
  const CX = FX + 211
  const CW = 609
  ctx.fillStyle = '#161616'
  ctx.fillRect(CX, 47, CW, CANVAS_H - 47)

  // Subtle Canvas Rulers
  ctx.fillStyle = '#222222'
  ctx.fillRect(CX, 47, CW, 18)
  ctx.fillStyle = '#6e6e77'
  ctx.font = '11px "Space Mono", monospace'
  ctx.fillText('0        360        720        1080        1440', CX + 48, 60)

  // ==========================================================================
  // WEBSITE ARTBOARD ON FIGMA CANVAS (Matches the React Code in VS Code!)
  // ==========================================================================
  const AX = CX + 52
  const AY = 104
  const AW = 506
  const AH = 496

  // Frame Title Above Artboard
  ctx.fillStyle = '#0d99ff'
  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillText('Desktop - 1440 × 900   •   Component #PortfolioHero', AX, AY - 10)

  // Artboard Paper Surface (#fbf9f3 from Stitch Design System)
  ctx.fillStyle = '#fbf9f3'
  roundRect(ctx, AX, AY, AW, AH, 6)
  ctx.fill()

  // A. Website Header Bar inside Artboard
  ctx.fillStyle = '#f0eee8'
  roundRect(ctx, AX + 20, AY + 20, AW - 40, 42, 21)
  ctx.fill()
  ctx.strokeStyle = '#cfc6ab'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = '#f5d000'
  ctx.beginPath()
  ctx.arc(AX + 40, AY + 41, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#1b1c19'
  ctx.font = 'bold 12.5px "Space Mono", monospace'
  ctx.fillText('AUREOLIN // STUDIO', AX + 54, AY + 46)

  ctx.fillStyle = '#4c4732'
  ctx.font = '12px "Space Mono", monospace'
  ctx.fillText('01. INDEX   02. WORKS   03. LAB', AX + 210, AY + 46)

  ctx.fillStyle = '#cbe6d0'
  roundRect(ctx, AX + AW - 108, AY + 28, 78, 26, 13)
  ctx.fill()
  ctx.fillStyle = '#354c3b'
  ctx.font = 'bold 11px "Space Mono", monospace'
  ctx.fillText('AVAILABLE', AX + AW - 100, AY + 45)

  // B. Website Hero Section inside Artboard
  // Specimen Pill Badge
  ctx.fillStyle = '#f0eee8'
  roundRect(ctx, AX + 24, AY + 94, 172, 26, 13)
  ctx.fill()
  ctx.strokeStyle = '#cfc6ab'
  ctx.stroke()
  ctx.fillStyle = '#6f5d00'
  ctx.font = 'bold 11.5px "Space Mono", monospace'
  ctx.fillText('● AUREOLIN BOTANICA', AX + 36, AY + 111)

  // Editorial Serif Headline (Matches Line 9-10 in VS Code!)
  ctx.fillStyle = '#1b1c19'
  ctx.font = '32px "Newsreader", Georgia, serif'
  ctx.fillText('Digital Craft &', AX + 24, AY + 156)
  ctx.fillStyle = '#4c4732'
  ctx.font = 'italic 32px "Newsreader", Georgia, serif'
  ctx.fillText('Creative Engineering', AX + 24, AY + 194)

  // C. Website Primary Action Pill Button (Matches Line 11 in VS Code!)
  ctx.fillStyle = '#f5d000'
  roundRect(ctx, AX + 22, AY + 232, 186, 44, 22)
  ctx.fill()
  ctx.fillStyle = '#6a5900'
  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillText('EXPLORE WORKS ↗', AX + 46, AY + 259)

  // Secondary Button
  ctx.fillStyle = '#f0eee8'
  roundRect(ctx, AX + 222, AY + 232, 146, 44, 22)
  ctx.fill()
  ctx.strokeStyle = '#cfc6ab'
  ctx.stroke()
  ctx.fillStyle = '#1b1c19'
  ctx.fillText('ARCHIVE', AX + 266, AY + 259)

  // D. Website Project Cards Grid (Matches <Projects columns={2} /> in VS Code!)
  const cards = [
    {
      x: AX + 22,
      bannerBg: '#30312d',
      tag: '01 // 3D WORKSPACE',
      tagColor: '#f5d000',
      title: 'Spatial Studio Hero',
      sub: 'React Three Fiber • WebGL',
    },
    {
      x: AX + 262,
      bannerBg: '#cbe6d0',
      tag: '02 // DESIGN SYSTEM',
      tagColor: '#354c3b',
      title: 'Aureolin Botanica',
      sub: 'Figma Tokens • Tailwind',
    },
  ]

  cards.forEach((c) => {
    ctx.fillStyle = '#f5f3ee'
    roundRect(ctx, c.x, AY + 300, 222, 170, 12)
    ctx.fill()
    ctx.strokeStyle = '#cfc6ab'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Card Visual Header
    ctx.fillStyle = c.bannerBg
    roundRect(ctx, c.x + 12, AY + 312, 198, 76, 8)
    ctx.fill()

    ctx.fillStyle = c.tagColor
    ctx.font = 'bold 11px "Space Mono", monospace'
    ctx.fillText(c.tag, c.x + 24, AY + 355)

    ctx.fillStyle = '#1b1c19'
    ctx.font = 'bold 18px "Newsreader", Georgia, serif'
    ctx.fillText(c.title, c.x + 14, AY + 418)

    ctx.fillStyle = '#4c4732'
    ctx.font = '12px "Space Mono", monospace'
    ctx.fillText(c.sub, c.x + 14, AY + 444)
  })

  // E. Active Figma Selection Outline, Resize Handles & Dimension Pill
  const selX = AX + activeNode.x
  const selY = AY + activeNode.y
  const selW = activeNode.w + propPulse
  const selH = activeNode.h

  ctx.strokeStyle = '#0d99ff'
  ctx.lineWidth = 2.5
  ctx.strokeRect(selX, selY, selW, selH)

  // 4 Corner Resize Handles
  const corners = [
    [selX - 5, selY - 5],
    [selX + selW - 5, selY - 5],
    [selX - 5, selY + selH - 5],
    [selX + selW - 5, selY + selH - 5],
  ]
  corners.forEach(([hx, hy]) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(hx, hy, 10, 10)
    ctx.strokeStyle = '#0d99ff'
    ctx.lineWidth = 2
    ctx.strokeRect(hx, hy, 10, 10)
  })

  // Blue Dimension Badge Under Selected Element
  const badgeText = `${activeNode.dispW + propPulse} × ${activeNode.dispH}`
  ctx.fillStyle = '#0d99ff'
  roundRect(ctx, selX + selW / 2 - 48, selY + selH + 6, 96, 22, 4)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px "Space Mono", monospace'
  ctx.fillText(badgeText, selX + selW / 2 - 36, selY + selH + 21)

  // F. Animated Designer Cursor Moving Smoothly Across the Figma Canvas
  const curX =
    AX +
    THREE.MathUtils.lerp(activeNode.cursorX, nextNode.cursorX, smoothPhase) +
    Math.sin(t * 2.5) * 6
  const curY =
    AY +
    THREE.MathUtils.lerp(activeNode.cursorY, nextNode.cursorY, smoothPhase) +
    Math.cos(t * 2.0) * 4

  // Cursor Arrow Triangle
  ctx.fillStyle = '#0d99ff'
  ctx.beginPath()
  ctx.moveTo(curX, curY)
  ctx.lineTo(curX + 6, curY + 22)
  ctx.lineTo(curX + 12, curY + 15)
  ctx.lineTo(curX + 21, curY + 14)
  ctx.closePath()
  ctx.fill()

  // Cursor Name Tag Pill
  ctx.fillStyle = '#0d99ff'
  roundRect(ctx, curX + 14, curY + 18, 118, 24, 5)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px "Space Mono", monospace'
  ctx.fillText('UI/UX • Live', curX + 24, curY + 34)

  // 4. Right Figma Properties Panel — Design / Prototype / Inspect (x: FX+820..2100)
  const PX = FX + 820
  const PW = 230
  ctx.fillStyle = '#252525'
  ctx.fillRect(PX, 47, PW, CANVAS_H - 47)
  ctx.fillStyle = '#383838'
  ctx.fillRect(PX, 47, 1.5, CANVAS_H - 47)

  // Tabs
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillText('Design', PX + 16, 76)
  ctx.fillStyle = '#0d99ff'
  ctx.fillRect(PX + 16, 84, 52, 2.5)

  ctx.fillStyle = '#8c8c8c'
  ctx.font = '13px "Space Mono", monospace'
  ctx.fillText('Prototype   Inspect', PX + 82, 76)

  ctx.fillStyle = '#383838'
  ctx.fillRect(PX, 90, PW, 1)

  // Selected Node Name
  ctx.fillStyle = '#0d99ff'
  ctx.font = 'bold 13.5px "Space Mono", monospace'
  ctx.fillText(activeNode.name, PX + 16, 120)

  // X / Y / W / H / Radius Fields
  const propsGrid = [
    { label: 'X', val: String(activeNode.x), x: PX + 16, y: 136 },
    { label: 'Y', val: String(activeNode.y), x: PX + 122, y: 136 },
    {
      label: 'W',
      val: String(activeNode.dispW + propPulse),
      x: PX + 16,
      y: 174,
      highlight: true,
    },
    { label: 'H', val: String(activeNode.dispH), x: PX + 122, y: 174 },
  ]

  propsGrid.forEach((p) => {
    ctx.fillStyle = '#1c1c1c'
    roundRect(ctx, p.x, p.y, 92, 28, 4)
    ctx.fill()
    if (p.highlight) {
      ctx.strokeStyle = '#0d99ff'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    ctx.fillStyle = '#777777'
    ctx.font = '12.5px "Space Mono", monospace'
    ctx.fillText(p.label, p.x + 10, p.y + 19)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12.5px "Space Mono", monospace'
    ctx.fillText(p.val, p.x + 38, p.y + 19)
  })

  // Corner Radius Row
  ctx.fillStyle = '#1c1c1c'
  roundRect(ctx, PX + 16, 212, 198, 28, 4)
  ctx.fill()
  ctx.fillStyle = '#8c8c8c'
  ctx.font = '12.5px "Space Mono", monospace'
  ctx.fillText('Corner Radius', PX + 26, 231)
  ctx.fillStyle = '#f5d000'
  ctx.font = 'bold 12.5px "Space Mono", monospace'
  ctx.fillText(`${activeNode.radius}px`, PX + 152, 231)

  ctx.fillStyle = '#383838'
  ctx.fillRect(PX, 256, PW, 1)

  // Auto Layout Section
  ctx.fillStyle = '#8c8c8c'
  ctx.font = 'bold 12px "Space Mono", monospace'
  ctx.fillText('AUTO LAYOUT', PX + 16, 284)

  ctx.fillStyle = '#1c1c1c'
  roundRect(ctx, PX + 16, 296, 92, 28, 4)
  ctx.fill()
  ctx.fillStyle = '#777777'
  ctx.fillText('Gap', PX + 24, 315)
  ctx.fillStyle = '#ffffff'
  ctx.fillText('16px', PX + 58, 315)

  ctx.fillStyle = '#1c1c1c'
  roundRect(ctx, PX + 122, 296, 92, 28, 4)
  ctx.fill()
  ctx.fillStyle = '#777777'
  ctx.fillText('Pad', PX + 130, 315)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${activeNode.pad + propPulse}px`, PX + 164, 315)

  ctx.fillStyle = '#383838'
  ctx.fillRect(PX, 340, PW, 1)

  // Typography Section
  ctx.fillStyle = '#8c8c8c'
  ctx.font = 'bold 12px "Space Mono", monospace'
  ctx.fillText('TYPOGRAPHY', PX + 16, 368)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13.5px "Space Mono", monospace'
  ctx.fillText('Newsreader / Space Mono', PX + 16, 392)
  ctx.fillStyle = '#9ca3af'
  ctx.font = '12.5px "Space Mono", monospace'
  ctx.fillText('Regular • 4.5rem • -2.5%', PX + 16, 414)

  ctx.fillStyle = '#383838'
  ctx.fillRect(PX, 432, PW, 1)

  // Fill Token Section
  ctx.fillStyle = '#8c8c8c'
  ctx.font = 'bold 12px "Space Mono", monospace'
  ctx.fillText('FILL — STITCH TOKEN', PX + 16, 460)

  ctx.fillStyle = '#1c1c1c'
  roundRect(ctx, PX + 16, 474, 198, 46, 6)
  ctx.fill()

  ctx.fillStyle = activeNode.fillHex
  roundRect(ctx, PX + 26, 484, 26, 26, 4)
  ctx.fill()
  ctx.strokeStyle = '#52525b'
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px "Space Mono", monospace'
  ctx.fillText(activeNode.fillHex, PX + 62, 496)
  ctx.fillStyle = '#9ca3af'
  ctx.font = '11.5px "Space Mono", monospace'
  ctx.fillText(activeNode.fillName, PX + 62, 513)

  ctx.restore()
}

export function MonitorScreenSurface() {
  const { gl } = useThree()
  const { isAnyObjectOpen } = useWorkspaceFocus()
  const { stage } = useRoomEntrance()
  const lastDrawRef = useRef<number>(-1)

  const { canvas, ctx, texture } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = Math.round(CANVAS_W * RENDER_SCALE)
    c.height = Math.round(CANVAS_H * RENDER_SCALE)
    const context = c.getContext('2d')

    if (context) {
      drawSplitWorkspace(context, 0)
    }

    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 4)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    tex.needsUpdate = true

    return { canvas: c, ctx: context, texture: tex }
  }, [gl])

  // Only redraw when the user is actually inside the room overview (paused at entrance or when inspecting another object)
  useFrame(({ clock }) => {
    if (!ctx) return
    if (stage !== 'WORKSPACE' || isAnyObjectOpen) return

    const t = clock.getElapsedTime()
    if (t - lastDrawRef.current < 0.35) return
    lastDrawRef.current = t

    drawSplitWorkspace(ctx, t)
    texture.needsUpdate = true
  })

  void canvas

  return (
    <mesh position={[0, 0, 0.0125]} raycast={() => null}>
      <planeGeometry args={[0.84, 0.34]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}
