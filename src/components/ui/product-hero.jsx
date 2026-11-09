import * as React from "react"
import { createPortal } from "react-dom"
import gsap from "gsap"

/*
 * Product Hero: the 21st.dev "Sneaker Product Hero" by kedhareswer
 * (https://21st.dev/r/kedhareswer/sneaker-product-hero), converted from TSX to JSX.
 * A product-detail section for one piece in one or more colourways: name and copy on the
 * left, the piece in the middle over a huge colour name, the buy column on the right.
 *
 * Its motion (the GSAP timelines, eases, durations, the float, tilt, sweep, loupe, heart
 * burst and the gallery's open/step) is kept as the original wrote it.
 *
 * Hestola changes:
 * - JSX, no TypeScript types; the original's type docs are kept as JSDoc on the props below.
 * - `stage` prop: a node shown in the middle in place of the component's own photos. Hestola
 *   passes the rail's hanging garment, which keeps the rail's lift-in, spin and drag. With a
 *   stage, the float, pointer tilt, reflection, light sweep and hold-to-zoom loupe are off
 *   (the garment has its own motion and its own pointer drag); the colour word, the tinted
 *   backdrop, the floor shadow and the gallery stay. The stage area is portrait for garments.
 * - No reviews or star rating, no per-size prices, and no "ships in 2 days": Hestola has no
 *   review data or shipping rules yet (CLAUDE.md, design.md §20). `price` is a node the caller
 *   formats (integer paise there), so sale prices can show.
 * - No size is chosen for the shopper (design.md §6.5). Pressing Add with no size calls
 *   `onAddToCart` with `size: null`, so the caller can say "Select a size".
 * - Size, liked and cart state can be controlled (`size`/`onSizeChange`, `liked`/`onLikeChange`,
 *   `cartState`), so a page can share them with another Add button. The built-in add toast is
 *   gone; the page shows its own confirmation.
 * - Labels are sentence case and come from `labels`; `sizeNote` sits under the stock line
 *   (Hestola's size-guide note); `revealed` fades the copy and buy columns in and out.
 * - Gallery photos are portrait (`portrait`, default true). The gallery renders in a portal
 *   and keeps its keys to itself: Esc closes only the gallery, Tab stays inside it, and the
 *   arrows step photos instead of reaching the page behind.
 * - `actionsOnSmall={false}` hides the Add/like row in the one-column layout, for pages
 *   with their own sticky Add bar.
 * - With `revealed={false}` the section's own backdrop goes transparent too, so a page can fade
 *   its canvas in and out around the stage.
 * - The section clips sideways only, so a stage animating in from elsewhere is not cut off.
 * - The colour word is set in the display face passed as `--snp-word-font`.
 *
 * Props:
 * - variants: [{ name, swatch, tint?, src, gallery?: [{ src, label?, focus?: [x,y], zoom?, mirror? }],
 *   soldOut?: [sizeLabel], stock?: { [sizeLabel]: number } }]
 * - sizes: [{ label, soldOut?, stock? }]; lowStock (default 3)
 * - eyebrow, title, titleId, description, price (node)
 * - size, defaultSize, onSizeChange(label), sizeError (bool), sizeNote (node)
 * - cartState ('idle' | 'busy' | 'done'), onAddToCart({ variant, size })
 * - liked, onLikeChange(liked), likeColor
 * - stage (node), revealed (bool), actionsOnSmall (bool), portrait (bool), labels, height,
 *   className, style
 */

const HEART =
  "M12 20.3l-1.4-1.3C5.4 14.3 2 11.2 2 7.4 2 4.4 4.4 2 7.4 2c1.7 0 3.4.8 4.6 2.1C13.2 2.8 14.9 2 16.6 2 19.6 2 22 4.4 22 7.4c0 3.8-3.4 6.9-8.6 11.6z"

const DEFAULT_LABELS = {
  size: "Size",
  price: "Price",
  colour: "Colour",
  add: "Add to bag",
  added: "Added",
  soldOut: "Sold out",
  selectSize: "Select a size",
  inStock: "In stock",
  soldOutColour: "Sold out in this colour",
  lowStock: (n, size) => `Only ${n} left in size ${size}`,
  liked: "Saved to wishlist",
  unliked: "Removed from wishlist",
  like: "Save to wishlist",
  hintFine: "Hold to zoom",
  hintTouch: "Tap to view",
}

// Seven framings of one photo: the gallery a piece gets when it has no photos of its own.
const FRAMINGS = [
  { label: "Front" },
  { label: "Mirrored", mirror: true },
  { label: "Collar", focus: [0.5, 0.18], zoom: 1.8 },
  { label: "Chest", focus: [0.5, 0.38], zoom: 1.8 },
  { label: "Sleeve", focus: [0.18, 0.4], zoom: 1.8 },
  { label: "Hem", focus: [0.5, 0.86], zoom: 1.7 },
  { label: "Detail", focus: [0.7, 0.5], zoom: 1.9 },
]

// #region logic
/** Background position that puts image point `f` (0–1) mid-box at zoom `z`. */
export function focusPosition(f, z) {
  if (z <= 1) return 50
  const p = (f * z - 0.5) / (z - 1)
  return Math.round(Math.min(1, Math.max(0, p)) * 1000) / 10
}

/** Whether a size is sold out in a colourway, and how many are left. */
export function availability(size, variant) {
  if (!size) return { soldOut: true, stock: 0 }
  const stock = variant?.stock?.[size.label] ?? size.stock
  const soldOut = !!size.soldOut || !!variant?.soldOut?.includes(size.label) || stock === 0
  return { soldOut, stock: soldOut ? 0 : stock }
}
// #endregion

/** Peak opacity of the floor reflection. */
const REFLECT = 0.24

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

function viewStyle(v) {
  const z = v.zoom ?? 1
  const [fx, fy] = v.focus ?? [0.5, 0.5]
  return {
    backgroundImage: `url("${v.src}")`,
    backgroundSize: z <= 1 ? "contain" : `${z * 100}% auto`,
    backgroundPosition: `${focusPosition(fx, z)}% ${focusPosition(fy, z)}%`,
    transform: v.mirror ? "scaleX(-1)" : undefined,
  }
}

