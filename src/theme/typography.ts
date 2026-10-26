/**
 * Central typography. Swap the diner display face in this file only.
 *
 * Daylight is the client's heading font (personal-use license). It is not in
 * the repo. To enable it, add the licensed file and a @font-face rule for the
 * family name "Daylight" — it is already first in FONT_DISPLAY, so it will
 * take over from the fallbacks automatically.
 *
 * Fallback order: Daylight → Playfair Display Bold → SF Pro Rounded / system serif.
 * Body, buttons, and labels stay on SF Pro (the system font).
 */
export const FONT_DISPLAY =
  '"Daylight", "Playfair Display", "Iowan Old Style", "Palatino Linotype", Palatino, serif';

export const FONT_BODY =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", system-ui, sans-serif';

export const FONT_ROUNDED =
  '-apple-system, BlinkMacSystemFont, "SF Pro Rounded", ui-rounded, system-ui, sans-serif';

export const TYPE = {
  largeTitle: 34,
  title: 28,
  title2: 22,
  headline: 17,
  body: 17,
  callout: 16,
  subhead: 15,
  footnote: 13,
  caption: 13,
} as const;
