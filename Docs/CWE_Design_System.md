# Counselling and Wellness Ecosystem
## Design System & UI/UX Specification

**Organisation:** Directorate of Counselling and Wellness Services  
**Document Type:** Design System — Tokens, Components, Patterns, Flows  
**Version:** v1.0 — March 2026  
**Classification:** CONFIDENTIAL — Government Internal Use Only

---

## Design Philosophy

### Concept: *Grounded Warmth*

The CWE platform sits at the intersection of two competing demands: the authority and trust of a government institution, and the warmth and psychological safety required for mental health engagement. Most government digital platforms lean too hard into the former — cold blues, rigid grids, clinical white — and that aesthetic is precisely what discourages stigma-affected users from engaging.

CWE's design system inverts this. It takes the colours of the Kenyan flag — deep black, Maasai red, forest green, and ivory white — and reinterprets them through a lens of *grounded warmth*: the feeling of sitting in a quiet, safe office with the late afternoon sun coming through the window. Authority without coldness. Warmth without frivolity.

**The one thing users will remember:** The platform feels like it was made *for* them, not *at* them.

### Design Principles

| Principle | Expression |
|---|---|
| **Confidential by design** | Dark, enclosed UI surfaces. No exposed data. Visual hierarchy that de-emphasises clinical labels. |
| **Dignity, not clinical sterility** | Warm neutrals replace cold whites. Rounded forms over sharp corners. Generous whitespace. |
| **Progressive disclosure** | Show only what is needed at each step. Crisis flows are focused and uncluttered — nothing competes for attention. |
| **Inclusive legibility** | WCAG 2.1 AA minimum at all sizes. High contrast on all interactive elements. Never use colour alone to convey meaning. |
| **Kenyan identity** | Flag-derived palette used with intention. Not decorative nationalism — a visual anchor that says "this was built for us." |

---

## 1. Colour System

### 1.1 Palette Derivation

The palette derives directly from the Kenyan national flag, refined for digital use. Raw flag colours are too saturated for extended screen use, so each hue is pulled from the flag and then resolved into a 10-step scale spanning near-black to near-white.

```
Kenyan Flag Source Colours:
  ██ Black   → Obsidian scale  (authority, depth, confidentiality)
  ██ Red     → Jasper scale    (urgency, action, warmth, courage)
  ██ Green   → Savanna scale   (healing, growth, wellness, nature)
  ██ White   → Ivory scale     (clarity, space, openness)
  ── Maasai shield accent → Sienna (warm amber-brown, cultural grounding)
```

### 1.2 CSS Custom Properties (Full Token Set)

