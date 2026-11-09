import HestolaMark from '@/components/brand/HestolaMark'
import { cn } from '@/lib/utils'

// Departments are fixed in the spec (§4.2). Further categories must come from
// admin-managed navigation data, so none are hard-coded here.
const departments = [
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  // §16 has no dedicated route; assumes an admin-created "new-arrivals" collection.
  { label: 'New arrivals', href: '/collection/new-arrivals' },
]

// Underline draws in from the left on hover/focus.
const linkClass =
  'relative inline-flex min-h-11 items-center text-sm font-medium text-foreground after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none'

export default function SiteHeader({ bagCount = 0 }) {
  return (
    <header className="enter-fade border-b border-border">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 px-4 sm:px-8">
        <a href="/" className="flex h-16 items-center gap-2.5 text-foreground sm:h-[72px]">
          <HestolaMark className="h-8 w-8 text-brand" />
          <span className="font-wordmark text-[28px] leading-none tracking-[0.12em]">HESTOLA</span>
          <span className="sr-only">home</span>
        </a>

        <nav aria-label="Departments" className="order-last -mx-4 flex w-[calc(100%+2rem)] gap-6 overflow-x-auto border-t border-border px-4 sm:order-none sm:mx-0 sm:w-auto sm:border-0 sm:px-0">
          {departments.map((d) => (
            <a key={d.href} href={d.href} className={linkClass}>
              {d.label}
            </a>
          ))}
        </nav>

        <nav aria-label="Your account" className="ml-auto flex gap-5">
          <a href="/search" className={linkClass}>Search</a>
          <a href="/account" className={cn(linkClass, 'hidden md:inline-flex')}>Account</a>
          <a href="/wishlist" className={cn(linkClass, 'hidden md:inline-flex')}>Wishlist</a>
          <a href="/cart" className={linkClass}>Bag ({bagCount})</a>
        </nav>
      </div>
    </header>
  )
}
