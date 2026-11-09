import { useEffect, useRef, useState } from 'react'

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A number that springs towards `target`. With `immediate` (for example while a finger drags
// it) or under reduced motion it follows the target exactly, and a later spring starts from there.
export function useSpring(target, { stiffness = 170, damping = 22, immediate = false } = {}) {
  const [value, setValue] = useState(target)
  const state = useRef({ x: target, v: 0, raf: 0, last: 0 })
  const still = immediate || prefersReduced()
  // Keep the shown value on the target while still, so a spring that starts later starts here.
  if (still && value !== target) setValue(target)

  useEffect(() => {
    const s = state.current
    cancelAnimationFrame(s.raf)
    s.raf = 0
    if (still) {
      s.x = target
      s.v = 0
      return
    }
    s.last = 0
    const tick = (time) => {
      const dt = s.last ? Math.min(0.032, (time - s.last) / 1000) : 1 / 60
      s.last = time
      s.v += (-stiffness * (s.x - target) - damping * s.v) * dt
      s.x += s.v * dt
      if (Math.abs(s.v) < 0.005 && Math.abs(s.x - target) < 0.005) {
        s.x = target
        s.v = 0
        setValue(target)
        s.raf = 0
        return
      }
      setValue(s.x)
      s.raf = requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(s.raf)
  }, [target, stiffness, damping, still])

  return still ? target : value
}
