const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Amounts are stored as integer paise; format only at the display edge.
export function formatPaise(paise) {
  return inr.format(paise / 100)
}
