import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { HESTOLA_MARK_PATH } from "@/components/brand/mark-path"

/*
 * Bag drop: the 21st.dev "Bucket" by 0xUrvish (https://21st.dev/r/0xUrvish/bucket), converted
 * from TSX to JSX. A chip appears above an open container and drops into it, the container's
 * front panel drawn over the chip so it disappears inside.
 *
 * The chip's motion is the original's: in from y -100 (-70 on phones) at 0.8 scale and no
 * opacity, to y 0 at 1.25 scale (1 on phones) over 0.5 s on ease [0.455, 0.03, 0.515, 0.955];
 * out to y 130 (100 on phones) at 0.8 scale over 0.8 s, through AnimatePresence "popLayout".
 *
 * Hestola changes:
 * - Plays once, as the "added to bag" moment, instead of cycling four feature chips every 2 s.
 *   Phases: chip in, hold, drop, the bag gives a small bounce as it lands, everything fades
 *   out, then `onDone`.
 * - The open box is a Hestola shopping bag: warm ivory paper, ink rope handles (the back one
 *   behind the chip, the front one over it), the Hestola mark in brand orange (unchanged, from
 *   mark-path.js), the Bebas wordmark and "Wear your identity".
 * - The glass effects (backdrop blurs, translucent white fills, Figma drop-shadow filters)
 *   are gone: the brand avoids glassmorphism and heavy shadows (CLAUDE.md).
 * - The chip shows the piece: photo, name, size and price, instead of a Hugeicons icon and
 *   feature copy, so @hugeicons is not needed. `useIsMobile` is a media query here.
 * - The chip is clipped to the bag's opening once it is below the rim, so a chip wider than
 *   the bag doesn't show beside it as it goes in.
 * - Decorative only (aria-hidden): the page announces the add in its own status message.
 *   With reduced motion it renders nothing and calls `onDone` straight away.
 *
 * Props: item { name, image, meta }, onDone().
 */

const EASE = [0.455, 0.03, 0.515, 0.955]
const HOLD = 950 // ms the chip waits above the bag before it drops
const DROP = 1050 // ms from the drop to the fade-out
const FADE = 320 // ms

const RIM = 150 / 400 // the bag's front rim, as a fraction of the drawing's height

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

function BagBack() {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden="true">
      {/* Back handle, behind everything that goes in */}
      <path d="M152 131 C152 80 248 80 248 131" fill="none" stroke="var(--color-ink)" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
      {/* The inside of the bag, seen over the front rim */}
      <path d="M90 150 L112 127 L288 127 L310 150 Z" fill="#D9CFBC" />
      <path d="M112 127 L288 127" stroke="#C9BEA8" strokeWidth="1.5" />
    </svg>
  )
}

function BagFront() {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
      <ellipse cx="200" cy="392" rx="128" ry="7" fill="var(--color-ink)" opacity="0.08" />
      {/* Folded side gussets at the rim */}
      <path d="M90 150 L112 127 L104 150 Z" fill="#E7DFCF" />
      <path d="M310 150 L288 127 L296 150 Z" fill="#E7DFCF" />
      {/* Front panel */}
      <path d="M90 150 H310 V368 Q310 382 296 382 H104 Q90 382 90 368 Z" fill="var(--color-ivory)" stroke="#D6CCB8" strokeWidth="1.5" />
      <path d="M90 166 H310" stroke="#E2D9C7" strokeWidth="1.5" />
      {/* Front handle and its rivets */}
      <path d="M140 158 C140 92 260 92 260 158" fill="none" stroke="var(--color-ink)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="140" cy="158" r="4.5" fill="var(--color-brand)" />
      <circle cx="260" cy="158" r="4.5" fill="var(--color-brand)" />
      {/* Branding */}
      <svg x="170" y="200" width="60" height="60" viewBox="8 17 420 417">
        <path fill="var(--color-brand)" fillRule="evenodd" d={HESTOLA_MARK_PATH} />
      </svg>
      <text x="200" y="306" textAnchor="middle" fontFamily="var(--font-wordmark)" fontSize="38" letterSpacing="5" fill="var(--color-ink)">
        HESTOLA
      </text>
      <text x="200" y="328" textAnchor="middle" fontSize="8.5" fontWeight="500" letterSpacing="2.6" fill="#77705F">
        WEAR YOUR IDENTITY
      </text>
    </svg>
  )
}

export default function BagDrop({ item, onDone }) {
  const [reduced] = useState(prefersReduced)
  const [isMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches)
  const [phase, setPhase] = useState("in") // in → drop → out

  useEffect(() => {
    if (reduced) {
      onDone?.()
      return
    }
    const timers = [
      window.setTimeout(() => setPhase("drop"), HOLD),
      window.setTimeout(() => setPhase("out"), HOLD + DROP),
      window.setTimeout(() => onDone?.(), HOLD + DROP + FADE),
    ]
    return () => timers.forEach(window.clearTimeout)
    // Plays once per mount; the caller remounts it (key) for the next add.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (reduced) return null

  const rim = `${RIM * 100}%`
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-white/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: FADE / 1000, ease: "easeOut" }}
    >
      <motion.div
        className="relative aspect-square w-[min(340px,78vw)] origin-bottom"
        initial={{ y: 24, scale: 0.96, opacity: 0 }}
        animate={
          phase === "drop"
            ? { y: 0, opacity: 1, scaleX: [1, 1.04, 0.99, 1], scaleY: [1, 0.93, 1.02, 1] }
            : phase === "out"
              ? { y: 12, opacity: 0, scale: 0.96 }
              : { y: 0, scale: 1, opacity: 1 }
        }
        transition={
          phase === "drop"
            ? { delay: 0.42, duration: 0.5, ease: "easeOut" }
            : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <BagBack />

        {/* The chip, between the back and the front of the bag */}
        <div
          className="absolute inset-0 z-10"
          style={{
            clipPath: `polygon(0 0, 100% 0, 100% ${rim}, 77.5% ${rim}, 77.5% 100%, 22.5% 100%, 22.5% ${rim}, 0 ${rim})`,
          }}
        >
          <div className="absolute inset-x-0 top-[3%] flex justify-center">
            <AnimatePresence mode="popLayout">
              {phase === "in" && (
                <motion.div
                  key="chip"
                  initial={{ y: isMobile ? -70 : -100, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: isMobile ? 1 : 1.25 }}
                  exit={{ y: isMobile ? 100 : 130, scale: 0.8, transition: { duration: 0.8 } }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="flex w-[220px] origin-bottom items-center gap-2 rounded-full border border-(--sheet-line,#E4E4E2) bg-white p-2 shadow-sm"
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-(--sheet-card,#EEEEEC)">
                    {item.image && <img src={item.image} alt="" className="size-full object-contain p-0.5" />}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium leading-none text-(--sheet-ink,#0A0A0A)">{item.name}</span>
                    <span className="truncate text-xs text-(--sheet-muted,#6B6B6B)">{item.meta}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute inset-0 z-20">
          <BagFront />
        </div>
      </motion.div>
    </motion.div>
  )
}
