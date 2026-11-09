# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Hestola is a planned fashion e-commerce platform (men's and women's clothing, India, mid-range). `App.jsx` shows the logo intro, then the landing page (`src/pages/LandingPage.jsx` + `landing.css`): a room painted Hestola orange, lit by three spots, with the brand sign and the new-drop clothing rail on the back wall and a single "Explore Hestola" button. It has no navigation by design. Sequence: the intro hands its end-frame logo boxes to the landing page, which moves its sign from there (FLIP) while the lights come on; the rail then draws across the wall left to right, the pieces glide in from the left (the rail's `slideIn` prop), and the button appears. On phones (≤640px) the room is shallower so the back wall is wider, the rail runs as the component's carousel, and the pieces either side fade into the wall. The storefront is not built, so "Explore Hestola" shows "Not updated yet." (`src/pages/HomePage.jsx` is the unfinished storefront, not rendered.) There is no router yet. There is no backend, product page, test runner, or git repo yet. Product links point to `/product/:slug` (the §16 route), which nothing serves yet.

The logo intro (`src/components/brand/LogoIntro.jsx` + `logo-intro.css`) is a faithful port of `design/HESTOLA – Logo Intro.html`, rendered by `App.jsx` over the page. It plays on every app load (`src/lib/intro.js`), opening on a "Tap to enter" gate because browsers block sound until the visitor interacts (the tap unlocks the Web Audio effects in `src/lib/sound.js` and puts the app in fullscreen via `src/lib/fullscreen.js`, then the intro animates with sound). It is skippable (button, click/tap, Esc/Enter/Space), and is never shown under `prefers-reduced-motion`, per §3.6. When it fades out, `App.jsx` remounts the page so the page's own entrance plays in view. The logo outline lives in `src/components/brand/mark-path.js`, shared with `HestolaMark`.

`src/components/ui/product-rail-gallery.jsx` is the 21st.dev "Product Rail Gallery" component by dhxwhy, converted from TSX. The landing page deliberately matches the component's original 21st.dev demo layout: label, headline, rail with price tags, caption, and a pill button. Its header comment lists every Hestola change and documents the props. Its motion (physics constants near the top of the file and in `step()`, impulses, timings, transitions) is kept identical to the original component; do not retune it. All motion is disabled under `prefers-reduced-motion`. `src/components/home/HeroRail.jsx` maps products onto it. Re-installing it from 21st.dev needs a 21st.dev account and would overwrite those changes.

Opening a piece on the rail shows the product sheet (`src/components/product/ProductSheet.jsx`, a §6.5 quick view): image card with the hanging garment, front/back dots, name, price, colour, size grid with sold-out/low-stock states, wishlist heart, and a sticky Add to Bag bar. The rail renders it through its `renderDetail` prop, so the lift-in animation and spin stay the rail's own. The bag and wishlist are an in-memory demo store (`src/lib/bag.js`); the demo `sizes` on each piece in `src/data/demo-products.js` are not a real size chart. The sheet has its own palette, scoped as `.product-sheet` variables in `src/index.css` (white canvas, cool stone card, near-black type, graphite secondary text, orange only on the saved heart, softer `--radius`); the brand tokens below are unchanged. Its layout follows the owner's "After" product-screen reference: compact sans name, subtitle, price with sale badge near the top, 4-column size grid, one primary action in a sticky bar. The demo Oxford shirt has a demo `compareAtPaise` so the sale badge shows.

`src/components/ui/liquid-metal-button.jsx` is the 21st.dev "Liquid Metal Button" by johuniq, converted from TSX (fetched through the 21st.dev MCP, since the shadcn install URL needs an account). It is the landing room's "Explore Hestola" button. It draws a WebGL shader from `@paper-design/shaders`; its header lists the Hestola changes (width prop, focus ring, label contrast, reduced motion, and a `theme` prop). The landing page passes `EXPLORE_THEME` for the brand CTA look (as `CtaLink`): orange face, ink label, ink fill rising on hover/focus with an ivory label, metal rim tinted with the spotlights' warm light.

