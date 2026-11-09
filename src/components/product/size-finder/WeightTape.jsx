import { memo, useRef, useState } from 'react'
import { KG_PER_LB } from '@/lib/size-suggestion'
import { useSpring } from '@/lib/use-spring'
import { cn } from '@/lib/utils'

// Weight as a sliding tape under a fixed marker, like a scale's dial: drag or flick it, and it
// springs to the nearest whole kg (or lb). Arrow keys, Page Up/Down, Home and End work too.

export const MIN_WEIGHT = 30
export const MAX_WEIGHT = 160

const UNITS = {
  kg: { min: MIN_WEIGHT, max: MAX_WEIGHT, ppu: 9, mid: 5, major: 10, toUnit: (kg) => kg, toKg: (v) => v },
  lb: { min: Math.ceil(MIN_WEIGHT / KG_PER_LB), max: Math.floor(MAX_WEIGHT / KG_PER_LB), ppu: 4, mid: 5, major: 10, toUnit: (kg) => kg / KG_PER_LB, toKg: (v) => v * KG_PER_LB },
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const TAPE_H = 58

// Drawn once per unit; dragging only moves it (a transform), it doesn't redraw it.
const Ticks = memo(function Ticks({ u }) {
  const width = (u.max - u.min) * u.ppu
  const lines = []
  for (let v = u.min; v <= u.max; v++) {
    const x = (v - u.min) * u.ppu
    const kind = v % u.major === 0 ? 'major' : v % u.mid === 0 ? 'mid' : 'minor'
    lines.push(
      <g key={v}>
        <line x1={x} x2={x} y1={0} y2={kind === 'major' ? 24 : kind === 'mid' ? 16 : 9} stroke="var(--sheet-ink)" strokeWidth={kind === 'minor' ? 0.8 : 1.3} opacity={kind === 'minor' ? 0.4 : 0.9} />
        {kind === 'major' && (
          <text x={x} y={42} textAnchor="middle" fontSize="11" fill="var(--sheet-muted)" className="tabular-nums">
            {v}
          </text>
        )}
      </g>,
    )
  }
  return (
    <svg width={width} height={TAPE_H} viewBox={`0 0 ${width} ${TAPE_H}`} className="overflow-visible" aria-hidden="true">
      {lines}
    </svg>
  )
})

export default function WeightTape({ weightKg, unit, onChange, onCommit, className }) {
  const u = UNITS[unit]
  const [dragging, setDragging] = useState(false)
  const drag = useRef(null)
  const value = u.toUnit(weightKg)
  const shown = useSpring(value, { stiffness: 200, damping: 24, immediate: dragging })
  const offset = (clamp(shown, u.min, u.max) - u.min) * u.ppu

  const commit = (v) => onCommit(u.toKg(clamp(Math.round(v), u.min, u.max)))

  const onKeyDown = (event) => {
    const keys = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }
    let next
    if (event.key in keys) next = Math.round(value) + keys[event.key]
    else if (event.key === 'Home') next = u.min
    else if (event.key === 'End') next = u.max
    else return
    event.preventDefault()
    commit(next)
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Weight"
      aria-valuemin={u.min}
      aria-valuemax={u.max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={`${Math.round(value)} ${unit === 'kg' ? 'kilograms' : 'pounds'}`}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { x: event.clientX, start: value, samples: [{ t: event.timeStamp, v: value }] }
        setDragging(true)
      }}
      onPointerMove={(event) => {
        const d = drag.current
        if (!d) return
        const v = clamp(d.start - (event.clientX - d.x) / u.ppu, u.min, u.max)
        d.samples = [...d.samples.slice(-4), { t: event.timeStamp, v }]
        onChange(u.toKg(v))
      }}
      onPointerUp={() => {
        const d = drag.current
        if (!d) return
        drag.current = null
        setDragging(false)
        // A flick carries on a little before it settles.
        const first = d.samples[0]
        const last = d.samples.at(-1)
        const dt = (last.t - first.t) / 1000
        const velocity = dt > 0 ? (last.v - first.v) / dt : 0
        commit(last.v + clamp(velocity * 0.18, -25, 25))
      }}
      onPointerCancel={() => {
        drag.current = null
        setDragging(false)
        commit(value)
      }}
      className={cn(
        'relative h-[76px] cursor-grab touch-none overflow-hidden rounded-xl bg-(--sheet-card) outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
        // the tape fades out at both ends
        '[mask-image:linear-gradient(to_right,transparent,#000_18%,#000_82%,transparent)]',
        className,
      )}
    >
      <div className="absolute left-1/2 top-3 will-change-transform" style={{ transform: `translate3d(${-offset}px, 0, 0)` }}>
        <Ticks u={u} />
      </div>
      {/* The fixed marker */}
      <div aria-hidden="true" className="absolute left-1/2 top-0 h-[46px] w-[3px] -translate-x-1/2 rounded-b-full bg-brand" />
      <div aria-hidden="true" className="absolute left-1/2 top-0 size-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent border-t-brand" />
    </div>
  )
}
