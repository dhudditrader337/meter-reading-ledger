export type NumberFormat = 'space' | 'dotComma';

/** Groups the integer part in threes: 48317 -> "48 317" / "48.317". */
function groupInteger(intPart: string, format: NumberFormat): string {
  const sep = format === 'dotComma' ? '.' : ' ';
  let out = '';
  for (let i = 0; i < intPart.length; i++) {
    const fromEnd = intPart.length - i;
    out += intPart[i];
    if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) {
      out += sep;
    }
  }
  return out;
}

/** "48 317.0" — never a currency symbol, this app has no money in it. */
export function formatValue(
  value: number,
  decimals: number,
  format: NumberFormat = 'space',
): string {
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const decimalSep = format === 'dotComma' ? ',' : '.';
  const grouped = groupInteger(intPart, format);
  const body = decPart ? grouped + decimalSep + decPart : grouped;
  return negative ? '-' + body : body;
}

/** Signed delta: "+147.0" / "-12.0". */
export function formatDelta(
  value: number,
  decimals: number,
  format: NumberFormat = 'space',
): string {
  const sign = value > 0 ? '+' : '';
  return sign + formatValue(value, decimals, format);
}

export function formatPercent(value: number | null): string {
  if (value === null || !isFinite(value)) {
    return '--';
  }
  const sign = value > 0 ? '+' : '';
  return sign + Math.round(value) + '%';
}

/**
 * Splits a value into odometer cells.
 * Integer part is left-padded to `intCells`; the fraction fills `decimals` cells.
 */
export function odometerCells(
  value: number,
  decimals: number,
  intCells: number,
): { intDigits: string[]; decDigits: string[]; leadingZeros: number } {
  const safe = isFinite(value) ? Math.max(0, value) : 0;
  const fixed = safe.toFixed(decimals);
  const [rawInt, rawDec] = fixed.split('.');
  const clipped = rawInt.slice(-intCells);
  const padded = clipped.padStart(intCells, '0');
  const leadingZeros = intCells - clipped.replace(/^0+/, '').length;
  return {
    intDigits: padded.split(''),
    decDigits: (rawDec || '').padEnd(decimals, '0').slice(0, decimals).split(''),
    leadingZeros: Math.min(leadingZeros, intCells),
  };
}

/** Maps a raw keypad buffer ("48317.5") onto odometer cells. */
export function bufferCells(
  buffer: string,
  decimals: number,
  intCells: number,
): { intDigits: string[]; decDigits: string[]; leadingZeros: number } {
  const [rawInt = '', rawDec = ''] = buffer.split('.');
  const clipped = rawInt.slice(-intCells);
  return {
    intDigits: clipped.padStart(intCells, '0').split(''),
    decDigits: rawDec.padEnd(decimals, '0').slice(0, decimals).split(''),
    leadingZeros: intCells - clipped.length,
  };
}

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

export const MONTH_INITIALS = [
  'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D',
];

/** "09 NOV 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  return day + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
}

/** "09 NOV" — history rows */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  return day + ' ' + MONTHS_SHORT[d.getMonth()];
}

/** "NOV 2026" — billing period strip */
export function formatMonth(date: Date): string {
  return MONTHS_SHORT[date.getMonth()] + ' ' + date.getFullYear();
}

export { MONTHS_SHORT };
