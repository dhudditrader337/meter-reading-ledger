/**
 * Household meter ledger — pure logic, no React, no network.
 */

export type Unit = 'kWh' | 'm3' | 'L' | 'GJ';
export type Decimals = 0 | 1 | 2;

export type Meter = {
  id: string;
  name: string;
  unit: Unit;
  decimals: Decimals;
  color: string;
  sprite: 1 | 2 | 3 | 4;
  rate?: number;
};

export type Reading = {
  id: string;
  meterId: string;
  value: number;
  dateIso: string;
  hasPhoto: boolean;
  isReset: boolean;
};

export const DAY_MS = 86400000;

/* ----------------------------------------------------------------
 * Selection helpers — all return new arrays, never mutate.
 * ---------------------------------------------------------------- */

/** Readings of one meter, newest first. */
export function readingsForMeter(
  readings: Reading[],
  meterId: string,
): Reading[] {
  return readings
    .filter(r => r.meterId === meterId)
    .sort((a, b) => Date.parse(b.dateIso) - Date.parse(a.dateIso));
}

export function lastReading(
  readings: Reading[],
  meterId: string,
): Reading | undefined {
  return readingsForMeter(readings, meterId)[0];
}

/** The reading recorded immediately before `reading` for the same meter. */
export function previousReading(
  readings: Reading[],
  reading: Reading,
): Reading | undefined {
  const t = Date.parse(reading.dateIso);
  return readingsForMeter(readings, reading.meterId).find(
    r => r.id !== reading.id && Date.parse(r.dateIso) < t,
  );
}

/* ----------------------------------------------------------------
 * Computation rules
 * ---------------------------------------------------------------- */

export function daysBetween(fromIso: string, toIso: string): number {
  const diff = Date.parse(toIso) - Date.parse(fromIso);
  return Math.max(1, Math.round(diff / DAY_MS));
}

/** delta = value - prevValue; a confirmed meter reset counts the value itself. */
export function computeDelta(
  value: number,
  prevValue: number | undefined,
  isReset: boolean,
): number {
  if (prevValue === undefined) {
    return 0;
  }
  return isReset ? value : value - prevValue;
}

export function perDay(delta: number, days: number): number {
  return days > 0 ? delta / days : 0;
}

/** Delta of a stored reading against the one before it. */
export function deltaOf(readings: Reading[], reading: Reading): number {
  const prev = previousReading(readings, reading);
  return computeDelta(reading.value, prev?.value, reading.isReset);
}

/** Start of the billing month that contains `date`. */
export function billingMonthStart(date: Date, firstBillingDay: number): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), firstBillingDay);
  if (date.getDate() < firstBillingDay) {
    start.setMonth(start.getMonth() - 1);
  }
  return start;
}

/** Sum of the deltas whose reading date falls inside the billing month. */
export function monthlyTotal(
  readings: Reading[],
  meterId: string,
  reference: Date,
  firstBillingDay: number,
): number {
  const start = billingMonthStart(reference, firstBillingDay).getTime();
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  const rows = readingsForMeter(readings, meterId);
  let total = 0;
  for (const r of rows) {
    const t = Date.parse(r.dateIso);
    if (t >= start && t < end.getTime()) {
      total += Math.max(0, deltaOf(readings, r));
    }
  }
  return total;
}

/** 12 monthly consumption totals for a calendar year, index 0 = January. */
export function monthlySeries(
  readings: Reading[],
  meterId: string,
  year: number,
): number[] {
  const series = new Array(12).fill(0);
  const rows = readingsForMeter(readings, meterId);
  for (const r of rows) {
    const d = new Date(r.dateIso);
    if (d.getFullYear() === year) {
      series[d.getMonth()] += Math.max(0, deltaOf(readings, r));
    }
  }
  return series;
}

export function yearTotal(
  readings: Reading[],
  meterId: string,
  year: number,
): number {
  return monthlySeries(readings, meterId, year).reduce((a, b) => a + b, 0);
}

/** Year-over-year change of the current month, or null without last-year data. */
export function yoyPercent(
  readings: Reading[],
  meterId: string,
  reference: Date,
): number | null {
  const month = reference.getMonth();
  const thisYear = monthlySeries(readings, meterId, reference.getFullYear())[month];
  const lastYear = monthlySeries(readings, meterId, reference.getFullYear() - 1)[month];
  if (!lastYear) {
    return null;
  }
  return ((thisYear - lastYear) / lastYear) * 100;
}

/** Personal-reference estimate. Returns null when no rate note is set. */
export function estimateFor(delta: number, rate?: number): number | null {
  if (rate === undefined || rate <= 0) {
    return null;
  }
  return delta * rate;
}

export function averageOf(series: number[]): number {
  const used = series.filter(v => v > 0);
  if (used.length === 0) {
    return 0;
  }
  return used.reduce((a, b) => a + b, 0) / used.length;
}

/* ----------------------------------------------------------------
 * Mutations (pure — return the next array)
 * ---------------------------------------------------------------- */

let idCounter = 0;
export function nextId(prefix: string): string {
  idCounter += 1;
  return prefix + '-' + Date.now().toString(36) + '-' + idCounter;
}

export function appendReading(
  readings: Reading[],
  reading: Reading,
): Reading[] {
  return readings.concat(reading);
}