// Controlled when `value` is given, otherwise local state.
function useMaybeControlled(value, initial, onChange) {
  const [own, setOwn] = React.useState(initial)
  const controlled = value !== undefined
  const set = React.useCallback(
    (next) => {
      if (!controlled) setOwn(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [controlled ? value : own, set]
}

const ProductHero = React.forwardRef(function ProductHero(
  {
    variants,
    defaultVariant = 0,
    eyebrow,
    title,
    titleId,
    description,
    sizes = [],
    price,
    lowStock = 3,
    size: sizeProp,
    defaultSize = null,
    onSizeChange,
    sizeError = false,
    sizeNote,
    cartState,
    onAddToCart,
    liked: likedProp,
    onLikeChange,
    likeColor = "#e11d48",
    stage,
    revealed = true,
    actionsOnSmall = true,
    portrait = true,
    labels: labelsProp,
    height = "100svh",
    className,
    style,
  },
  forwardedRef,
) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp }
  const count = variants.length
  const [active, setActive] = React.useState(() => Math.min(Math.max(defaultVariant, 0), Math.max(count - 1, 0)))
  const avail = (vi, label) => availability(sizes.find((s) => s.label === label), variants[vi])
  const [size, setSize] = useMaybeControlled(sizeProp, defaultSize, onSizeChange)
  const [ownCart, setOwnCart] = React.useState("idle")
  const cart = cartState ?? ownCart
  const cartTimers = React.useRef([])
  const [vZoom, setVZoom] = React.useState(false)
  const [hintSeen, setHintSeen] = React.useState(false)
  const [liked, setLiked] = useMaybeControlled(likedProp, false, onLikeChange)
  const [likeMsg, setLikeMsg] = React.useState("")
  const [viewer, setViewer] = React.useState(null)
  const [thumbSet, setThumbSet] = React.useState(active)
  const slotted = stage != null

  const shoeRefs = React.useRef([])
  const wordRefs = React.useRef([])
  const reflectRefs = React.useRef([])
  const tiltRef = React.useRef(null)
  const sheenRef = React.useRef(null)
  const shoeStageRef = React.useRef(null)
  const loupeRef = React.useRef(null)
  const loupeImgRef = React.useRef(null)
  const holding = React.useRef(false)
  const lastPointer = React.useRef("mouse")
  const reflectWrapRef = React.useRef(null)
  const floatRef = React.useRef(null)
  const floorRef = React.useRef(null)
  const rootRef = React.useRef(null)
  const thumbsRef = React.useRef(null)
  const likeRef = React.useRef(null)
  const burstRef = React.useRef(null)
  const pillRef = React.useRef(null)
  const boxRef = React.useRef(null)
  const viewerRef = React.useRef(null)
  const closeRef = React.useRef(null)
  const opener = React.useRef(null)
  const shown = React.useRef(active)

  const setRoot = React.useCallback(
    (el) => {
      rootRef.current = el
      if (typeof forwardedRef === "function") forwardedRef(el)
      else if (forwardedRef) forwardedRef.current = el
    },
    [forwardedRef],
  )

  // Only the shoe and word on show are visible at first.
  React.useLayoutEffect(() => {
    shoeRefs.current.forEach((el, i) => el && gsap.set(el, { yPercent: 0, rotation: 0, autoAlpha: i === shown.current ? 1 : 0 }))
    wordRefs.current.forEach((el, i) => el && gsap.set(el, { yPercent: 0, autoAlpha: i === shown.current ? 1 : 0 }))
    reflectRefs.current.forEach((el, i) => el && gsap.set(el, { autoAlpha: i === shown.current ? REFLECT : 0 }))
  }, [count])

  // A slow float while the section is on screen. (Hestola: not around a slotted stage.)
  React.useEffect(() => {
    const wrap = floatRef.current
    const floor = floorRef.current
    const root = rootRef.current
    if (slotted || !wrap || !floor || !root || prefersReduced()) return
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 2.6, ease: "sine.inOut" } })
    tl.to(wrap, { y: "-1.1cqw" }, 0).to(floor, { scaleX: 0.88, opacity: 0.65 }, 0)
    if (reflectWrapRef.current) tl.to(reflectWrapRef.current, { y: "1.1cqw" }, 0)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.resume() : tl.pause()))
    io.observe(root)
    return () => {
      io.disconnect()
      tl.kill()
    }
  }, [slotted])

  React.useEffect(
    () => () => {
      cartTimers.current.forEach(clearTimeout)
    },
    [],
  )

  // The shoe leans towards a fine pointer; the glow and the shadow follow.
  // (Hestola: only the glow follows a slotted stage; the garment is not tilted.)
  React.useEffect(() => {
    const root = rootRef.current
    const tilt = tiltRef.current
    const floor = floorRef.current
    if (!root || !floor || prefersReduced() || !window.matchMedia("(pointer: fine)").matches) return
    const ry = tilt && !slotted ? gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" }) : () => {}
    const rx = tilt && !slotted ? gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" }) : () => {}
    const fx = gsap.quickTo(floor, "x", { duration: 0.9, ease: "power3.out" })
    if (tilt && !slotted) gsap.set(tilt, { transformPerspective: 1100 })
    const glow = { x: 0, y: 0 }
    const drift = (x, y) =>
      gsap.to(glow, {
        x,
        y,
        duration: 1,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          root.style.setProperty("--mx", glow.x.toFixed(2) + "%")
          root.style.setProperty("--my", glow.y.toFixed(2) + "%")
        },
      })
    const onMove = (e) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return
      const r = (shoeStageRef.current ?? root).getBoundingClientRect()
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
      const k = holding.current ? 0 : 1
      ry(nx * 12 * k)
      rx(-ny * 7 * k)
      fx(-nx * 14 * k)
      drift(nx * 8, ny * 6)
    }
    const onLeave = () => {
      ry(0)
      rx(0)
      fx(0)
      drift(0, 0)
    }
    root.addEventListener("pointermove", onMove)
    root.addEventListener("pointerleave", onLeave)
    return () => {
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerleave", onLeave)
      gsap.killTweensOf(glow)
    }
  }, [slotted])

  // A band of light crosses the shoe: once on arrival, then on every colour.
  const sweep = (delay) => {
    const sh = sheenRef.current
    if (!sh || prefersReduced()) return
    gsap.fromTo(sh, { backgroundPosition: "130% 0%" }, { backgroundPosition: "-30% 0%", duration: 1.2, ease: "power2.inOut", delay })
  }
  React.useEffect(() => sweep(0.6), [])

  const pick = (next) => {
    const prev = shown.current
    if (next === prev) return
    setActive(next)
    shown.current = next
    // Hestola: a size that sells out in the new colour is cleared, not swapped for another.
    if (size && avail(next, size).soldOut) setSize(null)
    const refl = reflectRefs.current
    const rm = prefersReduced()
    refl.forEach((el) => el && gsap.killTweensOf(el))
    if (refl[prev]) gsap.to(refl[prev], { autoAlpha: 0, duration: rm ? 0 : 0.25 })
    if (refl[next]) gsap.to(refl[next], { autoAlpha: REFLECT, duration: rm ? 0 : 0.6, delay: rm ? 0 : 0.45 })
    const reduce = prefersReduced()
    const shoes = shoeRefs.current
    const words = wordRefs.current
    ;[shoes, words].forEach((list) =>
      list.forEach((el, i) => {
        if (!el) return
        gsap.killTweensOf(el)
        if (i !== prev && i !== next) gsap.set(el, { autoAlpha: 0, yPercent: 0, rotation: 0 })
      }),
    )
    if (reduce) {
      ;[shoes, words].forEach((list) => {
        if (list[prev]) gsap.set(list[prev], { autoAlpha: 0, yPercent: 0, rotation: 0 })
        if (list[next]) gsap.set(list[next], { autoAlpha: 1, yPercent: 0, rotation: 0 })
      })
      setThumbSet(next)
      return
    }
    // From the reference: a ~0.4 s swap, the old shoe lifting out the top as
    // the new one rises from below, about 1.3 shoe-heights of travel.
    if (shoes[prev]) gsap.to(shoes[prev], { yPercent: -130, rotation: -7, autoAlpha: 0, duration: 0.45, ease: "power2.in" })
    if (shoes[next])
      gsap.fromTo(
        shoes[next],
        { yPercent: 130, rotation: 9, autoAlpha: 0 },
        { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 0.7, ease: "back.out(1.3)", delay: 0.06 },
      )
    sweep(0.55)
    if (words[prev]) gsap.to(words[prev], { yPercent: -70, autoAlpha: 0, duration: 0.55, ease: "power2.in" })
    if (words[next]) gsap.fromTo(words[next], { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", delay: 0.1 })
    const thumbs = thumbsRef.current
    if (thumbs)
      gsap.to(thumbs, {
        autoAlpha: 0,
        x: -8,
        duration: 0.16,
        ease: "power1.in",
        onComplete: () => {
          setThumbSet(next)
          gsap.fromTo(thumbs, { autoAlpha: 0, x: 8 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out" })
        },
      })
    else setThumbSet(next)
  }

  const like = () => {
    const next = !liked
    setLiked(next)
    setLikeMsg(next ? labels.liked : labels.unliked)
    const from = likeRef.current
    const pill = pillRef.current
    if (!from || !pill) return
    gsap.killTweensOf(pill)
    if (prefersReduced()) {
      gsap.set(pill, { autoAlpha: 1, y: 0 })
      gsap.to(pill, { autoAlpha: 0, duration: 0, delay: 1.6 })
      return
    }
    gsap
      .timeline()
      .fromTo(pill, { autoAlpha: 0, y: 6, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2)" })
      .to(pill, { autoAlpha: 0, y: -10, duration: 0.4, ease: "power2.in" }, "+=1.1")
    gsap.fromTo(from.firstElementChild, { scale: next ? 0.5 : 1.2 }, { scale: 1, duration: 0.55, ease: "back.out(3)" })
    const burst = burstRef.current
    if (!next || !burst) return
    Array.from(burst.children).forEach((h, i) => {
      const a = (-90 + (i - 3) * 26 + gsap.utils.random(-8, 8)) * (Math.PI / 180)
      const d = gsap.utils.random(26, 46)
      gsap.fromTo(
        h,
        { x: 0, y: 0, scale: 0.4, autoAlpha: 1, rotation: 0 },
        {
          x: Math.cos(a) * d,
          y: Math.sin(a) * d,
          scale: gsap.utils.random(0.6, 1),
          rotation: gsap.utils.random(-30, 30),
          autoAlpha: 0,
          duration: gsap.utils.random(0.6, 0.9),
          ease: "power2.out",
        },
      )
    })
  }

  const addToCart = () => {
    const variant = variants[shown.current]
    if (cart !== "idle") return
    if (!size) {
      onAddToCart?.({ variant, size: null })
      return
    }
    if (avail(shown.current, size).soldOut) return
    onAddToCart?.({ variant, size })
    if (cartState !== undefined) return
    const reduce = prefersReduced()
    const later = (ms, fn) => cartTimers.current.push(window.setTimeout(fn, ms))
    setOwnCart(reduce ? "done" : "busy")
    later(reduce ? 0 : 650, () => setOwnCart("done"))
    later(reduce ? 1600 : 2100, () => setOwnCart("idle"))
  }

  // Hold a mouse or pen on the shoe for a loupe; tap it on touch to open the photos.
  const placeLoupe = (e) => {
    const stageEl = shoeStageRef.current
    const img = shoeRefs.current[shown.current]
    const lp = loupeRef.current
    const li = loupeImgRef.current
    if (!stageEl || !img || !lp || !li) return
    const st = stageEl.getBoundingClientRect()
    const r = img.getBoundingClientRect()
    const L = lp.offsetWidth
    const Z = 2.2
    gsap.set(lp, { x: e.clientX - st.left - L / 2, y: e.clientY - st.top - L / 2 })
    li.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`
    li.style.backgroundPosition = `${-((e.clientX - r.left) * Z - L / 2)}px ${-((e.clientY - r.top) * Z - L / 2)}px`
  }
  const onStageDown = (e) => {
    lastPointer.current = e.pointerType
    if (e.pointerType === "touch" || e.button !== 0) return
    const lp = loupeRef.current
    const li = loupeImgRef.current
    const cur = variants[shown.current]
    if (!lp || !li || !cur) return
    holding.current = true
    setHintSeen(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    li.style.backgroundImage = `url("${cur.src}")`
    if (tiltRef.current) gsap.to(tiltRef.current, { rotationX: 0, rotationY: 0, duration: 0.3 })
    placeLoupe(e)
    gsap.fromTo(lp, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: prefersReduced() ? 0 : 0.3, ease: "back.out(2)" })
  }
  const onStageMove = (e) => {
    if (holding.current) placeLoupe(e)
  }
  const onStageUp = () => {
    if (!holding.current) return
    holding.current = false
    if (loupeRef.current) gsap.to(loupeRef.current, { autoAlpha: 0, scale: 0.7, duration: prefersReduced() ? 0 : 0.2 })
  }

  const v = variants[thumbSet] ?? variants[0]
  const views = v ? (v.gallery?.length ? v.gallery : FRAMINGS.map((f) => ({ ...f, src: v.src }))) : []
  const more = Math.max(0, views.length - 3)

  // Gallery: open, step, close, keyboard.
  const openViewer = (i) => {
    opener.current = document.activeElement
    setViewer(i)
  }
  const closeViewer = () => {
    setViewer(null)
    setVZoom(false)
    opener.current?.focus({ preventScroll: true })
  }
  const step = (d) => {
    setVZoom(false)
    setViewer((i) => (i === null ? i : (i + d + views.length) % views.length))
  }
  // Hestola: the gallery's keys stay in the gallery (it sits inside the product sheet's dialog).
  const onViewerKey = (e) => {
    e.stopPropagation()
    if (e.key === "Escape") {
      e.preventDefault()
      closeViewer()
    } else if (e.key === "ArrowRight") step(1)
    else if (e.key === "ArrowLeft") step(-1)
    else if (e.key === "Tab") {
      const controls = [...(viewerRef.current?.querySelectorAll("button:not([tabindex='-1'])") ?? [])]
      const firstEl = controls[0]
      const lastEl = controls.at(-1)
      if (!firstEl) return
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
  }
  const isOpen = viewer !== null
  React.useLayoutEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    if (!prefersReduced() && boxRef.current)
      gsap.fromTo(boxRef.current, { autoAlpha: 0, scale: 0.94, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" })
  }, [isOpen])
  const frameRef = React.useRef(null)
  React.useLayoutEffect(() => {
    if (viewer === null || prefersReduced() || !frameRef.current) return
    gsap.fromTo(frameRef.current, { autoAlpha: 0.2, scale: 0.985 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" })
  }, [viewer])

  const tintOf = (vv) => vv.tint ?? vv.swatch
  const here = size ? avail(active, size) : null
  const stockTone = !here
    ? sizeError
      ? "error"
      : "none"
    : here.soldOut
      ? "out"
      : here.stock !== undefined && here.stock <= lowStock
        ? "low"
        : "ok"
  const stockText =
    stockTone === "error" || stockTone === "none"
      ? labels.selectSize
      : stockTone === "out"
        ? labels.soldOutColour
        : stockTone === "low"
          ? labels.lowStock(here.stock, size)
          : labels.inStock
  const rootVars = {
    "--snp-like": likeColor,
    "--snp-tint": v ? tintOf(variants[active] ?? v) : "transparent",
  }

  return (
    <section
      ref={setRoot}
      className={"snp-root" + (className ? " " + className : "")}
      data-revealed={revealed}
      data-slotted={slotted}
      data-actions-small={actionsOnSmall}
      data-portrait={portrait}
      style={{ minHeight: height, ...rootVars, ...style }}
      aria-labelledby={titleId}
    >
      <style>{CSS}</style>

      {variants.map((vv, i) => (
        <span key={i} className="snp-bg" data-on={i === active} style={{ "--t": tintOf(vv) }} aria-hidden="true" />
      ))}

      <div className="snp-body">
        <div className="snp-info">
          {eyebrow && <p className="snp-eyebrow">{eyebrow}</p>}
          <h2 id={titleId} className="snp-title">
            {title}
          </h2>
          {description && <p className="snp-desc">{description}</p>}
          <div className="snp-thumbs">
            <span className="snp-thumbset" ref={thumbsRef}>
              {views.slice(0, 3).map((vw, i) => (
                <button key={i} type="button" className="snp-thumb" aria-label={`View ${vw.label ?? `photo ${i + 1}`}`} onClick={() => openViewer(i)}>
                  <span className="snp-view" style={viewStyle(vw)} />
                </button>
              ))}
            </span>
            {more > 0 && (
              <button type="button" className="snp-more" aria-label={`View all ${views.length} photos`} onClick={() => openViewer(3)}>
                +{more}
              </button>
            )}
          </div>
        </div>

        <div
          className="snp-stage"
          ref={shoeStageRef}
          onPointerDown={slotted ? undefined : onStageDown}
          onPointerMove={slotted ? undefined : onStageMove}
          onPointerUp={slotted ? undefined : onStageUp}
          onPointerCancel={slotted ? undefined : onStageUp}
          onClick={
            slotted
              ? undefined
              : () => {
                  if (lastPointer.current === "touch") openViewer(0)
                }
          }
        >
          <div className="snp-words" aria-hidden="true">
            {variants.map((vv, i) => (
              <span
                key={i}
                ref={(el) => {
                  wordRefs.current[i] = el
                }}
                className="snp-word"
                style={{ "--t": tintOf(vv), visibility: i === active ? "visible" : "hidden" }}
              >
                {vv.name}
              </span>
            ))}
          </div>
          <span className="snp-floor" ref={floorRef} aria-hidden="true" />
          {slotted ? (
            <div className="snp-slot">{stage}</div>
          ) : (
            <>
              <div className="snp-reflects" ref={reflectWrapRef} aria-hidden="true">
                {variants.map((vv, i) => (
                  <img
                    key={i}
                    ref={(el) => {
                      reflectRefs.current[i] = el
                    }}
                    className="snp-shoe snp-reflect"
                    src={vv.src}
                    alt=""
                    draggable={false}
                    style={{ visibility: i === active ? "visible" : "hidden" }}
                  />
                ))}
              </div>
              <div className="snp-float" ref={floatRef}>
                <div className="snp-tilt" ref={tiltRef}>
                  {variants.map((vv, i) => (
                    <img
                      key={i}
                      ref={(el) => {
                        shoeRefs.current[i] = el
                      }}
                      className="snp-shoe"
                      src={vv.src}
                      alt={i === active ? `${title} in ${vv.name}` : ""}
                      aria-hidden={i === active ? undefined : true}
                      draggable={false}
                      style={{ visibility: i === active ? "visible" : "hidden" }}
                    />
                  ))}
                  <span
                    className="snp-shoe snp-sheen"
                    ref={sheenRef}
                    aria-hidden="true"
                    style={{ WebkitMaskImage: `url("${variants[active]?.src}")`, maskImage: `url("${variants[active]?.src}")` }}
                  />
                </div>
              </div>
              <span className="snp-loupe" ref={loupeRef} aria-hidden="true">
                <span ref={loupeImgRef} />
              </span>
              <span className="snp-hint" data-seen={hintSeen} aria-hidden="true">
                <span className="snp-hint-fine">{labels.hintFine}</span>
                <span className="snp-hint-touch">{labels.hintTouch}</span>
              </span>
            </>
          )}
        </div>

        <div className="snp-buy">
          <span className="snp-label">{labels.size}</span>
          <div className="snp-sizes" role="group" aria-label={labels.size}>
            {sizes.map((s) => {
              const out = avail(active, s.label).soldOut
              return (
                <button
                  key={s.label}
                  type="button"
                  className="snp-size"
                  aria-pressed={size === s.label}
                  disabled={out}
                  aria-label={out ? `Size ${s.label}, sold out` : `Size ${s.label}`}
                  onClick={() => setSize(s.label)}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          <span className="snp-stock" data-tone={stockTone} role={stockTone === "error" ? "alert" : undefined} aria-live="polite">
            {stockText}
          </span>
          {sizeNote}
          <div className="snp-row">
            <span className="snp-label">{labels.price}</span>
            <span className="snp-price">{price}</span>
          </div>
          <span className="snp-label snp-colour">
            {labels.colour}
            <span className="snp-colour-name">{variants[active]?.name}</span>
          </span>
          <div className="snp-swatches" role="group" aria-label={labels.colour}>
            {variants.map((vv, i) => (
              <button
                key={i}
                type="button"
                className="snp-swatch"
                aria-pressed={i === active}
                aria-label={vv.name}
                style={{ "--sw": vv.swatch }}
                onClick={() => pick(i)}
              />
            ))}
          </div>
          <div className="snp-actions">
            <button type="button" className="snp-cta" data-state={cart} onClick={addToCart} aria-live="polite">
              <span className="snp-cta-idle">{labels.add}</span>
              <span className="snp-cta-busy" aria-hidden="true">
                <i />
              </span>
              <span className="snp-cta-done">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.2 4.2L19 7" />
                </svg>
                {labels.added}
              </span>
            </button>
            <button ref={likeRef} type="button" className="snp-like" aria-pressed={liked} aria-label={labels.like} onClick={like}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={HEART} />
              </svg>
              <span className="snp-burst" ref={burstRef} aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <svg key={i} viewBox="0 0 24 24">
                    <path d={HEART} fill="currentColor" />
                  </svg>
                ))}
              </span>
            </button>
            <span className="snp-pill" ref={pillRef} role="status" aria-live="polite">
              {liked ? <b>♥ </b> : null}
              {likeMsg}
            </span>
          </div>
        </div>
      </div>

      {viewer !== null &&
        views[viewer] &&
        createPortal(
          <div
            ref={viewerRef}
            className={"snp-viewer" + (className ? " " + className : "")}
            data-portrait={portrait}
            style={{ ...rootVars, ...style }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} photos`}
            onKeyDown={onViewerKey}
          >
            <button type="button" className="snp-scrim" aria-label="Close photos" tabIndex={-1} onClick={closeViewer} />
            <div className="snp-box" ref={boxRef}>
              <div className="snp-vbar">
                <strong>{views[viewer].label ?? "Photo"}</strong>
                <span>
                  {viewer + 1} / {views.length}
                </span>
                <button ref={closeRef} type="button" className="snp-vbtn snp-close" aria-label="Close photos" onClick={closeViewer}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div
                className="snp-frame"
                ref={frameRef}
                data-zoom={vZoom}
                onClick={(e) => {
                  if (e.target.closest("button")) return
                  setVZoom((z) => !z)
                }}
                onPointerMove={(e) => {
                  if (!vZoom) return
                  const r = e.currentTarget.getBoundingClientRect()
                  const el = e.currentTarget.firstElementChild
                  if (el) el.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
                }}
              >
                <span
                  className="snp-view"
                  style={{
                    ...viewStyle(views[viewer]),
                    transform: `${views[viewer].mirror ? "scaleX(-1) " : ""}scale(${vZoom ? 2.2 : 1})`,
                  }}
                  role="img"
                  aria-label={`${v?.name} ${views[viewer].label ?? ""}`}
                />
                <button type="button" className="snp-vbtn snp-nav-l" aria-label="Previous photo" onClick={() => step(-1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button type="button" className="snp-vbtn snp-nav-r" aria-label="Next photo" onClick={() => step(1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="snp-rail">
                {views.map((vw, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show ${vw.label ?? `photo ${i + 1}`}`}
                    aria-current={i === viewer}
                    onClick={() => {
                      setVZoom(false)
                      setViewer(i)
                    }}
                  >
                    <span className="snp-view" style={viewStyle(vw)} />
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
})

export default ProductHero

const CSS = `
.snp-root{position:relative;display:flex;flex-direction:column;width:100%;container-type:inline-size;overflow-x:clip;isolation:isolate;
  color:var(--color-foreground);background:color-mix(in oklab,var(--color-foreground) 4%,var(--color-background));
  font-family:inherit;-webkit-font-smoothing:antialiased}
:where(.snp-root,.snp-viewer) :where(*,*::before,*::after){box-sizing:border-box}
:where(.snp-root,.snp-viewer) :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer}
:where(.snp-root,.snp-viewer) :where(button):focus-visible{outline:2px solid var(--color-foreground);outline-offset:3px}
.snp-root img{max-width:none;display:block}
.snp-bg{position:absolute;inset:0;z-index:-1;opacity:0;transition:opacity .8s ease;pointer-events:none;
  background:radial-gradient(var(--snp-gs,48% 62%) at calc(50% + var(--mx,0%)) calc(var(--snp-gy,52%) + var(--my,0%)),color-mix(in oklab,var(--t) 42%,transparent),transparent 72%),
    color-mix(in oklab,var(--t) 15%,color-mix(in oklab,var(--color-foreground) 4%,var(--color-background)))}
.snp-bg[data-on="true"]{opacity:1}
.snp-body{position:relative;flex:1;display:grid;grid-template-columns:20cqw minmax(0,1fr) 17cqw;column-gap:3cqw;align-items:start;align-content:center;
  padding:4cqw 9cqw 4cqw 7.3cqw;overflow-x:clip}
.snp-root[data-slotted="true"] .snp-body{grid-template-columns:22cqw minmax(0,1fr) 24cqw;padding:3cqw 6cqw 4cqw}
.snp-info{align-self:start;position:relative;z-index:1}
.snp-info,.snp-buy,.snp-words{transition:opacity .5s ease,translate .5s ease}
.snp-root[data-revealed="false"] :is(.snp-info,.snp-buy,.snp-words){opacity:0;translate:0 8px}
.snp-root{transition:background-color .3s ease}
.snp-root[data-revealed="false"]{background-color:transparent}
.snp-root[data-revealed="false"] .snp-bg{opacity:0}
.snp-eyebrow{margin:0;font-size:max(12px,1.1cqw);color:var(--color-muted-foreground)}
.snp-title{margin:1.2cqw 0 0;font-size:max(22px,2.4cqw);line-height:1.18;font-weight:600;letter-spacing:-.01em;max-width:20cqw;text-wrap:balance}
.snp-desc{margin:2.4cqw 0 0;max-width:21cqw;font-size:max(12px,1.05cqw);line-height:1.55;font-style:italic;color:var(--color-muted-foreground)}
.snp-thumbs{display:flex;align-items:center;gap:2.4cqw;margin-top:9cqw}
.snp-root[data-slotted="true"] .snp-thumbs{margin-top:4cqw;gap:1.2cqw}
.snp-thumbset{display:flex;align-items:center;gap:inherit}
.snp-thumb{flex:none;width:4.6cqw;height:3cqw;overflow:hidden;border-radius:4px;outline-offset:3px;transition:transform .25s}
.snp-root[data-portrait="true"] .snp-thumb{width:max(48px,4.4cqw);height:auto;aspect-ratio:200/310;border-radius:8px;
  background:color-mix(in oklab,var(--snp-tint) 14%,var(--color-background));box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--color-foreground) 8%,transparent)}
.snp-root[data-portrait="true"] .snp-thumb .snp-view{background-origin:content-box;padding:4px}
.snp-thumb:hover{transform:translateY(-2px)}
.snp-view{display:block;width:100%;height:100%;background-repeat:no-repeat}
.snp-more{flex:none;width:3cqw;height:3cqw;display:grid;place-items:center;background:var(--color-foreground);color:var(--color-background);
  font-size:max(10px,1.05cqw);transition:transform .25s}
.snp-more:hover{transform:scale(1.08)}
.snp-stage{position:relative;align-self:stretch;max-height:42cqw;min-height:26cqw}
.snp-root[data-slotted="true"] .snp-stage{align-self:start;height:min(44cqw,calc(100svh - 9rem));max-height:none;min-height:420px}
.snp-words{position:absolute;inset:0;pointer-events:none}
.snp-word{position:absolute;left:50%;top:0;translate:-50% -14%;font-size:11cqw;line-height:1;font-weight:800;letter-spacing:-.04em;
  text-transform:uppercase;white-space:nowrap;color:color-mix(in oklab,var(--t) 34%,transparent);pointer-events:none;user-select:none}
.snp-root[data-slotted="true"] .snp-word{top:46%;translate:-50% -50%;font-family:var(--snp-word-font,inherit);font-weight:400;letter-spacing:.01em;
  font-size:13cqw;color:color-mix(in oklab,color-mix(in oklab,var(--t) 72%,var(--color-foreground)) 22%,transparent)}
.snp-slot{position:absolute;inset:0;display:flex;justify-content:center;padding:var(--snp-slot-pad,2.75rem 0 2.5rem)}
.snp-float{position:absolute;inset:0}
.snp-tilt{position:absolute;inset:0;transform-style:preserve-3d}
.snp-reflects{position:absolute;inset:0;pointer-events:none}
.snp-shoe.snp-reflect{transform:scaleY(-1);transform-origin:50% 88.5%;filter:blur(.6px);
  -webkit-mask-image:linear-gradient(to bottom,transparent 52%,#000 88%);mask-image:linear-gradient(to bottom,transparent 52%,#000 88%)}
.snp-shoe.snp-sheen{display:block;pointer-events:none;filter:none;
  background:linear-gradient(100deg,transparent 40%,rgba(255,255,255,.55) 50%,transparent 60%) 130% 0/300% 100% no-repeat;
  -webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.snp-loupe{position:absolute;left:0;top:0;z-index:3;width:max(130px,15cqw);aspect-ratio:1;border-radius:50%;overflow:hidden;
  visibility:hidden;opacity:0;pointer-events:none;background:color-mix(in oklab,var(--snp-tint) 18%,var(--color-background));
  box-shadow:0 0 0 2px var(--color-background),0 18px 44px -12px rgba(0,0,0,.4)}
.snp-loupe>span{position:absolute;inset:0;background-repeat:no-repeat}
.snp-hint{position:absolute;left:3%;bottom:4%;transition:opacity .5s;font-size:max(10px,.85cqw);letter-spacing:.12em;text-transform:uppercase;
  color:var(--color-muted-foreground);pointer-events:none}
.snp-hint-touch{display:none}
.snp-hint[data-seen="true"]{opacity:0}
@media (pointer:fine){.snp-root:not([data-slotted="true"]) .snp-stage{cursor:zoom-in}}
@media (pointer:coarse){.snp-hint-fine{display:none}.snp-hint-touch{display:inline}}
.snp-shoe{position:absolute;left:50%;top:50%;width:96%;height:auto;aspect-ratio:16/9;object-fit:contain;translate:-50% -58%;
  filter:drop-shadow(0 1.6cqw 1.4cqw rgba(0,0,0,.12))}
.snp-floor{position:absolute;left:18%;right:14%;top:50%;height:4cqw;translate:0 6.6cqw;border-radius:50%;
  background:radial-gradient(closest-side,rgba(0,0,0,.22),transparent);filter:blur(4px)}
.snp-root[data-slotted="true"] .snp-floor{left:32%;right:32%;top:auto;bottom:1.6rem;height:2.4cqw;translate:none;
  background:radial-gradient(closest-side,rgba(0,0,0,.16),transparent)}
.snp-buy{align-self:start;font-size:max(11px,1.25cqw);position:relative;z-index:1}
.snp-root[data-slotted="true"] .snp-buy{font-size:14px}
.snp-label{display:block;font-size:max(12px,1.05cqw);font-weight:500;color:var(--color-muted-foreground);letter-spacing:.01em}
.snp-sizes{display:flex;flex-wrap:wrap;gap:max(8px,.9cqw);margin-top:max(10px,1cqw)}
.snp-size{width:max(40px,3.1cqw);height:max(40px,3.1cqw);border-radius:50%;display:grid;place-items:center;
  border:1.5px solid var(--color-foreground);font-size:max(12px,.95cqw);font-weight:500;transition:background .25s,color .25s,transform .2s}
.snp-size:not(:disabled):hover{transform:scale(1.07)}
.snp-size[aria-pressed="true"]{background:var(--color-foreground);color:var(--color-background)}
.snp-size:disabled{opacity:.35;cursor:not-allowed;border-width:1px;text-decoration:line-through}
.snp-stock{display:flex;align-items:center;gap:max(6px,.6cqw);margin-top:max(10px,1.2cqw);font-size:max(12px,.95cqw);color:var(--color-muted-foreground)}
.snp-stock::before{content:"";width:max(6px,.55cqw);height:max(6px,.55cqw);border-radius:50%;background:#22c55e}
.snp-stock[data-tone="none"]::before{background:color-mix(in oklab,var(--color-foreground) 25%,transparent)}
.snp-stock[data-tone="low"]{color:#b8410c}
.snp-stock[data-tone="low"]::before{background:#f97316}
.snp-stock[data-tone="error"]{color:var(--snp-error,#b42318);font-weight:500}
.snp-stock[data-tone="error"]::before{background:var(--snp-error,#b42318)}
.snp-stock[data-tone="out"]::before{background:var(--color-muted-foreground)}
.snp-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:3cqw}
.snp-root[data-slotted="true"] .snp-row{margin-top:max(22px,2.2cqw);padding-top:max(16px,1.6cqw);border-top:1px solid color-mix(in oklab,var(--color-foreground) 10%,transparent)}
.snp-price{display:inline-block;font-weight:600;font-size:max(13px,1.4cqw);font-variant-numeric:tabular-nums}
.snp-colour{margin-top:3.1cqw;display:flex;gap:.5em}
.snp-root[data-slotted="true"] .snp-colour{margin-top:max(18px,1.8cqw)}
.snp-colour-name{color:var(--color-foreground)}
.snp-swatches{display:flex;gap:2.4cqw;margin-top:3.2cqw}
.snp-root[data-slotted="true"] .snp-swatches{margin-top:max(10px,1cqw);gap:max(12px,1.2cqw)}
.snp-swatch{width:max(30px,3.1cqw);height:max(30px,3.1cqw);border-radius:50%;background:var(--sw);
  box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--color-foreground) 22%,transparent);transition:box-shadow .3s,transform .2s}
.snp-swatch:hover{transform:scale(1.08)}
.snp-swatch[aria-pressed="true"]{box-shadow:inset 0 0 0 max(3px,.3cqw) var(--sw),inset 0 0 0 max(6px,.65cqw) var(--color-background),
  inset 0 0 0 20cqw var(--sw),0 0 0 1px color-mix(in oklab,var(--color-foreground) 22%,transparent)}
.snp-actions{position:relative;display:flex;align-items:center;gap:3.6cqw;margin-top:4.2cqw}
.snp-root[data-slotted="true"] .snp-actions{margin-top:max(24px,2.6cqw);gap:max(14px,1.4cqw)}
.snp-cta{height:max(40px,4.4cqw);padding:0 2cqw;background:var(--color-foreground);color:var(--color-background);
  font-weight:600;font-size:max(11px,1.15cqw);letter-spacing:.02em;white-space:nowrap;transition:transform .15s}
.snp-root[data-slotted="true"] .snp-cta{flex:1;height:max(48px,3.4cqw);border-radius:var(--snp-cta-radius,0);font-size:14px;letter-spacing:0}
.snp-cta:active{transform:scale(.96)}
.snp-cta{position:relative;display:grid;place-items:center;min-width:max(150px,11.6cqw);overflow:hidden;transition:transform .15s,background .35s}
.snp-cta>span{grid-area:1/1;display:inline-flex;align-items:center;gap:.6em;transition:opacity .25s,transform .4s cubic-bezier(.2,.8,.2,1)}
.snp-cta-busy,.snp-cta-done{opacity:0;transform:translateY(70%)}
.snp-cta[data-state="busy"] .snp-cta-idle,.snp-cta[data-state="done"] .snp-cta-idle{opacity:0;transform:translateY(-70%)}
.snp-cta[data-state="busy"] .snp-cta-busy,.snp-cta[data-state="done"] .snp-cta-done{opacity:1;transform:none}
.snp-cta[data-state="done"]{background:var(--snp-done,#15803d);color:#fff}
.snp-cta-busy i{width:1.15em;height:1.15em;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:snp-spin .7s linear infinite}
@keyframes snp-spin{to{transform:rotate(360deg)}}
.snp-cta-done svg{width:1.25em;height:1.25em;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;
  stroke-dasharray:24;stroke-dashoffset:24;transition:stroke-dashoffset .45s .12s ease}
.snp-cta[data-state="done"] .snp-cta-done svg{stroke-dashoffset:0}
.snp-cta:disabled{opacity:.45;cursor:not-allowed}
.snp-like{position:relative;width:max(24px,2.4cqw);height:max(24px,2.4cqw);display:grid;place-items:center}
.snp-root[data-slotted="true"] .snp-like{width:max(48px,3.4cqw);height:max(48px,3.4cqw);border-radius:50%;
  box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--color-foreground) 18%,transparent)}
.snp-root[data-slotted="true"] .snp-like>svg{width:42%;height:42%}
.snp-like>svg{width:80%;height:80%;overflow:visible}
.snp-like>svg path{fill:none;stroke:currentColor;stroke-width:1.8;transition:fill .3s,stroke .3s}
.snp-like[aria-pressed="true"]>svg path{fill:var(--snp-like);stroke:var(--snp-like)}
.snp-burst{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none}
.snp-burst svg{position:absolute;left:-6px;top:-6px;width:12px;height:12px;color:var(--snp-like);opacity:0}
.snp-pill{position:absolute;right:-.4cqw;bottom:calc(100% + 1cqw);padding:.6cqw 1.2cqw;border-radius:999px;white-space:nowrap;
  background:var(--color-foreground);color:var(--color-background);font-size:max(11px,.95cqw);font-weight:500;
  visibility:hidden;opacity:0;pointer-events:none}
.snp-pill b{color:var(--snp-like);font-weight:700}
.snp-viewer{position:fixed;inset:0;z-index:60;display:grid;grid-template-columns:minmax(0,1fr);place-items:center;padding:24px;color:var(--color-foreground)}
.snp-scrim{position:absolute;inset:0;background:color-mix(in oklab,var(--color-background) 72%,transparent);backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);cursor:zoom-out}
.snp-box{position:relative;width:min(880px,100%);display:flex;flex-direction:column;gap:14px}
.snp-viewer[data-portrait="true"] .snp-box{width:min(560px,100%)}
.snp-frame{position:relative;aspect-ratio:16/10;max-height:72vh;width:100%;border-radius:14px;overflow:hidden;
  background:radial-gradient(60% 70% at 50% 55%,color-mix(in oklab,var(--snp-tint) 38%,transparent),transparent 75%),
    color-mix(in oklab,var(--snp-tint) 14%,var(--color-background));
  box-shadow:0 30px 80px -20px rgba(0,0,0,.35)}
.snp-viewer[data-portrait="true"] .snp-frame{aspect-ratio:4/5;max-height:70svh;margin-inline:auto;width:auto;max-width:100%;height:70svh}
.snp-frame .snp-view{position:absolute;inset:0;width:auto;height:auto;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.snp-viewer[data-portrait="true"] .snp-frame .snp-view{inset:4%}
.snp-frame{cursor:zoom-in}
.snp-frame[data-zoom="true"]{cursor:zoom-out}
.snp-vbar{display:flex;align-items:center;gap:12px;font-size:14px}
.snp-vbar strong{font-weight:600}
.snp-vbar span{color:var(--color-muted-foreground);font-variant-numeric:tabular-nums}
.snp-vbtn{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--color-background);
  box-shadow:0 0 0 1px color-mix(in oklab,var(--color-foreground) 14%,transparent);transition:transform .2s}
.snp-vbtn:hover{transform:scale(1.08)}
.snp-vbtn svg{width:18px;height:18px}
.snp-nav-l,.snp-nav-r{position:absolute;top:50%;translate:0 -50%}
.snp-nav-l{left:14px}.snp-nav-r{right:14px}
.snp-close{margin-left:auto}
.snp-rail{display:flex;gap:8px;overflow-x:auto;padding:2px}
.snp-rail button{flex:none;width:76px;height:48px;border-radius:8px;overflow:hidden;opacity:.55;transition:opacity .2s;
  background:color-mix(in oklab,var(--snp-tint) 12%,var(--color-background))}
.snp-viewer[data-portrait="true"] .snp-rail{justify-content:center}
.snp-viewer[data-portrait="true"] .snp-rail button{width:48px;height:auto;aspect-ratio:200/310;padding:3px}
.snp-rail button[aria-current="true"]{opacity:1;box-shadow:0 0 0 2px var(--color-foreground)}
@container (max-width:767px){
  .snp-body,.snp-root[data-slotted="true"] .snp-body{grid-template-columns:1fr;grid-template-rows:auto auto auto;padding:24px 20px 72px;row-gap:8px;align-items:start}
  .snp-root[data-slotted="true"] .snp-body{padding:12px 20px 28px;row-gap:14px}
  .snp-desc{max-width:none;margin-top:12px}
  .snp-thumbs,.snp-root[data-slotted="true"] .snp-thumbs{margin-top:16px;gap:12px}
  .snp-thumb{width:56px;height:36px}
  .snp-root[data-portrait="true"] .snp-thumb{width:52px;height:auto}
  .snp-more{width:36px;height:36px}
  .snp-stage{order:-1;min-height:60cqw}
  .snp-root[data-slotted="true"] .snp-stage{height:min(112cqw,60svh);min-height:320px}
  .snp-word{font-size:20cqw;top:0}
  .snp-root[data-slotted="true"] .snp-word{font-size:24cqw;top:46%}
  .snp-info{display:contents}
  .snp-eyebrow{order:-3}
  .snp-title{order:-2;margin-top:-4px;max-width:none}
  .snp-root[data-slotted="true"] .snp-eyebrow{order:-2;margin-top:6px}
  .snp-root[data-slotted="true"] .snp-title{order:-1;margin-top:-8px;font-size:22px}
  .snp-desc,.snp-thumbs{order:2}
  .snp-floor{height:9cqw;translate:0 15cqw}
  .snp-root[data-slotted="true"] .snp-floor{height:6cqw;translate:none}
  .snp-buy{order:1}
  .snp-sizes{gap:10px;margin-top:10px}
  .snp-row,.snp-colour{margin-top:18px}
  .snp-swatches{margin-top:12px;gap:16px}
  .snp-actions{margin-top:22px;gap:20px}
  .snp-root[data-actions-small="false"] .snp-actions{display:none}
  .snp-cta{flex:1}
  .snp-stock{margin-top:8px;gap:6px}
  .snp-hint{bottom:2%}
  .snp-pill{padding:6px 10px;bottom:calc(100% + 8px)}
  .snp-bg{--snp-gy:22%;--snp-gs:85% 26%}
}
@media (max-width:640px){
  .snp-viewer{padding:12px}
  .snp-rail button{width:60px;height:40px}
  .snp-nav-l{left:8px}.snp-nav-r{right:8px}
  .snp-vbtn{width:36px;height:36px}
  .snp-viewer[data-portrait="true"] .snp-frame{height:auto;width:100%;max-height:64svh}
}
@media (prefers-reduced-motion: reduce){
  .snp-root *,.snp-viewer *,.snp-root .snp-info,.snp-root .snp-buy,.snp-root .snp-words{transition:none!important;animation:none!important}
}
`