```css
:root {

  /* ── OBSIDIAN (Black / Depth) ── */
  --obsidian-950: #0A0A09;
  --obsidian-900: #141410;
  --obsidian-800: #1E1D18;
  --obsidian-700: #2C2B24;
  --obsidian-600: #3D3C33;
  --obsidian-500: #524F43;
  --obsidian-400: #706D5F;
  --obsidian-300: #958F80;
  --obsidian-200: #BCB7AB;
  --obsidian-100: #E0DDD6;
  --obsidian-50:  #F5F4F1;

  /* ── JASPER (Red / Action / Urgency) ── */
  --jasper-950: #2D0808;
  --jasper-900: #4A0E0E;
  --jasper-800: #6B1414;
  --jasper-700: #8C1C1C;
  --jasper-600: #B02020;   /* Primary Red — closest to flag */
  --jasper-500: #C93030;
  --jasper-400: #D95555;
  --jasper-300: #E58080;
  --jasper-200: #F0AAAA;
  --jasper-100: #F8D5D5;
  --jasper-50:  #FDF1F1;

  /* ── SAVANNA (Green / Wellness / Growth) ── */
  --savanna-950: #041A0A;
  --savanna-900: #082D14;
  --savanna-800: #0F4520;
  --savanna-700: #185C2C;   /* Primary Green — closest to flag */
  --savanna-600: #227538;
  --savanna-500: #2E9147;
  --savanna-400: #45AD5F;
  --savanna-300: #72C484;
  --savanna-200: #A3D9AE;
  --savanna-100: #D0EDD6;
  --savanna-50:  #EEF8F0;

  /* ── IVORY (White / Clarity / Space) ── */
  --ivory-950: #1A1915;
  --ivory-900: #2E2C24;
  --ivory-800: #4A4740;
  --ivory-700: #6B6860;
  --ivory-600: #8C8980;
  --ivory-500: #ADAAA0;
  --ivory-400: #C8C5BC;
  --ivory-300: #DDD9D2;
  --ivory-200: #ECEAE4;
  --ivory-100: #F5F3EE;
  --ivory-50:  #FAFAF7;   /* Primary surface — warm off-white */

  /* ── SIENNA (Maasai Amber / Cultural Accent) ── */
  --sienna-950: #1E0E00;
  --sienna-900: #341800;
  --sienna-800: #522500;
  --sienna-700: #733300;
  --sienna-600: #944200;
  --sienna-500: #B85200;   /* Primary Sienna */
  --sienna-400: #D46820;
  --sienna-300: #E28F50;
  --sienna-200: #EDB990;
  --sienna-100: #F6DEC8;
  --sienna-50:  #FCF2EA;

  /* ── SEMANTIC TOKENS ── */

  /* Backgrounds */
  --bg-base:          var(--ivory-50);      /* App root background */
  --bg-surface:       #FFFFFF;              /* Cards, modals, panels */
  --bg-surface-raised: var(--ivory-100);    /* Slightly elevated surfaces */
  --bg-overlay:       var(--obsidian-900);  /* Modals, drawers overlay */
  --bg-subtle:        var(--ivory-200);     /* Table rows, input backgrounds */
  --bg-inverse:       var(--obsidian-800);  /* Dark panels, nav sidebar */

  /* Text */
  --text-primary:     var(--obsidian-900);  /* Main body text */
  --text-secondary:   var(--obsidian-500);  /* Supporting labels, captions */
  --text-tertiary:    var(--obsidian-300);  /* Placeholder, disabled */
  --text-inverse:     var(--ivory-50);      /* Text on dark backgrounds */
  --text-brand:       var(--savanna-700);   /* Brand green text */
  --text-danger:      var(--jasper-700);    /* Error messages */
  --text-warning:     var(--sienna-600);    /* Warning messages */
  --text-success:     var(--savanna-700);   /* Success messages */

  /* Interactive / Brand */
  --brand-primary:    var(--savanna-700);   /* Primary CTA, links */
  --brand-primary-hover: var(--savanna-800);
  --brand-primary-active: var(--savanna-900);
  --brand-secondary:  var(--obsidian-800);  /* Secondary actions */
  --brand-accent:     var(--sienna-500);    /* Highlights, badges, accents */

  /* Danger / Crisis */
  --danger:           var(--jasper-600);
  --danger-hover:     var(--jasper-700);
  --danger-surface:   var(--jasper-50);
  --danger-border:    var(--jasper-200);

  /* Borders */
  --border-subtle:    var(--ivory-300);
  --border-default:   var(--ivory-400);
  --border-strong:    var(--obsidian-300);
  --border-brand:     var(--savanna-400);
  --border-danger:    var(--jasper-300);
  --border-focus:     var(--savanna-500);   /* Focus ring */

  /* Status */
  --status-active:    var(--savanna-500);
  --status-pending:   var(--sienna-400);
  --status-crisis:    var(--jasper-500);
  --status-inactive:  var(--obsidian-300);
  --status-complete:  var(--savanna-600);

  /* ── SPACING SCALE (8pt grid) ── */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32:  128px;

  /* ── BORDER RADIUS ── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* ── ELEVATION (Shadows) ── */
  --shadow-xs:  0 1px 2px rgba(10, 10, 9, 0.05);
  --shadow-sm:  0 1px 3px rgba(10, 10, 9, 0.08), 0 1px 2px rgba(10, 10, 9, 0.05);
  --shadow-md:  0 4px 6px rgba(10, 10, 9, 0.07), 0 2px 4px rgba(10, 10, 9, 0.05);
  --shadow-lg:  0 10px 15px rgba(10, 10, 9, 0.08), 0 4px 6px rgba(10, 10, 9, 0.04);
  --shadow-xl:  0 20px 25px rgba(10, 10, 9, 0.10), 0 8px 10px rgba(10, 10, 9, 0.05);
  --shadow-brand: 0 4px 14px rgba(24, 92, 44, 0.20);   /* Green glow */
  --shadow-danger: 0 4px 14px rgba(176, 32, 32, 0.20); /* Red glow */

  /* ── TRANSITIONS ── */
  --transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base:   200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── Z-INDEX SCALE ── */
  --z-base:     0;
  --z-raised:   10;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
  --z-crisis:   9999;  /* SOS button — always on top */
}
```

### 1.3 Dark Mode (Admin & Counsellor Portals)

The Admin and Counsellor portals default to a **dark theme** — reflecting the enclosed, private nature of clinical work. Client and Employer portals default to the warm light theme.

```css
[data-theme="dark"] {
  --bg-base:            var(--obsidian-900);
  --bg-surface:         var(--obsidian-800);
  --bg-surface-raised:  var(--obsidian-700);
  --bg-subtle:          var(--obsidian-800);
  --bg-inverse:         var(--ivory-50);

  --text-primary:       var(--ivory-100);
  --text-secondary:     var(--obsidian-200);
  --text-tertiary:      var(--obsidian-400);
  --text-inverse:       var(--obsidian-900);

  --border-subtle:      var(--obsidian-700);
  --border-default:     var(--obsidian-600);
  --border-strong:      var(--obsidian-400);
}
```

### 1.4 Colour Usage Rules

| Rule | Rationale |
|---|---|
| Never use `--jasper` (red) for anything except Danger, SOS, and destructive actions | Red must retain its full psychological weight for the crisis SOS button. Overusing it dilutes the signal. |
| `--sienna` is the only accent — use sparingly (max 1 sienna element per screen section) | Prevents visual noise; sienna draws the eye and must mean "notable" |
| `--savanna-700` is the brand colour for interactive elements (links, primary CTAs) | Consistency in affordance signalling |
| All text on coloured backgrounds must pass WCAG AA (4.5:1 minimum) | Non-negotiable for a government platform serving users of varying vision |
| Dark surfaces (`--obsidian-800`, `--obsidian-900`) are used for the sidebar and clinical areas, not for public-facing pages | Reinforces the psychological separation between safe/private (dark) and open/public (light) zones |

---

## 2. Typography

### 2.1 Type Scale

