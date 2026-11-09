import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { Heart, Ruler } from 'lucide-react'
import BagBar from '@/components/product/BagBar'
import BagDrawer from '@/components/product/BagDrawer'
import FindMySize from '@/components/product/FindMySize'
import RelatedPieces from '@/components/product/RelatedPieces'
import SheetHeader from '@/components/product/SheetHeader'
import ViewDots from '@/components/product/ViewDots'
import HestolaMark from '@/components/brand/HestolaMark'
import ProductHero from '@/components/ui/product-hero'
import BagDrop from '@/components/ui/bag-drop'
import { addToBag, bagCount, toggleWish, useBag } from '@/lib/bag'
import { formatPaise } from '@/lib/money'
import { cn } from '@/lib/utils'

const ADDED_FOR = 2200 // ms the "Added" state and toasts stay up
const ADD_DELAY = 300 // ms; stands in for the cart request so the pending state is visible

const VIEW_LABELS = { front: 'Front', back: 'Back', side: 'Side' }

// The hero's colours come from the sheet palette (index.css, .product-sheet); the colour word
// behind the garment is set in the brand's display face.
const HERO_THEME = {
  '--color-foreground': 'var(--sheet-ink)',
  '--color-background': 'var(--sheet-canvas)',
  '--color-muted-foreground': 'var(--sheet-muted)',
  '--snp-word-font': 'var(--font-wordmark)',
  '--snp-done': 'var(--sheet-ink-raised)',
  '--snp-error': 'var(--sheet-sale-ink)',
  '--snp-cta-radius': '0.75rem',
}

