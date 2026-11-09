import { useSyncExternalStore } from 'react'

// DEMO bag and wishlist, held in memory only (lost on reload). Replace with the cart and
// wishlist APIs once the backend exists (design.md §6.8, §6.9, §18). Prices are integer paise.

let state = { lines: [], wished: new Set() }
const listeners = new Set()

function set(next) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Adds one of the exact variant; a repeat add raises that line's quantity.
export function addToBag({ productId, slug, name, colour, size, pricePaise }) {
  const key = `${productId}:${colour}:${size}`
  const existing = state.lines.find((line) => line.key === key)
  const lines = existing
    ? state.lines.map((line) => (line === existing ? { ...line, quantity: line.quantity + 1 } : line))
    : [...state.lines, { key, productId, slug, name, colour, size, pricePaise, quantity: 1 }]
  set({ ...state, lines })
}

export function toggleWish(productId) {
  const wished = new Set(state.wished)
  if (wished.has(productId)) wished.delete(productId)
  else wished.add(productId)
  set({ ...state, wished })
}

export function useBag() {
  return useSyncExternalStore(subscribe, () => state)
}

export const bagCount = (bag) => bag.lines.reduce((sum, line) => sum + line.quantity, 0)
