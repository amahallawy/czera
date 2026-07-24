# Czera — Design base

Single source of truth for the Czera Maison visual system. Any design
skill, reviewer, or contributor reads this **before** touching markup or
CSS. Code-level tokens live in [`css/tokens.css`](css/tokens.css); this
document explains the *intent* behind those tokens and the rules they
exist to protect.

> If a decision is in conflict between this file and the code, this file
> wins for new work — and the code is updated to match in the same PR.
> If something is missing here, add it before relying on it.

---

## 1. Brand at a glance

**Czera Maison** — premium Egyptian cotton towels for the home and
hospitality. Woven in Egypt at 600–800 GSM. Bilingual (English default,
Arabic mirror). Direct-to-consumer storefront with editorial brand
storytelling on the landing page and a Frette-style catalogue grid.

| | |
|---|---|
| **Voice** | Quiet, certain, materially specific. No exclamation marks. No "discover", "elevate", "indulge", "experience luxury". Say what the product is and where it comes from. |
| **Posture** | Heritage-modern. Restrained. Premium without flexing. |
| **Surface** | Ivory-on-charcoal, gold reserved for one accent per screen. |
| **Tagline** | *Luxury in every touch.* |
| **Region** | Cairo, Egypt. WhatsApp-first commerce. EGP pricing. |

---

## 2. References and what we take from each

