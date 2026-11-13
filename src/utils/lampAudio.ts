/**
 * Synthesizes a tactile mechanical switch click / toggle sound for the desk lamp.
 */
class LampAudioController {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  playClick(isTurningOn: boolean) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Crisp mechanical snap transient
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(isTurningOn ? 850 : 620, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.045)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.045)

    // Warm electrical hum swell if turning on
    if (isTurningOn) {
      const humOsc = ctx.createOscillator()
      const humGain = ctx.createGain()
      humOsc.type = 'sine'
      humOsc.frequency.setValueAtTime(120, now + 0.02)
      humOsc.frequency.linearRampToValueAtTime(240, now + 0.18)

      humGain.gain.setValueAtTime(0.001, now + 0.02)
      humGain.gain.linearRampToValueAtTime(0.08, now + 0.08)
      humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      humOsc.connect(humGain)
      humGain.connect(ctx.destination)

      humOsc.start(now + 0.02)
      humOsc.stop(now + 0.25)
    }
  }
}

export const lampAudio = new LampAudioController()