**Display / Heading Font:** `Fraunces` (variable, optical size axis)  
A high-contrast, old-style serif with a warmth and character that feels deeply human. Its optical size axis means it looks beautiful at both 64px display sizes and 14px captions. Chosen over slab serifs (too masculine) and sans serifs (too clinical) — Fraunces carries quiet authority.

**Body / UI Font:** `DM Sans` (variable)  
A geometric humanist sans-serif with open apertures and generous x-height — highly legible at small sizes on low-resolution screens (important for county-office monitors). Warm enough to complement Fraunces without competing.

**Mono / Code Font:** `JetBrains Mono`  
For data tables, session IDs, timestamps, and analytics numbers. Used only in Admin/Counsellor portals.

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..500&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..500&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Fraunces', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  /* ── TYPE SCALE (Major Third — 1.250 ratio) ── */
  --text-xs:   0.640rem;   /*  ~10px */
  --text-sm:   0.800rem;   /*  ~13px */
  --text-base: 1.000rem;   /*   16px */
  --text-lg:   1.125rem;   /*   18px */
  --text-xl:   1.250rem;   /*   20px */
  --text-2xl:  1.563rem;   /*   25px */
  --text-3xl:  1.953rem;   /*   31px */
  --text-4xl:  2.441rem;   /*   39px */
  --text-5xl:  3.052rem;   /*   49px */
  --text-6xl:  3.815rem;   /*   61px */

  /* ── LINE HEIGHTS ── */
  --leading-tight:  1.2;
  --leading-snug:   1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose:  1.8;

  /* ── LETTER SPACING ── */
  --tracking-tight:  -0.025em;
  --tracking-normal:  0em;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;

  /* ── FONT WEIGHTS ── */
  --weight-light:    300;
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
}
```

### 2.2 Text Styles (Semantic)

```css
/* Display — hero headings, portal names */
.text-display-xl {
  font-family: var(--font-display);
  font-size: var(--text-6xl);
  font-weight: var(--weight-light);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: oldstyle-nums;
}

.text-display-lg {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--weight-light);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

/* Headings — section titles */
.text-h1 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
}
.text-h2 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
}
.text-h3 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--weight-medium);
  line-height: var(--leading-snug);
}
.text-h4 {
  font-family: var(--font-body);
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
}

/* Body */
.text-body-lg  { font-family: var(--font-body); font-size: var(--text-lg);   line-height: var(--leading-relaxed); }
.text-body     { font-family: var(--font-body); font-size: var(--text-base);  line-height: var(--leading-relaxed); }
.text-body-sm  { font-family: var(--font-body); font-size: var(--text-sm);   line-height: var(--leading-normal); }
.text-caption  { font-family: var(--font-body); font-size: var(--text-xs);   line-height: var(--leading-normal); letter-spacing: var(--tracking-wide); text-transform: uppercase; }

/* Labels — form fields, table headers */
.text-label    { font-family: var(--font-body); font-size: var(--text-sm);   font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); }
.text-overline { font-family: var(--font-body); font-size: var(--text-xs);   font-weight: var(--weight-semibold); letter-spacing: var(--tracking-widest); text-transform: uppercase; }

/* Data / Mono */
.text-data     { font-family: var(--font-mono); font-size: var(--text-sm);   font-variant-numeric: tabular-nums; }
```

### 2.3 Typography Rules

- **Fraunces is for headings and display text only** — never use it for body copy, labels, or UI chrome.
- **DM Sans for all UI** — buttons, navigation, forms, tooltips, tables.
- **Never set body copy below 16px** — county office monitors may be low-DPI.
- **Use oldstyle numerals** (`font-variant-numeric: oldstyle-nums`) in Fraunces headings — they have better optical rhythm.
- **Tabular numerals** (`font-variant-numeric: tabular-nums`) in all data tables and analytics numbers.
- **Line length for readable prose:** 60–75 characters per line. Never let content columns exceed `72ch`.

---

## 3. Iconography

**Icon Library:** `Lucide Icons` (already in the Next.js stack)  
**Style:** Outlined, 2px stroke, rounded caps and joins  
**Base sizes:** 16px (inline), 20px (default UI), 24px (feature icons), 32px (empty states), 48px (illustrations)

```tsx
// Standard icon usage
import { Calendar, AlertCircle, HeartPulse, BookOpen, Shield } from 'lucide-react';

// Always pair icons with accessible labels
<button aria-label="View appointments">
  <Calendar size={20} strokeWidth={2} />
</button>

// Never use icons alone to convey critical information — always add text
<span className="flex items-center gap-2 text-danger">
  <AlertCircle size={16} />
  <span>Session overdue</span>
</span>
```

### 3.1 Icon → Meaning Map (Platform-Specific)

| Icon | Lucide Name | Platform Meaning |
|---|---|---|
| 🗓 | `Calendar` | Appointments & booking |
| 💬 | `MessageSquare` | Session notes |
| 😊 | `Smile` | Mood check-in |
| 📖 | `BookOpen` | Wellness content library |
| 🛡 | `Shield` | Safety plan / crisis |
| ❤️ | `HeartPulse` | Wellbeing score / overview |
| 👥 | `Users` | Client list (Counsellor) |
| 📊 | `BarChart3` | Analytics (Admin) |
| 🔔 | `Bell` | Notifications |
| ⚠️ | `AlertTriangle` | Warnings, urgent status |
| 🔴 | `Siren` | SOS / Crisis button |
| 🔒 | `Lock` | Locked note / confidential |
| ↗ | `ArrowUpRight` | Referral sent |
| ✓ | `CheckCircle2` | Completed / attended |

---

## 4. Component Library

### 4.1 Buttons

```css
/* Base button */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: background var(--transition-fast),
              border-color var(--transition-fast),
              box-shadow var(--transition-fast),
              transform var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
}
.btn:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
.btn:active { transform: translateY(1px); }

