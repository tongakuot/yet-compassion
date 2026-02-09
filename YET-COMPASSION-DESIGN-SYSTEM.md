# Y.E.T. Compassion — Design System Extraction

**Purpose:** A complete, reusable design system derived from the Y.E.T. Compassion website, documented for transfer to PyStatR+ or any future project.

---

## 1. Design Philosophy: "Sacred Minimalism"

The aesthetic is built on a tension that works: **authority without heaviness, warmth without clutter**. Every page communicates institutional credibility through restraint — not through ornamentation. The design speaks through spacing, hierarchy, and color discipline rather than decoration.

Core principles:

- **Maximum content, minimum chrome.** No decorative borders, no gratuitous shadows, no gradient backgrounds that distract from text. Shadows are surgical (`0 1px 3px rgba(0,0,0,0.08)` — barely visible).
- **Section-based narrative flow.** Every page reads like a vertical story: Hero → Content Sections → Scripture/Divider → CTA. The rhythm is predictable enough to feel safe but varied enough to hold attention.
- **Color as meaning, not mood.** Each color signals a specific brand pillar. Green = primary/identity. Gold = emphasis/premium. Blue = programs/information. Colors are never decorative — they carry semantic weight.
- **Typography carries the hierarchy alone.** Playfair Display for authority and emotional weight. Inter for clarity and function. Cormorant Garamond for contemplative moments. The type system does 90% of the visual heavy lifting.

---

## 2. Color System

### Primary Palette

| Token | Hex | Role |
|-------|-----|------|
| **Primary** | `#1F5E3B` | Identity, CTAs, section headers, form focus states |
| **Primary Light** | `#2A7A4E` | Hover states for primary buttons, gradient endpoints |
| **Secondary** | `#C9A227` | Emphasis, gold accents, hero highlights, premium CTAs |
| **Secondary Light** | `#D4B44A` | Hover states for gold buttons, gradient endpoints |
| **Accent** | `#3A7CA5` | Information, programs section, tertiary elements |
| **Accent Light** | `#4A92BF` | Hover states for blue buttons, gradient endpoints |

### Neutral Palette

| Token | Hex | Role |
|-------|-----|------|
| **Charcoal** | `#2B2B2B` | Dark backgrounds, CTA sections, text headings |
| **Dark Green** | `#1a2e23` | Gradient midpoint (hero backgrounds) |
| **Text** | `#5A5955` | Body copy, descriptions, paragraphs |
| **Muted** | `#8A8985` | Metadata, timestamps, scripture attributions |
| **Border** | `#D9D8D4` | Card borders, form borders, divider lines |
| **Ivory** | `#F7F6F2` | Light section backgrounds, card fills |
| **Alt BG** | `#F0EFEB` | Newsletter sections, secondary light backgrounds |
| **White** | `#FFFFFF` | Card surfaces, form inputs, primary backgrounds |

### Transparency Patterns

```
rgba(255,255,255,0.85) — Hero subtitle text
rgba(255,255,255,0.8)  — Hero body text, CTA description text
rgba(255,255,255,0.7)  — Quick-nav pill text (inactive)
rgba(255,255,255,0.6)  — Info strip labels
rgba(255,255,255,0.5)  — 404 scripture text, year in date blocks
rgba(255,255,255,0.2)  — Quick-nav pill borders (inactive)
rgba(255,255,255,0.1)  — Helpful links card borders (dark bg)
rgba(255,255,255,0.06) — Helpful links card background (dark bg)
rgba(0,0,0,0.08)       — Subtle card shadows
rgba(0,0,0,0.12)       — Hover-state card shadows
rgba(31,94,59,0.12)    — Form focus ring (green glow)
rgba(201,162,39,0.3)   — Gold button shadow
rgba(201,162,39,0.1)   — Event type tag backgrounds (gold)
rgba(31,94,59,0.1)     — Event type tag backgrounds (green)
rgba(58,124,165,0.1)   — Event type tag backgrounds (blue)
```

---

## 3. Typography System

### Font Stack

| Role | Family | Fallback | Usage |
|------|--------|----------|-------|
| **Display** | Playfair Display | Georgia, serif | All h1-h3, card titles, section headers |
| **Body** | Inter | sans-serif | Body text, labels, buttons, metadata |
| **Contemplative** | Cormorant Garamond | Georgia, serif | Scripture quotes only |

### Scale (using `clamp()` for fluid sizing)

