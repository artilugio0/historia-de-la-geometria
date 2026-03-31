/**
 * modal.js — Detail overlay with focus trap.
 */

import { getPeriod } from './data.js';

/** @type {HTMLElement | null} */
let _overlay = null;

/** @type {HTMLElement | null} */
let _panel = null;

/** @type {HTMLElement | null} */
let _previousFocus = null;

/** Selectors for focusable elements inside the modal */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Initialize the modal — must be called once with the overlay element.
 * @param {HTMLElement} overlayEl
 */
export function initModal(overlayEl) {
  _overlay = overlayEl;
  _panel = overlayEl.querySelector('.modal-panel');

  // Close on overlay backdrop click
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeModal();
  });

  // Close button
  const closeBtn = overlayEl.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Keyboard inside modal
  overlayEl.addEventListener('keydown', _handleModalKeydown);

  // Back button / swipe-back on mobile: close modal instead of leaving the page
  window.addEventListener('popstate', () => {
    if (isModalOpen()) closeModal({ fromPopstate: true });
  });
}

/**
 * Open the modal with the given entry data.
 * @param {import('./data.js').Entry} entry
 */
export function openModal(entry) {
  if (!_overlay || !_panel) return;

  const period = getPeriod(entry.periodId);

  // Set CSS custom properties for theming
  _panel.style.setProperty('--modal-period-color', period?.color || '#888');
  _panel.style.setProperty('--modal-period-accent', period?.accentColor || '#aaa');

  // Populate content
  const periodTagEl = _panel.querySelector('.modal-period-tag');
  const yearEl = _panel.querySelector('.modal-year');
  const titleEl = _panel.querySelector('.modal-title');
  const textEl = _panel.querySelector('.modal-text');
  const tagsEl = _panel.querySelector('.modal-tags');

  if (periodTagEl) periodTagEl.textContent = period?.label || '';
  if (yearEl) yearEl.textContent = entry.yearLabel;
  if (titleEl) titleEl.textContent = entry.title;
  if (textEl) textEl.textContent = entry.body;

  // Tags
  if (tagsEl) {
    tagsEl.innerHTML = '';
    for (const tag of entry.tags) {
      const span = document.createElement('span');
      span.className = 'modal-tag';
      span.textContent = tag;
      tagsEl.appendChild(span);
    }
  }

  // Image
  const imageEl = _panel.querySelector('.modal-image');
  const imageWrap = _panel.querySelector('.modal-image-wrap');
  if (imageEl && imageWrap) {
    if (entry.image) {
      imageEl.src = entry.image;
      imageEl.alt = entry.title;
      imageWrap.hidden = false;
    } else {
      imageEl.src = '';
      imageEl.alt = '';
      imageWrap.hidden = true;
    }
  }

  // Update ARIA
  _overlay.setAttribute('aria-hidden', 'false');
  _panel.setAttribute('aria-label', entry.title);

  // Store previous focus
  _previousFocus = document.activeElement;

  // Push a history state so the back button closes the modal instead of leaving the page
  history.pushState({ modal: true }, '');

  // Show overlay
  _overlay.classList.remove('is-closing');
  _overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Focus the close button after transition starts
  requestAnimationFrame(() => {
    const closeBtn = _panel.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();
  });
}

/**
 * Close the modal with animation.
 */
export function closeModal({ fromPopstate = false } = {}) {
  if (!_overlay) return;
  if (!_overlay.classList.contains('is-open')) return;

  // If the user closed via button/backdrop (not the back button), pop the
  // history state we pushed on open so the back button behaves normally.
  if (!fromPopstate) history.back();

  _overlay.classList.remove('is-open');
  _overlay.classList.add('is-closing');

  // After animation, hide completely
  const onEnd = () => {
    _overlay.classList.remove('is-closing');
    _overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Return focus
    if (_previousFocus && typeof _previousFocus.focus === 'function') {
      _previousFocus.focus();
    }
    _previousFocus = null;
    _overlay.removeEventListener('transitionend', onEnd);
  };

  _overlay.addEventListener('transitionend', onEnd, { once: true });

  // Fallback in case transition doesn't fire
  setTimeout(() => {
    if (_overlay.classList.contains('is-closing')) {
      onEnd();
    }
  }, 500);
}

/**
 * @returns {boolean} Whether the modal is currently open.
 */
export function isModalOpen() {
  return _overlay?.classList.contains('is-open') ?? false;
}

/**
 * Handle keyboard events inside the modal.
 * @param {KeyboardEvent} e
 */
function _handleModalKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeModal();
    return;
  }

  if (e.key === 'Tab') {
    _trapFocus(e);
  }
}

/**
 * Trap focus within the modal panel.
 * @param {KeyboardEvent} e
 */
function _trapFocus(e) {
  if (!_panel) return;

  const focusable = Array.from(_panel.querySelectorAll(FOCUSABLE));
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
