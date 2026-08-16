# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static Astro site for a couple ("Bruno & Bruna") to list secondhand items for sale before becoming digital nomads, sharing the link in WhatsApp groups. No backend, no auth, no CMS — items are registered by editing a TypeScript data file. Deployed to GitHub Pages via GitHub Actions on every push to `main`.

Full requirements/rationale: `docs/superpowers/specs/2026-08-15-moving-sale-landing-page-design.md`. User-facing instructions for adding/editing items live in `README.md` (Portuguese) — keep both in sync with the data model if you change it.

## Commands

```bash
npm install
npm run dev        # http://localhost:4321/nomad-project/ (base path applies in dev too)
npm run build       # outputs to dist/
npm run preview     # serve the built dist/ locally
npm test            # vitest run — src/lib/items.test.ts
npx tsc --noEmit    # type-check (no separate lint script exists)
```

There's no single-test flag configured; run `npx vitest run src/lib/items.test.ts` (or `npx vitest` for watch mode) to scope a run. Only `src/lib/items.ts` has unit tests — it's the one file with real logic; everything else is Astro templates/markup.

Before considering a change done: `npm run build`, `npm test`, `npx tsc --noEmit` should all pass clean.

## Architecture

### Data flow

`src/data/site.ts` (site-wide config: title, intro, WhatsApp number) and `src/data/items.ts` (the `Item[]` catalog) are the only "database." Both import their types from `src/lib/items.ts`, which also holds the three pure functions with unit test coverage: `formatPrice`, `sortItemsByStatus` (available items first, stable sort), `buildWhatsappLink`. Adding fields to `Item`/`ItemStatus` means updating that one file — everything else (`ItemCard`, the detail page) consumes the type, not a redefinition of it.

Photos are resolved from `src/assets/items/<item-id>/<filename>` via `resolveItemPhotos()` in `src/lib/photos.ts`, which wraps `import.meta.glob` (Vite build-time macro — the glob pattern is absolute from project root, so this works from any file that imports it) and optimizes/eager-loads every image under `src/assets/items/`. A missing/misnamed photo file doesn't fail the build — it logs a `console.warn` and is silently dropped from that item's gallery.

### Pages and shared components

- `src/layouts/BaseLayout.astro` — the only place fonts, global CSS, favicon, and `<meta>` tags are declared. Both pages use it; don't duplicate `<head>` content in a page.
- `src/pages/index.astro` — the grid of all items (`ItemCard` per item, sorted via `sortItemsByStatus`).
- `src/pages/itens/[id].astro` — one static page per item (`getStaticPaths()` maps over `items`), reusing `PhotoGallery` at a larger size.
- `src/components/PhotoGallery.astro` — the photo carousel, shared by `ItemCard` and the detail page. Pure CSS, no JavaScript: each photo is a hidden radio input + an absolutely-positioned `<Image>`, and prev/next arrows + dot indicators are `<label for="...">` elements pointing at the right radio's `id`. CSS wires visibility with `~` sibling selectors keyed off index classes (`photo-radio-0`, `photo-slide-0`, `nav-prev-1`, etc.), hardcoded up to index 3 — **an item with a 5th photo won't get gallery controls for it**; extend the CSS rule blocks if that's ever needed. The component always fills its parent (`position: absolute; inset: 0`), so sizing/aspect-ratio is the caller's responsibility (`.ticket-photo` in the card, `.detail-photo` on the detail page).
- `src/components/ItemCard.astro` — the "ticket" card. The title link is a stretched-link (`::after { position: absolute; inset: 0 }` on an `<a>` inside `.ticket-stub`) to the detail page, so the whole text area is clickable without wrapping the photo gallery or the WhatsApp CTA in an anchor (both need independent click targets — nesting interactive elements inside a link breaks them). The CTA button counters the stretched-link with `position: relative; z-index: 1`. If you add more clickable elements inside `.ticket-stub`, they'll need the same z-index treatment.

### Base-path-aware links

The site is deployed at a GitHub Pages subpath (`base: "/nomad-project"` in `astro.config.mjs`), and `import.meta.env.BASE_URL` has **no trailing slash**. Never concatenate it directly (`` `${import.meta.env.BASE_URL}itens/${id}/` `` silently produces `/nomad-projectitens/...`). Always build internal links through `withBase()` in `src/lib/urls.ts`, which normalizes the separator.

### Visual identity (this is where UI/UX work will happen)

Design tokens live in `src/styles/global.css` as CSS custom properties — change colors/fonts there, not per-component:

- `--color-bg` (#111825) is a solid, exact match to the background baked into `src/assets/brand/logo-*.png` (sampled directly from the source file). If those images are ever regenerated, re-sample and update this token, or the brand assets will show a visible seam.
- `--font-mono` (IBM Plex Mono) is the site-wide default — body copy, item titles, buttons, everything. `--font-display` (Fraunces) is reserved *only* for the "Bruno & Bruna" wordmark (`.wordmark` in `src/pages/index.astro`). This split was a deliberate, explicit request — don't reintroduce a body/sans font or spread Fraunces to other headings without checking first.
- The recurring motif is a torn boarding-pass ticket: a dashed `.perforation` divider with two circle "notches" (pseudo-elements colored `var(--color-bg)`, positioned half-outside the card so the parent's `overflow: hidden` clips them into a punched-hole look), a mono `.ticket-id` code (item's `id`, uppercased), and a rotated `.stamp` badge for non-`disponivel` items. The same divider/stamp pattern is duplicated (not shared) between `ItemCard.astro` and `[id].astro` — if you rework it, update both.
- Unavailable items (`reservado`/`vendido`) never get a live WhatsApp CTA — that's a deliberate product decision (avoids "is this still available?" pile-ups in the group chat), not an oversight. Keep the disabled/inert state if you touch that branch.

### Content is placeholder data

`src/data/items.ts` currently holds 8 sample items with Lorem Picsum photos, added for layout validation. `src/data/site.ts`'s `whatsappNumber` is also a placeholder. Both need replacing with the couple's real listings/number before the site is actually shared — see the checklist at the top of `README.md`.
