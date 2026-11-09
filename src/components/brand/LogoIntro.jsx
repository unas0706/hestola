import { useCallback, useEffect, useRef, useState } from 'react'
import { HESTOLA_MARK_PATH } from '@/components/brand/mark-path'
import { enterFullscreen } from '@/lib/fullscreen'
import { cancelSounds, playIntro, resumeSound } from '@/lib/sound'
import './logo-intro.css'

// The animated logo intro from design/HESTOLA – Logo Intro.html, shown over the landing page
// on every app load. It is skippable (button, click/tap, Esc/Enter/Space) and never shown
// under prefers-reduced-motion (design.md §3.6).
//
// "Tap to enter": browsers only allow sound after the visitor interacts, so the intro opens
// on its black stage with one line. A tap/click or Enter/Space unlocks sound and starts the
// animation; Esc (or Skip) goes straight to the room.
//
// Hand-off: onLeave({ logo, word, tag, natural }) passes the screen boxes of the end frame's
// mark, wordmark and tagline so the landing page can move its own sign from there. At the
// natural end the intro is removed at once (its flat orange end frame matches the landing
// page's lights-off state); when skipped it fades out.

const LETTERS = ['H', 'E', 'S', 'T', 'O', 'L', 'A']
// Mask strokes that draw the mark: [stroke duration, delay, stroke width, path].
const STROKES = [
  ['1.7s', '.5s', 30, 'M138 410L196 225C208 150 218 100 212 78C195 70 150 100 128 160C118 190 125 208 150 207'],
  ['1.4s', '1s', 30, 'M379 30L282 410'],
  ['1.4s', '1.7s', 30, 'M24 344C120 310 280 262 414 222'],
  ['.7s', '2.7s', 14, 'M126 310L354 254'],
  ['.8s', '3.1s', 16, 'M355 208L362 182L376 198L382 176L394 196L408 184L408 210'],
]
const FINAL_AT = 7700 // the orange end frame has fully faded in (6.3s + 1.4s)
const HOLD = 400 // pause on the end frame before leaving
const LEAVE = 600 // matches the .logo-intro opacity transition

function Lockup({ children, wordRef, tagRef }) {
  return (
    <>
      {children}
      <div ref={wordRef} className="li-word">
        {LETTERS.map((letter, i) => (
          <span key={i} style={{ '--i': i }}>
            {letter}
          </span>
        ))}
      </div>
      <p ref={tagRef} className="li-tag">WEAR YOUR IDENTITY</p>
    </>
  )
}

export default function LogoIntro({ onLeave, onDone }) {
  const [entered, setEntered] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [started, setStarted] = useState(false)
  const [final, setFinal] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const leavingRef = useRef(false)
  const finLogo = useRef(null)
  const finWord = useRef(null)
  const finTag = useRef(null)
  const maskId = 'logo-intro-mask'

  const leave = useCallback((natural = false) => {
    if (leavingRef.current) return
    leavingRef.current = true
    const box = (ref) => ref.current?.getBoundingClientRect() ?? null
    onLeave?.({ logo: box(finLogo), word: box(finWord), tag: box(finTag), natural })
    if (natural) {
      onDone?.()
      return
    }
    cancelSounds('intro')
    setLeaving(true)
    window.setTimeout(() => onDone?.(), LEAVE)
  }, [onLeave, onDone])

  // Load the fonts while the gate shows (or give up after 1.5s), as the original does.
  useEffect(() => {
    let cancelled = false
    const fonts = document.fonts?.load
      ? Promise.all([document.fonts.load("40px 'Bebas Neue'"), document.fonts.load("500 12px 'Inter Variable'")])
      : Promise.resolve()
    const ready = () => !cancelled && setFontsReady(true)
    Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 1500))]).then(ready, ready)
    return () => {
      cancelled = true
    }
  }, [])

  // Start once the visitor has entered (sound unlocked) and the fonts are ready.
  useEffect(() => {
    if (!entered || !fontsReady) return
    let cancelled = false
    requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setStarted(true)))
    return () => {
      cancelled = true
    }
  }, [entered, fontsReady])

  const enter = useCallback(() => {
    if (entered || leavingRef.current) return
    enterFullscreen() // must run inside the tap/click/key handler, before anything async
    resumeSound().then(() => setEntered(true))
  }, [entered])

  useEffect(() => {
    if (!started) return
    playIntro()
    const toFinal = window.setTimeout(() => setFinal(true), 6300)
    const toLeave = window.setTimeout(() => leave(true), FINAL_AT + HOLD)
    return () => {
      window.clearTimeout(toFinal)
      window.clearTimeout(toLeave)
    }
  }, [started, leave])

  // Keys work from anywhere: at the gate Enter/Space enter and Esc skips; during the intro
  // Esc/Enter/Space skip. Scroll is locked while it covers the page.
  useEffect(() => {
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (!['Escape', 'Enter', ' '].includes(event.key)) return
      event.preventDefault()
      if (!entered && event.key !== 'Escape') enter()
      else leave(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
    }
  }, [leave, enter, entered])

  return (
    <div
      className={`logo-intro${entered ? '' : ' is-gate'}${started ? ' go' : ''}${final ? ' is-final' : ''}${leaving ? ' is-leaving' : ''}`}
      role="img"
      aria-label="HESTOLA logo animation. Wear your identity."
      onClick={() => (entered ? leave(false) : enter())}
    >
      <div className="li-lay" aria-hidden="true">
        <Lockup>
          <svg className="li-logo" viewBox="8 17 420 417">
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="450" height="430">
                {STROKES.map(([t, s, width, d]) => (
                  <path key={d} className="li-d" pathLength="1" style={{ '--t': t, '--s': s, strokeWidth: width }} d={d} />
                ))}
              </mask>
            </defs>
            <path d={HESTOLA_MARK_PATH} fillRule="evenodd" fill="currentColor" mask={`url(#${maskId})`} />
          </svg>
        </Lockup>
      </div>
      <div className="li-lay li-fin" aria-hidden="true">
        <Lockup wordRef={finWord} tagRef={finTag}>
          <svg ref={finLogo} className="li-logo" viewBox="8 17 420 417">
            <path d={HESTOLA_MARK_PATH} fillRule="evenodd" fill="currentColor" />
          </svg>
        </Lockup>
      </div>
      {!entered && (
        <button type="button" className="li-enter" onClick={(event) => { event.stopPropagation(); enter() }}>
          Tap to enter
        </button>
      )}
      <button type="button" className="li-skip" onClick={(event) => { event.stopPropagation(); leave(false) }}>
        SKIP
      </button>
    </div>
  )
}
