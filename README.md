# AI Lab Global — Design System

A dark-first, high-contrast design system for AI Lab Global. Visual direction inspired by
modern motorsport/athlete branding ([landonorris.com](https://landonorris.com/)): carbon
neutrals, a single neon-lime signature accent, heavyweight uppercase display type, and
restrained, precise motion.

**Live style guide:** open `index.html` in a browser.

## Structure

```
css/
  tokens.css       Design tokens as CSS custom properties (colors, type, spacing, radii, motion)
  base.css         Reset, typography defaults, layout primitives, a11y helpers
  components.css   Buttons, badges, nav, cards, stats, forms, marquee, footer
  ailab.css        Single entry point (@imports the three layers above)
tokens/
  tokens.json      Machine-readable token source (for Figma sync, Style Dictionary, etc.)
index.html         Living style guide / component showcase
```

## Usage

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/ailab.css">
```

All classes are prefixed `al-`; all custom properties are prefixed `--al-`.

```html
<button class="al-btn al-btn--primary">Get Started</button>
<span class="al-badge al-badge--accent">Beta</span>
```

Light theme (for docs / long-form reading) is opt-in per subtree:

```html
<html data-theme="light">
```

## Design principles

1. **Dark is the default.** Near-black backgrounds (`#0A0A0B`) with carbon surfaces; light
   theme exists but the brand lives in the dark.
2. **One loud voice.** Neon lime `#C6FF00` is the only saturated color in a view — use it
   for the primary action and one accent moment, never for large fills of text.
3. **Type does the talking.** Display headings are Archivo, weight 900, uppercase, tight
   tracking. Body (Inter) and labels (JetBrains Mono) stay quiet.
4. **Sharp surfaces, pill controls.** Cards and media use 2px radii; buttons and badges are
   full pills.
5. **Motion is decisive.** Fast (150–450ms), one signature ease
   (`cubic-bezier(0.16, 1, 0.3, 1)`), and everything respects `prefers-reduced-motion`.

## Token quick reference

| Token | Value | Role |
| --- | --- | --- |
| `--al-lime-500` | `#C6FF00` | Brand accent / primary action |
| `--al-black` | `#0A0A0B` | Page background |
| `--al-carbon-800` | `#16181B` | Raised surfaces |
| `--al-offwhite` | `#F4F5F3` | Primary text |
| `--al-gray-300` | `#9AA0A6` | Muted text |
| `--al-font-display` | Archivo | Headings, buttons, nav |
| `--al-font-body` | Inter | Body copy |
| `--al-font-mono` | JetBrains Mono | Labels, eyebrows, data |
| `--al-radius-pill` | `999px` | Buttons, badges |
| `--al-ease-out` | `cubic-bezier(0.16,1,0.3,1)` | Signature easing |

## Accessibility

- Text on the dark background uses off-white (≈15.5:1 contrast); muted text stays above 4.5:1.
- Lime is paired only with near-black text (`--al-accent-contrast`), never white.
- Visible `:focus-visible` rings on every interactive element.
- `prefers-reduced-motion` disables the marquee and transitions globally.