```css
/* Hero H1 — Homepage */
font-size: clamp(2.25rem, 5vw, 3.5rem);

/* Hero H1 — Interior pages */
font-size: clamp(2rem, 4.5vw, 3rem);

/* Section H2 */
font-size: clamp(1.75rem, 3vw, 2.25rem);

/* Scripture quote */
font-size: clamp(1.15rem, 2.5vw, 1.5rem);

/* Body large */
font-size: 1.05rem; (line-height: 1.8)

/* Body standard */
font-size: 0.95rem; (line-height: 1.6)

/* Card body */
font-size: 0.9rem; (line-height: 1.6)

/* Label / uppercase micro */
font-size: 0.8rem; (letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600)

/* Metadata / small */
font-size: 0.85rem;

/* Fine print */
font-size: 0.75rem;
```

### Key Typography Patterns

**Hero gold highlight:** Wrap the emotional phrase in `<span style="color: #C9A227;">...</span>` inside the h1. Always the second half of the sentence.

**Numbered lists with Playfair numerals:** Use Playfair Display at 1.5rem, 700 weight, color `#1F5E3B` for list numbers — creates an editorial, magazine-like feel.

**Bold-then-description pattern:** `<strong>Label.</strong> <span>Description text...</span>` — used for core values, bullet points, and impact descriptions.

---

## 4. Layout Architecture

### Page Composition Formula

Every page follows this vertical narrative:

```
1. HERO (dark gradient)
2. CONTENT SECTION(S) (alternating white ↔ ivory)
3. SCRIPTURE DIVIDER (charcoal or green)
4. MORE CONTENT SECTION(S)
5. CTA (dark gradient or charcoal)
```

### Section Padding

```css
/* Standard content section */
padding: 3.5rem 1.5rem;

/* Hero section */
padding: 4rem 1.5rem;

/* Compact strip (pillars, info strip) */
padding: 2.25rem 1.5rem;

/* Scripture divider */
padding: 3.5rem 1.5rem; (or 2.5rem for tighter variants)
```

### Max-Width Containers

```css
780px  — Long-form text (mission, about, FAQ answers)
800px  — FAQ accordion, scripture banners
900px  — Card grids, two-column layouts
1000px — Three-column card grids (Get Involved)
1200px — Homepage program grid (5 cards)
```

### Background Alternation Pattern

```
Section 1: #FFFFFF (white)
Section 2: #F7F6F2 (ivory)
Section 3: #FFFFFF
Section 4: #2B2B2B (charcoal divider)
Section 5: #F7F6F2 or #FFFFFF
Section N: dark gradient CTA (final)
```

---

## 5. Component Library

### 5.1 Hero Section

**Structure:** Full-width dark gradient with SVG geometric pattern overlay at 5% opacity.

```css
background: linear-gradient(135deg, #2B2B2B 0%, #1a2e23 50%, #2B2B2B 100%);
position: relative;
overflow: hidden;
```

