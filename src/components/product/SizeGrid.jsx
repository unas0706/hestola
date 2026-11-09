import { forwardRef, useId, useState } from 'react'
import { cn } from '@/lib/utils'

const LOW_STOCK = 3

// Size choice for the selected colour. `sizes` is [{ label, stock }]; sold-out sizes are shown
// but cannot be chosen. A size guide only appears when the product has one (design.md §6.6).
const SizeGrid = forwardRef(function SizeGrid({ sizes, selected, onSelect, error, sizeGuide }, ref) {
  const id = useId()
  const [guideOpen, setGuideOpen] = useState(false)
  const current = sizes.find((size) => size.label === selected)

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p id={`${id}-label`} className="text-sm">
          <span className="font-semibold">Size</span>
          {current && <span className="ml-2 text-(--sheet-muted)">{current.label}</span>}
        </p>
        <button
          type="button"
          aria-expanded={guideOpen}
          aria-controls={`${id}-guide`}
          onClick={() => setGuideOpen((open) => !open)}
          className="text-xs text-(--sheet-muted) underline decoration-(--sheet-off-ink) underline-offset-4 outline-none hover:text-(--sheet-ink) focus-visible:ring-2 focus-visible:ring-ring"
        >
          Size guide
        </button>
      </div>

      <div id={`${id}-guide`} hidden={!guideOpen} className="mt-3 border-l-2 border-(--sheet-line) pl-3 text-xs leading-relaxed text-(--sheet-muted)">
        {sizeGuide ?? 'A size guide for this piece isn’t available yet.'}
      </div>

      <div
        ref={ref}
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2.5 grid grid-cols-4 gap-2"
      >
        {sizes.map((size) => {
          const soldOut = size.stock <= 0
          const active = size.label === selected
          return (
            <button
              key={size.label}
              type="button"
              disabled={soldOut}
              aria-pressed={active}
              aria-label={soldOut ? `${size.label}, sold out` : size.label}
              onClick={() => onSelect(size.label)}
              className={cn(
                'h-10 rounded-lg border text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none',
                active && 'border-(--sheet-ink) bg-(--sheet-ink) font-medium text-white',
                !active && !soldOut && 'border-(--sheet-line) bg-white hover:border-(--sheet-ink)',
                soldOut && 'cursor-not-allowed border-(--sheet-off) bg-(--sheet-off) text-(--sheet-off-ink) line-through',
                error && !active && !soldOut && 'border-(--sheet-muted)',
              )}
            >
              {size.label}
            </button>
          )
        })}
      </div>

      <p className="mt-2 min-h-4 text-xs" aria-live="polite">
        {error ? (
          <span id={`${id}-error`} role="alert" className="font-medium">
            Select a size
          </span>
        ) : current ? (
          current.stock <= LOW_STOCK ? (
            <span>Only {current.stock} left in {current.label}</span>
          ) : (
            <span className="text-(--sheet-muted)">In stock</span>
          )
        ) : null}
      </p>
    </div>
  )
})

export default SizeGrid
