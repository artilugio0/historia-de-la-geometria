/**
 * timeline.js — Render the timeline DOM and manage active entry state.
 */

import { getAllEntries, getAllPeriods, getPeriod } from './data.js';

/** @type {string | null} */
let _activeEntryId = null;

/** @type {((entry: import('./data.js').Entry) => void) | null} */
let _onActivateCallback = null;

/** @type {((entry: import('./data.js').Entry) => void) | null} */
let _onOpenModalCallback = null;

/**
 * Register callbacks for timeline events.
 * @param {{ onActivate?: Function, onOpenModal?: Function }} callbacks
 */
export function registerCallbacks({ onActivate, onOpenModal } = {}) {
  if (onActivate) _onActivateCallback = onActivate;
  if (onOpenModal) _onOpenModalCallback = onOpenModal;
}

/**
 * Render the entire timeline into the given container.
 * @param {HTMLElement} container
 */
export function renderTimeline(container) {
  const entries = getAllEntries();
  const periods = getAllPeriods();

  // Build period → entries map
  const byPeriod = new Map();
  for (const period of periods) {
    byPeriod.set(period.id, []);
  }
  for (const entry of entries) {
    if (byPeriod.has(entry.periodId)) {
      byPeriod.get(entry.periodId).push(entry);
    }
  }

  // Create the axis spine
  const axis = document.createElement('div');
  axis.className = 'timeline-axis';
  axis.setAttribute('aria-hidden', 'true');

  // Create track
  const track = document.createElement('div');
  track.className = 'timeline-track';
  track.setAttribute('role', 'list');
  track.setAttribute('aria-label', 'Línea de tiempo de la geometría');

  // Add axis first (positioned absolute relative to track)
  track.appendChild(axis);

  // Build period sections (flex items)
  for (const period of periods) {
    const periodEntries = byPeriod.get(period.id) || [];
    if (periodEntries.length === 0) continue;

    const section = _buildPeriodSection(period, periodEntries);
    track.appendChild(section);
  }

  // Clear and append
  container.innerHTML = '';
  container.appendChild(track);

  // Set first entry as active
  if (entries.length > 0) {
    setActiveEntry(entries[0].id, false);
  }
}

/**
 * Build a period section element.
 * @param {import('./data.js').Period} period
 * @param {import('./data.js').Entry[]} entries
 * @returns {HTMLElement}
 */
function _buildPeriodSection(period, entries) {
  const entrySpacing = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--timeline-entry-spacing')
  ) || 340;

  const section = document.createElement('div');
  section.className = 'period-section';
  section.dataset.periodId = period.id;
  section.style.width = `${entries.length * entrySpacing}px`;

  // Period header label
  const header = document.createElement('div');
  header.className = 'period-header';
  header.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'period-label';
  label.textContent = period.label;
  label.style.cssText = `
    background: color-mix(in srgb, ${period.color} 15%, transparent);
    color: ${period.accentColor};
    border: 1px solid color-mix(in srgb, ${period.color} 30%, transparent);
  `;
  header.appendChild(label);
  section.appendChild(header);

  // Entries
  entries.forEach((entry, i) => {
    const isAbove = i % 2 === 0;
    const entryEl = _buildEntryElement(entry, period, i, entrySpacing, isAbove);
    section.appendChild(entryEl);
  });

  return section;
}

/**
 * Build a single timeline entry element.
 */
