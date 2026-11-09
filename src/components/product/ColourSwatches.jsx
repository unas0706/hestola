import { cn } from '@/lib/utils'

// Colour choice: a row of swatches with the name under each. `colours` is [{ name, hex }].
// With one colour (all demo products today) it shows the swatch without a control.
export default function ColourSwatches({ colours, selected, onSelect }) {
  const interactive = onSelect && colours.length > 1
  const current = colours.find((colour) => colour.name === selected) ?? colours[0]

  return (
    <div>
      <p className="text-sm">
        <span className="font-semibold">Colour</span>
        <span className="ml-2 text-(--sheet-muted)">{current?.name}</span>
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-4" aria-label="Colours">
        {colours.map((colour) => {
          const active = colour.name === current?.name
          const dot = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-10 place-items-center rounded-full transition-shadow duration-200 motion-reduce:transition-none',
                  active ? 'shadow-[0_0_0_1.5px_var(--sheet-ink)]' : 'shadow-[0_0_0_1px_var(--sheet-line)]',
                )}
              >
                <span
                  className="size-7 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
                  style={{ backgroundColor: colour.hex }}
                />
              </span>
              <span className={cn('text-[11px]', active ? 'text-(--sheet-ink)' : 'text-(--sheet-muted)')}>{colour.name}</span>
            </>
          )
          return (
            <li key={colour.name}>
              {interactive ? (
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(colour.name)}
                  className="flex flex-col items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {dot}
                </button>
              ) : (
                <span className="flex flex-col items-center gap-1">{dot}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
