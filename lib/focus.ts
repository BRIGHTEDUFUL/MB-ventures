/**
 * Centralized focus ring utilities for consistent keyboard navigation styling
 * Per docs/DESIGN.md: 2px focus ring with 2px offset on surface background
 */

/**
 * Standard focus ring for interactive elements
 * Uses brand-hover (#1D4ED8) color with 2px ring and 2px offset
 */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/**
 * Focus ring without offset - use for elements that already have spacing
 * or when offset would create visual issues
 */
export const FOCUS_RING_INSET =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-0";

/**
 * Focus ring for elements on canvas background instead of surface
 */
export const FOCUS_RING_ON_CANVAS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