**Geometric overlay:** An inline SVG triangle pattern rendered at 60×60px tiles, 5% opacity, in gold (#C9A227):

```css
position: absolute; inset: 0; opacity: 0.05;
background-image: url('data:image/svg+xml;utf8,...'); /* Triangle path */
background-size: 60px 60px;
```

**Content layering:** `position: relative; z-index: 2;` on the content container to sit above the pattern.

**Hero variants:**
- Homepage: centered text, `min-height: 60vh`
- Interior pages: left-aligned text, `min-height: 50vh` (or 40–45vh for simpler pages)
- 404: centered, `min-height: 100vh`

---

### 5.2 Quick-Nav Anchor Pills

Horizontal flex row of pill-shaped anchor links inside the hero. Allows instant navigation to page sections.

```css
display: inline-block;
padding: 0.4rem 1rem;
border: 1px solid rgba(255,255,255,0.2); /* or rgba(201,162,39,0.4) for gold variant */
border-radius: 20px;
font-size: 0.8rem;
font-weight: 500;
text-decoration: none;
transition: all 200ms ease;
```

Hover: `background: rgba(255,255,255,0.1); color: #FFFFFF; border-color: rgba(255,255,255,0.4);`

---

### 5.3 Section Header with Accent Bar

A colored vertical bar (4px wide, 28px tall) left of the section heading. Replaces traditional underlines.

```html
<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
  <div style="width: 4px; height: 28px; background: #1F5E3B; border-radius: 2px;"></div>
  <h2>Section Title</h2>
</div>
```

Color rotation: Green → Gold → Blue → Green...

---

### 5.4 Gold Underline Separator

A thin gold line (60px × 3px) placed below section headings for visual rhythm.

```css
width: 60px; height: 3px; background-color: #C9A227; margin-bottom: 1.5rem;
```

Color variants: Gold (`#C9A227`), Green (`#1F5E3B`), Blue (`#3A7CA5`).

---

### 5.5 Card Styles

**Standard Card (white, with colored top border):**
```css
background: #FFFFFF;
border-radius: 12px;
padding: 2rem 1.5rem;
border-top: 4px solid #1F5E3B; /* rotates: green, gold, blue */
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
transition: box-shadow 200ms ease, transform 200ms ease;
```
Hover: `box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px);`

**Info Card (ivory, with left accent border):**
```css
background: #F7F6F2;
border-radius: 12px;
padding: 1.5rem;
border-left: 4px solid #1F5E3B; /* rotates by card */
```

**Gradient Icon Badge:**
```css
width: 52px; height: 52px;
background: linear-gradient(135deg, #1F5E3B, #2A7A4E);
border-radius: 12px;
display: flex; align-items: center; justify-content: center;
```

---

### 5.6 Event Date Block (unique pattern)

A two-column card with a dark date sidebar and content area:

```html
<div style="display: grid; grid-template-columns: 100px 1fr; border-left: 4px solid [color];">
  <!-- Date column: dark bg with day/month/year stacked -->
  <div style="background: #2B2B2B; display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <span style="font-family: Playfair Display; font-size: 1.75rem; color: #C9A227;">15</span>
    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">MAR</span>
    <span style="font-size: 0.7rem; color: rgba(255,255,255,0.5);">2026</span>
  </div>
  <!-- Content column: title, tags, description, metadata -->
</div>
```

**Event type tags:** Inline pill with tinted background:
```css
font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
color: #C9A227; background: rgba(201,162,39,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;
```

---

### 5.7 Scripture Banner

Full-width section with centered scripture in Cormorant Garamond italic:

```css
/* Dark variant */
background-color: #2B2B2B;
font-family: 'Cormorant Garamond', serif;
font-style: italic;
color: #C9A227;

/* Green variant */
background-color: #1F5E3B;
color: rgba(255,255,255,0.92);
/* Attribution in gold */
```

---

### 5.8 FAQ Accordion

Native `<details>` elements with custom styling:

```css
details summary { list-style: none; }
details summary::-webkit-details-marker { display: none; }
details summary::before {
  content: "+";
  width: 24px; height: 24px;
  background: #F0EFEB;
  border-radius: 50%;
  color: #1F5E3B;
}
details[open] summary::before {
  content: "−";
  background: #1F5E3B;
  color: #FFFFFF;
}
details[open] { border-color: #1F5E3B !important; }
```

---

### 5.9 Button System

**Gold Primary (premium CTA):**
```css
background-color: #C9A227; color: #2B2B2B;
font-weight: 700; padding: 0.85rem 2rem; border-radius: 8px;
box-shadow: 0 2px 8px rgba(201,162,39,0.3);
```

**Green Primary (standard CTA):**
```css
background-color: #1F5E3B; color: #FFFFFF;
font-weight: 600; padding: 0.75rem 2rem; border-radius: 8px;
```

**Ghost (dark backgrounds):**
```css
background: transparent; color: #FFFFFF;
border: 2px solid rgba(255,255,255,0.5); font-weight: 600;
```

**Ghost Gold (dark backgrounds, secondary):**
```css
background: transparent; color: #C9A227;
border: 1px solid rgba(201,162,39,0.5); font-weight: 600;
```

All buttons: `transition: all 200ms ease; border-radius: 8px; min-height: 48px;`

---

### 5.10 Form System

**Input styling:**
```css
padding: 0.7rem 1rem;
border: 1px solid #D9D8D4;
border-radius: 8px;
font-family: 'Inter', sans-serif;
font-size: 0.95rem;
background: #FFFFFF;
transition: border-color 200ms ease;
```

**Focus state:**
```css
outline: none;
border-color: #1F5E3B !important;
box-shadow: 0 0 0 3px rgba(31,94,59,0.12);
```

**Form container:** Always wrapped in a `#F7F6F2` rounded box: `border-radius: 12px; padding: 2rem;`

**Label styling:**
```css
font-family: 'Inter'; font-size: 0.85rem; font-weight: 600;
color: #2B2B2B; margin-bottom: 0.4rem;
```

---

### 5.11 Inline Newsletter Form

Horizontal email + button on desktop, stacks vertically on mobile:

```css
@media (min-width: 640px) { flex-direction: row; }
input { border-radius: 8px 0 0 8px; }
button { border-radius: 0 8px 8px 0; }
```

---

### 5.12 CTA Footer Section

Every page ends with a dark section (gradient or solid charcoal):

```css
background: linear-gradient(135deg, #2B2B2B 0%, #1a2e23 60%, #2B2B2B 100%);
/* or solid: */ background-color: #2B2B2B;
padding: 3.5rem 1.5rem; text-align: center;
```

Always contains: Playfair h2 in white, Inter subtitle in `rgba(255,255,255,0.8)`, one or two button pair (gold primary + ghost).

---

### 5.13 Pillar Strip

A compact green bar beneath the hero displaying brand pillars horizontally:

```css
background-color: #1F5E3B; padding: 2.25rem 1.5rem;
/* Items: icon + label, separated by vertical dividers */
```

---

### 5.14 Contact Info Strip

A green bar with icon-label pairs (email, location, hours) in a horizontal flex row:

```css
background-color: #1F5E3B; padding: 1.75rem 1.5rem;
display: flex; justify-content: center; gap: 3rem;
```

---

### 5.15 Donation Amount Selector

Interactive grid of clickable amount cards with JS state management:

```javascript
function selectAmount(btn, amount) {
  document.querySelectorAll('.donate-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('custom-amount').value = amount;
}
```

Active state: `border-color: #1F5E3B; background: rgba(31,94,59,0.05); box-shadow: 0 0 0 2px rgba(31,94,59,0.15);`

---

## 6. Interaction & Motion

All transitions use `200ms ease` — fast enough to feel responsive, slow enough to feel intentional.

| Interaction | Effect |
|-------------|--------|
| Card hover | `translateY(-2px)` + deeper shadow |
| Button hover | Color shift to lighter variant |
| Form focus | Green border + `box-shadow: 0 0 0 3px rgba(31,94,59,0.12)` |
| Pill hover | Background fill + border brightening |
| Link hover | Color shift only |

No animations on scroll (reveal-on-scroll class exists but is kept minimal). The philosophy is: **motion should confirm interaction, not create spectacle**.

---

## 7. Responsive Strategy

### Breakpoints

| Width | Behavior |
|-------|----------|
| `1024px+` | 3-column grids |
| `768px` | 3-col → 1-col, 2-col side-by-side → stacked |
| `640px` | 2-col grids → 1-col, newsletter form stacks |
| `480px` | Inline newsletter form stacks, micro-adjustments |
| `600px` | Event date blocks go full-width, donation grid goes 2-col |

### Pattern

All responsive overrides use `!important` on grid columns since the base styles are inline. This is a Quarto-specific constraint — styles are embedded per-component, and media queries live in `<style>` blocks at section ends.

```css
@media (max-width: 768px) {
  div[style*="grid-template-columns: repeat(3, 1fr)"] {
    grid-template-columns: 1fr !important;
  }
}
```

---

## 8. Structural SEO

- JSON-LD `Organization` schema on homepage
- JSON-LD `FAQPage` schema on FAQ page
- Footer JSON-LD schema via `_includes/footer-scripts.html` (loads on every page)
- Structured `sameAs` array for social profiles
- Descriptive `title` and `description` in every page's YAML frontmatter

---

## 9. Translation Notes for PyStatR+

The Y.E.T. Compassion palette is warm and sacred (greens, golds, earth tones). PyStatR+ operates in a different register: futuristic, geometric, luminous.

**Direct mappings:**

| Y.E.T. Token | PyStatR+ Equivalent |
|--------------|---------------------|
| `#1F5E3B` (green) | Metallic blue (primary) |
| `#C9A227` (gold) | PyStatR+ gold (accent) |
| `#3A7CA5` (blue) | Electric teal or silver |
| `#2B2B2B` (charcoal) | Deep black `#0D0D0D` or `#111111` |
| `#F7F6F2` (ivory) | Near-black `#1A1A2E` or `#0F0F1A` (dark theme) |
| `#5A5955` (text) | `rgba(255,255,255,0.75)` (on dark) |

**What transfers directly (structural patterns):**

1. The Hero → Sections → Scripture/Quote → CTA page rhythm
2. Quick-nav anchor pills
3. Section headers with colored accent bars
4. Card system (top-border color coding, gradient icon badges)
5. Form styling with focus ring glow
6. Event date-block layout
7. FAQ accordion with +/− indicators
8. Newsletter inline form
9. The `clamp()` fluid typography approach
10. The 200ms ease transition standard
11. The responsive grid-override pattern

**What changes aesthetically:**

1. SVG pattern overlay becomes circuit-board or node-graph pattern
2. Cormorant Garamond (scripture) → a monospace or futuristic serif for "philosophical quotes"
3. Playfair Display → could keep, or shift to something like Space Grotesk for a more technical feel
4. Backgrounds shift from light-dominant to dark-dominant
5. Subtle glow effects replace the warm box-shadows

---

*Extracted February 2026. Source: Y.E.T. Compassion Quarto website (15 pages, custom section-based architecture).*
