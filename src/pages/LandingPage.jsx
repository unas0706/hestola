import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HESTOLA_MARK_PATH } from '@/components/brand/mark-path'
import HeroRail from '@/components/home/HeroRail'
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button'
import { DEMO_RAIL_PRODUCTS } from '@/data/demo-products'
import { playClick, playHangersSettle, playHover, playLightOn, playRailDraw, playRailSlide } from '@/lib/sound'
import './landing.css'

// Landing page: a room painted Hestola orange, lit by three spots, with the brand sign on
// the back wall and the new drop hanging on a rail below it. No navigation; one button.
//
// Sequence after the intro: the lights come on, the rail draws across the wall from left to
// right, the pieces glide in along it from the left, then "Explore Hestola" appears. The
// store behind that button is not built yet, so it says so.
//
// `reveal`:
//   'wait'     the intro is still covering the page; the room waits with its lights off
//   { logo, word, tag }  intro end-frame boxes: the sign moves from there into place and the
//              lights come on
//   'instant'  no intro (reduced motion): the room is shown lit, without motion

// Spots across the back wall, as a share of its width.
const SPOTS = [0.2, 0.5, 0.8]

const RAIL_AFTER_LIGHTS = 1900 // ms after the lights start coming on
const RAIL_DRAW = 800 // ms the rail takes to draw in; matches .room-railzone.is-drawing
const NOTICE_FOR = 3200
// Sound timing, in step with the CSS and the rail: spots click on at 1.35 s + i x 0.22 s
// (.room-scallop transition), the glide lasts 1.6 s (SLIDE_MS in product-rail-gallery.jsx).
const LIGHT_AT = (i) => 1350 + i * 220
const GLIDE = 1600

