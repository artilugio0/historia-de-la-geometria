/**
 * data.js — Fetch and parse timeline.json, build lookup index.
 */

/** @type {{ periods: Period[], entries: Entry[] } | null} */
let _data = null;

/** @type {Map<string, Entry>} */
let _entryIndex = new Map();

/** @type {Map<string, Period>} */
let _periodIndex = new Map();

/**
 * Fetch and return the timeline data.
 * Caches after first load.
 * @returns {Promise<{ periods: Period[], entries: Entry[] }>}
 */
export async function fetchTimeline() {
  if (_data) return _data;

  const url = new URL('../data/timeline.json', import.meta.url);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load timeline data: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();

  // Sort entries by sortKey
  raw.entries.sort((a, b) => a.sortKey - b.sortKey);

  _data = raw;
  buildIndex(raw);

  return _data;
}

/**
 * Build lookup maps for O(1) access by id.
 * @param {{ periods: Period[], entries: Entry[] }} data
 */
export function buildIndex(data) {
  _entryIndex.clear();
  _periodIndex.clear();

  for (const entry of data.entries) {
    _entryIndex.set(entry.id, entry);
  }

  for (const period of data.periods) {
    _periodIndex.set(period.id, period);
  }
}

/**
 * Get a single entry by id.
 * @param {string} id
 * @returns {Entry | undefined}
 */
export function getEntry(id) {
  return _entryIndex.get(id);
}

/**
 * Get a single period by id.
 * @param {string} id
 * @returns {Period | undefined}
 */
export function getPeriod(id) {
  return _periodIndex.get(id);
}

/**
 * Get all entries (sorted).
 * @returns {Entry[]}
 */
export function getAllEntries() {
  return _data ? _data.entries : [];
}

/**
 * Get all periods (in declaration order).
 * @returns {Period[]}
 */
export function getAllPeriods() {
  return _data ? _data.periods : [];
}

/**
 * @typedef {Object} Period
 * @property {string} id
 * @property {string} label
 * @property {string} color
 * @property {string} accentColor
 * @property {string} [image] - Optional background image path (desktop only)
 */

/**
 * @typedef {Object} Entry
 * @property {string} id
 * @property {string} periodId
 * @property {number|null} year
 * @property {string} yearLabel
 * @property {number} sortKey
 * @property {string} title
 * @property {string} summary
 * @property {string} body
 * @property {string|null} image
 * @property {string[]} tags
 */
