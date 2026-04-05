/**
 * Viewport-aware positioning utilities.
 * All returned coordinates are viewport-relative for use with `position: fixed`.
 */

const MARGIN = 8; // minimum gap from any viewport edge

// ── Cursor-based (ContextMenu main panel) ─────────────────────────────────────

/**
 * For menus that open at the cursor position.
 * Flips horizontally and/or vertically when near the edge so the panel
 * never overflows the viewport.
 */
export function calcCursorPos(
  cursor: { x: number; y: number },
  panelW: number,
  panelH: number,
): { x: number; y: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: cursor.x + panelW > vw - MARGIN ? Math.max(MARGIN, cursor.x - panelW) : cursor.x,
    y: cursor.y + panelH > vh - MARGIN ? Math.max(MARGIN, cursor.y - panelH) : cursor.y,
  };
}

// ── Anchor-based (dropdowns / popovers) ───────────────────────────────────────

export type SmartPosOptions = {
  /** DOMRect of the trigger element */
  anchor: DOMRect;
  panelW: number;
  panelH: number;
  /** Gap between trigger edge and panel, in px (default: 4) */
  gap?: number;
  /**
   * Preferred vertical side (default: "bottom").
   * Automatically flips to the opposite side when there isn't enough room.
   */
  preferV?: "bottom" | "top";
  /**
   * Horizontal alignment relative to the anchor (default: "start").
   * "start" — panel left edge aligns with trigger left edge (opens rightward).
   * "end"   — panel right edge aligns with trigger right edge (opens leftward).
   * Automatically mirrors when the panel would overflow the opposite edge.
   */
  preferH?: "start" | "end";
};

/**
 * Calculates the best `{ top, left }` for a panel anchored to a trigger element,
 * flipping direction when there isn't enough space in the preferred direction.
 */
export function calcSmartPos({
  anchor,
  panelW,
  panelH,
  gap = 4,
  preferV = "bottom",
  preferH = "start",
}: SmartPosOptions): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // ── Vertical ──────────────────────────────────────────────────────────────
  const belowTop = anchor.bottom + gap;
  const aboveTop = anchor.top - gap - panelH;

  let top: number;
  if (preferV === "bottom") {
    top = belowTop + panelH > vh - MARGIN ? aboveTop : belowTop;
  } else {
    top = aboveTop < MARGIN ? belowTop : aboveTop;
  }
  top = Math.max(MARGIN, Math.min(top, vh - panelH - MARGIN));

  // ── Horizontal ────────────────────────────────────────────────────────────
  let left: number;
  if (preferH === "start") {
    left = anchor.left;
    if (left + panelW > vw - MARGIN) left = anchor.right - panelW;
  } else {
    left = anchor.right - panelW;
    if (left < MARGIN) left = anchor.left;
  }
  left = Math.max(MARGIN, Math.min(left, vw - panelW - MARGIN));

  return { top, left };
}

// ── Sub-menu (ContextMenu nested panels) ──────────────────────────────────────

/**
 * For sub-menus that expand to the side of a parent menu item.
 * Returns which side to open on and a vertical `topOffset` (px) relative to
 * the parent item's top edge.
 */
export function calcSubMenuPos(
  triggerRect: DOMRect,
  subW: number,
  subH: number,
): { side: "left" | "right"; topOffset: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const side: "left" | "right" =
    triggerRect.right + subW > vw - MARGIN ? "left" : "right";

  // Base −4 px mirrors the original −mt-1; shift further up if overflowing bottom.
  const baseOffset = -4;
  const overflow = Math.max(0, triggerRect.top + baseOffset + subH - (vh - MARGIN));
  return { side, topOffset: baseOffset - overflow };
}
