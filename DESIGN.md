---
name: LocalResearcher Anti-Slop
colors:
  surface: '#f5f4f2'
  surface-dim: '#e5e4e2'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdfcfb'
  surface-container: '#f5f4f2'
  surface-container-high: '#ebeae8'
  surface-container-highest: '#e1e0de'
  on-surface: '#0a0a0a'
  on-surface-variant: '#4b5563'
  inverse-surface: '#0a0a0a'
  inverse-on-surface: '#ffffff'
  outline: '#d1d5db'
  outline-variant: '#e5e7eb'
  surface-tint: '#ff6b00'
  primary: '#ff6b00'
  on-primary: '#ffffff'
  primary-container: '#ff8a33'
  on-primary-container: '#4d1e00'
  inverse-primary: '#ff8a33'
  secondary: '#0a0a0a'
  on-secondary: '#ffffff'
  secondary-container: '#27272a'
  on-secondary-container: '#f4f4f5'
  tertiary: '#06b6d4'
  on-tertiary: '#ffffff'
  tertiary-container: '#67e8f9'
  on-tertiary-container: '#083344'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#fecaca'
  on-error-container: '#7f1d1d'
  primary-fixed: '#ff8a33'
  primary-fixed-dim: '#ff6b00'
  on-primary-fixed: '#4d1e00'
  on-primary-fixed-variant: '#803200'
  secondary-fixed: '#27272a'
  secondary-fixed-dim: '#0a0a0a'
  on-secondary-fixed: '#ffffff'
  on-secondary-fixed-variant: '#f4f4f5'
  tertiary-fixed: '#67e8f9'
  tertiary-fixed-dim: '#06b6d4'
  on-tertiary-fixed: '#083344'
  on-tertiary-fixed-variant: '#155e75'
  background: '#f5f4f2'
  on-background: '#0a0a0a'
  surface-variant: '#ebeae8'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '600'
    lineHeight: 80px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Georgia, serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  full: 9999px
spacing:
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-4xl: 6rem
---

# Design System: LocalResearcher Anti-Slop

## 1. Visual Theme & Atmosphere
A restrained, gallery-airy interface with confident asymmetric layouts and fluid spring-physics motion. The atmosphere is clinical yet warm — like a well-lit architecture studio or high-end consumer hardware brand. High-contrast typography drives the visual hierarchy against a clean stone substrate.

## 2. Color Palette & Roles
- **Stone Canvas** (#F5F4F2) — Primary background surface
- **Pure Surface** (#FFFFFF) — Card and container fill with glassmorphic transparency
- **Obsidian Ink** (#0A0A0A) — Primary text, buttons, deep depth
- **Muted Slate** (#4B5563) — Secondary text, descriptions, metadata
- **Verified Orange** (#FF6B00) — Single high-chroma accent for CTAs, active states, focus rings. 

## 3. Typography Rules
- **Display:** Geist — Track-tight, controlled scale, weight-driven hierarchy. Extremely tight letter-spacing for large headlines.
- **Subheadline:** Georgia (Serif) — Used exclusively for the immediate subheadline below the hero to provide editorial contrast.
- **Body:** Geist — Relaxed leading, 65ch max-width, neutral secondary color.
- **Mono:** JetBrains Mono — For code, metadata, terminal commands, and telemetry.
- **Banned:** Inter, generic system fonts for premium contexts. No neon/purple text.

## 4. Component Stylings
* **Buttons:** Flat, no outer glow. Tactile -1px translate on active. Obsidian fill for primary, ghost/outline for secondary.
* **Cards:** Generously rounded corners (1.5rem - 2rem). Diffused whisper shadow. Glassmorphic frosted glass effects used over light noise backgrounds.
* **Inputs:** Label above, error below. Focus ring in accent color. No floating labels.
* **Empty States:** Composed compositions indicating how to populate data.
* **Code Terminal:** Dark obsidian boxes with monospace text and copy-to-clipboard micro-interactions.

## 5. Layout Principles
Grid-first responsive architecture. Asymmetric splits for Hero sections.
Strict single-column collapse below 768px. Max-width containment (1280px).
No flexbox percentage math. Generous internal padding.

## 6. Motion & Interaction
Spring physics for all interactive elements. Staggered cascade reveals.
Hardware-accelerated transforms only.

## 7. Anti-Patterns (Banned)
- No emojis anywhere.
- No Inter font.
- No pure black (#000000).
- No neon glows or AI "purple" branding.
- No 3-column equal grids.
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen").
- No filler UI text: "Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons.
- No overlapping elements — clean spatial separation always.
