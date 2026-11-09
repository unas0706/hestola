import { cn } from '@/lib/utils'

const VIEWS = [
  { side: 'front', label: 'Front' },
  { side: 'back', label: 'Back' },
]

// Front / back switch under the image card. The active view is a short ink bar, the other a dot.
export default function ViewDots({ side, onChange, className }) {
  return (
    <div role="group" aria-label="View" className={cn('flex items-center justify-center', className)}>
      {VIEWS.map((view) => (
        <button
          key={view.side}
          type="button"
          aria-label={`${view.label} view`}
          aria-pressed={side === view.side}
          onClick={() => onChange(view.side)}
          className="group grid h-8 place-items-center px-1.5 outline-none"
        >
          <span
            aria-hidden="true"
            className={cn(
              'block h-1.5 rounded-full transition-[width,background-color] duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-white motion-reduce:transition-none',
              side === view.side ? 'w-5 bg-(--sheet-ink)' : 'w-1.5 bg-(--sheet-dot) group-hover:bg-(--sheet-muted)',
            )}
          />
        </button>
      ))}
    </div>
  )
}
