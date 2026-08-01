# Wakaru — Design System

A dark-first, retrofuture design system for [wakaruapp.app](https://wakaruapp.app) — the app
that lets English speakers in Japan photograph any Japanese document and understand what to do.
Visual direction modeled on [rabbit r1](https://www.rabbit.tech/rabbit-r1) (Teenage Engineering
retrofuture): near-black ink, a single luminous-orange accent, lowercase grotesque display type,
monospace data labels, and rounded-square "device" surfaces.

**Live style guide:** open `index.html` in a browser.

## Structure

```
css/
  tokens.css       Design tokens as CSS custom properties (colors, type, spacing, radii, motion)
  base.css         Reset, typography defaults, layout primitives, a11y helpers
  components.css   Buttons, badges, nav, cards, scan frame, steps, bilingual pairs, chat, forms
  wakaru.css       Single entry point (@imports the three layers above)
tokens/
  tokens.json      Machine-readable token source (for Figma sync, Style Dictionary, etc.)
index.html         Living style guide / component showcase
```

## Usage

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/wakaru.css">
```

All classes are prefixed `wk-`; all custom properties are prefixed `--wk-`.

```html
<button class="wk-btn wk-btn--primary">scan a document <span class="wk-btn__arrow">→</span></button>
<span class="wk-badge wk-badge--urgent">urgent · due mar 15</span>
```

Paper theme (for analysis results / long-form reading — documents are paper) is opt-in per subtree:

```html
<html data-theme="paper">
```

## Design principles

1. **Dark is the default.** Warm near-black ink (`#111110`) — never blue-gray. The paper theme
   (`#FAF8F2`) exists for reading analysis results.
2. **One loud voice.** Luminous orange `#FF4D00` is the only saturated color in a view. It marks
   the primary action and *urgency* — the product's core signal — never decoration.
3. **Lowercase display.** Headings, buttons, and links use Space Grotesk in lowercase (enforced
   in CSS). Body copy (Inter) stays sentence-cased; Japanese text (`.wk-jp`, Noto Sans JP) is exempt.
4. **Mono is the machine's voice.** Space Mono for eyebrows (`[ 01 — scan ]`), metadata,
   timestamps, and counters — small, wide-tracked, lowercase.
5. **Device surfaces, pill controls.** Cards and media use the signature 24px rounded-square
   radius (like handheld hardware); buttons and badges are full pills. Arrows (`→`) point at
   every forward action.
6. **Motion is calm and mechanical.** 150–500ms, one signature ease
   (`cubic-bezier(0.22, 1, 0.36, 1)`), scan-sweep animation reserved for the scanner, and
   everything respects `prefers-reduced-motion`.

## Product-specific components

| Component | Purpose |
| --- | --- |
| `.wk-scan` | Viewfinder frame with orange corners + sweep line; drop-zone variant for uploads |
| `.wk-badge--urgent/soon/ok/info` | Urgency level — exactly one per document card |
| `.wk-doc` | Scanned-document card: badge, date, Japanese title, translation, summary |
| `.wk-steps` | "What to do next" numbered list with mono counters (`01`, `02`, …) |
| `.wk-pair` | Bilingual pair — Japanese source above, English translation below |
| `.wk-chat` | Follow-up Q&A bubbles (user = orange, app = surface) |

## Token quick reference

| Token | Value | Role |
| --- | --- | --- |
| `--wk-orange-500` | `#FF4D00` | Brand accent / primary action / urgent |
| `--wk-ink` | `#111110` | Page background |
| `--wk-ink-800` | `#1D1D1B` | Raised surfaces |
| `--wk-paper` | `#FAF8F2` | Primary text (dark) / paper-theme background |
| `--wk-font-display` | Space Grotesk | Headings, buttons, nav (lowercase) |
| `--wk-font-body` | Inter | Body copy |
| `--wk-font-mono` | Space Mono | Labels, eyebrows, data |
| `--wk-font-jp` | Noto Sans JP | Japanese source text |
| `--wk-radius-device` | `24px` | Cards, panels, media |
| `--wk-radius-pill` | `999px` | Buttons, badges |
| `--wk-ease-out` | `cubic-bezier(0.22,1,0.36,1)` | Signature easing |

## Accessibility

- Text on ink uses warm paper white (≈16:1 contrast); muted text stays above 4.5:1.
- Orange `#FF4D00` on ink is ≈5.7:1 — fine for large display text, buttons, and icons; small
  orange text uses `--wk-orange-300` on dark, `--wk-orange-600` on paper.
- Orange is paired only with near-black text (`--wk-accent-contrast`) in the dark theme.
- Visible `:focus-visible` rings on every interactive element.
- Urgency badges pair color with a text label — never color alone.
- `prefers-reduced-motion` disables the scan sweep and transitions globally.