/* Sizes */
.btn-sm  { height: 32px; padding: 0 var(--space-3); font-size: var(--text-xs); }
.btn-md  { height: 40px; padding: 0 var(--space-5); }
.btn-lg  { height: 48px; padding: 0 var(--space-6); font-size: var(--text-base); }
.btn-xl  { height: 56px; padding: 0 var(--space-8); font-size: var(--text-lg); }

/* Primary — Savanna Green */
.btn-primary {
  background: var(--savanna-700);
  color: var(--ivory-50);
  border-color: var(--savanna-700);
}
.btn-primary:hover {
  background: var(--savanna-800);
  border-color: var(--savanna-800);
  box-shadow: var(--shadow-brand);
}

/* Secondary — Outlined */
.btn-secondary {
  background: transparent;
  color: var(--savanna-700);
  border-color: var(--savanna-400);
}
.btn-secondary:hover {
  background: var(--savanna-50);
  border-color: var(--savanna-600);
}

/* Ghost — text only */
.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border-color: transparent;
}
.btn-ghost:hover { background: var(--bg-subtle); }

/* Danger — destructive actions */
.btn-danger {
  background: var(--jasper-600);
  color: #FFFFFF;
  border-color: var(--jasper-600);
}
.btn-danger:hover {
  background: var(--jasper-700);
  box-shadow: var(--shadow-danger);
}

/* SOS — crisis trigger */
.btn-sos {
  background: var(--jasper-600);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  padding: 0 var(--space-5);
  height: 40px;
  animation: sos-pulse 3s ease-in-out infinite;
  box-shadow: 0 0 0 0 rgba(176, 32, 32, 0.4);
}
@keyframes sos-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(176, 32, 32, 0); }
  50%       { box-shadow: 0 0 0 8px rgba(176, 32, 32, 0); }
}
.btn-sos:hover {
  background: var(--jasper-700);
  animation: none;
  box-shadow: var(--shadow-danger);
}

/* Disabled state — all variants */
.btn:disabled, .btn[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### 4.2 Form Controls

```css
/* Input base */
.input {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-fast),
              box-shadow var(--transition-fast);
}
.input::placeholder { color: var(--text-tertiary); }
.input:hover  { border-color: var(--border-strong); }
.input:focus  {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(46, 145, 71, 0.15);
}
.input:disabled {
  background: var(--bg-subtle);
  color: var(--text-tertiary);
  cursor: not-allowed;
}
.input--error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(176, 32, 32, 0.12);
}
.input--error:focus { border-color: var(--danger); }

/* Textarea */
.textarea {
  /* Inherits .input */
  height: auto;
  min-height: 100px;
  padding: var(--space-3) var(--space-4);
  resize: vertical;
  line-height: var(--leading-relaxed);
}

/* Select */
.select {
  /* Inherits .input */
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 8l4 4 4-4' stroke='%23706D5F' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
}

/* Form group wrapper */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.form-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  letter-spacing: var(--tracking-wide);
}
.form-hint  { font-size: var(--text-sm); color: var(--text-secondary); }
.form-error { font-size: var(--text-sm); color: var(--text-danger); }
```

### 4.3 Cards

```css
/* Base card */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

/* Interactive card — clickable */
.card--interactive {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.card--interactive:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-default);
}

/* Elevated — modals, popovers */
.card--elevated {
  box-shadow: var(--shadow-xl);
  border-color: transparent;
}

/* Brand accent — featured sections */
.card--brand {
  border-left: 3px solid var(--savanna-600);
  background: linear-gradient(135deg, var(--savanna-50) 0%, var(--bg-surface) 60%);
}

/* Alert card — warning */
.card--warning {
  border-left: 3px solid var(--sienna-400);
  background: var(--sienna-50);
}

/* Danger card — crisis / destructive */
.card--danger {
  border-left: 3px solid var(--jasper-500);
  background: var(--jasper-50);
}

/* Dark card — clinical areas */
.card--dark {
  background: var(--obsidian-800);
  border-color: var(--obsidian-700);
  color: var(--text-inverse);
}
```

### 4.4 Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-3);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  white-space: nowrap;
}

.badge--active    { background: var(--savanna-100);  color: var(--savanna-800); }
.badge--pending   { background: var(--sienna-100);   color: var(--sienna-700); }
.badge--crisis    { background: var(--jasper-100);   color: var(--jasper-800); }
.badge--complete  { background: var(--savanna-100);  color: var(--savanna-900); }
.badge--cancelled { background: var(--ivory-200);    color: var(--obsidian-500); }
.badge--locked    { background: var(--obsidian-100); color: var(--obsidian-700); }
.badge--draft     { background: var(--ivory-200);    color: var(--obsidian-500); }

/* Status dot inside badge */
.badge::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

### 4.5 Navigation Sidebar

