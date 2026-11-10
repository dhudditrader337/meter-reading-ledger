import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export { SCREEN_W, SCREEN_H };

/* ----------------------------------------------------------------
 * Timings
 * ---------------------------------------------------------------- */
export const LOADER_DURATION_MS = 8000; // rule #13 — exactly 8000
export const SCREEN_TRANSITION_MS = 220;
export const ODOMETER_STAGGER_MS = 40;
export const ODOMETER_DIGIT_MS = 180;
export const BAR_GROW_MS = 400;
export const BAR_STAGGER_MS = 35;
export const SAVED_FLASH_MS = 350;
export const SAVING_MS = 260;
export const TILE_STAGGER_MS = 60;
export const TILE_IN_MS = 260;

export const SPRING_PRESS = { tension: 300, friction: 12 };
export const SPRING_KEY = { tension: 420, friction: 14 };
export const SPRING_POP = { tension: 160, friction: 9 };

/* ----------------------------------------------------------------
 * Touch targets
 * ---------------------------------------------------------------- */
export const MIN_TOUCH = 48;
export const CTA_H = 60;
export const SECONDARY_H = 48;
export const CHIP_H = 44;
export const HEADER_PAD_TOP = 44; // rule #6
export const HEADER_CONTENT_H = 72;
export const HEADER_H = HEADER_PAD_TOP + HEADER_CONTENT_H;
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

/* ----------------------------------------------------------------
 * Shared content frame (rule #5: Math.min(SCREEN_W - 32, 380))
 * ---------------------------------------------------------------- */
export const CONTENT_W = Math.min(SCREEN_W - 32, 380);

/** Short viewports trim the chrome instead of letting the stack overflow. */
export const COMPACT = SCREEN_H < 700;
export const GAP_V = COMPACT ? 8 : 10;

/* ----------------------------------------------------------------
 * Menu bento grid — 2 columns of meter tiles
 * ---------------------------------------------------------------- */
export const TILE_GAP = 12;
export const TILE_W = Math.floor((CONTENT_W - TILE_GAP) / 2);
export const GRID_W = TILE_W * 2 + TILE_GAP;
export const TILE_PAD_H = 12;

/**
 * Tile height is what the Menu stack has left over after the period strip, the
 * add-meter row, the stat pills, the secondary row, the hint and the CTA —
 * derived rather than tiered so two rows of tiles always fit the viewport.
 */
const MENU_FIXED =
  HEADER_H + 40 + 10 + 46 + 10 + 78 + 10 + SECONDARY_H + 34 + CTA_H + 16;
export const TILE_H = Math.max(
  96,
  Math.min(200, Math.floor((SCREEN_H - MENU_FIXED - TILE_GAP) / 2)),
);

/* ----------------------------------------------------------------
 * Odometer display panel (GameScreen) — rule #4 frame arithmetic
 * ---------------------------------------------------------------- */
export const DISPLAY_PAD = 14;
export const DISPLAY_BORDER = 1;
export const DISPLAY_FRAME = DISPLAY_PAD + DISPLAY_BORDER; // 15
export const CELL_GAP = 4;
export const DOT_DIAMETER = 5;
export const INT_CELLS = 6;

/**
 * 6 integer cells + up to 2 decimal cells + the amber separator dot must all
 * fit inside the panel. The readout lays out with a flex gap, so the row is
 * n*CELL_W + n*CELL_GAP + DOT_DIAMETER wide in the worst case.
 */
const MAX_CELLS = INT_CELLS + 2;
export const CELL_W = Math.min(
  42,
  Math.floor(
    (CONTENT_W - 2 * DISPLAY_FRAME - DOT_DIAMETER - CELL_GAP * MAX_CELLS) /
      MAX_CELLS,
  ),
);
export const CELL_H = Math.round(CELL_W * 1.34);
export const DISPLAY_H = CELL_H + (COMPACT ? 38 : 48);

/* ----------------------------------------------------------------
 * Keypad 3x4 — rule #4 frame arithmetic
 * ---------------------------------------------------------------- */
export const PAD_PADDING = 8;
export const PAD_BORDER = 1;
export const PAD_FRAME = PAD_PADDING + PAD_BORDER; // 9
export const KEY_GAP = 10;
export const KEY_W = Math.floor(
  (CONTENT_W - 2 * PAD_FRAME - 2 * KEY_GAP) / 3,
);
/**
 * The key height is derived from the space the GameScreen actually has left,
 * not from a fixed tier — otherwise the four rows push the odometer panel off
 * a 731dp viewport. Floored at 44 and widened by hitSlop:8 on every key.
 */
export const STRIP_H = 78;
export const PHOTO_ROW_H = COMPACT ? 48 : 56;
const CONTROLS_CHROME = (COMPACT ? 10 : 14) + (COMPACT ? 14 : 18) + CTA_H + 14;
const GAME_AREA_NEED =
  DISPLAY_H + GAP_V + STRIP_H + GAP_V + PHOTO_ROW_H;
const KEY_H_FIT = Math.floor(
  (SCREEN_H -
    HEADER_H -
    GAME_AREA_NEED -
    CONTROLS_CHROME -
    PAD_FRAME * 2 -
    KEY_GAP * 3) /
    4,
);
export const KEY_H = Math.max(44, Math.min(KEY_W, 70, KEY_H_FIT));
export const PAD_W = KEY_W * 3 + KEY_GAP * 2 + PAD_FRAME * 2;
export const PAD_H = KEY_H * 4 + KEY_GAP * 3 + PAD_FRAME * 2;

/* ----------------------------------------------------------------
 * Month chart — 12 bars inside a bento card
 * ---------------------------------------------------------------- */
export const CHART_PAD = 14;
export const CHART_BORDER = 1;
export const CHART_FRAME = CHART_PAD + CHART_BORDER; // 15
export const BAR_GAP = 6;
export const BAR_W = Math.floor(
  (CONTENT_W - 2 * CHART_FRAME - BAR_GAP * 11) / 12,
);
export const BAR_AREA_H = SCREEN_H >= 780 ? 190 : 156;

/* ----------------------------------------------------------------
 * Photo archive grid — 3 columns
 * ---------------------------------------------------------------- */
export const PHOTO_GAP = 10;
export const PHOTO_CELL = Math.floor((CONTENT_W - PHOTO_GAP * 2) / 3);

/* ----------------------------------------------------------------
 * Ledger defaults
 * ---------------------------------------------------------------- */
export const DEFAULT_BILLING_DAY = 1;
export const BILLING_DAY_CHOICES = [1, 5, 10, 15, 20, 25];
export const UNIT_CHOICES = ['kWh', 'm3', 'L', 'GJ'] as const;
export const DECIMAL_CHOICES = [0, 1, 2] as const;
export const COLOR_CHOICES = ['#7AD151', '#FFB000', '#3FB8E0', '#FF7A45'];
export const APP_VERSION = '1.0.0';

/* ----------------------------------------------------------------
 * Menu tile odometer — 6 integer cells sized from the tile width so the
 * readout can never overflow the cell on a narrow device (rules #4-5).
 * ---------------------------------------------------------------- */
export const TILE_CELLS = 6;
export const TILE_CELL_W = Math.max(
  13,
  Math.min(
    24,
    Math.floor(
      (TILE_W - 2 * TILE_PAD_H - CELL_GAP * (TILE_CELLS - 1)) / TILE_CELLS,
    ),
  ),
);
export const TILE_CELL_H = Math.round(TILE_CELL_W * 1.45);
