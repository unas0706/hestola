// Find my size (design.md §6.7): turns a height, weight and fit preference into a suggested
// size for one product, using that product's size model. The model is product data, not code:
// in production it comes from the admin's size charts and fit rules (§2.2, §20); nothing here
// knows a threshold of its own. Height and weight are never stored or sent anywhere.
//
// A size model looks like:
// {
//   demo: true,                         // demo data; the UI says so
//   sizes: [{ label, heightCm: [min, max], weightKg: [min, max] }, ...],  // smallest first
//   weigh: { weight: 0.65, height: 0.35 }, // how much each input counts
//   fitShift: { snug: -0.35, regular: 0, relaxed: 0.35 }, // in sizes
//   fitNote: 'Cut oversized ...',       // optional, shown with the result
// }

export const FIT_PREFERENCES = [
  { id: 'snug', label: 'Snug' },
  { id: 'regular', label: 'Regular' },
  { id: 'relaxed', label: 'Relaxed' },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Where a value falls along the sizes, as a fractional index: 2 is the middle of the third
// size's range, 2.5 its top edge. Null when it is outside every range.
function position(value, ranges) {
  if (value < ranges[0][0] || value > ranges.at(-1)[1]) return null
  for (let i = 0; i < ranges.length; i++) {
    const [min, max] = ranges[i]
    const nextMin = ranges[i + 1]?.[0] ?? Infinity
    if (value >= min && (value <= max || value < nextMin)) {
      return i + clamp((value - min) / (max - min), 0, 1) - 0.5
    }
  }
  return null
}

export function suggestSize(model, { heightCm, weightKg, fit = 'regular' }) {
  if (!model?.sizes?.length) return { status: 'unavailable' }
  const sizes = model.sizes
  const byHeightPos = position(heightCm, sizes.map((size) => size.heightCm))
  const byWeightPos = position(weightKg, sizes.map((size) => size.weightKg))
  if (byHeightPos === null || byWeightPos === null) {
    return { status: 'out-of-range', heightOut: byHeightPos === null, weightOut: byWeightPos === null }
  }

  const { weight = 0.5, height = 0.5 } = model.weigh ?? {}
  const raw = (byWeightPos * weight + byHeightPos * height) / (weight + height) + (model.fitShift?.[fit] ?? 0)
  const last = sizes.length - 1
  const index = clamp(Math.round(raw), 0, last)
  const byHeight = clamp(Math.round(byHeightPos), 0, last)
  const byWeight = clamp(Math.round(byWeightPos), 0, last)

  // Close to the edge of a size: name the neighbour as the other one worth trying.
  const lean = raw - index
  const neighbour = Math.abs(lean) > 0.3 ? clamp(index + Math.sign(lean), 0, last) : index

  return {
    status: 'ok',
    size: sizes[index].label,
    index,
    byHeight: sizes[byHeight].label,
    byWeight: sizes[byWeight].label,
    alternative: neighbour !== index ? sizes[neighbour].label : null,
    alternativeIsLarger: neighbour > index,
  }
}

// Unit conversions for the scales. Stored values are always cm and kg.
export const CM_PER_INCH = 2.54
export const KG_PER_LB = 0.45359237

export function formatHeight(cm, unit) {
  if (unit === 'cm') return `${Math.round(cm)} cm`
  const inches = Math.round(cm / CM_PER_INCH)
  return `${Math.floor(inches / 12)}′ ${inches % 12}″`
}

export function formatWeight(kg, unit) {
  return unit === 'kg' ? `${Math.round(kg)} kg` : `${Math.round(kg / KG_PER_LB)} lb`
}
