import { memo, useRef, useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { CM_PER_INCH, formatHeight, formatWeight } from '@/lib/size-suggestion'
import { useSpring } from '@/lib/use-spring'
import { cn } from '@/lib/utils'

// The figure and the height ruler share one drawing at true scale: the top of the figure's
// head lines up with the height on the ruler. Dragging anywhere on it (or the arrow keys)
// sets the height; the figure springs up or down to meet it and fills out with the weight.

const W = 300
const H = 440
const GROUND = 404 // top of the scale the figure stands on
const TOP = 14
const MAX_CM = 215
export const MIN_HEIGHT = 130
export const MAX_HEIGHT = 210
const K = (GROUND - TOP) / MAX_CM // drawing units per cm
const CX = 112
const RULER_X = 228

const yOf = (cm) => GROUND - cm * K
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function ticks(unit) {
  const list = []
  if (unit === 'cm') {
    for (let cm = MIN_HEIGHT; cm <= MAX_HEIGHT; cm++) {
      const kind = cm % 10 === 0 ? 'major' : cm % 5 === 0 ? 'mid' : 'minor'
      list.push({ y: yOf(cm), kind, label: kind === 'major' ? String(cm) : null })
    }
  } else {
    for (let inch = Math.ceil(MIN_HEIGHT / CM_PER_INCH); inch * CM_PER_INCH <= MAX_HEIGHT; inch++) {
      const kind = inch % 12 === 0 ? 'major' : inch % 6 === 0 ? 'mid' : 'minor'
      list.push({ y: yOf(inch * CM_PER_INCH), kind, label: kind === 'major' ? `${inch / 12}′` : null })
    }
  }
  return list
}

const TICK = { major: 16, mid: 10, minor: 5 }

// The ruler only changes with the unit, so it is drawn once per unit, not on every frame.
const Ruler = memo(function Ruler({ unit }) {
  return (
    <g>
      <line x1={RULER_X} y1={yOf(MAX_HEIGHT) - 6} x2={RULER_X} y2={yOf(MIN_HEIGHT) + 6} stroke="var(--sheet-ink)" strokeWidth="1.2" />
      {ticks(unit).map((tick) => (
        <g key={tick.y}>
          <line
            x1={RULER_X}
            x2={RULER_X + TICK[tick.kind]}
            y1={tick.y}
            y2={tick.y}
            stroke="var(--sheet-ink)"
            strokeWidth={tick.kind === 'minor' ? 0.6 : 1.1}
            opacity={tick.kind === 'minor' ? 0.45 : 0.9}
          />
          {tick.label && (
            <text x={RULER_X + 21} y={tick.y + 3.5} fontSize="10" fill="var(--sheet-muted)" className="tabular-nums">
              {tick.label}
            </text>
          )}
        </g>
      ))}
    </g>
  )
})

// Body measurements, in drawing units, for a height and weight. `build` runs from slight (0)
// to heavy (about 1); it widens the waist, shoulders and limbs. It only shapes the drawing.
function body(heightCm, weightKg) {
  const h = heightCm * K
  const y0 = GROUND - h
  const build = clamp((weightKg / (heightCm / 100) ** 2 - 17) / 17, 0, 1.25)
  const r = h * 0.066
  return {
    h,
    y0,
    build,
    r,
    headY: y0 + r,
    shY: y0 + h * 0.19,
    hipY: y0 + h * 0.53,
    kneeY: y0 + h * 0.76,
    shW: h * (0.11 + 0.035 * build),
    waistW: h * (0.07 + 0.08 * build),
    hipW: h * (0.06 + 0.045 * build),
    limb: 2.4 + 3.6 * build,
  }
}

function garmentPath(b, longSleeves) {
  const { h, shY, hipY, shW, waistW } = b
  const neck = h * 0.03
  const hemY = hipY + h * 0.035
  const midY = (shY + hipY) / 2
  const side = (dir) => {
    const s = (x) => CX + dir * x
    if (longSleeves) {
      const wristX = shW + h * 0.075 + b.build * h * 0.02
      const wristY = hipY - h * 0.03
      return {
        out: `L ${s(shW)} ${shY} L ${s(wristX + h * 0.025)} ${wristY} L ${s(wristX - h * 0.025)} ${wristY + h * 0.008} L ${s(shW * 0.86)} ${shY + h * 0.11}`,
        hem: [s(waistW * 1.04), hemY],
        bulge: [s(waistW * 1.14), midY + h * 0.05],
      }
    }
    return {
      out: `L ${s(shW)} ${shY} L ${s(shW + h * 0.07)} ${shY + h * 0.1} L ${s(shW * 0.9)} ${shY + h * 0.115}`,
      hem: [s(waistW * 1.04), hemY],
      bulge: [s(waistW * 1.14), midY + h * 0.05],
    }
  }
  const l = side(-1)
  const rt = side(1)
  return [
    `M ${CX - neck} ${shY - h * 0.012}`,
    l.out,
    `Q ${l.bulge[0]} ${l.bulge[1]} ${l.hem[0]} ${l.hem[1]}`,
    `L ${rt.hem[0]} ${rt.hem[1]}`,
    `Q ${rt.bulge[0]} ${rt.bulge[1]} ${CX + shW * 0.9} ${shY + h * 0.115}`,
    // right side back up, mirrored from the left
    rt.out
      .split(' L ')
      .slice(1)
      .reverse()
      .map((point) => `L ${point}`)
      .join(' '),
    `L ${CX + shW} ${shY}`,
    `L ${CX + neck} ${shY - h * 0.012}`,
    `Q ${CX} ${shY + h * 0.03} ${CX - neck} ${shY - h * 0.012} Z`,
  ].join(' ')
}

function Figure({ heightCm, weightKg, colour, longSleeves, size }) {
  const b = body(heightCm, weightKg)
  const { h, headY, r, shY, hipY, kneeY, shW, hipW, limb } = b
  const arm = (dir) => {
    const s = (x) => CX + dir * x
    return `M ${s(shW * 0.92)} ${shY + h * 0.02} L ${s(shW + h * 0.045)} ${shY + h * 0.17} L ${s(shW + h * 0.055)} ${hipY - h * 0.01}`
  }
  const leg = (dir) => {
    const s = (x) => CX + dir * x
    return `M ${s(hipW * 0.55)} ${hipY} L ${s(hipW * 0.6)} ${kneeY} L ${s(hipW * 0.7)} ${GROUND - 1} L ${s(hipW * 0.7 + h * 0.035)} ${GROUND - 1}`
  }
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <g fill="none" stroke="var(--sheet-ink)" strokeWidth={limb}>
        <path d={arm(-1)} />
        <path d={arm(1)} />
        <path d={leg(-1)} strokeWidth={limb * 1.25} />
        <path d={leg(1)} strokeWidth={limb * 1.25} />
        <line x1={CX} y1={headY + r} x2={CX} y2={shY} />
      </g>
      <path d={garmentPath(b, longSleeves)} fill={colour} stroke="var(--sheet-ink)" strokeWidth="1.6" />
      <circle cx={CX} cy={headY} r={r} fill="var(--sheet-canvas)" stroke="var(--sheet-ink)" strokeWidth="2.2" />
      <circle cx={CX - r * 0.35} cy={headY - r * 0.08} r={Math.max(1, r * 0.09)} fill="var(--sheet-ink)" />
      <circle cx={CX + r * 0.35} cy={headY - r * 0.08} r={Math.max(1, r * 0.09)} fill="var(--sheet-ink)" />
      <path d={`M ${CX - r * 0.32} ${headY + r * 0.35} Q ${CX} ${headY + r * 0.6} ${CX + r * 0.32} ${headY + r * 0.35}`} fill="none" stroke="var(--sheet-ink)" strokeWidth="1.4" />
      {size && (
        <g key={size} className="animate-in fade-in zoom-in-50 duration-300 motion-reduce:animate-none" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx={CX + shW * 0.42} cy={shY + h * 0.12} r={11} fill="var(--color-brand)" />
          <text x={CX + shW * 0.42} y={shY + h * 0.12 + 3.5} textAnchor="middle" fontSize={size.length > 2 ? 7.5 : 10} fontWeight="700" fill="var(--sheet-ink)">
            {size}
          </text>
        </g>
      )}
    </g>
  )
}

