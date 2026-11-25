---
name: Deterministic Academic Precision
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#bdc2ff'
  on-secondary: '#131e8c'
  secondary-container: '#2f3aa3'
  on-secondary-container: '#a8afff'
  tertiary: '#56e5a9'
  on-tertiary: '#003824'
  tertiary-container: '#30c88f'
  on-tertiary-container: '#004e34'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  telemetry-badge:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  math-display:
    fontFamily: EB Garamond
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  math-inline:
    fontFamily: EB Garamond
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-density, computational aesthetic designed for research engineers, computational linguists, and systems architects building verifiable retrieval-augmented generation pipelines. It converges the exacting visual rigor of academic publications (LaTeX, Stripe Press) with the tactical, state-driven interfaces of modern developer infrastructure (Linear, Vercel).

The visual metaphor is that of an advanced algorithmic laboratory: dark crystalline substrates, monospaced AST parsers, cryogenic luminescence, and cryptographic certainty. Every visual element must communicate immutability, mathematical rigor, and zero-latency execution.

### Key Principles
- **Algorithmic Rigor:** Typography, grids, and components align to strict mathematical cadences (4px/8px modular base). Information density takes precedence over decorative negative space.
- **Cryptographic Verifiability:** Success and verification states are rendered with crystalline clarity, employing emerald byte-anchor indicators to signal deterministic proofs and tamper-proof citations.
- **Instrument-Grade Restraint:** Visual noise is aggressively suppressed. Surfaces utilize obsidian and deep zinc slates, punctuated only by functional spectral glows (ice-blue and cold cyan) to direct cognitive focus to runtime states, latency metrics, and mathematical nodes.

## Colors

The palette operates under a default dark mode, engineered to reduce ocular fatigue during prolonged research cycles and terminal interaction. It balances deep abyssal backgrounds with high-contrast foreground data streams.

### Palette Architecture
- **Primary (`#38BDF8` - Ice Cyan):** Signifies computational focus, active execution traces, active AST nodes, and terminal prompts. Used sparingly for primary interactive triggers and high-priority vector space anchors.
- **Secondary (`#818CF8` - Spectral Indigo):** Denotes secondary query parameters, relational graph edges, metadata tags, and semantic embeddings.
- **Tertiary / Proof Anchor (`#10B981` - Cryptographic Emerald):** Reserved strictly for deterministic verifications, citation consensus checks, zero-hash validation proofs, and 100% vector confidence scores.
- **System Slate / Warning (`#F59E0B` - Amber Telemetry):** Reserved for cache misses, embedding drift, token budget thresholds, and pipeline warnings.
- **System Slate / Error (`#F43F5E` - Rose Exception):** Signifies schema validation failures, hallucination alerts, and network partition faults.
- **Substrates & Neutrals:**
  - `Canvas / Root`: `#0B0F17` (Deep Obsidian)
  - `Surface Level 1 / Elevated Card`: `#111827` (Zinc Slate Core)
  - `Surface Level 2 / Interactive Panel`: `#1E293B` (Structured Slate)
  - `Surface Level 3 / Active Hover`: `#334155` (Slate Accent)
  - `Border Subtle`: `rgba(51, 65, 85, 0.45)` (Hairline grid boundaries)
  - `Border Highlight`: `rgba(56, 189, 248, 0.3)` (Active field boundaries)
  - `Text Primary`: `#F8FAFC` (Slate 50 - High contrast LaTeX text and equations)
  - `Text Secondary`: `#94A3B8` (Slate 400 - Technical parameters and labels)
  - `Text Muted / Code Ghost`: `#64748B` (Slate 500 - Line numbers, inactive operators)

## Typography

The typographic hierarchy balances structural engineering clarity, monospaced machine output, and classical academic prose.

- **System & Interface (`Inter`):** Engineered for ultra-high legibility on screens. Utilizes subtle negative tracking on headings to provide compact, authoritative architecture titles and navigation.
- **Code & Telemetry (`JetBrains Mono`):** Applied to vector coordinates, hash signatures, latency durations, AST node keys, and JSON/TypeScript payload inspections.
- **Formal Academic & Formulaic Notation (`EB Garamond`):** Applied to LaTeX representations, formal mathematical theorems, citation attributions, and paper titles to evoke the dignity of Stripe Press publications and physical journal manuscripts.
- **Numerical Formatting:** All numeric values in data tables and telemetry meters must enforce tabular lining figures (`font-feature-settings: 'tnum' 1, 'zero' 1`) to ensure stable visual column alignments during live streaming data.

## Layout & Spacing

The layout is built around a rigorous 4px baseline micro-grid combined with an 8px macro-spacing progression.

### Grid & Viewport Hierarchy
- **Desktop Grid (1200px and up):** 12-column dynamic layout with `gutter-desktop` (1.5rem) and outer `margin-desktop` (3rem). Panels are dockable and vertically partitioned with hairline borders rather than empty whitespace.
- **Tablet / Split View (768px - 1199px):** 8-column layout with `gutter` (1rem) and `margin-tablet` (2rem). Auxiliary vector visualizers collapse into tabbed drawer sheets.
- **Mobile / Terminal View (<768px):** 4-column layout with `gutter` (1rem) and `margin` (1rem). Horizontal scroll regions with visual clipping masks handle wide-column matrix comparisons and code blocks.

