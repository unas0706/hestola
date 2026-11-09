// Static Hestola logo mark, taken unchanged from design/HESTOLA – Logo Intro.html
// (the final, unmasked state of the intro animation). Colour comes from `currentColor`.
import { HESTOLA_MARK_PATH } from '@/components/brand/mark-path'

export default function HestolaMark({ className, title }) {
  return (
    <svg
      viewBox="8 17 420 417"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d={HESTOLA_MARK_PATH}
      />
    </svg>
  )
}
