// Sound effects for the intro and the landing room, synthesised with the Web Audio API
// (no audio files). Every effect is short (well under 3 s) and quiet.
//
// Browsers only let a page play sound after the visitor has clicked, tapped or pressed a
// key. Until then the audio context is suspended and effects are dropped, not queued, so
// nothing bursts out late. The first interaction unlocks sound for the rest of the visit.

const MASTER = 0.55

let ctx = null
let master = null
let noise = null
const groups = new Map() // name -> Set of scheduled sources, so a sequence can be cancelled

function context() {
  if (ctx || typeof window === 'undefined') return ctx
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  master = ctx.createGain()
  master.gain.value = MASTER
  master.connect(ctx.destination)
  const unlock = () => {
    if (ctx.state === 'suspended') ctx.resume()
  }
  for (const type of ['pointerdown', 'keydown', 'touchstart']) {
    window.addEventListener(type, unlock, { capture: true, passive: true })
  }
  return ctx
}

// Call early (before any effect) so the first interaction can unlock audio.
export function initSound() {
  context()
}

// Unlock audio from inside a click/tap/key handler; resolves once sound can play.
export function resumeSound() {
  const c = context()
  if (!c || c.state === 'running') return Promise.resolve()
  return c.resume().catch(() => {})
}

function ready() {
  const c = context()
  return c && c.state === 'running' ? c : null
}

function noiseBuffer(c) {
  if (noise) return noise
  noise = c.createBuffer(1, c.sampleRate, c.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

function track(group, source) {
  if (!group) return
  if (!groups.has(group)) groups.set(group, new Set())
  const set = groups.get(group)
  set.add(source)
  source.addEventListener('ended', () => set.delete(source))
}

// Stops everything scheduled in a group (e.g. the intro when it is skipped).
export function cancelSounds(group) {
  const set = groups.get(group)
  if (!set) return
  for (const source of set) {
    try {
      source.stop()
    } catch {
      // already stopped
    }
  }
  set.clear()
}

// Filtered noise with an attack/decay envelope.
function hiss(c, { at, duration, type = 'bandpass', freq = 1200, freqTo, q = 1, gain = 0.2, attack = 0.01, group }) {
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c)
  src.loop = true
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.Q.value = q
  filter.frequency.setValueAtTime(freq, at)
  if (freqTo) filter.frequency.exponentialRampToValueAtTime(freqTo, at + duration)
  const env = c.createGain()
  env.gain.setValueAtTime(0.0001, at)
  env.gain.exponentialRampToValueAtTime(gain, at + attack)
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  src.connect(filter).connect(env).connect(master)
  src.start(at, Math.random() * 0.5)
  src.stop(at + duration + 0.05)
  track(group, src)
  return { src, env, filter }
}

// A sine (or other wave) with a pitch glide and a decaying envelope.
function tone(c, { at, duration, freq, freqTo, type = 'sine', gain = 0.2, attack = 0.005, group }) {
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, at)
  if (freqTo) osc.frequency.exponentialRampToValueAtTime(freqTo, at + duration)
  const env = c.createGain()
  env.gain.setValueAtTime(0.0001, at)
  env.gain.exponentialRampToValueAtTime(gain, at + attack)
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  osc.connect(env).connect(master)
  osc.start(at)
  osc.stop(at + duration + 0.05)
  track(group, osc)
}

// Struck metal: a few inharmonic partials that ring and fade.
function ring(c, { at, base, duration = 0.45, gain = 0.08, group }) {
  for (const [ratio, level] of [[1, 1], [2.76, 0.55], [5.4, 0.3], [8.93, 0.15]]) {
    tone(c, { at, duration: duration / Math.sqrt(ratio), freq: base * ratio, gain: gain * level, attack: 0.002, group })
  }
}

// ---- Intro ---------------------------------------------------------------------------

// Brush swishes timed to the five mask strokes that draw the H (delay, duration in s, as
// in logo-intro.css / LogoIntro.jsx), then a low hit as the orange end frame comes in.
const STROKES = [[0.5, 1.7], [1, 1.4], [1.7, 1.4], [2.7, 0.7], [3.1, 0.8]]
export function playIntro() {
  const c = ready()
  if (!c) return
  const t0 = c.currentTime + 0.05
  STROKES.forEach(([delay, duration], i) => {
    hiss(c, { at: t0 + delay, duration: duration * 0.8, freq: 900 + i * 180, freqTo: 2400 + i * 200, q: 0.8, gain: 0.07, attack: 0.08, group: 'intro' })
  })
  hiss(c, { at: t0 + 3.6, duration: 1.1, type: 'highpass', freq: 5000, gain: 0.025, attack: 0.3, group: 'intro' }) // wordmark rises
  tone(c, { at: t0 + 6.3, duration: 1.6, freq: 92, freqTo: 48, gain: 0.32, attack: 0.04, group: 'intro' })
  hiss(c, { at: t0 + 6.3, duration: 0.9, type: 'lowpass', freq: 600, freqTo: 200, gain: 0.08, attack: 0.03, group: 'intro' })
}

