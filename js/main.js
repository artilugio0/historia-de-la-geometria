/**
 * main.js — App initialization. Wires all modules via callbacks.
 * Navigation never imports modal directly — all wiring happens here.
 */

import { fetchTimeline, getPeriod, getTimelineMeta } from './data.js';
import { renderTimeline, registerCallbacks } from './timeline.js';
import { initNavigation, updateNavUI } from './navigation.js';
import { initModal, openModal, closeModal, isModalOpen } from './modal.js';

// ── Theme Management ──

const DARK_BG  = '#0f0e17';
const LIGHT_BG = '#f8f7ff';

function initTheme(defaultTheme) {
  let theme;
  try { theme = localStorage.getItem('theme'); } catch (e) { theme = null; }
  if (theme !== 'light' && theme !== 'dark') theme = defaultTheme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  _syncThemeButton(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';

  // If on start entry, update active-period-color to match new bg
  const activePeriodColor = document.body.style.getPropertyValue('--active-period-color').toLowerCase();
  if (activePeriodColor === DARK_BG || activePeriodColor === LIGHT_BG) {
    document.body.style.setProperty('--active-period-color', next === 'light' ? LIGHT_BG : DARK_BG);
  }

  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  _syncThemeButton(next);
}

function _syncThemeButton(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  if (theme === 'light') {
    btn.textContent = '☾';
    btn.setAttribute('aria-label', 'Cambiar a modo oscuro');
  } else {
    btn.textContent = '☀';
    btn.setAttribute('aria-label', 'Cambiar a modo claro');
  }
}

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

  // ── Wire Theme Toggle ──
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

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
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
      document.body.style.setProperty('--active-period-color', bg);
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
    const { title, subtitle, defaultTheme } = getTimelineMeta();
    const titleEl = document.querySelector('.site-title');
    const subtitleEl = document.querySelector('.site-subtitle');
    if (titleEl && title) titleEl.textContent = title;
    if (subtitleEl && subtitle) subtitleEl.textContent = subtitle;
    initTheme(defaultTheme);
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