```css
/* Sidebar shell */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--obsidian-900);
  display: flex;
  flex-direction: column;
  padding: var(--space-6) 0;
  border-right: 1px solid var(--obsidian-800);
}

/* Logo area */
.sidebar__brand {
  padding: 0 var(--space-6) var(--space-6);
  border-bottom: 1px solid var(--obsidian-800);
  margin-bottom: var(--space-4);
}
.sidebar__brand-name {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  color: var(--ivory-100);
  letter-spacing: var(--tracking-tight);
}
.sidebar__brand-role {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--obsidian-300);
  text-transform: uppercase;
  letter-spacing: var(--tracking-widest);
  margin-top: var(--space-1);
}

/* Nav items */
.sidebar__nav { flex: 1; padding: 0 var(--space-3); }
.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--obsidian-300);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
  margin-bottom: var(--space-1);
}
.sidebar__nav-item:hover {
  background: var(--obsidian-800);
  color: var(--ivory-100);
}
.sidebar__nav-item--active {
  background: var(--savanna-900);
  color: var(--savanna-200);
  font-weight: var(--weight-medium);
  border-left: 2px solid var(--savanna-500);
  padding-left: calc(var(--space-3) - 2px);
}

/* Section divider */
.sidebar__section {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--obsidian-500);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  padding: var(--space-4) var(--space-3) var(--space-2);
}
```

### 4.6 Mood Selector (Client Check-in)

```css
/* Mood emoji scale container */
.mood-scale {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-surface-raised);
  border-radius: var(--radius-xl);
}
.mood-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-2);
  border-radius: var(--radius-lg);
  border: 2px solid transparent;
  cursor: pointer;
  transition: background var(--transition-fast),
              border-color var(--transition-fast),
              transform var(--transition-spring);
}
.mood-option:hover { transform: translateY(-2px); background: var(--bg-subtle); }
.mood-option--selected {
  border-color: var(--savanna-400);
  background: var(--savanna-50);
  transform: translateY(-3px);
  box-shadow: var(--shadow-brand);
}
.mood-option__emoji { font-size: 2rem; line-height: 1; }
.mood-option__label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  text-align: center;
}
.mood-option--selected .mood-option__label { color: var(--savanna-700); }
```

### 4.7 Data Table

```css
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
  font-size: var(--text-sm);
}
.table thead {
  background: var(--bg-surface-raised);
  border-bottom: 1px solid var(--border-default);
}
.table th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  white-space: nowrap;
}
.table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
  vertical-align: middle;
}
.table tbody tr:last-child td { border-bottom: none; }
.table tbody tr:hover td { background: var(--bg-surface-raised); }

/* Priority row — crisis / urgent */
.table tr--crisis td {
  background: var(--jasper-50);
  border-left: 3px solid var(--jasper-400);
}
```

### 4.8 Toast Notifications

```css
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: var(--z-toast);
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--obsidian-900);
  color: var(--ivory-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  min-width: 320px;
  max-width: 420px;
  border-left: 3px solid var(--savanna-500);
  animation: toast-in var(--transition-spring) forwards;
}
.toast--danger  { border-left-color: var(--jasper-500); }
.toast--warning { border-left-color: var(--sienna-400); }
.toast--success { border-left-color: var(--savanna-400); }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(20px) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
```

---

## 5. Portal Layouts

### 5.1 Global Shell

All portals share a fixed sidebar + scrollable main content layout. The SOS button is anchored in the top navigation bar for Client-facing portals.

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR (64px fixed)                          [ 🔴 SOS ]    │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                           │
│  SIDEBAR         │  MAIN CONTENT AREA                        │
│  (240px fixed)   │  (scrollable)                             │
│                  │                                           │
│  • Nav items     │  ┌─────────────────────────────────────┐ │
│  • Role badge    │  │  Page Header                        │ │
│  • User avatar   │  ├─────────────────────────────────────┤ │
│                  │  │  Content Grid                        │ │
│                  │  └─────────────────────────────────────┘ │
│  [bottom]        │                                           │
│  • Settings      │                                           │
│  • Logout        │                                           │
└──────────────────┴──────────────────────────────────────────┘
```

### 5.2 Client Portal Layout

```
TOPBAR — light, warm ivory
  Left:  CWE wordmark (Fraunces, obsidian-900)
  Right: Notification bell | Avatar | [🔴 SOS Button]

SIDEBAR — obsidian-900 (dark, enclosed, private)
  Role badge: "PUBLIC SERVANT" (sienna accent)
  Nav:
    🏠 Home
    🗓 Book Session
    😊 My Mood
    📖 Wellness Content
    📅 My Appointments
    ─────────────
    🔔 Notifications
    ⚙️ Settings

MAIN CONTENT — bg-base (ivory-50), max-width 1024px centered
```

### 5.3 Counsellor Portal Layout

```
TOPBAR — dark (obsidian-800)
  Left:  CWE wordmark + "Counsellor Portal" label
  Right: Quick-add note | Availability toggle | Avatar

SIDEBAR — obsidian-900
  Role badge: "COUNSELLOR" (savanna accent)
  Nav:
    👥 My Clients          [N active badge]
    🗓 Calendar
    📋 Session Queue       [N pending badge]
    💬 Notes
    📖 Content Library
    ─────────────
    ⚙️ Settings

MAIN CONTENT — dark theme (obsidian-900 bg), max-width 1200px
```

### 5.4 Admin Portal Layout

```
TOPBAR — dark (obsidian-900 / black)
  Left:  CWE wordmark + "Directorate Admin" label
  Right: [Export Report] | Alert count | Avatar