### Component Density Rules
- Dense viewports require minimal vertical padding: inner card containers utilize `space-md` (1rem), while micro-badges and metric indicators use `space-xs` (0.25rem) vertically and `space-sm` (0.5rem) horizontally.
- Nested panels use pure flex/grid gap tokens (`space-sm`, `space-md`) to ensure pixel-perfect docking without cumulative margin collapsing.

## Elevation & Depth

This design system avoids heavy drop-shadows, instead leveraging calibrated luminosity, structural borders, and translucent layers to establish spatial hierarchy.

### Depth Hierarchy
1. **Base Layer (Canvas):** Pure `#0B0F17` background with an optional micro-mesh dot grid (`rgba(51, 65, 85, 0.15)` spaced at 24px) for technical grounding.
2. **Structural Surfaces (Cards, Tables, Terminals):** Background `#111827` overlaid with a 1px solid border of `rgba(51, 65, 85, 0.4)`. No box-shadow is applied; borders cleanly delimit bounding boxes.
3. **Interactive Overlays & Flyouts:** Background `rgba(17, 24, 39, 0.85)` with `backdrop-filter: blur(12px)` and a subtle rim highlight (`border-top: 1px solid rgba(56, 189, 248, 0.2)`).
4. **Spectral Glow Accents:** Active computational nodes and focused input perimeters cast a soft ambient luminescence: `box-shadow: 0 0 20px -4px rgba(56, 189, 248, 0.15)`.
5. **Deterministic Proof Accents:** Validated cryptographic byte nodes project a localized emerald diffusion: `box-shadow: 0 0 16px -4px rgba(16, 185, 129, 0.25)`.

## Shapes

The design system maintains a calibrated "Soft Sharp" geometric philosophy (Level 1 roundedness). Radii are deliberately tight to maintain instrument-panel discipline and maximize usable data real estate.

- **Standard Base Radii:** All inputs, small buttons, status tags, and metric cells feature `0.25rem` (4px) corner radii.
- **Panel & Card Radii (`rounded-lg`):** Main application cards, code panels, and terminal outputs use `0.5rem` (8px).
- **Modal & Large Shell Radii (`rounded-xl`):** Flyout dialogs and drawer containers cap at `0.75rem` (12px).
- **Circular Indicators:** Status pips, cryptographic presence dots, and user node avatars remain strict 50% circular geometries.
- **Beveled Terminal Dividers:** Inner panel dividers and tabs maintain hard 90° right angles (`0px` radius) to anchor high-density data tables.

## Components

### 1. Buttons
- **Primary Execution Button:** Solid `#38BDF8` background with `#0B0F17` bold typography. On hover: subtle scale-free brightness shift to `#7DD3FC` and an outer cold cyan glow. Padding: `0.5rem 1rem`. Radius: `0.25rem`.
- **Secondary Ghost / Technical Button:** Transparent background, `1px solid rgba(51, 65, 85, 0.6)` border, `#F8FAFC` text. On hover: background shifts to `rgba(30, 41, 59, 0.6)` with border color shifting to `#64748B`.
- **Destructive Action:** Deep rose tint `rgba(244, 63, 94, 0.1)` with `1px solid rgba(244, 63, 94, 0.4)` border and `#FB7185` text.

### 2. Telemetry Badges & Cryptographic Chips
- **Proof Tag:** JetBrains Mono 11px uppercase label. Deep emerald background `rgba(16, 185, 129, 0.1)`, `1px solid rgba(16, 185, 129, 0.3)` border, and a 6px pulsating `#10B981` dot indicating 100% deterministic citation anchoring.
- **Latency / Token Counter:** Monospaced slate chip with `#94A3B8` text, displaying execution metrics (e.g., `42ms | 1.2k tok/s`). Encased in `rgba(30, 41, 59, 0.8)` with hairline borders.

### 3. Interactive Code & Query Terminals
- Built with `#0D131F` background, 1px perimeter border of `rgba(51, 65, 85, 0.5)`. Includes an integrated top header strip containing filename or vector namespace in `JetBrains Mono` 12px, tab status, and execution duration.
- Syntax highlighting uses the palette: `#38BDF8` (keywords), `#818CF8` (types), `#10B981` (strings & proof keys), and `#64748B` (comments).

### 4. Input Fields & Parameter Controls
- Surface `#111827`, border `1px solid rgba(51, 65, 85, 0.6)`. Typography: `Inter` 14px for natural text, `JetBrains Mono` 13px for regex, semantic query vectors, and thresholds.
- **Focus State:** Border shifts instantly to `#38BDF8`, supported by a `0 0 0 1px #38BDF8` ring with `0 0 12px rgba(56, 189, 248, 0.2)` cyan diffusion.

### 5. Checkboxes & Deterministic Selectors
- Checkbox container is a `16px x 16px` square with `2px` rounded corners, finished with a `1px solid rgba(71, 85, 105, 0.8)` boundary. Checked state: `#38BDF8` fill with `#0B0F17` micro-check icon.
- Radio buttons maintain an identical border aesthetic with an inner `6px` solid cyan core when active.

### 6. Citation Cards & LaTeX Proof Blocks
- **Academic Citation Node:** A unified card structure (`#111827`) featuring an `EB Garamond` excerpt paired with an inline DOI/ArXiv link, cryptographic sha-256 byte stamp (`JetBrains Mono`), and a confidence meter progress bar colored with the emerald verification green.