Product photos: the raw images are in `imgages/` (spelled that way). Their checkerboard "transparent" background is painted into the pixels, so `scripts/cut-out-product-images.py` removes it and writes 800x1240 transparent WebP files to `public/products/<slug>/{front,back,side}.webp`. To add or change a piece, edit `PIECES` in that script (source file plus a crop box per view) and re-run it. It needs pillow, numpy and scipy in a throwaway venv, not the system Python (the command is in the script's header). The images are in `src/data/demo-products.js`. A piece with no `back` photo shows its front again when flipped, and with no `side` photo the rail turns the front away instead.

`design/design.md` is the authoritative product and UI/UX spec. Read the relevant section before building any page or feature. It contains the full route maps (§16), page-by-page specs (§6 storefront, §8 admin), data-domain map (§17), technical constraints (§18), acceptance criteria (§19), and open decisions (§20).

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # production build to dist/
npm run preview   # serve the built dist/
npm run lint      # ESLint (flat config, eslint.config.js)
```

No test framework is configured yet.

Styling uses Tailwind CSS v4 (via `@tailwindcss/vite`) and shadcn/ui in JS mode (`components.json` has `tsx: false`, style `radix-nova`). The `@/` alias maps to `src/`. Add components with `npx shadcn@latest add <name|url>`. Generated files go in `src/components/ui/` and have relaxed ESLint rules. Theme CSS variables live in `src/index.css`.

## Target architecture (from design.md)

- **MERN, JavaScript/JSX only.** Do not add TypeScript, `.ts`, or `.tsx` files.
- **Two frontends, one API.** The customer storefront and the owner-only admin dashboard are separate React + Vite apps, or separately built frontends in a monorepo. Both talk to one Node/Express API backed by MongoDB/Mongoose. Admin auth must be fully isolated from customer auth, and admin routes/data must never be reachable from a customer session.
- **Backend layering:** keep routes, controllers, services, models, validation, and middleware separate, organized by feature/domain. Keep authorization checks centralized.
- **Provider adapters:** payment, shipping, SMS/OTP, media storage, and analytics go behind service adapters, because none of the providers has been chosen yet.
- **Frontend:** API calls live in service modules; build pages from reusable components.
- **Money:** store amounts as integer paise (or one consistent decimal strategy), never floats. Orders snapshot item name, SKU, variant, price, discount, and tax at purchase time.
- **Inventory** is tracked per size-colour variant. Use transactions for the order, payment, and inventory flows.
- **Auth:** customers log in with a mobile number and OTP. Guest checkout is not allowed. There is a single owner admin account; do not build multi-staff roles.
- Secrets go in env vars, and `.env.example` holds placeholders only. Seed data is local-dev only and must be labelled as demo data.

## Do not hard-code

These are deliberately left configurable or undecided (§2.2, §20): product categories and subcategories (navigation must come from admin data), size labels and charts, colour names, shipping provider, fees and COD rules, return windows, payment gateway and enabled methods, GST/invoice rules, homepage section order and content, and size-recommendation thresholds. Never invent business claims, policies, or category names.

## Brand and visual system

Colour tokens (from the logo intro and §3.1). Define them as semantic CSS variables:

| Token | Value | Use |
|---|---|---|
| Hestola orange | `#D9541E` | Primary CTA, active/selected states, sale accents. Use sparingly; the UI must not become all-orange |
| Near black | `#111111` | Main text, nav, footer |
| Warm ivory | `#F3EEE3` | Brand and editorial backgrounds |
| Warm grey | `#A39D90` | Secondary text, dividers, disabled |

White is allowed as a neutral canvas behind product photography. Verify contrast before putting orange text on ivory.

- **Typography:** Bebas Neue is reserved for the wordmark and restrained display moments. Inter is for UI/body text. The landing mockup uses Cormorant Garamond for editorial display headings. The final pairing still needs owner sign-off.
- **Storefront feel:** editorial (Zara-like typography) combined with product-forward merchandising (H&M-like). Avoid gradients, glassmorphism, rounded SaaS cards, and heavy shadows. The admin can be denser.
- **Motion:** keep it subtle, respect `prefers-reduced-motion`, avoid scroll-jacking and long intros, and make sure nothing essential depends on hover.
- **Logo:** export a clean SVG from `design/HESTOLA – Logo Intro.html`. Do not use the intro HTML itself as the logo component, and do not redraw or recolour the logo. Tagline: "WEAR YOUR IDENTITY".

## Project skills

`.claude/skills/` holds two skills from Anthropic's official skills repo:
- `frontend-design`: use it when building or restyling UI. Its "generic AI defaults" list includes cream backgrounds, a terracotta accent, and `#111` black. Hestola's established brand palette overlaps with that list, so the brand wins: keep the tokens above and put the skill's distinctiveness into layout, imagery, and type treatment instead.
- `webapp-testing`: drives the running app with Python Playwright for screenshots and UI checks (`npm run dev` serves on port 5173). It needs `pip install playwright && playwright install chromium`.

## Design files

- `design/HESTOLA – Logo Intro.html`: the canonical animated logo with the orange/black/ivory/grey tokens above.
- `design/hestola-intro.html`: an older variant of the intro with a different palette (yellow `#FFC500`). It does not match the spec, so do not take tokens from it.
- `design/Hestola Landing Page – Hestola Landing.html`: a storefront landing mockup to use as a visual reference. It includes embedded font data, so it is large.
