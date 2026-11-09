import { useState } from 'react'
import LandingPage from '@/pages/LandingPage'
import LogoIntro from '@/components/brand/LogoIntro'
import { shouldPlayIntro } from '@/lib/intro'
import { initSound } from '@/lib/sound'

// Set up audio at load so the visitor's first click, tap or key press can unlock it.
initSound()

export default function App() {
  const [intro, setIntro] = useState(shouldPlayIntro)
  // 'wait' while the intro covers the landing page, then the intro's end-frame boxes so the
  // sign can move from there; 'instant' when there is no intro.
  const [reveal, setReveal] = useState(() => (intro ? 'wait' : 'instant'))

  return (
    <>
      <LandingPage reveal={reveal} />
      {intro && <LogoIntro onLeave={(boxes) => setReveal(boxes)} onDone={() => setIntro(false)} />}
    </>
  )
}