// Product sheet shown when a piece on the rail is opened (design.md §6.5, quick view), laid
// out like a shopping app's product screen. Rendered through the rail's `renderDetail`; `stage`
// is the hanging garment, which keeps the rail's lift-in animation, spin and drag-to-turn.
// The top of the sheet is ProductHero (src/components/ui/product-hero.jsx): copy and photos on
// the left, the garment over its colour name in the middle, the buy column on the right; one
// column on phones, where the Add to Bag bar sticks to the bottom instead.
export default function ProductSheet({ product, item, items, openAt, subtitle, stage, closeRef, close, side, turnTo, titleId, shown }) {
  const bag = useBag()
  const rootRef = useRef(null)
  const heroRef = useRef(null)
  const bagButtonRef = useRef(null)
  const [bagOpen, setBagOpen] = useState(false)
  const [fitOpen, setFitOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const fitButtonRef = useRef(null)
  const [toast, setToast] = useState(null)
  const [size, setSize] = useState(null)
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)
  const [added, setAdded] = useState(null)
  const [drop, setDrop] = useState(null) // the piece dropping into the bag animation
  const wished = bag.wished.has(product.slug)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), ADDED_FOR)
    return () => window.clearTimeout(timer)
  }, [toast])

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
        image: product.images?.front,
      })
      setPending(false)
      setAdded({ name: product.name, size })
      setToast('added')
      setDrop({ id: Date.now(), name: product.name, image: product.images?.front ?? item.image, meta: `Size ${size} · ${formatPaise(product.pricePaise)}` })
    }, ADD_DELAY)
    return () => window.clearTimeout(timer)
  }, [pending, product, size, item.image])

  // Both Add buttons (the hero's and the phone bar's) land here. No size: say so, go to sizes.
  const onAdd = () => {
    if (pending || added) return
    if (!size) {
      setError(true)
      heroRef.current?.querySelector('.snp-sizes button:not(:disabled)')?.focus()
      return
    }
    setPending(true)
  }

  // Native share sheet where there is one (phones), otherwise copy the link.
  const onShare = async () => {
    const url = `${window.location.origin}/product/${product.slug}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${product.name} | Hestola`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setToast('copied')
    } catch {
      // The visitor closed the share sheet, or the clipboard is blocked; nothing to report.
    }
  }

  // Swap another piece into the sheet, facing front, from the top.
  const openOther = (index) => {
    if (side !== 'front') turnTo('front')
    openAt(index)
    rootRef.current?.closest('[role="dialog"]')?.scrollTo({ top: 0 })
  }

  const closeFit = () => {
    setFitOpen(false)
    fitButtonRef.current?.focus({ preventScroll: true })
  }

  // A size chosen in Find my size comes back to the sheet; nothing goes in the bag yet (§6.7).
  const onFitSelect = (label) => {
    setSize(label)
    setError(false)
    setFitOpen(false)
    setToast('sized')
    heroRef.current?.querySelector(`.snp-sizes button[aria-label="Size ${label}"]`)?.focus({ preventScroll: false })
  }

  const closeBag = () => {
    setBagOpen(false)
    bagButtonRef.current?.focus({ preventScroll: true })
  }

  const fade = cn(
    'transition-[opacity,transform] duration-500 motion-reduce:transition-none',
    shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
  )
  const toastText =
    toast === 'added' && added
      ? `Added to bag: ${added.name}, size ${added.size}`
      : toast === 'copied'
        ? 'Link copied'
        : toast === 'sized' && size
          ? `Size ${size} selected`
          : ''

  // One colourway per piece for now; its photos make the gallery behind the thumbnails.
  const gallery = Object.entries(product.images ?? {}).map(([view, src]) => ({ src, label: VIEW_LABELS[view] ?? view }))
  const variants = [{ name: product.colour.name, swatch: product.colour.hex, src: product.images?.front ?? item.image, gallery }]

  const heroStage = (
    <>
      {stage}
      <ViewDots side={side} onChange={turnTo} className={cn('absolute inset-x-0 bottom-0', fade)} />
      <WishButton
        name={product.name}
        wished={wished}
        onToggle={() => toggleWish(product.slug)}
        className={cn('absolute right-0 top-0 md:hidden', shown ? 'opacity-100' : 'opacity-0')}
      />
    </>
  )

  return (
    <div ref={rootRef} className="product-sheet relative flex min-h-full w-full flex-col text-(--sheet-ink)">
      {/* White canvas over the page; clicks fall through to the rail's backdrop, which closes. */}
      <div
        aria-hidden="true"
        className={cn('pointer-events-none fixed inset-0 bg-(--sheet-canvas) transition-opacity duration-300 motion-reduce:transition-none', shown ? 'opacity-100' : 'opacity-0')}
      />

      <SheetHeader
        ref={bagButtonRef}
        closeRef={closeRef}
        onBack={close}
        onShare={onShare}
        onBag={() => setBagOpen(true)}
        bagCount={bagCount(bag)}
        className={cn('transition-opacity duration-300 motion-reduce:transition-none', shown ? 'opacity-100' : 'opacity-0')}
      />

      <ProductHero
        ref={heroRef}
        variants={variants}
        eyebrow={subtitle}
        title={product.name}
        titleId={titleId}
        description={product.description}
        sizes={product.sizes}
        size={size}
        onSizeChange={(label) => {
          setSize(label)
          setError(false)
        }}
        sizeError={error}
        sizeNote={
          <SizeHelp
            ref={fitButtonRef}
            guide={product.sizeGuide}
            guideOpen={guideOpen}
            onToggleGuide={() => setGuideOpen((open) => !open)}
            onFindSize={() => setFitOpen(true)}
          />
        }
        price={<Price pricePaise={product.pricePaise} compareAtPaise={product.compareAtPaise} />}
        cartState={pending ? 'busy' : added ? 'done' : 'idle'}
        onAddToCart={onAdd}
        liked={wished}
        onLikeChange={() => toggleWish(product.slug)}
        likeColor="var(--color-brand)"
        stage={heroStage}
        revealed={shown}
        actionsOnSmall={false}
        height="auto"
        labels={{ add: 'Add to Bag', like: wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist` }}
        style={HERO_THEME}
      />

      <RelatedPieces items={items} current={item} onOpen={openOther} />

      {/* Sign-off: the brand once more at the end of the page, as a shop's footer would. */}
      <footer className="relative mx-5 mt-12 flex flex-col items-center gap-2 border-t border-(--sheet-line) pb-8 pt-10 text-center md:mx-[6vw] md:mt-20">
        <HestolaMark className="size-7 text-brand" />
        <p className="font-wordmark text-2xl leading-none tracking-[0.12em]">HESTOLA</p>
        <p className="text-xs text-(--sheet-muted)">Wear your identity</p>
      </footer>

      <BagBar
        pricePaise={product.pricePaise}
        note={size ? `Size ${size}` : 'Select a size'}
        pending={pending}
        added={Boolean(added)}
        onAdd={onAdd}
        className="sticky bottom-0 z-10 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      />

      {/* Confirmations (outside the faded columns so `fixed` is relative to the viewport). */}
      <p
        role="status"
        className={cn(
          'pointer-events-none fixed left-1/2 top-[4.25rem] z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--sheet-ink) px-4 py-2 text-xs font-medium text-white transition-[opacity,transform] duration-300 motion-reduce:transition-none',
          toastText ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
        )}
      >
        {toastText}
      </p>

      {drop && <BagDrop key={drop.id} item={drop} onDone={() => setDrop(null)} />}
      {bagOpen && <BagDrawer onClose={closeBag} />}
      {fitOpen && (
        <FindMySize
          product={product}
          onSelect={onFitSelect}
          onOpenGuide={() => {
            setGuideOpen(true)
            closeFit()
          }}
          onClose={closeFit}
        />
      )}
    </div>
  )
}

// Price first and bold; on sale, the old price struck through and a small "% off" badge.
function Price({ pricePaise, compareAtPaise }) {
  const onSale = compareAtPaise > pricePaise
  return (
    <span className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
      {onSale && (
        <>
          <span className="rounded-md bg-(--sheet-sale-bg) px-1.5 py-0.5 text-[11px] font-semibold text-(--sheet-sale-ink)">
            {Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100)}% off
          </span>
          <s className="text-sm font-normal text-(--sheet-muted) tabular-nums">
            <span className="sr-only">Was </span>
            {formatPaise(compareAtPaise)}
          </s>
        </>
      )}
      <span className="text-xl font-bold tabular-nums">{formatPaise(pricePaise)}</span>
    </span>
  )
}

// Under the sizes: Find my size (design.md §6.7), then the size guide (§6.6), which shows the
// product's guide or says there isn't one yet.
const SizeHelp = forwardRef(function SizeHelp({ guide, guideOpen, onToggleGuide, onFindSize }, findRef) {
  const id = useId()
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          ref={findRef}
          type="button"
          onClick={onFindSize}
          aria-haspopup="dialog"
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-(--sheet-canvas) px-3 text-xs font-semibold shadow-[inset_0_0_0_1px_var(--sheet-line)] hover:shadow-[inset_0_0_0_1px_var(--sheet-ink)]"
        >
          <Ruler aria-hidden="true" className="size-3.5" />
          Find my size
        </button>
        <button
          type="button"
          aria-expanded={guideOpen}
          aria-controls={id}
          onClick={onToggleGuide}
          className="text-xs text-(--sheet-muted) underline decoration-(--sheet-off-ink) underline-offset-4 hover:text-(--sheet-ink)"
        >
          Size guide
        </button>
      </div>
      <p id={id} hidden={!guideOpen} className="mt-2 border-l-2 border-(--sheet-line) pl-3 text-xs leading-relaxed text-(--sheet-muted)">
        {guide ?? 'A size guide for this piece isn’t available yet.'}
      </p>
    </div>
  )
})

// Save to wishlist on phones, where the hero's own Add/like row is hidden.
function WishButton({ name, wished, onToggle, className }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={wished}
      aria-label={wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        'z-10 grid size-10 place-items-center rounded-full bg-white text-(--sheet-ink) shadow-[0_1px_2px_rgb(0_0_0/0.08)] outline-none transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
        className,
      )}
    >
      <Heart aria-hidden="true" className={cn('size-[18px] transition-colors motion-reduce:transition-none', wished && 'fill-brand text-brand')} />
    </button>
  )
}
