import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Heart } from 'lucide-react'
import BagBar from '@/components/product/BagBar'
import ColourSwatches from '@/components/product/ColourSwatches'
import SizeGrid from '@/components/product/SizeGrid'
import ViewDots from '@/components/product/ViewDots'
import { addToBag, bagCount, toggleWish, useBag } from '@/lib/bag'
import { formatPaise } from '@/lib/money'
import { cn } from '@/lib/utils'

const ADDED_FOR = 2200 // ms the "Added" state and toast stay up
const ADD_DELAY = 300 // ms; stands in for the cart request so the pending state is visible


// Product sheet shown when a piece on the rail is opened (design.md §6.5, quick view).
// Rendered through the rail's `renderDetail`; `stage` is the hanging garment, which keeps the
// rail's lift-in animation, spin and drag-to-turn. Mobile: image card on top, details below,
// price and Add to Bag in a sticky bar. Desktop: card left, details right.
export default function ProductSheet({ product, subtitle, stage, closeRef, close, side, turnTo, titleId, shown }) {
  const bag = useBag()
  const gridRef = useRef(null)
  const [size, setSize] = useState(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)
  const [added, setAdded] = useState(null)
  const wished = bag.wished.has(product.slug)

  useEffect(() => {
    if (!added) return
    const timer = window.setTimeout(() => setAdded(null), ADDED_FOR)
    return () => window.clearTimeout(timer)
  }, [added])

  useEffect(() => {
    if (!pending) return
    const timer = window.setTimeout(() => {
      addToBag({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colour: product.colour.name,
        size,
        pricePaise: product.pricePaise,
      })
      setPending(false)
      setAdded({ name: product.name, size })
    }, ADD_DELAY)
    return () => window.clearTimeout(timer)
  }, [pending, product, size])

  const onAdd = () => {
    if (pending) return
    if (!size) {
      setError(true)
      gridRef.current?.querySelector('button:not(:disabled)')?.focus()
      return
    }
    setPending(true)
  }

  const fade = cn(
    'transition-[opacity,transform] duration-500 motion-reduce:transition-none',
    shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
  )
  const roundButton =
    'absolute top-3 z-10 grid size-9 place-items-center rounded-full bg-white text-(--sheet-ink) shadow-[0_1px_2px_rgb(0_0_0/0.08)] outline-none transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none'
  const current = product.sizes?.find((entry) => entry.label === size)

  return (
    <div className="product-sheet relative mx-auto flex min-h-full w-full max-w-5xl flex-col text-(--sheet-ink) md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:content-center md:items-start md:gap-12 md:px-10 md:py-12">
      {/* White canvas over the page; clicks fall through to the rail's backdrop, which closes. */}
      <div
        aria-hidden="true"
        className={cn('pointer-events-none fixed inset-0 bg-(--sheet-canvas) transition-opacity duration-300 motion-reduce:transition-none', shown ? 'opacity-100' : 'opacity-0')}
      />

      {/* Image: one clean card, two controls (back, save), view dots under it. */}
      <div className="relative px-4 pt-4 md:px-0 md:pt-0">
        <div className="relative h-[min(42vh,400px)] md:h-[min(72vh,620px)]">
          <div
            aria-hidden="true"
            className={cn('absolute inset-0 rounded-2xl bg-(--sheet-card) transition-opacity duration-300 motion-reduce:transition-none', shown ? 'opacity-100' : 'opacity-0')}
          />
          {/* Top padding matches SHEET_ROD in product-rail-gallery.jsx. */}
          <div className="absolute inset-0 flex justify-center pb-4 pt-11">{stage}</div>
          <button ref={closeRef} type="button" onClick={close} aria-label="Back to the rail" className={cn(roundButton, 'left-3', shown ? 'opacity-100' : 'opacity-0')}>
            <ArrowLeft aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleWish(product.slug)}
            aria-pressed={wished}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={cn(roundButton, 'right-3', shown ? 'opacity-100' : 'opacity-0')}
          >
            <Heart aria-hidden="true" className={cn('size-4 transition-colors motion-reduce:transition-none', wished && 'fill-brand text-brand')} />
          </button>
        </div>
        <ViewDots side={side} onChange={turnTo} className={cn('mt-1', fade)} />
      </div>

      {/* Details: name, then price straight away, then the two choices. */}
      <div className={cn('relative flex flex-1 flex-col delay-150 md:max-h-[min(72vh,620px)] md:overflow-y-auto', fade)}>
        <div className="flex flex-col gap-5 px-5 pb-4 pt-2 md:px-0 md:pt-0">
          <header>
            <h2 id={titleId} className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
              {product.name}
            </h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-(--sheet-muted)">{subtitle}</p>}
            <Price pricePaise={product.pricePaise} compareAtPaise={product.compareAtPaise} />
          </header>

          <ColourSwatches colours={product.colours ?? [product.colour]} selected={product.colour.name} />

          {product.sizes?.length > 0 && (
            <SizeGrid
              ref={gridRef}
              sizes={product.sizes}
              selected={size}
              error={error}
              sizeGuide={product.sizeGuide}
              onSelect={(label) => {
                setSize(label)
                setError(false)
              }}
            />
          )}
        </div>

        <BagBar
          pricePaise={product.pricePaise}
          note={current ? `Size ${current.label}` : 'Select a size'}
          pending={pending}
          added={Boolean(added)}
          onAdd={onAdd}
          className="sticky bottom-0 mt-auto px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-0"
        />
      </div>

      {/* Confirmation (outside the faded column so `fixed` is relative to the viewport). */}
      <p
        role="status"
        className={cn(
          'pointer-events-none fixed left-1/2 top-4 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--sheet-ink) px-4 py-2 text-xs font-medium text-white transition-[opacity,transform] duration-300 motion-reduce:transition-none',
          added ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
        )}
      >
        {added ? `Added to bag · ${added.name}, ${added.size} · Bag (${bagCount(bag)})` : ''}
      </p>
    </div>
  )
}

// Price first and bold; on sale, the old price struck through and a small "% off" badge.
function Price({ pricePaise, compareAtPaise }) {
  const onSale = compareAtPaise > pricePaise
  return (
    <p className="mt-2 flex items-center gap-2">
      <span className="text-xl font-bold tabular-nums">{formatPaise(pricePaise)}</span>
      {onSale && (
        <>
          <s className="text-sm text-(--sheet-muted) tabular-nums">
            <span className="sr-only">Was </span>
            {formatPaise(compareAtPaise)}
          </s>
          <span className="rounded-md bg-(--sheet-sale-bg) px-1.5 py-0.5 text-[11px] font-semibold text-(--sheet-sale-ink)">
            {Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100)}% off
          </span>
        </>
      )}
    </p>
  )
}
