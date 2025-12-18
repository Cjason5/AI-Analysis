---
name: design-guide
description: Ensures all UI components look modern and professional. Use when building ANY user interface - React components, HTML pages, dashboards, forms, landing pages, or interactive artifacts. Enforces clean minimalist design with proper spacing, typography, and color usage.
---

# Design Guide

Apply these principles to every UI component.

## Core Principles

**Minimal & Clean**: Generous white space, no clutter. Let content breathe.

**Color Palette**:
- Base: grays and off-whites (`#FAFAFA`, `#F5F5F5`, `#E5E5E5`, `#737373`, `#262626`)
- ONE accent color used sparingly (for CTAs, links, key interactions)
- NO purple/blue gradients, NO rainbow colors

**8px Spacing Grid**: All spacing uses multiples of 8: `8, 16, 24, 32, 48, 64px`
- Component padding: 16-24px
- Section gaps: 32-64px
- Element margins: 8-16px

**Typography**:
- Body text: 16px minimum, line-height 1.5-1.6
- Max 2 font families (1 preferred)
- Clear hierarchy: distinct sizes for h1 > h2 > h3 > body > caption
- Font weights: 400 (body), 500-600 (emphasis), 700 (headings)

**Shadows**: Subtle only
- Cards: `0 1px 3px rgba(0,0,0,0.08)` or `0 4px 12px rgba(0,0,0,0.05)`
- Elevated: `0 8px 24px rgba(0,0,0,0.08)`
- Never dark or heavy shadows

**Border Radius**: Consistent, not excessive
- Small elements (buttons, inputs): 6-8px
- Cards/containers: 8-12px
- Not everything needs rounding

## Component Patterns

### Buttons
```
- Padding: 12px 24px
- Border-radius: 6-8px
- Primary: solid accent color, white text
- Secondary: transparent + border or light gray bg
- Hover: subtle brightness/shadow change, smooth transition
- No gradients
```

### Cards
```
- Use subtle shadow OR thin border (1px #E5E5E5), not both
- Padding: 24px
- Border-radius: 8-12px
- Hover state if interactive: slight shadow lift
```

### Forms
```
- Labels above inputs, 8px gap
- Input padding: 12px 16px
- Input border: 1px #E5E5E5, focus: accent color
- Field spacing: 24px between groups
- Error: red border + red helper text below
- Placeholder text: lighter gray (#9CA3AF)
```

### Navigation
```
- Clear active state (accent color or underline)
- Consistent padding: 12-16px
- Hover: subtle background change
```

## Interactive States

Every interactive element needs:
- **Default**: base appearance
- **Hover**: subtle visual feedback (0.15s transition)
- **Active/Pressed**: slightly darker/depressed
- **Focus**: visible ring for accessibility
- **Disabled**: 50% opacity, cursor: not-allowed

## Anti-Patterns (Never Do)

- Gradients everywhere (especially purple/blue)
- Text smaller than 14px (16px for body)
- Inconsistent spacing (eyeballing instead of grid)
- Multiple accent colors competing
- Heavy drop shadows
- Cluttered layouts without breathing room
- Missing hover/focus states
- Both border AND shadow on same card

## Quick Reference

| Element | Size/Spacing |
|---------|--------------|
| Body text | 16px, line-height 1.5 |
| Small text | 14px minimum |
| Heading scale | 32/24/20/18/16px |
| Button padding | 12px 24px |
| Card padding | 24px |
| Input padding | 12px 16px |
| Section gap | 48-64px |
| Element gap | 16-24px |
| Border radius | 6-12px |

## Tailwind Tokens

If using Tailwind, prefer these utilities:
- Spacing: `p-4`, `p-6`, `gap-4`, `gap-6`, `space-y-4`
- Text: `text-base`, `text-gray-900`, `text-gray-600`
- Background: `bg-white`, `bg-gray-50`, `bg-gray-100`
- Border: `border`, `border-gray-200`, `rounded-lg`
- Shadow: `shadow-sm`, `shadow` (never `shadow-lg` or `shadow-2xl`)
- Transitions: `transition-colors`, `duration-150`
