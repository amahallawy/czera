# Project: Czera

Inherits workspace rules from `Company/CLAUDE.md`. This file defines the
project-specific concretions.

**Published to:** https://github.com/amahallawy/czera
**Default branch:** main

Czera Maison — premium Egyptian cotton towels. E-commerce-style static site
(HTML / CSS / vanilla JS), bilingual English/Arabic, with hero + brand
storytelling and a Frette-inspired product catalogue.

## Merge policy — concrete markers

**Marker 1 (automated review) — all of:**

- Manual review of the diff by Claude's code-reviewer agent with no blocking
  issues — until CI is added (no CI workflows defined yet).

**Marker 2 (explicit authorization):**

- `lgtm` / `approved` comment on the PR by the repo owner.

### Current state: aspirational

Direct pushes to the default branch are the norm today. The policy
activates once PR-first workflow is adopted. When that happens, enable
GitHub branch protection requiring PR + the required checks listed under
Marker 1.

## Project-specific conventions

### Stack

- **HTML5**, **CSS3** (custom properties for tokens, no preprocessor),
  **vanilla JavaScript** (ES modules, no framework, no bundler unless
  later justified by AgDR).
- No build pipeline by default — pages served as-is. If a build becomes
  necessary (e.g. minification, image optimization), record an AgDR.

### Languages & accessibility

- Bilingual EN/AR. English is the default surface; Arabic mirrors it
  with `dir="rtl"` and `lang="ar"` at the page or block level.
- Latin typography: **Montserrat** (per brand book).
- Arabic typography: **Cairo** (per brand book).
- Alt text on every image; meaningful heading order; visible focus
  styles on all interactive elements.

### Design tokens (from the Czera brand book)

Defined as CSS custom properties at `:root`:

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#F4F2EC` (Soft Ivory) | Page background |
| `--color-surface` | `#E7E1D5` (Warm Beige) | Cards, secondary surfaces |
| `--color-gold` | `#D4AF36` (Classic Royal Gold) | Primary accent |
| `--color-gold-sand` | `#D8C28A` (Sand Gold) | Subtle accent |
| `--color-gold-deep` | `#BA7C17` (Deep Gold) | Emphasis, hover |
| `--color-ink` | `#2B2B2B` (Deep Charcoal) | Body text |
| `--color-ink-strong` | `#010100` | Headings on light bg |

Spacing, type scale, and motion tokens are introduced as the design
matures — keep additions in the same `:root` block so the token surface
stays one file.

### File layout

```
projects/czera/
├── index.html                # landing
├── catalog.html              # collection grid (Frette-inspired)
├── css/
│   ├── tokens.css            # design tokens (vars only)
│   ├── base.css              # reset + base typography
│   ├── components.css        # buttons, cards, nav
│   └── pages/
│       ├── landing.css
│       └── catalog.css
├── js/
│   ├── main.js               # global behaviours (nav, lang toggle)
│   └── catalog.js            # filters + grid behaviour
├── assets/
│   ├── logo/                 # processed brand marks (svg/png)
│   ├── img/                  # photography (optimized)
│   └── video/                # hero video (added later)
└── graphics/                 # raw client material (kept; not shipped)
```

### Source content

- `graphics/` holds the original client zips and extracted reference
  imagery. **Not** shipped to production — keep `assets/` as the
  optimized, page-ready copy.
- Logo assets: extract clean PNG/SVG from the brand book pages into
  `assets/logo/` rather than referencing files in `graphics/`.

### Inspirations (for visual reviewers)

- Editorial / brand storytelling: https://www.abysshabidecor.com/home
- Catalogue grid + filters: https://www.frette.com/en_US/towels
- Voice / lifestyle imagery: Instagram (@czera_maison), Facebook page

### Naming

- HTML files: kebab-case (`product-detail.html`).
- CSS classes: BEM-ish (`.hero__title`, `.card--featured`).
- JS modules: kebab-case files, camelCase exports.
- Image assets: kebab-case + descriptive (`hero-bath-towel.jpg`).
