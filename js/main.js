/**
 * main.js — App initialization. Wires all modules via callbacks.
 * Navigation never imports modal directly — all wiring happens here.
 */

import { fetchTimeline } from './data.js';
import { renderTimeline, registerCallbacks } from './timeline.js';
import { initNavigation, updateNavUI } from './navigation.js';
import { initModal, openModal, closeModal, isModalOpen } from './modal.js';

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
