/**
 * Web Audio API procedural sound effects for realistic physical door interactions:
 * - Door knock (warm wooden tap resonance)
 * - Handle latch turn (metallic click & mechanical spring twist)
 * - Door unlock & latch bolt retract (crisp brass click)
 * - Door smooth creak / swing open
 */

class RoomEntranceAudioController {
  private ctx: AudioContext | null = null

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Warm natural double wooden door knock
   */
  playKnock() {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Knock 1
    this.synthesizeKnockTap(ctx, now)
    // Knock 2 (slightly softer and slightly higher pitched for natural variation)
    this.synthesizeKnockTap(ctx, now + 0.14, 1.05, 0.8)
  }

  private synthesizeKnockTap(
    ctx: AudioContext,
    time: number,
    pitchMult = 1.0,
    gainMult = 1.0,
  ) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    // Low woody fundamental pitch drop
    osc.frequency.setValueAtTime(140 * pitchMult, time)
    osc.frequency.exponentialRampToValueAtTime(45 * pitchMult, time + 0.08)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(450, time)

    gain.gain.setValueAtTime(0.35 * gainMult, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.14)
  }

  /**
   * Realistic metallic handle turn & spring latch click
   */
  playHandleTurn() {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(280, now)
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.09)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, now)
    filter.Q.setValueAtTime(3, now)

    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.11)
  }

  /**
   * Mechanical door unlock & bolt retract sound
   */
  playUnlock() {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Crisp high-frequency metallic click
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1200, now)
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.05)
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.07)

    // Secondary deep bolt release mechanical clunk
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(220, now + 0.04)
    osc2.frequency.exponentialRampToValueAtTime(70, now + 0.18)
    gain2.gain.setValueAtTime(0.3, now + 0.04)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.04)
    osc2.stop(now + 0.22)
  }

  /**
   * Subtle smooth wooden door swing open resonance
   */
  playDoorSwing() {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(90, now)
    osc.frequency.linearRampToValueAtTime(65, now + 0.7)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, now)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.85)
  }

  /**
   * Heavy architectural glass door slide / swing open & close sound
   */
  playGlassDoorSlide(isOpening: boolean) {
    const ctx = this.getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // 1. Crisp metallic latch release / engage click
    const clickOsc = ctx.createOscillator()
    const clickGain = ctx.createGain()
    clickOsc.type = 'triangle'
    clickOsc.frequency.setValueAtTime(isOpening ? 920 : 680, now)
    clickOsc.frequency.exponentialRampToValueAtTime(220, now + 0.05)
    clickGain.gain.setValueAtTime(0.2, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    clickOsc.connect(clickGain)
    clickGain.connect(ctx.destination)
    clickOsc.start(now)
    clickOsc.stop(now + 0.07)

    // 2. Smooth heavy aluminum track / hinge whoosh
    const glideOsc = ctx.createOscillator()
    const glideFilter = ctx.createBiquadFilter()
    const glideGain = ctx.createGain()

    glideOsc.type = 'sawtooth'
    glideOsc.frequency.setValueAtTime(isOpening ? 75 : 95, now + 0.04)
    glideOsc.frequency.linearRampToValueAtTime(isOpening ? 110 : 65, now + 0.55)

    glideFilter.type = 'bandpass'
    glideFilter.frequency.setValueAtTime(240, now + 0.04)
    glideFilter.Q.setValueAtTime(2.5, now + 0.04)

    glideGain.gain.setValueAtTime(0.001, now + 0.04)
    glideGain.gain.linearRampToValueAtTime(0.09, now + 0.16)
    glideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.62)

    glideOsc.connect(glideFilter)
    glideFilter.connect(glideGain)
    glideGain.connect(ctx.destination)

    glideOsc.start(now + 0.04)
    glideOsc.stop(now + 0.65)
  }
}

export const entranceAudio = new RoomEntranceAudioController()

