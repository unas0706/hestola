// Whether to play the logo intro: on every app load, except under reduced motion
// (design.md §3.6: respect prefers-reduced-motion).
export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