// ---- Landing room ----------------------------------------------------------------------

// A spotlight switching on: switch click plus the relay's low thump.
export function playLightOn() {
  const c = ready()
  if (!c) return
  const at = c.currentTime + 0.01
  hiss(c, { at, duration: 0.03, type: 'highpass', freq: 2500, gain: 0.35, attack: 0.001 })
  tone(c, { at, duration: 0.16, freq: 110, freqTo: 55, gain: 0.25, attack: 0.002 })
  hiss(c, { at: at + 0.02, duration: 0.5, type: 'bandpass', freq: 120, q: 4, gain: 0.02, attack: 0.05 }) // brief hum
}

// The rail drawing across the wall: a rod sliding, ending in a clank at its bracket.
export function playRailDraw(duration = 0.8) {
  const c = ready()
  if (!c) return
  const at = c.currentTime + 0.01
  hiss(c, { at, duration, freq: 700, freqTo: 2600, q: 3, gain: 0.08, attack: 0.15 })
  ring(c, { at: at + duration - 0.05, base: 410, duration: 0.6, gain: 0.07 })
  tone(c, { at: at + duration - 0.05, duration: 0.1, freq: 160, freqTo: 80, gain: 0.18 })
}

// Hangers running along the rail as the pieces glide in: it builds as they speed up and
// fades as they slow (the glide is ease-in-out).
export function playRailSlide(duration = 1.6) {
  const c = ready()
  if (!c) return
  const at = c.currentTime + 0.01
  const { env } = hiss(c, { at, duration, freq: 1800, q: 2, gain: 0.07, attack: duration * 0.45 })
  env.gain.cancelScheduledValues(at)
  env.gain.setValueAtTime(0.0001, at)
  env.gain.exponentialRampToValueAtTime(0.07, at + duration * 0.5)
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  // Hook-on-rail chatter: an amplitude flutter that speeds up and slows with the pieces.
  const lfo = c.createOscillator()
  const depth = c.createGain()
  lfo.frequency.setValueAtTime(6, at)
  lfo.frequency.linearRampToValueAtTime(34, at + duration * 0.5)
  lfo.frequency.linearRampToValueAtTime(5, at + duration)
  depth.gain.value = 0.03
  lfo.connect(depth).connect(env.gain)
  lfo.start(at)
  lfo.stop(at + duration)
  // Low rumble of the rail itself.
  const rumble = hiss(c, { at, duration, type: 'lowpass', freq: 260, gain: 0.05, attack: duration * 0.45 })
  rumble.env.gain.cancelScheduledValues(at)
  rumble.env.gain.setValueAtTime(0.0001, at)
  rumble.env.gain.exponentialRampToValueAtTime(0.05, at + duration * 0.5)
  rumble.env.gain.exponentialRampToValueAtTime(0.0001, at + duration)
}

// Hangers knocking together as the pieces settle.
export function playHangersSettle(count = 10) {
  const c = ready()
  if (!c) return
  const start = c.currentTime + 0.01
  for (let i = 0; i < count; i++) {
    const at = start + i * 0.045 + Math.random() * 0.03
    ring(c, { at, base: 1500 + Math.random() * 900, duration: 0.12, gain: 0.03 + Math.random() * 0.02 })
  }
}

// "Explore Hestola": a quiet tick on hover, a metallic shing on click.
export function playHover() {
  const c = ready()
  if (!c) return
  tone(c, { at: c.currentTime + 0.005, duration: 0.05, freq: 2100, freqTo: 1800, gain: 0.05 })
}

export function playClick() {
  const c = ready()
  if (!c) return
  const at = c.currentTime + 0.005
  ring(c, { at, base: 880, duration: 0.7, gain: 0.06 })
  hiss(c, { at, duration: 0.35, type: 'highpass', freq: 3500, freqTo: 8000, gain: 0.06, attack: 0.01 })
  tone(c, { at, duration: 0.08, freq: 180, freqTo: 90, gain: 0.15 })
}