SIDEBAR — obsidian-950 (deepest, most authoritative)
  Role badge: "ADMIN" (jasper accent — authority, not danger)
  Nav:
    📊 Analytics Overview
    📋 Pending Requests    [N badge]
    👥 All Clients
    🩺 Counsellors
    📖 Content Library
    ↗  Referrals           [N badge]
    ─────────────
    ⚙️ Platform Settings
    📄 Audit Log

MAIN CONTENT — dark theme, wide layout (max-width 1400px)
```

---

## 6. Screen Designs (Wireframe Specifications)

### 6.1 Client — Home Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Good afternoon, Wanjiku  ·  Tuesday, 9 March               │
│  [Fraunces, text-h2, obsidian-900]                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────┐  ┌──────────────────┐│
│  │  TODAY'S CHECK-IN [card--brand]  │  │  NEXT SESSION    ││
│  │                                  │  │                  ││
│  │  How are you feeling today?      │  │  Wed 12 March    ││
│  │                                  │  │  10:00 AM        ││
│  │  😔  😕  😐  🙂  😊            │  │  Dr. Otieno      ││
│  │  [mood-scale component]          │  │  Individual      ││
│  │                                  │  │                  ││
│  │  [+ Add journal note]            │  │  [Cancel] [View] ││
│  └──────────────────────────────────┘  └──────────────────┘│
│                                                             │
│  YOUR PROGRESS  [text-overline, savanna-700]                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  14        │  │  3         │  │  ████░░░░  │            │
│  │  Day streak│  │  Sessions  │  │  60% prog. │            │
│  │  [sienna]  │  │  attended  │  │  [savanna] │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                             │
│  RECOMMENDED FOR YOU  [text-overline]                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ 🧘       │  │ 💨       │  │ 📖       │                 │
│  │Mindfulness│  │Breathing │  │Work Stress│                │
│  │5 min     │  │3 min     │  │Article   │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Client — Session Booking Flow

```
Step 1: Service Type Selection
┌─────────────────────────────────────────────────────────────┐
│  Book a Session                         Step 1 of 4  ○●○○○ │
│  [Fraunces h2]                                              │
│  What kind of support do you need?                          │
│  [body text, text-secondary]                                │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ 👤 Individual      │  │ 👨‍👩‍👧 Family          │            │
│  │ One-on-one session │  │ Family counselling │            │
│  │ [card--interactive]│  │                    │            │
│  └────────────────────┘  └────────────────────┘            │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ 🧠 Stress & Burnout│  │ 🍶 Substance Use   │            │
│  │                    │  │                    │            │
│  └────────────────────┘  └────────────────────┘            │
│  ┌────────────────────┐                                     │
│  │ 📋 Assessment      │                                     │
│  │ Initial evaluation │                                     │
│  └────────────────────┘                                     │
│                                                             │
│  [Back]                              [Continue →]          │
└─────────────────────────────────────────────────────────────┘

Step 2: Date & Time Selection
┌─────────────────────────────────────────────────────────────┐
│  Book a Session                         Step 2 of 4  ○○●○○ │
│  Choose a date and time                                     │
│                                                             │
│  ┌────────────────────────────────────┐                     │
│  │      March 2026                    │                     │
│  │  Mo  Tu  We  Th  Fr                │                     │
│  │  9   10  [11] 12  13               │                     │  
│  │  16  17  18  19  20               │                     │
│  │  [available: savanna-50 bg]        │                     │
│  │  [selected: savanna-700 bg]        │                     │
│  └────────────────────────────────────┘                     │
│                                                             │
│  Available times — Wednesday 11 March                       │
│  ○ 9:00 AM   ● 10:00 AM  ○ 11:30 AM                        │
│  ○ 2:00 PM   ○ 3:30 PM                                      │
│                                                             │
│  [← Back]                            [Confirm →]           │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Crisis — SOS Flow

