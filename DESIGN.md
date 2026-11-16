# Design System: LendLoop

## 1. Brand Identity & Character
- **Product:** LendLoop — Neighborhood Tool-Lending Board with Automated Workflows.
- **Character:** Grounded, trustworthy, utilitarian, calm, and neighborly.
- **Ethos:** Utilitarian craftsmanship over decorative fluff. Every pixel, border, and badge serves an informational purpose. Designed for everyday neighbors sharing lawnmowers, ladders, and drills.

## 2. Color Palette & Hierarchy
- **Base Canvas:** Clean Slate Neutral `#f8fafc` (`bg-slate-50`).
- **Surfaces:**
  - Cards & Panels: Pure White `#ffffff` (`bg-white`)
  - Sub-elements & Table Headers: Slate 100 `#f1f5f9`
  - Crisp Structural Borders: Slate 200 `#e2e8f0` (clean 1px hairpins)
- **Typography:**
  - Primary Headings & Bold Labels: Slate 900 `#0f172a`
  - Body & Descriptive Text: Slate 600 `#475569`
  - Secondary Metadata & Notes: Slate 500 `#64748b`
- **Single Deliberate Accent:**
  - Emerald `#059669` (used solely for available inventory states, verified trust indicators, and primary user actions).
  - Absolute ban on blue-purple gradients, neon glow orbs, and rainbow fills.

## 3. Systematic Radii Scale
- `rounded-md` (6px): Small controls, status badges, metadata tags.
- `rounded-lg` (8px): Action buttons, inputs, filter toggles.
- `rounded-xl` (12px): Feature cards, modals, container blocks.
- *Strict Rule:* No arbitrary `rounded-3xl` or universal pill shapes on rectangular surfaces.

## 4. Typography Hierarchy
- Clean, highly legible sans-serif.
- Strong weight contrast (Bold `font-bold` for headings, `font-medium` for labels, `font-normal` for body).
- No wide-tracked uppercase labels (`tracking-[0.2em]`) on arbitrary copy.
- Monospace reserved strictly for machine hashes, IDs, and technical keys (HMAC signatures, idempotency tokens).

## 5. Anti-Slop Visual Rules
- **No Background Grid:** No dot grids, blueprint lines, or canvas mesh patterns.
- **No Glow Orbs:** No floating blurred radial circles behind the hero or cards.
- **No Decorative Pulsing Dots:** Dots only mark actual real-time connection or live loan state.
- **No Eyebrow Duplication:** Let the headline state the proposition directly without redundant pill labels above it.
- **No Decorative Emoji:** Professional, uncluttered copy without emoji filler.
- **No Ubiquitous Arrows:** Buttons say what they do cleanly without arbitrary `→` on every element.
- **Real Metrics:** Only display verifiable operational characteristics (Zero PII, HMAC-SHA256, Idempotent n8n write-backs).
- **Harmonious Navigation & Layout:** Clean sticky navbar with subtle border, integrated footer with real links.
