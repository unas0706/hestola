import { useMemo } from 'react'
import ClothingRailHero from '@/components/ui/product-rail-gallery'
import ProductSheet from '@/components/product/ProductSheet'
import { formatPaise } from '@/lib/money'

// How each garment type reads in copy, and which built-in illustration the rail falls back
// to when a product has no photos.
const GARMENTS = {
  shirt: { label: 'shirt', kind: 'shirt' },
  tee: { label: 'T-shirt', kind: 'tee' },
  polo: { label: 'polo T-shirt', kind: 'tee' },
  hoodie: { label: 'hoodie', kind: 'hoodie' },
  sweatshirt: { label: 'sweatshirt', kind: 'knit' },
  sweater: { label: 'sweater', kind: 'knit' },
  henley: { label: 'henley', kind: 'knit' },
}

// Opening a piece shows the product sheet (quick view) over the page.
// Keyed by piece, so swapping to another piece ("You may also like") starts its choices fresh.
const renderDetail = ({ item, ...sheet }) => <ProductSheet key={item.id} item={item} product={item.product} subtitle={item.subtitle} {...sheet} />

const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']

// Maps catalogue products onto the rail component's item shape.
function toRailItem(product) {
  const garment = GARMENTS[product.garment]
  return {
    id: product.id,
    name: product.name,
    kind: garment.kind,
    color: product.colour.hex,
    trim: product.colour.trim,
    image: product.images?.front,
    backImage: product.images?.back,
    sideImage: product.images?.side,
    tag: formatPaise(product.pricePaise),
    description: `${product.colour.name} ${garment.label}.`,
    slug: product.slug,
    subtitle: `${garment.label[0].toUpperCase()}${garment.label.slice(1)} in ${product.colour.name.toLowerCase()}`,
    product,
  }
}

// `bare` hangs the rail in the landing room: no heading, caption or button. Other props
// (maxSize, slideIn, onSlideInDone, autoplay) go straight to the rail.
export default function HeroRail({ products, bare = false, autoplay = true, ...railProps }) {
  const items = useMemo(() => products.map(toRailItem), [products])
  const count = NUMBER_WORDS[items.length] ?? items.length

  if (bare) {
    return <ClothingRailHero items={items} bare autoplay={autoplay} aria-label="New drop" renderDetail={renderDetail} {...railProps} />
  }

  return (
    <ClothingRailHero
      items={items}
      autoplay={autoplay}
      eyebrow={`New season · ${count} ${items.length === 1 ? 'piece' : 'pieces'} on the rail`}
      heading="Wear your identity."
      caption="Brush along the rail, slide a hanger, lift a piece to see the back."
      action={
        <a
          href="/collection/new-arrivals"
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          Shop the edit
        </a>
      }
      renderDetail={renderDetail}
      {...railProps}
    />
  )
}