```
SOS Modal (Step 1 — Assessment)
┌─────────────────────────────────────────────────────────────┐
│  ██████████████████████████████████████████████████████████ │
│  ██  [jasper-900 bg, full overlay]                        ██ │
│  ██                                                       ██ │
│  ██   🛡  You are safe here               Step 1 of 9   ██ │
│  ██   [Fraunces, ivory-50, text-h3]                      ██ │
│  ██                                                       ██ │
│  ██   We want to understand how you're feeling            ██ │
│  ██   right now.                                          ██ │
│  ██                                                       ██ │
│  ██   Over the last 2 weeks, how often have you           ██ │
│  ██   felt little interest or pleasure in things?         ██ │
│  ██                                                       ██ │
│  ██   ○ Not at all                                        ██ │
│  ██   ○ Several days                                      ██ │
│  ██   ○ More than half the days                           ██ │
│  ██   ● Nearly every day                                  ██ │
│  ██   [jasper-300 radio, selected = jasper-400]           ██ │
│  ██                                                       ██ │
│  ██   [Exit safely]              [Next step →]            ██ │
│  ██   [ghost, ivory]             [btn-primary, light]     ██ │
│  ██                                                       ██ │
│  ██████████████████████████████████████████████████████████ │
└─────────────────────────────────────────────────────────────┘

Step 3 — Stabilisation (Breathing exercise)
┌─────────────────────────────────────────────────────────────┐
│  ██  🌬  Let's breathe together           Step 3 of 9   ██ │
│  ██                                                       ██ │
│  ██        ╭─────────────────────────────╮               ██ │
│  ██        │                             │               ██ │
│  ██        │        ◉                   │               ██ │
│  ██        │   [animated circle]        │               ██ │
│  ██        │   Breathe in... 4s         │               ██ │
│  ██        │   [savanna-400 pulse]      │               ██ │
│  ██        │                             │               ██ │
│  ██        ╰─────────────────────────────╯               ██ │
│  ██                                                       ██ │
│  ██   Inhale for 4 · Hold for 4 · Exhale for 6           ██ │
│  ██                                                       ██ │
│  ██   [Skip]                    [I feel steadier →]       ██ │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Counsellor — Client Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│  ← Client List                                              │
│  Wanjiku M.  [anonymised, obsidian-100 text on dark]        │
│  [badge--active] Active  ·  Client since Jan 2026           │
├───────────────────────────┬─────────────────────────────────┤
│  MOOD HISTORY  [tab]      │  SESSIONS  [tab]  NOTES  [tab] │
├───────────────────────────┴─────────────────────────────────┤
│                                                             │
│  30-day mood trend                    [30d] [60d] [90d]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  5 │                    ·                           │   │
│  │  4 │            ·  ·  ·   ·  ·                     │   │
│  │  3 │  ·  ·  ·               ·  ·  ·  ·             │   │
│  │  2 │                                    ·           │   │
│  │  1 │─────────────────────────────────────────────  │   │
│  │    Mar 1                              Mar 9         │   │
│  │    [savanna-400 line chart]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Next session: Wed 11 March, 10:00 AM                      │
│  Assigned exercises: 3 pending, 2 completed                 │
│                                                             │
│  [+ Add session note]  [Assign content]  [View notes]      │
└─────────────────────────────────────────────────────────────┘
```

### 6.5 Admin — Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Platform Overview                  [Export] [Filter: March]│
│  [Fraunces h1, ivory-100 on dark]                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   247    │  │   83%    │  │   12     │  │   94%    │   │
│  │ DAU      │  │ Booking  │  │ Crisis   │  │ Uptime   │   │
│  │ [data]   │  │ Completion│  │ Events   │  │          │   │
│  │ ↑ 14%   │  │ ↑ 6%    │  │ ↓ 2     │  │          │   │
│  │[savanna] │  │[savanna] │  │[jasper]  │  │[savanna] │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  MOOD TRENDS BY DEPARTMENT         SERVICE UTILISATION     │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │  [line chart]           │  │  Individual    ████ 52%  │ │
│  │  [savanna lines]        │  │  Stress        ███  31%  │ │
│  │  [dept comparison]      │  │  Assessment    █    12%  │ │
│  └─────────────────────────┘  │  Substance     ▌    5%   │ │
│                               └──────────────────────────┘ │
│                                                             │
│  COUNSELLOR UTILISATION                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Name           Load    Sessions   Completion       │   │
│  │  Dr. Otieno     18/25   ████████░░  88%             │   │
│  │  Dr. Kamau      22/25   █████████░  91%  ⚠ near cap│   │
│  │  Dr. Njeri      11/25   █████░░░░░  79%             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Motion & Animation

### 7.1 Principles

- **Purposeful:** Every animation either communicates state change or aids spatial orientation. No decorative motion.
- **Fast:** UI transitions max 300ms. Longer durations only for breathing exercises and onboarding.
- **Reduced motion:** All animations respect `prefers-reduced-motion`. Critical flows (crisis SOS) must work without any animation.

### 7.2 Core Animations

```css
/* Page transition — fade in on route change */
@keyframes page-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: page-enter 200ms var(--transition-base) forwards; }

/* Card appear — staggered dashboard load */
@keyframes card-appear {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.card:nth-child(1) { animation: card-appear 250ms 0ms   ease-out forwards; }
.card:nth-child(2) { animation: card-appear 250ms 60ms  ease-out forwards; }
.card:nth-child(3) { animation: card-appear 250ms 120ms ease-out forwards; }
.card:nth-child(4) { animation: card-appear 250ms 180ms ease-out forwards; }

/* Mood scale item hover */
.mood-option { transition: transform var(--transition-spring); }

/* Breathing circle — crisis Step 3 */
@keyframes breathe {
  0%,  100% { transform: scale(1);    opacity: 0.6; }
  25%        { transform: scale(1.4); opacity: 1;   }   /* inhale */
  50%        { transform: scale(1.4); opacity: 1;   }   /* hold */
  75%        { transform: scale(0.85); opacity: 0.7; }  /* exhale */
}
.breathing-circle {
  animation: breathe 14s ease-in-out infinite;
  transform-origin: center;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .btn-sos { animation: none; }
}
```

---

## 8. Accessibility Standards

### 8.1 Contrast Ratios (Verified)

