/**
 * Sorting modes (4 required):
 * 1) Ascending
 * 2) Descending
 * 3) Random
 * 4) Every n-th
 */

export const SORT_MODES = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
  { value: 'random', label: 'Random' },
  { value: 'everyNth', label: 'Every n-th' },
];

function isNumericLike(value) {
  const s = String(value ?? '').trim();
  if (!s) return false;
  return Number.isFinite(Number(s));
}

function compareValues(a, b) {
  if (isNumericLike(a) && isNumericLike(b)) {
    return Number(a) - Number(b);
  }
  const aStr = String(a ?? '').toLowerCase();
  const bStr = String(b ?? '').toLowerCase();
  if (aStr < bStr) return -1;
  if (aStr > bStr) return 1;
  return 0;
}

function randomInt(maxExclusive) {
  // Prefer cryptographically stronger randomness when available.
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function fisherYatesShuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Every n-th ordering:
 * Example (n=3):
 * indices: 0,3,6,... then 1,4,7,... then 2,5,8,...
 */
function everyNthOrder(items, n) {
  const step = Number.isFinite(n) ? n : 2;
  const safeN = Math.max(2, step);

  const result = [];
  for (let offset = 0; offset < safeN; offset++) {
    for (let i = offset; i < items.length; i += safeN) {
      result.push(items[i]);
    }
  }
  return result;
}

/**
 * Applies requested sorting to a list.
 * - mode=asc/desc: sort by field
 * - mode=random: shuffle
 * - mode=everyNth: sort ascending by field, then apply every-nth ordering using `everyNthN`
 */
export function applySort(items, { sortBy, mode, everyNthN }) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const safeMode = mode || 'asc';
  const safeKey = sortBy || '';

  if (safeMode === 'random') {
    return fisherYatesShuffle(items);
  }

  const baseSorted = [...items].sort((a, b) => compareValues(a?.[safeKey], b?.[safeKey]));

  if (safeMode === 'desc') {
    baseSorted.reverse();
    return baseSorted;
  }

  if (safeMode === 'everyNth') {
    return everyNthOrder(baseSorted, Number.parseInt(String(everyNthN), 10));
  }

  // asc (default)
  return baseSorted;
}