| Reference | We borrow | We do **not** borrow |
|---|---|---|
| [abysshabidecor.com](https://www.abysshabidecor.com/home) | Chapter rhythm (full-bleed media → centered copy → next chapter), restrained type scale, single-accent color discipline | Their full-page video maximalism — Czera leans more print-editorial |
| [frette.com/en_US/towels](https://www.frette.com/en_US/towels) | Catalogue grid density, hover behaviour, filter chrome, product-name treatment, body-copy weight | Their cooler grey palette — Czera is warm ivory + gold |
| [@czera_maison](https://www.instagram.com/czera_maison) | Photography mood (warm light, soft shadows, fabric closeups), gold-on-ivory product staging | Anything that resembles a typical mass-market towel ad |
| Czera brand book (in `graphics/`) | Palette, typography, crown mark, wordmark, pattern motifs | — |

---

## 3. Brand foundation

### 3.1 Palette

Defined in [`css/tokens.css`](css/tokens.css). Use the token, never the
hex literal.

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#F4F2EC` | Page background — Soft Ivory. The default surface. |
| `--color-surface` | `#E7E1D5` | Warm Beige — secondary surfaces, cards. |
| `--color-surface-soft` | `#FAF8F3` | Lifted ivory — input fields, hover-on-bg. |
| `--color-gold` | `#D4AF36` | Classic Royal Gold — **one accent per screen.** |
| `--color-gold-sand` | `#D8C28A` | Sand Gold — hairline dividers, subtle accents. |
| `--color-gold-deep` | `#BA7C17` | Deep Gold — emphasis, hover, link-active. |
| `--color-ink` | `#2B2B2B` | Body text. |
| `--color-ink-strong` | `#010100` | Headings on light bg + dark surfaces. |
| `--color-ink-mute` | `#6B6B6B` | Captions, metadata. |
| `--color-ink-faint` | `#A3A099` | Placeholder, divider on light. |
| `--color-on-dark` | `#F4F2EC` | Foreground on charcoal surfaces. |

**Gold is sacred.** A landing screen has one gold moment (hero crown,
single CTA, or one chapter eyebrow). Never gold buttons + gold dividers
+ gold underlines on the same screen. Color audit (impeccable
`/colorize`, `/quieter`) enforces this.

### 3.2 Typography

| Family | Source | Use |
|---|---|---|
| **Montserrat** (300 / 400 / 500) | Google Fonts | All Latin: body, nav, headings, labels. Display moments use **Montserrat Light 300** at large sizes with negative tracking. |
| **Italiana** (400) | Google Fonts | Reserved — product names + a single editorial flourish per page. Never body, never CTA. |
| **Cairo** (300 / 400 / 500 / 700) | Google Fonts | Arabic surface (`[lang="ar"], [dir="rtl"]`). |

**Banned serifs** (AI-luxury defaults — instant dilution): Cormorant
Garamond, Playfair Display, EB Garamond, Lora, DM Serif. If a future
brief wants "more editorial," push Italiana harder before reaching for
another serif.

**Type scale** — Frette-tight editorial proportions, no fluid clamps
below the `md` step. See `--fs-2xs` through `--fs-4xl` in
[`tokens.css`](css/tokens.css).

**Letter-spacing rule**: large display = negative (`--ls-display`,
`-0.025em`). Small caps = wide (`--ls-wide`, `0.06em`). Eyebrows =
widest (`--ls-widest`, `0.18em`) — restrained from the v1 `0.22em`
because anything wider reads as theatrical.

**Headings always weight 300**, never 400 or 700. The display feel
comes from size + tracking, not from weight.

### 3.3 Marks

- **Wordmark**: `assets/logo/czera-wordmark-ivory.jpg` — used in the
  header. Sits with `mix-blend-mode: multiply` so the ivory plate
  blends into the page surface.
- **Crown** (`.brand-crown`): inline SVG, defined in markup. Used
  anywhere the wordmark would be too heavy — chapter eyebrows, footer,
  hero. Variants: default ivory, `--sm` size, `--deep` gold.
- The crown is the brand's repeatable signature. Three peaks with
  beaded points. Never recolor it outside the gold/ivory/charcoal
  triad.

### 3.4 Pattern motifs

Brand book includes a few decorative motifs (in `graphics/`). They are
deliberately **unused** on the current landing — the design doctrine is
"empty space is the pattern." A motif is allowed as a single dim
background flourish on the catalogue intro or on the gift-set page when
those land. Anywhere else: ask first.

---

## 4. Design principles

These are the rails. Every design skill (`/critique`, `/polish`,
`/normalize`, `/distill`, `/quieter`, `/harden`) is applied against
them.

1. **Quiet over loud.** If a section can be removed without losing
   meaning, remove it. Czera is not a deals site. Whitespace is not
   wasted space.
2. **One accent per screen.** Gold is rare. A gold CTA + a gold
   underline + a gold eyebrow on the same fold = redo.
3. **Editorial, not promotional.** Headings state facts ("Egyptian
   cotton, woven in Egypt") not slogans ("Discover Luxury Today!").
4. **Materially specific.** "600–800 GSM, Nile Delta, finished by
   hand." Show the spec, not adjectives.
5. **Heading weight is 300, always.** See §3.2.
6. **No card chrome unless earned.** Editorial entries (`/journal`)
   sit on the page surface — no shadow, no border, no rounded
   container. The image and the kicker do the work.
7. **Motion is restrained.** Reveal-on-scroll, slow ken-burns on
   chapter media, hover micro-states. No springs, no bounces, no
   parallax beyond the ken-burn.
8. **RTL is a peer, not an afterthought.** Anything that uses
   `margin-left` instead of `margin-inline-start` is a bug.
9. **Photography or nothing.** A chapter without a real photo uses an
   Unsplash placeholder during dev — but ships only with a real
   client photograph or a deliberate empty media slot.
10. **Speak product, not commerce.** "Bath, hand, robe" — not "Best
    Sellers" or "Trending Now."

---

## 5. Layout system

### 5.1 Container

- `--content-max: 1320px` — outer container.
- `--content-narrow: 720px` — editorial paragraph block.
- `--content-reading: 65ch` — comfortable measure for body copy.
- `--gutter: clamp(1rem, 4vw, 3rem)` — page side padding.

### 5.2 Section rhythm

`.section { padding-block: clamp(var(--space-8), 10vw, var(--space-10)); }`

That's `4rem → 8rem` of vertical air per section. The chapter rhythm
on the landing is: full-bleed media → centered copy block → next
chapter. **Air between chapters is the design** — do not tighten it
to fit "more above the fold."

### 5.3 Spacing scale (4px base)

`--space-1` through `--space-10`. Use the tokens. Hard-coded `padding:
14px` is a code-review block.

### 5.4 Grid

- Header: `grid-template-columns: 1fr auto 1fr` — nav, brand mark,
  utilities. Symmetric.
- Catalogue grid: 2 / 3 / 4 columns at sm / md / lg, with no gaps
  between cells (Frette flush-grid pattern). Hover lifts the image
  by 1.02 scale, fades in the alt-image (when present).
- Editorial row: `grid-template-columns: repeat(3, 1fr)` at desktop,
  stacked on mobile.

---

## 6. Component patterns

Components live in [`css/components.css`](css/components.css). This
section explains *what each is for and when to use it.*

### 6.1 Site header

Sticky, translucent ivory (`rgba(244, 242, 236, 0.92)` + backdrop
blur). 88px tall. Three-zone grid: nav-left / wordmark-center /
icons-right. Nav links hover with a gold underline that scales from
center.

**Don't**: drop-down megamenus, wide search bars, account avatars.
The brand's heritage feel relies on a simple, near-empty header.

### 6.2 Hero

Full viewport, media background (image now, video later — see comment
in [`index.html`](index.html) for the video swap-in pattern). Crown
mark above title. Title in Montserrat 300 at `--fs-3xl` / `--fs-4xl`.
Scroll cue at the bottom (`Scroll`, small caps, animated).

### 6.3 Value strip

A single bordered row directly under the hero. Four icon + label items
at desktop, scrollable on mobile. Always factual ("100% Egyptian
cotton", "600–800 GSM", "Free shipping over EGP 2,500", "Order on
WhatsApp"). Never marketing copy.

### 6.4 Chapters

The landing's narrative engine. Five chapter shapes:

| Variant | Layout | Surface |
|---|---|---|
| `chapter--light` | Centered copy on ivory, full-bleed media block | Light |
| `chapter--dark` | Centered copy on charcoal, full-bleed media block | Dark — uses `--color-on-dark`. Single gold accent is the **crown**; the eyebrow reads muted ivory and the link rests ivory (gold on hover only), per §3.1 one-accent-per-screen. |
| `chapter--split` | 50/50 image-left, copy-right (with `<dl>` spec list) | Light |
| `chapter--editorial` | Heading row + 3-column entries (no card chrome) | Light |
| `chapter--story` | Text over image — photo full-bleed on the leading edge, copy over the trailing ivory void, a `to right` scrim (`.chapter__scrim`) fading the image into `--color-bg` so image and copy read as one field. Mirrors on RTL. Stacks (image over copy) below 768px. | Light |

Each chapter starts with `<span class="eyebrow">…</span>`, then the
crown mark, then the title, then the body. Skipping the eyebrow makes
chapters blur into each other.

### 6.5 Buttons

Two only:

- `.btn.btn--gold` — primary CTA. Filled gold, charcoal text. One per
  screen.
- `.btn.btn--on-dark` — secondary, ivory outline on dark surface.

No tertiary "ghost" button. If a third action is needed, it is a text
link with a `→` glyph (`.chapter__link`), not a button.

### 6.6 Spec list (`<dl class="spec-list">`)

Used in chapter–split for material specs. Two-column key/value, hairline
divider between rows. Reads like a Frette product fact-sheet.

### 6.7 Footer

Four-column grid: brand block / Shop / Company / Newsletter. Below: copy
line + socials + city. The brand block reuses the crown mark + the
"CZERA" wordmark-text + the tagline — same elements as the header,
restated.

### 6.8 Catalog

Frette-flush grid. Card = image + product name (Italiana) + price
(Montserrat 400, no commas in EGP for now) + size variants on hover.
No "Add to Cart" buttons in the grid — click into PDP.

### 6.9 PDP (product detail)

Two-column desktop layout. Image gallery left (sticky), product info
right. Spec list under the buy box. "You may also like" row at
bottom — no upsell modals, no popups.

---

## 7. Motion

| Cue | When | How |
|---|---|---|
| `.reveal` (opacity + 20px Y) | Section enters viewport | IntersectionObserver in [`js/main.js`](js/main.js); 700ms `--ease-out`. |
| Ken-burns on `.chapter__media` | Chapter media in view | Slow `transform: scale()` + `translate()`, ~20s loop. Imperceptible per frame. |
| Header underline | Nav hover | `transform: scaleX(0 → 1)` from center, `--dur-base`. |
| Image hover lift | Catalogue cards | `transform: scale(1.02)` on the inner img, 320ms `--ease-out`. |
| `prefers-reduced-motion` | Always respected | All transitions clamped to `0.01ms`; reveal becomes instant. |

What we do **not** do: spring physics, page-load splash screens,
cursor-following effects, sticky cursor blobs, scroll-jacking,
horizontal scroll storytelling, parallax beyond ken-burn.

---

## 8. Imagery

- **Subjects**: stacked towels, fabric closeups, hands folding, bath
  scenes, robe hung on a hook, a single rose petal on white cotton.
- **Light**: warm, side-lit, soft shadow. Never flat product-on-white.
- **Crop**: tight on texture; loose on lifestyle. No center-locked
  product photos.
- **Aspect**: hero is 16:9 desktop / 4:5 mobile; chapter media is
  3:2; editorial entries are 4:5.
- **Placeholders**: Unsplash links allowed during build (see
  `index.html`); production swaps in client photography from
  `assets/img/`. `graphics/` is the staging dump — never reference
  files there from production HTML.

---

## 9. Voice and microcopy

- Sentences end with a period. No `!`. (Hero subtitle, value strip,
  chapter bodies — all flat declarative.)
- Numerals use thin spacing for ranges (`600–800`) and the en-dash
  (`&ndash;`), never a hyphen.
- Currency: `EGP 2,500` — three-letter code, space, comma-grouped.
- CTAs are imperative + concrete: "Shop the collection", "Our
  story", "Subscribe →". Never "Click here", "Learn more", "Get
  started".
- Product names are Italiana, sentence case, no quotes ("Nile
  Bath Towel", not "NILE BATH TOWEL" or "Nile™ Bath Towel").

---

## 10. Internationalisation

- Default surface: `<html lang="en">`. Arabic surface: `<html
  lang="ar" dir="rtl">`.
- Mirror, don't translate-and-paste. RTL flips the entire layout
  (header zones, chapter–split, footer grid, catalog filters).
- Use logical properties everywhere: `margin-inline-start`,
  `padding-inline-end`, `border-inline-start`. **No** `margin-left`
  in component CSS.
- Arabic typography uses Cairo via the token swap in
  [`tokens.css`](css/tokens.css). No font-stack hand-overrides per
  component.
- Numerals stay Latin (`600–800 GSM`) on the Arabic surface for
  spec consistency — confirm with brand if Arabic-Indic numerals
  are wanted later.

---

## 11. Accessibility

Non-negotiables:

- Every image has `alt` text. Decorative-only images use `alt=""`
  **and** `aria-hidden="true"` on the wrapper.
- Visible focus on every interactive element. Default outline:
  1.5px ink-strong, 3px offset. On dark surfaces: gold. See
  [`base.css`](css/base.css) `:focus-visible`.
- Skip link is the first focusable element.
- Heading order is sequential — no `h2` followed by `h4`.
- Color contrast: ink on bg ≥ 7:1; ink-mute on bg ≥ 4.5:1.
- Form inputs always have a `<label>` (visible or `sr-only`); icon
  buttons always have `aria-label`.
- `prefers-reduced-motion` respected (see §7).

---

## 12. Source material map

```
projects/czera/
├── design.md                ← this file
├── index.html               landing
├── catalog.html             collection grid (Frette-style)
├── product.html             PDP
├── css/
│   ├── tokens.css           brand tokens (vars only)
│   ├── base.css             reset + global typography + motion
│   ├── components.css       header, nav, buttons, footer
│   └── pages/
│       ├── landing.css
│       ├── catalog.css
│       └── product.css
├── js/
│   ├── main.js              global behaviours (nav, scroll-reveal)
│   └── catalog.js           filters + grid behaviour
├── assets/                  ← shipped, optimised, page-ready
│   ├── logo/                processed brand marks
│   ├── img/                 photography (Unsplash placeholders today)
│   └── video/               hero video (later)
└── graphics/                ← raw client material — NEVER referenced from HTML
    ├── crown.jpeg           crown reference
    ├── WhatsApp Image …     brand book pages
    └── WhatsApp Unknown …   extracted zip dumps
```

**Hard rule**: production HTML/CSS may only reference `assets/`. Every
new client image is processed and renamed (kebab-case, descriptive)
into `assets/img/` before it appears in markup.

---

## 13. Page intents

### Landing (`index.html`)
Editorial brand storytelling, chapter-paced. Five blocks: hero, value
strip, story chapter (light), collection chapter (dark), material
chapter (split), journal chapter (editorial 3-up), footer. Goal: a
visitor who has never heard of Czera leaves understanding what the
product is, where it comes from, and that it's premium — without a
single sales line.

### Catalog (`catalog.html`)
Frette-style flush grid. Filters: weight (GSM band), size, color.
Cards click into PDP. No "Add to Cart" in the grid. Goal: browse and
compare without distraction.

### Product (`product.html`)
PDP with sticky image gallery, product name (Italiana), price, sizes,
GSM, care, and a buy button. Spec list mirrors the chapter–split
format. Goal: make the spec the hero.

---

## 14. Anti-patterns

If you see any of these in a draft, push back:

- Cormorant / Playfair / EB Garamond anywhere
- `font-weight: 700` on a heading
- More than one gold element on a single fold
- Cards with shadow + border + rounded corners + gradient (any two of
  those three is already too much)
- Marketing copy: "discover", "elevate", "indulge", "experience
  luxury", "best in class"
- Exclamation marks
- Stock-grade product-on-white photography
- Sticky bottom-bar CTAs ("Buy Now") on mobile
- Cookie banners that take over the screen (a thin top strip is fine)
- Auto-playing audio
- Pop-up newsletter modals on first visit

---

## 15. How to use this file

When applying a design skill (e.g. `/critique`, `/polish`,
`/normalize`, `/distill`, `/typeset`, `/colorize`, `/arrange`,
`/quieter`, `/harden`, `/audit`):

1. Read this file first (it satisfies the impeccable Context Gathering
   Protocol for the project).
2. Read the relevant page CSS in `css/pages/` and the section in
   `index.html` / `catalog.html` / `product.html`.
3. Run the skill against the section.
4. If the change requires a new token, value, or rule, **update this
   file in the same PR** — no orphan changes.

When making a structural decision (new section type, new navigation
shape, swapping a typeface), record an AgDR at
`projects/czera/docs/agdr/AgDR-NNNN-<slug>.md` (per the workspace
`agdr-decisions.md` rule) and link it from this file's history.