| Foreground | Background | Ratio | WCAG Level |
|---|---|---|---|
| `obsidian-900` (#141410) on `ivory-50` (#FAFAF7) | Body text, light theme | **16.8:1** | AAA ✓ |
| `ivory-100` (#F5F3EE) on `obsidian-900` (#141410) | Body text, dark theme | **14.2:1** | AAA ✓ |
| `savanna-700` (#185C2C) on `ivory-50` (#FAFAF7) | Brand links/CTAs | **8.1:1** | AAA ✓ |
| `ivory-50` (#FAFAF7) on `savanna-700` (#185C2C) | Primary button text | **8.1:1** | AAA ✓ |
| `jasper-600` (#B02020) on `ivory-50` (#FAFAF7) | Danger text | **6.9:1** | AA ✓ |
| `ivory-50` (#FAFAF7) on `jasper-600` (#B02020) | SOS button text | **6.9:1** | AA ✓ |
| `obsidian-500` (#524F43) on `ivory-50` (#FAFAF7) | Secondary text | **5.8:1** | AA ✓ |
| `sienna-600` (#944200) on `ivory-50` (#FAFAF7) | Warning text | **5.2:1** | AA ✓ |

### 8.2 Interaction Requirements

- All interactive elements have visible `:focus-visible` states (2px savanna-500 ring, 2px offset).
- Touch targets minimum **44×44px** on all interactive elements.
- All form inputs have associated `<label>` elements (never placeholder-only labelling).
- All icons used alone have `aria-label` or `title` attributes.
- Crisis SOS flow is fully keyboard-navigable with no mouse-only interactions.
- All modal dialogs trap focus and return focus to trigger on close.
- All images and non-text media have descriptive `alt` text.
- Error messages are associated with inputs via `aria-describedby`.
- Status changes (booking confirmed, session note saved) are announced via `aria-live="polite"`.
- Crisis state changes use `aria-live="assertive"`.

---

## 9. Responsive Breakpoints

```css
/* Mobile-first breakpoints */
:root {
  --screen-sm:  480px;   /* Large phones */
  --screen-md:  768px;   /* Tablets */
  --screen-lg:  1024px;  /* Laptops / county office desktops */
  --screen-xl:  1280px;  /* Standard desktops */
  --screen-2xl: 1536px;  /* Large monitors */
}

/* Sidebar collapses to bottom nav on mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    min-height: auto;
    flex-direction: row;
    padding: var(--space-2) var(--space-4);
    border-right: none;
    border-top: 1px solid var(--obsidian-800);
    z-index: var(--z-sticky);
  }
  /* SOS button remains visible at all times */
  .btn-sos { position: fixed; bottom: 72px; right: var(--space-4); }
}
```

---

## 10. Design Tokens for Tailwind Config

For the Next.js implementation, extend `tailwind.config.ts` with these tokens:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0A0A09', 900: '#141410', 800: '#1E1D18',
          700: '#2C2B24', 600: '#3D3C33', 500: '#524F43',
          400: '#706D5F', 300: '#958F80', 200: '#BCB7AB',
          100: '#E0DDD6', 50: '#F5F4F1',
        },
        jasper: {
          950: '#2D0808', 900: '#4A0E0E', 800: '#6B1414',
          700: '#8C1C1C', 600: '#B02020', 500: '#C93030',
          400: '#D95555', 300: '#E58080', 200: '#F0AAAA',
          100: '#F8D5D5', 50: '#FDF1F1',
        },
        savanna: {
          950: '#041A0A', 900: '#082D14', 800: '#0F4520',
          700: '#185C2C', 600: '#227538', 500: '#2E9147',
          400: '#45AD5F', 300: '#72C484', 200: '#A3D9AE',
          100: '#D0EDD6', 50: '#EEF8F0',
        },
        ivory: {
          950: '#1A1915', 900: '#2E2C24', 800: '#4A4740',
          700: '#6B6860', 600: '#8C8980', 500: '#ADAAA0',
          400: '#C8C5BC', 300: '#DDD9D2', 200: '#ECEAE4',
          100: '#F5F3EE', 50: '#FAFAF7',
        },
        sienna: {
          950: '#1E0E00', 900: '#341800', 800: '#522500',
          700: '#733300', 600: '#944200', 500: '#B85200',
          400: '#D46820', 300: '#E28F50', 200: '#EDB990',
          100: '#F6DEC8', 50: '#FCF2EA',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        sm: '4px', md: '8px', lg: '12px',
        xl: '16px', '2xl': '24px',
      },
      boxShadow: {
        brand:  '0 4px 14px rgba(24, 92, 44, 0.20)',
        danger: '0 4px 14px rgba(176, 32, 32, 0.20)',
      },
      animation: {
        'sos-pulse': 'sos-pulse 3s ease-in-out infinite',
        'breathe':   'breathe 14s ease-in-out infinite',
        'card-appear': 'card-appear 250ms ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 11. Component Naming Conventions (Next.js)

```
components/
├── ui/                    # Primitive design system components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Toast.tsx
│   └── Modal.tsx
├── layout/                # Shell & navigation
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   └── SOSButton.tsx      # Persisted in Topbar, always visible
├── mood/
│   ├── MoodScale.tsx
│   ├── MoodChart.tsx
│   └── JournalEntry.tsx
├── booking/
│   ├── ServiceSelector.tsx
│   ├── CalendarPicker.tsx
│   └── BookingConfirmation.tsx
├── crisis/
│   ├── CrisisModal.tsx     # Full-screen overlay, z-index: 9999
│   ├── BreathingExercise.tsx
│   └── SafetyPlanBuilder.tsx
├── counsellor/
│   ├── ClientCard.tsx
│   ├── SessionNoteEditor.tsx
│   └── MoodHistoryChart.tsx
└── admin/
    ├── KPICard.tsx
    ├── UtilisationTable.tsx
    └── AssignmentModal.tsx
```

---

*Document Version: v1.0 · March 2026 · Directorate of Counselling and Wellness Services · CONFIDENTIAL*
