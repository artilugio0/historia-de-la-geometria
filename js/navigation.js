/**
 * navigation.js — Keyboard and button navigation handlers.
 */

import { getAllEntries, getAllPeriods, getEntry } from './data.js';
import { getActiveEntryId, setActiveEntry } from './timeline.js';

/** @type {((entry: import('./data.js').Entry) => void) | null} */
let _onOpenModal = null;

/**
 * Initialize navigation: prev/next buttons, keyboard, period pills.
 * @param {HTMLElement} navEl - The nav bar element
 * @param {{ onOpenModal?: Function }} callbacks
 */
export function initNavigation(navEl, { onOpenModal } = {}) {
  if (onOpenModal) _onOpenModal = onOpenModal;

  const prevBtn = navEl.querySelector('#nav-prev');
  const nextBtn = navEl.querySelector('#nav-next');
  const openBtn = navEl.querySelector('#nav-open');
  const counter = navEl.querySelector('#nav-counter');
  const periodsContainer = navEl.querySelector('#nav-periods');

  // Prev button
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToPrev());
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToNext());
  }

  // Open modal button
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      const activeId = getActiveEntryId();
      if (!activeId) return;
      const entry = getEntry(activeId);
      if (entry && _onOpenModal) _onOpenModal(entry);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Don't intercept when focus is inside modal or an input
    if (e.target.closest('[role="dialog"]')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Enter':
      case ' ': {
        // Only trigger from active card or nav open button
        if (e.target.classList.contains('entry-card') || e.target.id === 'nav-open') {
          e.preventDefault();
          const activeId = getActiveEntryId();
          if (!activeId) break;
          const entry = getEntry(activeId);
          if (entry && _onOpenModal) _onOpenModal(entry);
        }
        break;
      }
    }
  });

  // Update UI on activation
  updateNavUI(navEl);
}

/**
 * Go to the previous entry.
 */
export function goToPrev() {
  const entries = getAllEntries();
  const activeId = getActiveEntryId();
  const idx = entries.findIndex(e => e.id === activeId);
  if (idx > 0) {
    setActiveEntry(entries[idx - 1].id);
  }
}

/**
 * Go to the next entry.
 */
export function goToNext() {
  const entries = getAllEntries();
  const activeId = getActiveEntryId();
  const idx = entries.findIndex(e => e.id === activeId);
  if (idx < entries.length - 1) {
    setActiveEntry(entries[idx + 1].id);
  }
}

/**
 * Jump to the first entry of a period.
 * @param {string} periodId
 */
export function jumpToPeriod(periodId) {
  const entries = getAllEntries();
  const first = entries.find(e => e.periodId === periodId);
  if (first) {
    setActiveEntry(first.id);
  }
}

/**
 * Update prev/next button states and counter.
 * Called by main.js on each activation.
 * @param {HTMLElement} navEl
 * @param {import('./data.js').Entry} [activeEntry]
 */
export function updateNavUI(navEl, activeEntry) {
  const entries = getAllEntries();
  const periods = getAllPeriods();
  const activeId = activeEntry ? activeEntry.id : getActiveEntryId();
  const idx = entries.findIndex(e => e.id === activeId);

  const prevBtn = navEl.querySelector('#nav-prev');
  const nextBtn = navEl.querySelector('#nav-next');
  const counter = navEl.querySelector('#nav-counter');
  const openBtn = navEl.querySelector('#nav-open');
  const periodsContainer = navEl.querySelector('#nav-periods');

  if (prevBtn) prevBtn.disabled = idx <= 0;
  if (nextBtn) nextBtn.disabled = idx >= entries.length - 1;
  if (counter) counter.textContent = `${idx + 1} / ${entries.length}`;

  // Build period pills once, on first call with real data
  if (periodsContainer && periodsContainer.children.length === 0 && periods.length > 0) {
    for (const period of periods) {
      const pill = document.createElement('button');
      pill.className = 'period-pill';
      pill.id = `pill-${period.id}`;
      pill.dataset.periodId = period.id;
      pill.textContent = period.label;
      pill.style.setProperty('--pill-color', period.color);
      pill.setAttribute('type', 'button');
      pill.setAttribute('aria-label', `Ir al período: ${period.label}`);
      pill.addEventListener('click', () => jumpToPeriod(period.id));
      periodsContainer.appendChild(pill);
    }
  }

  // Update period pills active state
  const currentPeriodId = activeEntry
    ? activeEntry.periodId
    : entries[idx]?.periodId;

  for (const period of periods) {
    const pill = navEl.querySelector(`#pill-${period.id}`);
    if (!pill) continue;
    if (period.id === currentPeriodId) {
      pill.classList.add('is-active');
      pill.setAttribute('aria-current', 'true');
    } else {
      pill.classList.remove('is-active');
      pill.removeAttribute('aria-current');
    }
  }

  // Update open button color
  if (openBtn && activeEntry) {
    const period = periods.find(p => p.id === activeEntry.periodId);
    if (period) {
      navEl.style.setProperty('--active-period-color', period.color);
    }
  }
}
