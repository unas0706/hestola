import { useEffect, useRef, useState } from 'react'
import { Ruler, X } from 'lucide-react'
import HeightFigure from '@/components/product/size-finder/HeightFigure'
import WeightTape from '@/components/product/size-finder/WeightTape'
import { FIT_PREFERENCES, formatHeight, formatWeight, suggestSize } from '@/lib/size-suggestion'
import { cn } from '@/lib/utils'

const START = { heightCm: 170, weightKg: 65 } // where the scales rest before they're moved

// Find my size (design.md §6.7). The shopper sets height on the ruler beside the figure and
// weight on the tape, picks a fit, and gets a suggested size for this piece from its size model.
// Nothing is added to the bag, the size is only chosen when they press "Select", and height
// and weight live in this component's state only: never stored, logged or sent.
export default function FindMySize({ product, onSelect, onOpenGuide, onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const [entered, setEntered] = useState(false)
  const [heightCm, setHeightCm] = useState(START.heightCm)
  const [weightKg, setWeightKg] = useState(START.weightKg)
  const [touched, setTouched] = useState({ height: false, weight: false })
  const [fit, setFit] = useState('regular')
  const [units, setUnits] = useState({ height: 'cm', weight: 'kg' })

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const model = product.sizeModel
  const ready = touched.height && touched.weight
  const result = !model ? { status: 'unavailable' } : ready ? suggestSize(model, { heightCm, weightKg, fit }) : null
  const suggested = result?.status === 'ok' ? product.sizes?.find((size) => size.label === result.size) : null
  const soldOut = suggested && suggested.stock === 0

  const setHeight = (cm) => {
    setHeightCm(cm)
    setTouched((t) => (t.height ? t : { ...t, height: true }))
  }
  const setWeight = (kg) => {
    setWeightKg(kg)
    setTouched((t) => (t.weight ? t : { ...t, weight: true }))
  }

  // Keys stay in the panel: Esc closes it (not the sheet), Tab cycles its controls, and the
  // arrows move the scales instead of turning the garment behind.
  const onKeyDown = (event) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const controls = [...(panelRef.current?.querySelectorAll('button:not(:disabled), [tabindex="0"]') ?? [])]
    const first = controls[0]
    const last = controls.at(-1)
    if (!first) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-40" onKeyDown={onKeyDown}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn('absolute inset-0 bg-black/30 transition-opacity duration-300 motion-reduce:transition-none', entered ? 'opacity-100' : 'opacity-0')}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fit-title"
        aria-describedby="fit-intro"
        className={cn(
          'absolute inset-x-0 bottom-0 flex h-[92svh] flex-col overflow-hidden rounded-t-2xl bg-(--sheet-canvas) transition-[transform,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          'md:inset-auto md:left-1/2 md:top-1/2 md:h-[min(92vh,740px)] md:w-[min(920px,calc(100vw-4rem))] md:-translate-x-1/2 md:rounded-2xl',
          entered ? 'translate-y-0 opacity-100 md:-translate-y-1/2' : 'translate-y-full md:-translate-y-[46%] md:opacity-0',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-(--sheet-line) py-3 pl-5 pr-2 md:pl-7">
          <div className="pt-1">
            <h2 id="fit-title" className="flex items-center gap-2 text-base font-semibold">
              <Ruler aria-hidden="true" className="size-4" />
              Find my size
            </h2>
            <p id="fit-intro" className="mt-0.5 text-xs text-(--sheet-muted)">
              For the {product.name.toLowerCase()}. An estimate to start from, not a guaranteed fit.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close Find my size"
            className="grid size-10 shrink-0 place-items-center rounded-full outline-none hover:bg-(--sheet-off) focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!model ? (
            <Unavailable onOpenGuide={onOpenGuide} />
          ) : (
            <div className="grid items-start gap-5 p-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-8 md:p-7">
              {/* Figure and height ruler */}
              <div className="relative flex flex-col rounded-2xl bg-(--sheet-card) px-3 pb-2 pt-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-medium">
                    Height <span className="ml-1 font-semibold tabular-nums">{formatHeight(heightCm, units.height)}</span>
                  </p>
                  <UnitSwitch label="Height unit" options={['cm', 'ft']} value={units.height} onChange={(height) => setUnits((u) => ({ ...u, height }))} />
                </div>
                <HeightFigure
                  heightCm={heightCm}
                  weightKg={weightKg}
                  unit={units.height === 'cm' ? 'cm' : 'in'}
                  weightUnit={units.weight}
                  onChange={setHeight}
                  onCommit={setHeight}
                  colour={product.colour.hex}
                  longSleeves={product.garment === 'shirt'}
                  size={result?.status === 'ok' ? result.size : null}
                  className="mx-auto h-[300px] md:h-[440px]"
                />
                <p className={cn('pb-1 text-center text-xs text-(--sheet-muted) transition-opacity', touched.height && 'opacity-0')}>
                  Drag the figure up or down to your height
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Weight <span className="ml-1 font-semibold tabular-nums">{formatWeight(weightKg, units.weight)}</span>
                    </p>
                    <UnitSwitch label="Weight unit" options={['kg', 'lb']} value={units.weight} onChange={(weight) => setUnits((u) => ({ ...u, weight }))} />
                  </div>
                  <WeightTape weightKg={weightKg} unit={units.weight} onChange={setWeight} onCommit={setWeight} className="mt-3" />
                  <p className={cn('mt-2 text-center text-xs text-(--sheet-muted) transition-opacity', touched.weight && 'opacity-0')}>
                    Slide the scale to your weight
                  </p>
                </div>

                <fieldset>
                  <legend className="text-sm font-medium">How do you like it to fit?</legend>
                  <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-(--sheet-card) p-1">
                    {FIT_PREFERENCES.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={fit === option.id}
                        onClick={() => setFit(option.id)}
                        className={cn(
                          'h-10 rounded-lg text-sm outline-none transition-[background-color,box-shadow,color] duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                          fit === option.id ? 'bg-(--sheet-canvas) font-semibold shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'text-(--sheet-muted) hover:text-(--sheet-ink)',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Result
                  result={result}
                  model={model}
                  fit={fit}
                  soldOut={soldOut}
                  onOpenGuide={onOpenGuide}
                />

                {/* Announces the suggestion when it changes, not on every step of the scales */}
                <p className="sr-only" aria-live="polite">
                  {result?.status === 'ok' ? `Suggested size ${result.size}` : result ? 'More information needed' : ''}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() => onSelect(result.size)}
                    disabled={result?.status !== 'ok' || soldOut}
                    className="h-12 w-full rounded-xl bg-(--sheet-ink) text-sm font-semibold text-white outline-none hover:bg-(--sheet-ink-raised) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {result?.status !== 'ok' ? 'Select size' : soldOut ? `${result.size} is sold out` : `Select size ${result.size}`}
                  </button>
                  <p className="mt-3 text-center text-[11px] leading-relaxed text-(--sheet-muted)">
                    Your height and weight stay on this screen; they aren’t saved.
                    {model.demo && ' Suggestions use demo fit data, not a Hestola size chart.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function UnitSwitch({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full bg-(--sheet-canvas) p-0.5 text-xs shadow-[inset_0_0_0_1px_var(--sheet-line)]">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'h-7 rounded-full px-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
            value === option ? 'bg-(--sheet-ink) font-semibold text-white' : 'text-(--sheet-muted) hover:text-(--sheet-ink)',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function Result({ result, model, fit, soldOut, onOpenGuide }) {
  if (!result) {
    return (
      <div className="flex min-h-44 items-center rounded-2xl border border-dashed border-(--sheet-line) p-5 text-sm text-(--sheet-muted)">
        Set both scales and your suggested size shows up here.
      </div>
    )
  }

  if (result.status !== 'ok') {
    return (
      <div className="min-h-44 rounded-2xl bg-(--sheet-card) p-5">
        <p className="text-xs font-semibold">More information needed</p>
        <p className="mt-1.5 text-sm leading-relaxed text-(--sheet-body)">
          {result.heightOut && result.weightOut
            ? 'Your height and weight are'
            : result.heightOut
              ? 'Your height is'
              : 'Your weight is'}{' '}
          outside the fit data we have for this piece, so we won’t guess. The size guide can help, or pick a size yourself.
        </p>
        <GuideLink onOpenGuide={onOpenGuide} />
      </div>
    )
  }

  const reasons = []
  if (result.byHeight !== result.byWeight) {
    reasons.push(`Your height points to ${result.byHeight} and your weight to ${result.byWeight}; ${result.size} balances the two.`)
  } else {
    reasons.push(`Your height and weight both point to ${result.size} for this piece.`)
  }
  if (fit !== 'regular') reasons.push(`We’ve leaned ${fit === 'snug' ? 'smaller' : 'larger'} for a ${fit} fit.`)
  if (result.alternative) reasons.push(`You’re close to ${result.alternative}, which could suit you if you prefer it ${result.alternativeIsLarger ? 'roomier' : 'closer'}.`)
  if (model.fitNote) reasons.push(model.fitNote)

  return (
    <div className="flex min-h-44 gap-5 rounded-2xl bg-(--sheet-card) p-5">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-(--sheet-ink) text-white">
        <span key={result.size} className="font-wordmark text-5xl leading-none tracking-wide animate-in fade-in slide-in-from-bottom-6 duration-500 motion-reduce:animate-none">
          {result.size}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold">
          Suggested starting point
          {soldOut && <span className="ml-2 font-medium text-(--sheet-sale-ink)">Sold out in this colour</span>}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-(--sheet-body)">{reasons.join(' ')}</p>
        <GuideLink onOpenGuide={onOpenGuide} />
      </div>
    </div>
  )
}

function GuideLink({ onOpenGuide }) {
  return (
    <button
      type="button"
      onClick={onOpenGuide}
      className="mt-2 text-xs font-medium underline decoration-(--sheet-off-ink) underline-offset-4 outline-none hover:decoration-(--sheet-ink) focus-visible:ring-2 focus-visible:ring-ring"
    >
      View size guide
    </button>
  )
}

function Unavailable({ onOpenGuide }) {
  return (
    <div className="p-7">
      <p className="text-sm font-semibold">More information needed</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-(--sheet-body)">
        We don’t have fit data for this piece yet, so we can’t suggest a size. The size guide can help, or pick a size yourself.
      </p>
      <GuideLink onOpenGuide={onOpenGuide} />
    </div>
  )
}