export default function HeightFigure({ heightCm, weightKg, unit, weightUnit = 'kg', onChange, onCommit, colour, longSleeves, size, className }) {
  const boxRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  // The figure trails the ruler a little and settles with a spring; the marker follows exactly.
  const shownHeight = useSpring(heightCm, { stiffness: 140, damping: 18 })
  const shownWeight = useSpring(weightKg, { stiffness: 120, damping: 17 })
  const markerY = yOf(heightCm)
  const step = unit === 'cm' ? 1 : CM_PER_INCH
  const snap = (cm) => (unit === 'cm' ? Math.round(cm) : Math.round(cm / CM_PER_INCH) * CM_PER_INCH)

  const fromPointer = (event) => {
    const rect = boxRef.current.getBoundingClientRect()
    const y = ((event.clientY - rect.top) / rect.height) * H
    return clamp((GROUND - y) / K, MIN_HEIGHT, MAX_HEIGHT)
  }

  const onKeyDown = (event) => {
    const keys = {
      ArrowUp: step,
      ArrowRight: step,
      ArrowDown: -step,
      ArrowLeft: -step,
      PageUp: step * (unit === 'cm' ? 10 : 6),
      PageDown: -step * (unit === 'cm' ? 10 : 6),
    }
    let next
    if (event.key in keys) next = snap(heightCm) + keys[event.key]
    else if (event.key === 'Home') next = MIN_HEIGHT
    else if (event.key === 'End') next = MAX_HEIGHT
    else return
    event.preventDefault()
    onCommit(clamp(snap(next), MIN_HEIGHT, MAX_HEIGHT))
  }

  return (
    <div ref={boxRef} className={cn('relative aspect-[300/440]', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <Ruler unit={unit} />

        {/* Ground, the scale the figure stands on, and its shadow */}
        <ellipse cx={CX} cy={GROUND + 25} rx={78} ry={5} fill="var(--sheet-ink)" opacity="0.08" />
        <rect x={CX - 62} y={GROUND} width={124} height={18} rx={7} fill="var(--sheet-ink)" />
        <rect x={CX - 24} y={GROUND + 3.5} width={48} height={11} rx={2.5} fill="var(--sheet-canvas)" opacity="0.94" />
        <text x={CX} y={GROUND + 12.3} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--sheet-ink)" className="tabular-nums">
          {formatWeight(shownWeight, weightUnit)}
        </text>

        <Figure heightCm={shownHeight} weightKg={shownWeight} colour={colour} longSleeves={longSleeves} size={size} />

        {/* Head-height marker: from the top of the head across to the ruler */}
        <line
          x1={CX - 20}
          x2={RULER_X}
          y1={markerY}
          y2={markerY}
          stroke="var(--color-brand)"
          strokeWidth="1.4"
          strokeDasharray="3 4"
        />
      </svg>

      {/* Readout on the ruler, moving with the marker */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-[76%] flex -translate-y-1/2 items-center gap-1 rounded-full bg-(--sheet-ink) py-1 pl-2.5 pr-2 text-xs font-semibold whitespace-nowrap text-white tabular-nums shadow-[0_2px_6px_rgb(0_0_0/0.15)] transition-transform duration-200 motion-reduce:transition-none',
          dragging && 'scale-110',
        )}
        style={{ top: `${(markerY / H) * 100}%` }}
      >
        {formatHeight(heightCm, unit)}
        <ChevronsUpDown className="size-3 opacity-70" />
      </div>

      {/* The whole drawing is the height slider */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Height"
        aria-orientation="vertical"
        aria-valuemin={MIN_HEIGHT}
        aria-valuemax={MAX_HEIGHT}
        aria-valuenow={Math.round(heightCm)}
        aria-valuetext={formatHeight(heightCm, unit)}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          setDragging(true)
          onChange(fromPointer(event))
        }}
        onPointerMove={(event) => {
          if (dragging) onChange(fromPointer(event))
        }}
        onPointerUp={(event) => {
          if (!dragging) return
          setDragging(false)
          onCommit(snap(fromPointer(event)))
        }}
        onPointerCancel={() => {
          setDragging(false)
          onCommit(snap(heightCm))
        }}
        className="absolute inset-0 cursor-ns-resize touch-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}