// "Explore Hestola" in the brand's call-to-action style (as CtaLink): orange face, ink label,
// an ink fill rising on hover/focus with the label turning ivory. The liquid-metal rim is
// tinted with the spotlights' warm light.
const EXPLORE_THEME = {
  tint: [1, 0.82, 0.68, 1],
  face: '#D9541E',
  label: '#111111',
  labelShadow: 'none',
  font: { fontFamily: "'Inter Variable', Inter, sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.01em' },
  fill: '#111111',
  fillLabel: '#F3EEE3',
}

// A piece's height that fits the space for the rail: the rail stage is 1.12 x the piece
// height + 22 px (see the stage height in product-rail-gallery.jsx), and phones add the
// carousel dots.
const pieceHeightFor = (space) => Math.max(160, Math.floor((space - 36) / 1.12))

// Room geometry in % of the viewport (keep in step with .room in landing.css).
const ROOMS = {
  wide: { t: 11, f: 70 },
  narrow: { t: 7, f: 82 },
}

// Floor joints: lines running to the vanishing point, plus cross joints spaced in perspective.
function Joints({ t, f, className }) {
  const s = (100 - f + t) / 2
  const vy = (t / s) * 50 // vanishing point height (x is 50)
  const atBottom = (x) => 50 + ((x - 50) * (100 - vy)) / (f - vy)
  const runs = Array.from({ length: 8 }, (_, i) => s + ((100 - 2 * s) * (i + 0.5)) / 8)
  const near = 1 / (100 - vy)
  const far = 1 / (f - vy)
  const cross = [1, 2].map((k) => vy + 1 / (far - ((far - near) * k) / 3))
  // The floor's left edge runs from (s, f) to (0, 100).
  const halfWidthAt = (y) => 50 - (s * (100 - y)) / (100 - f)
  return (
    <svg className={`room-joints ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {runs.map((x) => (
        <line key={x} x1={x} y1={f} x2={atBottom(x)} y2={100} />
      ))}
      {cross.map((y) => {
        const half = halfWidthAt(y)
        return <line key={y} x1={50 - half} y1={y} x2={50 + half} y2={y} />
      })}
    </svg>
  )
}

export default function LandingPage({ reveal }) {
  const logoRef = useRef(null)
  const wordRef = useRef(null)
  const tagRef = useRef(null)
  const zoneRef = useRef(null)
  const state = reveal === 'wait' ? 'dark' : reveal === 'instant' ? 'instant' : 'lit'
  const instant = state === 'instant'
  const [railIn, setRailIn] = useState(instant)
  const [ready, setReady] = useState(instant)
  const [pieceHeight, setPieceHeight] = useState(0)
  const [notice, setNotice] = useState(false)

  // Start loading the photos while the intro plays.
  useEffect(() => {
    DEMO_RAIL_PRODUCTS.forEach(({ images }) => Object.values(images ?? {}).forEach((src) => { new Image().src = src }))
  }, [])

  // Hang the rail once the lights are coming on; each spot clicks on as its light appears.
  useEffect(() => {
    if (state !== 'lit') return
    const timers = [
      window.setTimeout(() => setRailIn(true), RAIL_AFTER_LIGHTS),
      ...SPOTS.map((_, i) => window.setTimeout(playLightOn, LIGHT_AT(i))),
    ]
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [state])

  // Rail sounds: the rod slides into place, the hangers run along it, then knock as they settle.
  useEffect(() => {
    if (!railIn || instant) return
    playRailDraw(RAIL_DRAW / 1000)
    const timers = [
      window.setTimeout(() => playRailSlide(GLIDE / 1000), RAIL_DRAW),
      window.setTimeout(() => playHangersSettle(DEMO_RAIL_PRODUCTS.length), RAIL_DRAW + GLIDE * 0.9),
    ]
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [railIn, instant])

  // Size the pieces to the space under the sign.
  useLayoutEffect(() => {
    const zone = zoneRef.current
    if (!zone) return
    const measure = () => setPieceHeight(pieceHeightFor(zone.clientHeight))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(zone)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(false), NOTICE_FOR)
    return () => window.clearTimeout(timer)
  }, [notice])

  // Move each part of the sign from where the intro left it (FLIP).
  useLayoutEffect(() => {
    if (!reveal || typeof reveal !== 'object') return
    const parts = [
      [logoRef.current, reveal.logo],
      [wordRef.current, reveal.word],
      [tagRef.current, reveal.tag],
    ]
    const animations = parts.map(([el, from]) => {
      if (!el || !from?.width) return null
      const to = el.getBoundingClientRect()
      if (!to.width) return null
      const scale = from.width / to.width
      return el.animate(
        [{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})` }, { transform: 'none' }],
        { duration: 1400, delay: 250, easing: 'cubic-bezier(0.65, 0, 0.25, 1)', fill: 'backwards' },
      )
    })
    return () => animations.forEach((animation) => animation?.cancel())
  }, [reveal])

  return (
    <main className="room" data-state={state} data-ready={ready || undefined}>
      <div className="room-ceiling" aria-hidden="true" />
      <div className="room-side is-left" aria-hidden="true" />
      <div className="room-side is-right" aria-hidden="true" />
      <div className="room-floor" aria-hidden="true" />
      <Joints {...ROOMS.wide} className="is-wide" />
      <Joints {...ROOMS.narrow} className="is-narrow" />

      <div className="room-back" aria-hidden="true">
        <div className="room-ambient" />
        <svg className="room-grain" preserveAspectRatio="none">
          <filter id="room-plaster">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="4" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.35" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#room-plaster)" />
        </svg>
        {SPOTS.map((x, i) => (
          <div key={x} className="room-scallop" style={{ '--x': x, '--i': i }} />
        ))}
        <div className="room-skirting" />
      </div>

      {SPOTS.map((x, i) => (
        <div key={`pool-${x}`} className="room-pool" style={{ '--x': x, '--i': i }} aria-hidden="true" />
      ))}
      <div className="room-track" aria-hidden="true" />
      {SPOTS.map((x, i) => (
        <div key={`spot-${x}`} className="room-spot" style={{ '--x': x, '--i': i }} aria-hidden="true" />
      ))}

      <div ref={zoneRef} className={`room-railzone${instant ? '' : ' is-drawing'}`}>
        <div className="room-rack">
          {railIn && pieceHeight > 0 && (
            <HeroRail
              products={DEMO_RAIL_PRODUCTS}
              bare
              hanger="wood"
              maxSize={pieceHeight}
              autoplay={ready}
              slideIn={instant ? undefined : RAIL_DRAW}
              onSlideInDone={() => setReady(true)}
            />
          )}
        </div>
      </div>

      <div className="room-dark" aria-hidden="true" />

      <div className="room-sign">
        <svg ref={logoRef} className="sign-part sign-logo" viewBox="8 17 420 417" aria-hidden="true">
          <path d={HESTOLA_MARK_PATH} fillRule="evenodd" fill="currentColor" />
        </svg>
        <h1 ref={wordRef} className="sign-part sign-word">
          HESTOLA
        </h1>
        <p ref={tagRef} className="sign-part sign-tag">
          WEAR YOUR IDENTITY
        </p>
      </div>

      <p className="room-notice" role="status" data-shown={notice || undefined}>
        {notice ? 'Not updated yet.' : ''}
      </p>
      <div className="room-explore" onPointerEnter={(event) => event.pointerType === 'mouse' && playHover()}>
        <LiquidMetalButton
          label="Explore Hestola"
          width={184}
          theme={EXPLORE_THEME}
          onClick={() => {
            playClick()
            setNotice(true)
          }}
        />
      </div>
    </main>
  )
}
