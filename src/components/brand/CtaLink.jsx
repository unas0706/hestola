import { cn } from '@/lib/utils'

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const variants = {
  primary: 'bg-primary text-primary-foreground',
  outline: 'border border-ink text-ink',
}

// Call-to-action link. On hover/focus an ink fill rises from the bottom and the label
// flips to ivory.
export default function CtaLink({ href, variant = 'primary', className, children }) {
  return (
    <a
      href={href}
      className={cn(
        'group relative inline-flex min-h-12 items-center justify-center overflow-hidden px-8 text-sm font-semibold transition-colors duration-500 hover:text-ivory focus-visible:text-ivory motion-reduce:transition-none',
        EASE,
        variants[variant],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 translate-y-full bg-ink transition-transform duration-500 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none',
          EASE,
        )}
      />
      <span className="relative">{children}</span>
    </a>
  )
}
