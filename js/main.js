/**
 * main.js — App initialization. Wires all modules via callbacks.
 * Navigation never imports modal directly — all wiring happens here.
 */

import { fetchTimeline, getPeriod, getTimelineMeta } from './data.js';
import { renderTimeline, registerCallbacks } from './timeline.js';
import { initNavigation, updateNavUI } from './navigation.js';
import { initModal, openModal, closeModal, isModalOpen } from './modal.js';

let _periodBgImage = null;   // currently shown image
let _targetImage = null;     // image we're transitioning toward
let _periodBgTimer = null;

function setPeriodBackground(period) {
  if (window.innerWidth <= 768) return;
  const el = document.getElementById('period-bg');
  if (!el) return;
  const next = period?.image || null;
  if (next === _targetImage) return;

  _targetImage = next;
  clearTimeout(_periodBgTimer);

  _periodBgTimer = setTimeout(() => {
    // Switched away and back — image already correct, just ensure it's visible
    if (_targetImage === _periodBgImage) {
      if (_targetImage) el.classList.add('is-visible');
      return;
    }

    if (_periodBgImage) {
      // Fade out current, then swap in target
      el.classList.remove('is-visible');
      _periodBgTimer = setTimeout(() => {
        _periodBgImage = _targetImage;
        if (_targetImage) {
          el.style.backgroundImage = `url('${_targetImage}')`;
          requestAnimationFrame(() => el.classList.add('is-visible'));
        } else {
          el.style.backgroundImage = '';
        }
      }, 500);
    } else {
      // Nothing currently shown — set and fade in
      _periodBgImage = _targetImage;
      if (_targetImage) {
        el.style.backgroundImage = `url('${_targetImage}')`;
        requestAnimationFrame(() => el.classList.add('is-visible'));
      }
    }
  }, 350);
}

async function init() {
  // ── DOM References ──
  const timelineWrapper = document.getElementById('timeline-wrapper');
  const navEl = document.getElementById('timeline-nav');
  const modalOverlay = document.getElementById('modal-overlay');

  if (!timelineWrapper || !navEl || !modalOverlay) {
    console.error('Required DOM elements not found. Check index.html structure.');
    return;
  }

  // ── Initialize Modal ──
  initModal(modalOverlay);

  // ── Initialize Navigation ──
  initNavigation(navEl, {
    onOpenModal: (entry) => openModal(entry),
  });

  // ── Wire Timeline Callbacks ──
  registerCallbacks({
    onActivate: (entry) => {
      updateNavUI(navEl, entry);
      const period = getPeriod(entry.periodId);
      if (period) {
        document.body.style.setProperty('--active-period-color', period.color);
        setPeriodBackground(period);
      }
    },
    onActivateStart: (startConfig) => {
      updateNavUI(navEl);
      document.body.style.setProperty('--active-period-color', '#0F0E17');
      setPeriodBackground(startConfig);
    },
    onOpenModal: (entry) => openModal(entry),
  });

  // ── Global Escape key (outside modal) ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen()) {
      closeModal();
    }
  });

  // ── Load Data & Render ──
  try {
    await fetchTimeline();
    const { title, subtitle } = getTimelineMeta();
    const titleEl = document.querySelector('.site-title');
    const subtitleEl = document.querySelector('.site-subtitle');
    if (titleEl && title) titleEl.textContent = title;
    if (subtitleEl && subtitle) subtitleEl.textContent = subtitle;
    renderTimeline(timelineWrapper);
    updateNavUI(navEl);
  } catch (err) {
    console.error('Failed to initialize timeline:', err);
    timelineWrapper.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        gap: 1rem;
        color: rgba(255,255,254,0.6);
        font-family: system-ui, sans-serif;
        font-size: 0.875rem;
      ">
        <span style="font-size: 2rem;">⚠</span>
        <p>No se pudo cargar la línea de tiempo.</p>
        <p style="font-size: 0.75rem; opacity: 0.6;">${err.message}</p>
        <p style="font-size: 0.75rem; opacity: 0.6;">
          Abre el archivo con un servidor local:<br>
          <code>python3 -m http.server 8080</code>
        </p>
      </div>
    `;
  }
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
