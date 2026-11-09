import { Check, ShoppingBag } from 'lucide-react'
import { formatPaise } from '@/lib/money'
import { cn } from '@/lib/utils'

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

// Sticky purchase bar: price with a short note under it (the chosen size) on the left, the one
// primary action on the right. On hover/focus a lighter graphite fill rises through the button.
export default function BagBar({ pricePaise, note, pending, added, onAdd, className }) {
  return (
    <div className={cn('flex items-center gap-4 border-t border-(--sheet-line) bg-(--sheet-canvas) pt-3', className)}>
      <div className="min-w-0 shrink-0">
        <p className="text-base font-bold leading-tight tabular-nums">{formatPaise(pricePaise)}</p>
        {note && <p className="mt-0.5 text-xs text-(--sheet-muted)">{note}</p>}
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={pending}
        aria-busy={pending || undefined}
        className="group relative ml-auto inline-flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-(--sheet-ink) px-6 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-progress sm:max-w-64 md:max-w-none"
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 translate-y-full bg-(--sheet-ink-raised) transition-transform duration-500 group-hover:translate-y-0 group-focus-visible:translate-y-0 group-disabled:translate-y-full motion-reduce:transition-none',
            EASE,
          )}
        />
        <span className="relative inline-flex items-center gap-2">
          {added ? <Check aria-hidden="true" className="size-4" /> : <ShoppingBag aria-hidden="true" className="size-4" />}
          {pending ? 'Adding…' : added ? 'Added' : 'Add to Bag'}
        </span>
      </button>
    </div>
  )
}
