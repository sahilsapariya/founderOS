# FounderOS — Design System

**Version:** 1.0
**Status:** Draft

Related Documents

* 01-product-vision.md
* 02-product-requirements.md

---

# 1. Design Philosophy

FounderOS is not designed to impress users with flashy animations.

It is designed to make ambitious people feel focused.

Every design decision should optimize for:

* Clarity
* Speed
* Information Density
* Visual Hierarchy
* Delight through polish

The interface should disappear behind the user's workflow.

---

# 2. Design Principles

## Information First

Data is more important than decoration.

Cards exist to organize information, not to create visual noise.

---

## Dense, Not Crowded

The application should display a large amount of information while maintaining generous spacing and clear hierarchy.

---

## Minimal Color Usage

Colors communicate state, not decoration.

Avoid rainbow dashboards.

Primary colors should remain neutral.

---

## Progressive Disclosure

Show only what users need first.

Allow deeper exploration through expansion rather than overwhelming them immediately.

---

## Motion with Purpose

Animations should guide attention.

Never animate simply because something can move.

---

# 3. Visual Identity

Overall Feeling

* Professional
* Premium
* Calm
* Modern
* Fast
* Developer-friendly

Users should immediately think:

> "Everything I need is right here."

---

# 4. Design Inspiration

Approximate influence:

* Linear — 40%
* Vercel — 30%
* Apple — 20%
* Raycast — 10%

Avoid copying any single product directly.

---

# 5. Color Palette

## Background

Primary Background

Very dark neutral

Secondary Background

Slightly elevated neutral surface

Cards

Subtle elevation using contrast instead of heavy shadows.

---

## Accent Color

Primary Accent

Indigo

Supporting Status Colors

* Emerald → Success
* Amber → Warning
* Rose → Error
* Sky → Information

Status colors should only appear when necessary.

---

# 6. Typography

Primary Font

Geist

Fallback

Inter

---

Hierarchy

Display

Page Title

Section Title

Card Title

Body

Caption

Use font weight rather than excessive font sizes to establish hierarchy.

---

# 7. Layout System

Desktop

Left Sidebar

↓

Top Navigation

↓

Scrollable Content

↓

Responsive Grid

---

Sidebar

Collapsed

Expanded

Floating (future)

---

Content Width

Avoid extremely wide layouts.

Large dashboards should remain comfortable to scan.

---

# 8. Grid System

Use a 12-column responsive grid.

Dashboard widgets should span multiple column widths depending on importance.

Examples

AI Brief

Large

Today's Focus

Medium

Calendar

Medium

Finance

Medium

Habits

Small

Notes

Small

---

# 9. Spacing

Base spacing should follow an 8px system.

Common values:

* 4
* 8
* 12
* 16
* 24
* 32
* 48
* 64

Avoid arbitrary spacing values.

---

# 10. Border Radius

Cards

Medium

Buttons

Medium

Inputs

Medium

Dialogs

Large

Avoid overly rounded interfaces.

---

# 11. Shadows

Prefer borders over shadows.

Use soft elevation only where depth improves hierarchy.

Avoid floating-card aesthetics.

---

# 12. Icons

Use Lucide Icons.

Icons should remain lightweight and consistent.

Avoid filled icon sets.

---

# 13. Buttons

Primary

Filled Accent

Secondary

Subtle Neutral

Ghost

Transparent

Danger

Rose

Buttons should prioritize clarity over decoration.

---

# 14. Forms

Every form should include:

Clear labels

Helpful placeholders

Inline validation

Keyboard accessibility

Logical tab order

---

# 15. Tables

Tables should support:

Sorting

Filtering

Search

Pagination

Column customization (future)

---

# 16. Cards

Every card should contain:

Header

Optional actions

Primary content

Supporting metadata

Cards should never become cluttered with excessive controls.

---

# 17. Charts

Preferred chart types

Line

Bar

Area

Progress Ring

Avoid unnecessary 3D effects.

---

# 18. Navigation

Sidebar should contain:

Dashboard

Projects

Tasks

Calendar

Finance

Goals

Notes

GitHub

Habits

AI

Settings

Navigation should remain consistent across the application.

---

# 19. Animations

Animation Duration

150–250ms

Use easing that feels natural and responsive.

Examples:

Hover

Expand

Collapse

Dialog

Navigation

Loading

Avoid exaggerated transitions.

---

# 20. Empty States

Every empty state should include:

Illustration or icon

Short explanation

Primary action

Never leave blank screens.

---

# 21. Loading States

Prefer skeleton loaders over spinners.

Only use spinners for short blocking operations.

---

# 22. Error States

Error messages should:

Explain what happened

Explain why

Provide recovery action

Avoid technical jargon where possible.

---

# 23. Accessibility

Minimum touch target

44×44px

Keyboard navigation

Required

Visible focus states

Required

High color contrast

Required

Semantic HTML

Required

---

# 24. Responsive Behavior

Desktop

Primary experience

Tablet

Optimized layout

Mobile

Simplified dashboard

Collapsible sidebar

Bottom navigation (future)

---

# 25. Design Tokens

Colors, spacing, typography, border radius, shadows, and motion should all be implemented using reusable design tokens.

No hardcoded values inside components.

---

# 26. Component Library

The application should build reusable components for:

Button

Card

Badge

Input

Textarea

Dialog

Drawer

Popover

Dropdown

Tabs

Table

Chart

Command Palette

Widget

Metric Card

Progress Card

Stat Card

Timeline

Activity Feed

AI Card

These components become the building blocks of every screen.

---

# 27. Widget Philosophy

Dashboard widgets are first-class components.

Every widget supports three presentation modes:

1. Compact
2. Expanded
3. Full Page

Users should feel like they are zooming into information rather than navigating away from it.

---

# 28. Overall Experience

FounderOS should feel:

Fast enough to trust.

Beautiful enough to enjoy.

Organized enough to reduce stress.

Powerful enough to become the first application a founder opens every morning.
