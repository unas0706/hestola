import { formatPaise } from '@/lib/money'

// "You may also like" (design.md §6.5, item 21): the other pieces on the rail, one of each,
// in a row that scrolls sideways on phones. Choosing one swaps it into the sheet.
export default function RelatedPieces({ items, current, onOpen, limit = 4 }) {
  const seen = new Set([current.product?.slug])
  const picks = []
  items.forEach((item, index) => {
    const slug = item.product?.slug
    if (!slug || seen.has(slug) || picks.length >= limit) return
    seen.add(slug)
    picks.push({ item, index })
  })
  if (picks.length === 0) return null

  return (
    <section aria-labelledby="related-title" className="relative w-full pt-10 md:px-[6vw] md:pt-16">
      <h2 id="related-title" className="px-5 text-base font-semibold md:px-0">
        You may also like
      </h2>
      <ul className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
        {picks.map(({ item, index }) => (
          <li key={item.product.slug} className="w-[42%] shrink-0 snap-start md:w-auto">
            <button
              type="button"
              onClick={() => onOpen(index)}
              className="group block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-(--sheet-card)">
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="size-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>
              <p className="mt-2 text-sm font-medium leading-snug">{item.product.name}</p>
              <p className="mt-0.5 text-sm tabular-nums text-(--sheet-muted)">{formatPaise(item.product.pricePaise)}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
