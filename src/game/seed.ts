import { Meter, Reading, DAY_MS } from './ledger';

/**
 * Deterministic seed data — no screen is ever empty on first launch and the
 * screenshots stay stable between builds (no Math.random anywhere).
 */

export const SEED_METERS: Meter[] = [
  { id: 'm-elec', name: 'ELECTRICITY', unit: 'kWh', decimals: 1, color: '#7AD151', sprite: 1, rate: 3.7 },
  { id: 'm-gas', name: 'GAS', unit: 'm3', decimals: 2, color: '#FFB000', sprite: 2, rate: 8.4 },
  { id: 'm-water', name: 'WATER', unit: 'L', decimals: 0, color: '#3FB8E0', sprite: 3 },
  { id: 'm-heat', name: 'HEAT', unit: 'GJ', decimals: 2, color: '#FF7A45', sprite: 4 },
];

/** Tiny LCG so the history is varied but identical on every run. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Profile = {
  meterId: string;
  start: number;
  monthly: number;
  spread: number;
  /** winter-heavy consumption curve multiplier per month index */
  seasonal: number[];
  photoMonths: number[];
};

const FLAT = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const WINTER = [1.45, 1.4, 1.2, 0.95, 0.7, 0.5, 0.45, 0.5, 0.75, 1.0, 1.25, 1.4];
const MILD = [1.15, 1.12, 1.05, 0.98, 0.9, 0.88, 0.9, 0.92, 0.96, 1.02, 1.08, 1.12];

const PROFILES: Profile[] = [
  { meterId: 'm-elec', start: 44120.0, monthly: 318, spread: 0.12, seasonal: MILD, photoMonths: [0, 4] },
  { meterId: 'm-gas', start: 7310.0, monthly: 96, spread: 0.18, seasonal: WINTER, photoMonths: [2] },
  { meterId: 'm-water', start: 183400, monthly: 9400, spread: 0.1, seasonal: FLAT, photoMonths: [] },
  { meterId: 'm-heat', start: 412.0, monthly: 6.4, spread: 0.22, seasonal: WINTER, photoMonths: [] },
];

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

function decimalsOf(meterId: string): number {
  const meter = SEED_METERS.find(m => m.id === meterId);
  return meter ? meter.decimals : 0;
}

/**
 * 14 monthly readings across the last 13 months plus 6 readings in the same
 * months of the previous year, so the ghost series and the YoY figure are real.
 */
export function buildSeedReadings(now: Date): Reading[] {
  const readings: Reading[] = [];
  const rand = lcg(20261109);

  for (const profile of PROFILES) {
    const decimals = decimalsOf(profile.meterId);

    // --- previous year: 6 readings in the same calendar months ---
    let lastYearValue = profile.start - profile.monthly * 13;
    for (let i = 6; i >= 1; i--) {
      const date = new Date(
        now.getFullYear() - 1,
        now.getMonth() - i + 1,
        8 + Math.floor(rand() * 4),
      );
      const month = date.getMonth();
      const step =
        profile.monthly *
        profile.seasonal[month] *
        (1 + (rand() - 0.5) * profile.spread) *
        1.07; // last year ran a bit heavier
      lastYearValue += step;
      readings.push({
        id: profile.meterId + '-ly-' + i,
        meterId: profile.meterId,
        value: round(lastYearValue, decimals),
        dateIso: date.toISOString(),
        hasPhoto: false,
        isReset: false,
      });
    }

    // --- current stretch: 14 readings over the last 13 months ---
    let value = profile.start;
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 30.4 * DAY_MS);
      const month = date.getMonth();
      const step =
        profile.monthly *
        profile.seasonal[month] *
        (1 + (rand() - 0.5) * profile.spread);
      value += step;
      readings.push({
        id: profile.meterId + '-r-' + i,
        meterId: profile.meterId,
        value: round(value, decimals),
        dateIso: date.toISOString(),
        hasPhoto: profile.photoMonths.indexOf(i) >= 0,
        isReset: false,
      });
    }
  }

  return readings;
}

export type LedgerSettings = {
  firstBillingDay: number;
  numberFormat: 'space' | 'dotComma';
  surfaceTone: 'dark' | 'dim';
};

export const SEED_SETTINGS: LedgerSettings = {
  firstBillingDay: 1,
  numberFormat: 'space',
  surfaceTone: 'dark',
};
