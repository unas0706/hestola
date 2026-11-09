import { forwardRef } from 'react'
import { ArrowLeft, Share2, ShoppingBag } from 'lucide-react'
import HestolaMark from '@/components/brand/HestolaMark'
import { cn } from '@/lib/utils'

const iconButton =
  'relative grid size-10 place-items-center rounded-full text-(--sheet-ink) outline-none transition-colors hover:bg-(--sheet-off) focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none'

// App bar of the product sheet: back to the rail, the Hestola mark and wordmark in the middle,
// share and bag on the right. The bag carries the brand's orange as its count badge.
const SheetHeader = forwardRef(function SheetHeader({ closeRef, onBack, onShare, onBag, bagCount, className }, bagRef) {
  return (
    <header className={cn('sticky top-0 z-20 border-b border-(--sheet-line) bg-(--sheet-canvas)', className)}>
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-2 md:px-[calc(6vw-0.625rem)]">
        <div className="flex">
          <button ref={closeRef} type="button" onClick={onBack} aria-label="Back to the rail" className={iconButton}>
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
        </div>

        <p className="flex items-center gap-2 text-(--sheet-ink)" aria-label="Hestola">
          <HestolaMark className="size-6 text-brand" />
          <span aria-hidden="true" className="font-wordmark text-[1.65rem] leading-none tracking-[0.08em] translate-y-[1px]">
            HESTOLA
          </span>
        </p>

        <div className="flex justify-end gap-0.5">
          <button type="button" onClick={onShare} aria-label="Share this piece" className={iconButton}>
            <Share2 aria-hidden="true" className="size-[18px]" />
          </button>
          <button
            ref={bagRef}
            type="button"
            onClick={onBag}
            aria-label={bagCount ? `Bag, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}` : 'Bag, empty'}
            className={iconButton}
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            {bagCount > 0 && (
              <span
                key={bagCount}
                aria-hidden="true"
                className="animate-in zoom-in-50 duration-300 motion-reduce:animate-none absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-ink tabular-nums"
              >
                {bagCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
})

export default SheetHeader