function _buildEntryElement(entry, period, index, entrySpacing, isAbove) {
  const entryEl = document.createElement('div');
  entryEl.className = 'timeline-entry';
  entryEl.id = `entry-${entry.id}`;
  entryEl.dataset.entryId = entry.id;
  entryEl.setAttribute('role', 'listitem');
  const cardWidth = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--timeline-card-width')
  ) || 280;
  const slotCenter = index * entrySpacing + entrySpacing / 2;

  entryEl.style.cssText = `
    --entry-period-color: ${period.color};
    --entry-period-accent: ${period.accentColor};
    left: ${slotCenter - cardWidth / 2}px;
  `;

  // Axis dot
  const dot = document.createElement('div');
  dot.className = 'entry-dot';
  dot.setAttribute('aria-hidden', 'true');

  // Connector line
  const connector = document.createElement('div');
  connector.className = `entry-connector ${isAbove ? 'above' : 'below'}`;
  connector.setAttribute('aria-hidden', 'true');

  // Year label
  const yearEl = document.createElement('div');
  yearEl.className = `entry-year ${isAbove ? 'above' : 'below'}`;
  yearEl.textContent = entry.yearLabel;
  yearEl.setAttribute('aria-hidden', 'true');

  // Card button
  const card = document.createElement('button');
  card.className = `entry-card ${isAbove ? 'above' : 'below'}`;
  card.style.animationDelay = `${index * 60}ms`;
  card.setAttribute('type', 'button');
  card.setAttribute('aria-label', `${entry.title}, ${entry.yearLabel}. Abrir detalle.`);
  card.setAttribute('tabindex', '0');

  // Period tag
  const tag = document.createElement('div');
  tag.className = 'card-period-tag';
  tag.textContent = period.label;

  // Title
  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = entry.title;

  // Summary
  const summary = document.createElement('p');
  summary.className = 'card-summary';
  summary.textContent = entry.summary;

  // Hint
  const hint = document.createElement('div');
  hint.className = 'card-hint';
  hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = '<span>Ver detalle</span><span class="card-hint-arrow">→</span>';

  card.appendChild(tag);
  card.appendChild(title);
  card.appendChild(summary);
  card.appendChild(hint);

  // Click: activate + open modal
  card.addEventListener('click', () => {
    setActiveEntry(entry.id);
    if (_onOpenModalCallback) {
      _onOpenModalCallback(entry);
    }
  });

  entryEl.appendChild(dot);
  entryEl.appendChild(connector);
  entryEl.appendChild(yearEl);
  entryEl.appendChild(card);

  return entryEl;
}

/**
 * Set the active timeline entry.
 * @param {string} id - Entry id
 * @param {boolean} scroll - Whether to scroll into view (default true)
 */
export function setActiveEntry(id, scroll = true) {
  // Remove previous active
  if (_activeEntryId) {
    const prev = document.getElementById(`entry-${_activeEntryId}`);
    if (prev) {
      prev.classList.remove('is-active');
      const prevCard = prev.querySelector('.entry-card');
      if (prevCard) {
        prevCard.setAttribute('aria-pressed', 'false');
        prevCard.removeAttribute('aria-current');
      }
    }
  }

  _activeEntryId = id;

  const el = document.getElementById(`entry-${id}`);
  if (!el) return;

  el.classList.add('is-active');
  const card = el.querySelector('.entry-card');
  if (card) {
    card.setAttribute('aria-pressed', 'true');
    card.setAttribute('aria-current', 'true');
  }

  if (scroll) {
    _scrollEntryIntoView(el);
  }

  const entries = getAllEntries();
  const entry = entries.find(e => e.id === id);
  if (entry && _onActivateCallback) {
    _onActivateCallback(entry);
  }
}

/**
 * Get the currently active entry id.
 * @returns {string | null}
 */
export function getActiveEntryId() {
  return _activeEntryId;
}

/**
 * Scroll an entry element into the visible area of the timeline.
 * @param {HTMLElement} el
 */
function _scrollEntryIntoView(el) {
  // Mobile vertical layout: scroll the document vertically
  if (window.innerWidth <= 768) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Desktop horizontal layout: scroll the wrapper
  const wrapper = el.closest('.timeline-wrapper');
  if (!wrapper) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    return;
  }

  const card = el.querySelector('.entry-card');
  const target = card || el;
  const wrapperRect = wrapper.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const targetCenter = targetRect.left + targetRect.width / 2;
  const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
  const scrollDelta = targetCenter - wrapperCenter;

  wrapper.scrollBy({ left: scrollDelta, behavior: 'smooth' });
}
