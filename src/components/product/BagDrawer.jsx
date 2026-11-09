import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { bagCount, bagSubtotal, removeFromBag, useBag } from '@/lib/bag'
import { formatPaise } from '@/lib/money'
import { cn } from '@/lib/utils'

// Bag drawer (design.md §6.9): the lines in the demo bag, a subtotal, and checkout, which is
// not open yet and says so. Slides in from the right; Esc, the backdrop and × close it.
export default function BagDrawer({ onClose }) {
  const bag = useBag()
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const [entered, setEntered] = useState(false)
  const count = bagCount(bag)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Keys stay inside the drawer: Esc closes it (not the whole sheet), Tab cycles its controls,
  // arrows don't turn the garment behind it.
  const onKeyDown = (event) => {
    event.stopPropagation()
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const controls = [...(panelRef.current?.querySelectorAll('button:not(:disabled), a[href]') ?? [])]
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
        aria-labelledby="bag-title"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-(--sheet-canvas) transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          entered ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-(--sheet-line) pl-5 pr-2">
          <h2 id="bag-title" className="text-base font-semibold">
            Your bag{count > 0 && <span className="ml-1.5 font-normal text-(--sheet-muted)">({count})</span>}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="grid size-10 place-items-center rounded-full outline-none hover:bg-(--sheet-off) focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        {bag.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-sm text-(--sheet-muted)">Your bag is empty. Pick a size and add a piece to see it here.</p>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-(--sheet-ink) px-5 text-sm font-semibold outline-none hover:bg-(--sheet-off) focus-visible:ring-2 focus-visible:ring-ring"
            >
              Keep browsing
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-(--sheet-line) overflow-y-auto px-5">
              {bag.lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-4">
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-(--sheet-card)">
                    {line.image && <img src={line.image} alt="" className="size-full object-contain p-1" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium leading-snug">{line.name}</p>
                      <p className="text-sm font-semibold tabular-nums">{formatPaise(line.pricePaise * line.quantity)}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-(--sheet-muted)">
                      {line.colour}, size {line.size}
                    </p>
                    <p className="mt-0.5 text-xs text-(--sheet-muted)">Quantity {line.quantity}</p>
                    <button
                      type="button"
                      onClick={() => removeFromBag(line.key)}
                      aria-label={`Remove ${line.name}, size ${line.size}`}
                      className="mt-auto self-start text-xs text-(--sheet-muted) underline decoration-(--sheet-off-ink) underline-offset-4 outline-none hover:text-(--sheet-ink) focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-(--sheet-line) px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Subtotal</p>
                <p className="text-base font-bold tabular-nums">{formatPaise(bagSubtotal(bag))}</p>
              </div>
              <button
                type="button"
                disabled
                aria-describedby="bag-checkout-note"
                className="mt-4 h-12 w-full rounded-xl bg-(--sheet-ink) text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Checkout
              </button>
              <p id="bag-checkout-note" className="mt-2 text-center text-xs text-(--sheet-muted)">
                Checkout isn’t open yet. Your bag stays here until you leave the page.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
