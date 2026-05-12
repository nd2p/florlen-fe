# Design System Documentation: The Tactile Collectible

## 1. Overview & Creative North Star

**Creative North Star: "The Curated Plushie Gallery"**

This design system moves away from the "e-commerce template" look and instead treats the digital interface as a premium display case for collectible art. By merging the high-contrast, bold aesthetic of designer toy culture with the soft, tactile nature of handmade crochet, we create an experience that feels both modern and incredibly cozy.

To achieve this, we reject standard structural lines in favor of **Tonal Layering**. The layout should feel "assembled" rather than "drawn," using extreme corner radii and shifting background planes to guide the eye. It is a playful, high-end editorial approach that prioritizes the "unboxing" feel of every screen.

---

## 2. Colors & Surface Architecture

### The Palette

We utilize a high-impact triad of **Crimson (#a40015)**, **Charcoal (#5e5e5e)**, and **Bone (#fbf9f8)**. These colors must remain solid at all times to honor the "no-gradient" directive, relying on saturation and value shifts to create depth.

### The "No-Line" Rule

**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a clear but soft distinction. We define space through mass, not lines.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers—like stacked felt pads or smooth plastic toy parts.

- **Base:** `surface` (#fbf9f8) for the main background.
- **Sectioning:** Use `surface-container-low` (#f5f3f3) for large content areas.
- **Components:** Use `surface-container-highest` (#e4e2e2) for interactive elements to make them "pop" against the softer base.

### Glassmorphism (Solid-Agnostic)

While gradients are forbidden, transparency is encouraged to maintain the "collectible" feel. Use `surface_container_lowest` (#ffffff) at 80% opacity with a `20px` backdrop-blur for floating navigation bars. This allows the vibrant crochet textures of product photography to bleed through the UI without compromising legibility.

---

## 3. Typography

The typography is a dialogue between the industrial precision of **Plus Jakarta Sans** and the clean, approachable nature of **Inter**.

- **Display & Headlines (Plus Jakarta Sans):** These are the "hero" moments. Use `display-lg` (3.5rem) with tight letter-spacing to mimic the bold branding found on toy packaging.
- **Titles & Body (Inter):** Inter provides the necessary "human" touch. It remains highly legible at small scales (`body-sm`), ensuring that the technical details of crochet patterns or product dimensions are easily digestible.
- **The "High-Contrast" Rule:** Headlines should almost always use `on-background` (#1b1c1c) or `primary` (#a40015) to command authority, while body text stays in `secondary` (#5e5e5e) to keep the overall feel "soft" and approachable.

---

## 4. Elevation & Depth

### The Layering Principle

Depth is achieved by "stacking" surface-container tiers.

- **Level 0 (Floor):** `surface`
- **Level 1 (Plinth):** `surface-container-low`
- **Level 2 (Object):** `surface-container-highest` or `surface-container-lowest` (for high-contrast cards).

### Ambient Shadows

Traditional "drop shadows" are too harsh for this brand. When an element must float (e.g., a "Buy Now" FAB), use an extra-diffused shadow:

- **Blur:** 40px - 60px
- **Opacity:** 4% - 6%
- **Color:** Derived from `on-surface` (#1b1c1c) but tinted slightly toward the `primary` red to mimic natural light bouncing off a colored object.

---

## 5. Do's and Don'ts

### Do

- **Embrace white space.** Treat the interface like a spacious gallery wall.
- **Layer purposefully.** Ensure that the `surface-container` tiers always move from darker/heavier at the bottom to lighter/whiter at the top.

### Don'ts

- **NO GRADIENTS.** Not even subtle ones. Use solid color blocks to maintain the "vinyl toy" feel.
- **No sharp corners.** Avoid `none` or `sm` roundness unless it is for a 1px utility element.
- **No pure black text on pure white.** Always use the `on-surface` and `surface` tokens to maintain the premium "Bone and Charcoal" editorial feel.
- **No dividers.** If you feel the need to add a line, add 16px of white space instead.
