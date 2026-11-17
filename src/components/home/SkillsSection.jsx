import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tools } from '../../data/skills'

// 3D Isometric View Cube with Tool branding & wireframe edge styling
function ToolCube({
  tool,
  shape = 'cube',
  rotationY = 35,
  lightType = 'spot',
  brightness = 1.0,
  shadowDensity = 0.5,
  isWireframe = false,
}) {
  const meshRef = useRef(null)
  const edgesRef = useRef(null)
  const targetRotationY = (rotationY * Math.PI) / 180

  // Create canvas texture for tool label / icon on cube faces
  const faceTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Clean architectural face fill
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, 512, 512)

      // Inset technical grid / border
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 12
      ctx.strokeRect(32, 32, 448, 448)

      // Subtle crosshairs
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(256, 40)
      ctx.lineTo(256, 70)
      ctx.moveTo(256, 442)
      ctx.lineTo(256, 472)
      ctx.moveTo(40, 256)
      ctx.lineTo(70, 256)
      ctx.moveTo(442, 256)
      ctx.lineTo(472, 256)
      ctx.stroke()

      // Primary Brand Name Accent
      ctx.fillStyle = '#0a0a0a'
      ctx.font = 'bold 54px "Geist", -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(tool.name, 256, 256)

      // Technical Tag
      ctx.fillStyle = '#64748b'
      ctx.font = '600 24px monospace'
      ctx.fillText('TOOL • CORE', 256, 320)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [tool.name])

  // Geometry selector based on CAD form selection
  const geometry = useMemo(() => {
    switch (shape) {
      case 'cylinder':
        return new THREE.CylinderGeometry(1.2, 1.2, 2.2, 32)
      case 'pyramid':
        return new THREE.ConeGeometry(1.5, 2.2, 4)
      case 'sphere':
        return new THREE.IcosahedronGeometry(1.4, 3)
      case 'cube':
      default:
        return new THREE.BoxGeometry(2.1, 2.1, 2.1)
    }
  }, [shape])

  // Edges geometry for the crisp CAD wireframe lines
  const edgesGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(geometry, 24)
  }, [geometry])

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smoothly rotate towards the target yaw angle while adding a gentle floating wobble
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y,
        targetRotationY,
        4.0,
        delta
      )
      // Isometric tilt (pitch: ~25 deg)
      meshRef.current.rotation.x = 0.42
      meshRef.current.rotation.z = -0.15
    }
  })

  return (
    <group position={[0, 0.2, 0]}>
      {/* Main 3D Solid Form */}
      <mesh ref={meshRef} geometry={geometry}>
        {isWireframe ? (
          <meshBasicMaterial color="#ffffff" wireframe wireframeLinewidth={2} />
        ) : (
          <meshStandardMaterial
            map={faceTexture}
            roughness={0.25}
            metalness={0.08}
            color="#ffffff"
          />
        )}

        {/* Sharp High-Contrast Black CAD Outline Edges */}
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color="#0a0a0a" linewidth={2.5} />
        </lineSegments>
      </mesh>

      {/* Floating Floor Shadow Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
        raycast={() => null}
      >
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          transparent
          opacity={0.35 * shadowDensity}
          depthWrite={false}
          color="#0f172a"
        />
      </mesh>
    </group>
  )
}

/**
 * Interactive 3D Studio CAD Viewport Section for Skills & Tools
 * Inspired by the uploaded industrial 3D CAD interface design
 */
export default function SkillsSection() {
  const [selectedToolIndex, setSelectedToolIndex] = useState(0)
  const [activeForm, setActiveForm] = useState('cube') // 'cube' | 'sphere' | 'pyramid' | 'cylinder'
  const [rotationAngle, setRotationAngle] = useState(35)
  const [lightMode, setLightMode] = useState('spot') // 'spot' | 'area' | 'target' | 'sun'
  const [brightness, setBrightness] = useState(1.1)
  const [shadowDensity, setShadowDensity] = useState(0.65)
  const [activeTab, setActiveTab] = useState('rotation') // 'render' | 'rotation' | 'wireframe' | 'polygons'
  const isDraggingRotation = useRef(false)
  const startXRef = useRef(0)
  const startAngleRef = useRef(35)

  const activeTool = tools[selectedToolIndex] || tools[0]

  // Interactive Rotation Ring drag handler
  const handleRingPointerDown = (e) => {
    isDraggingRotation.current = true
    startXRef.current = e.clientX
    startAngleRef.current = rotationAngle
    e.target.setPointerCapture?.(e.pointerId)
  }

  const handleRingPointerMove = (e) => {
    if (!isDraggingRotation.current) return
    const deltaX = e.clientX - startXRef.current
    const newAngle = Math.round(startAngleRef.current + deltaX * 0.75)
    setRotationAngle((newAngle % 360 + 360) % 360)
  }

  const handleRingPointerUp = (e) => {
    isDraggingRotation.current = false
    e.target.releasePointerCapture?.(e.pointerId)
  }

  return (
    <section
      id="skills"
      aria-label="Skills & Tools 3D Workspace"
      className="relative w-full min-h-screen bg-[#dce1e6] text-[#1e293b] font-sans py-14 sm:py-20 px-4 sm:px-8 lg:px-14 flex flex-col justify-between select-none overflow-hidden border-t border-black/10"
    >
      {/* 1. Header Toolbar: Section Title, Forms Selector & Window Controls */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748b]">
            WORKSPACE 02 • CORE STACK
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black tracking-tight">
            Tools & Technical Studio
          </h2>
        </div>

        {/* Center: CAD Form Primitives Selector */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-black/10 shadow-sm">
          <span className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider pr-1">
            Forms:
          </span>
          {[
            { id: 'cube', label: 'Cube', icon: '◻' },
            { id: 'sphere', label: 'Sphere', icon: '○' },
            { id: 'pyramid', label: 'Pyramid', icon: '△' },
            { id: 'cylinder', label: 'Cylinder', icon: '⬭' },
          ].map((form) => (
            <button
              key={form.id}
              type="button"
              onClick={() => setActiveForm(form.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all duration-200 ${
                activeForm === form.id
                  ? 'bg-black text-white shadow-sm font-semibold'
                  : 'text-[#475569] hover:bg-black/5 hover:text-black'
              }`}
              title={`Switch 3D Geometry to ${form.label}`}
            >
              <span className="mr-1">{form.icon}</span>
              <span className="hidden md:inline">{form.label}</span>
            </button>
          ))}
        </div>

        {/* Window controls (Min / Max / Close aesthetic) */}
        <div className="hidden sm:flex items-center gap-3 text-[#64748b] font-mono text-sm">
          <button className="hover:text-black transition-colors" title="Minimize">−</button>
          <button className="hover:text-black transition-colors" title="Maximize">□</button>
          <button className="hover:text-black transition-colors" title="Close">×</button>
        </div>
      </div>

      {/* 2. Main 3-Column CAD Workspace Grid */}
      <div className="relative w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Column (3 Cols): Tools & Modes Palette */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
          {/* Studio Modes */}
          <div className="space-y-1.5 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-black/10 shadow-sm">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#64748b] pl-2">
              STUDIO MODES
            </span>
            {[
              { id: 'rotation', label: 'Rotation', icon: '⟳' },
              { id: 'render', label: 'Render Solid', icon: '❖' },
              { id: 'wireframe', label: 'Wireframe', icon: '◫' },
              { id: 'polygons', label: 'Polygons', icon: '⬡' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveTab(mode.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all duration-200 ${
                  activeTab === mode.id
                    ? 'bg-black text-white font-semibold shadow-md translate-x-1'
                    : 'text-[#334155] hover:bg-white/80 hover:text-black'
                }`}
              >
                <span className="text-base">{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Tools List Palette */}
          <div className="bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-black/10 shadow-sm flex flex-col max-h-[300px] overflow-y-auto space-y-1 pr-1.5 custom-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#64748b] pl-2 sticky top-0 bg-white/90 py-0.5">
              AVAILABLE TOOLS ({tools.length})
            </span>
            {tools.map((tool, idx) => {
              const isSelected = idx === selectedToolIndex
              return (
                <button
                  key={tool.name}
                  type="button"
                  onClick={() => setSelectedToolIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#ffd700] text-black font-bold shadow-sm'
                      : 'text-[#475569] hover:bg-white/80 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={tool.icon}
                      alt={tool.name}
                      className="w-4 h-4 object-contain filter grayscale group-hover:grayscale-0"
                    />
                    <span className="truncate">{tool.name}</span>
                  </div>
                  <span className="text-[10px] opacity-60">#{String(idx + 1).padStart(2, '0')}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Center Column (6 Cols): Main 3D Viewport with Orbit Degree Ring */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] order-1 lg:order-2">
          {/* 3D WebGL Canvas Viewport */}
          <div className="w-full h-[340px] sm:h-[420px] relative">
            <Canvas
              shadows
              camera={{ position: [0, 1.2, 5.2], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
            >
              {/* Dynamic Studio Lighting based on Right Panel controls */}
              <ambientLight intensity={0.5 * brightness} />
              {lightMode === 'spot' && (
                <spotLight
                  position={[3, 5, 4]}
                  intensity={2.2 * brightness}
                  angle={0.6}
                  penumbra={0.8}
                  castShadow
                />
              )}
              {lightMode === 'area' && (
                <directionalLight position={[-4, 4, 2]} intensity={1.8 * brightness} />
              )}
              {lightMode === 'target' && (
                <directionalLight position={[0, 6, 2]} intensity={2.0 * brightness} />
              )}
              {lightMode === 'sun' && (
                <directionalLight position={[5, 6, -3]} intensity={2.4 * brightness} />
              )}

              <Suspense fallback={null}>
                <ToolCube
                  tool={activeTool}
                  shape={activeForm}
                  rotationY={rotationAngle}
                  lightType={lightMode}
                  brightness={brightness}
                  shadowDensity={shadowDensity}
                  isWireframe={activeTab === 'wireframe'}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Interactive Degree Rotation Arc Ring directly underneath the 3D Cube */}
          <div className="relative mt-2 flex flex-col items-center">
            {/* Circular Orbit Track */}
            <div
              onPointerDown={handleRingPointerDown}
              onPointerMove={handleRingPointerMove}
              onPointerUp={handleRingPointerUp}
              className="relative w-48 sm:w-64 h-16 sm:h-20 border-b-2 border-black/25 rounded-b-full flex items-end justify-center cursor-ew-resize hover:border-black/60 transition-colors"
              title="Drag horizontally to rotate 3D tool cube"
            >
              {/* Rotating Indicator Needle / Tick */}
              <div
                className="absolute w-8 h-1.5 bg-black rounded-full bottom-0 transform -translate-y-0.5 shadow-sm"
                style={{
                  transform: `translateX(${(rotationAngle % 360 - 180) * 0.4}px)`,
                }}
              />
            </div>

            {/* Rotation Degree readout matching CAD interface */}
            <div className="mt-2 text-center">
              <span className="text-[10px] font-mono tracking-widest text-[#64748b] uppercase block">
                ROTATION
              </span>
              <span className="text-lg sm:text-xl font-mono font-bold text-black">
                {rotationAngle}°
              </span>
            </div>

            {/* Coordinate Axis Indicator */}
            <div className="absolute -left-12 bottom-1 hidden sm:flex flex-col text-[10px] font-mono text-[#64748b]">
              <span>▲ Y</span>
              <div className="flex gap-1 items-center">
                <span>◀ X</span>
                <span>Z ▶</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (3 Cols): Lighting & Material Property Controls */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-3 bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-black/10 shadow-sm">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#64748b]">
              LIGHTING MODES
            </span>

            {/* 2x2 Grid of Lighting Models */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'spot', label: 'Spot', icon: '◐' },
                { id: 'area', label: 'Area', icon: '◫' },
                { id: 'target', label: 'Target', icon: '↘' },
                { id: 'sun', label: 'Sun', icon: '☼' },
              ].map((light) => (
                <button
                  key={light.id}
                  type="button"
                  onClick={() => setLightMode(light.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-mono transition-all duration-200 ${
                    lightMode === light.id
                      ? 'bg-black text-white border-black font-semibold shadow-md'
                      : 'bg-white/80 text-[#334155] border-black/10 hover:border-black/30'
                  }`}
                >
                  <span className="text-lg mb-1">{light.icon}</span>
                  <span>{light.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders for Brightness & Shadow Density */}
          <div className="space-y-4 pt-2 border-t border-black/10">
            {/* Brightness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-[#475569]">
                <span>Brightness</span>
                <span className="font-semibold text-black">{Math.round(brightness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.05"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full accent-black h-1.5 bg-black/15 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Shadow Density Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-[#475569]">
                <span>Shadow Density</span>
                <span className="font-semibold text-black">{Math.round(shadowDensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={shadowDensity}
                onChange={(e) => setShadowDensity(parseFloat(e.target.value))}
                className="w-full accent-black h-1.5 bg-black/15 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Active Tool Information Card */}
          <div className="pt-2 border-t border-black/10">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#64748b] block mb-1">
              CURRENT FOCUS
            </span>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-black/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#ffd700]/20 flex items-center justify-center p-1.5 border border-[#ffd700]">
                <img src={activeTool.icon} alt={activeTool.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 truncate">
                <div className="text-xs font-mono font-bold text-black truncate">{activeTool.name}</div>
                <div className="text-[10px] font-mono text-[#64748b]">Production Tooling</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <div className="w-full max-w-7xl mx-auto pt-4 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#64748b] gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ENGINE: THREE.JS R187
          </span>
          <span>•</span>
          <span>FPS: 60 (LOCKED)</span>
        </div>
        <div>
          <span>CLICK TOOL IN LIST OR DRAG ROTATION RING TO INSPECT</span>
        </div>
      </div>
    </section>
  )
}
