/* ============================================
   ClinicaSoft - Componentes de UI
   ============================================ */

const Components = (() => {

  /* --- Icon helper con Bootstrap Icons --- */
  function icon(name, extra = '') {
    return `<i class="bi bi-${name} ${extra}"></i>`;
  }

  /* --- Toast --- */
  function showToast({ message, type = 'success', duration = 3000 }) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: 'check-circle-fill', error: 'x-circle-fill', warning: 'exclamation-triangle-fill', info: 'info-circle-fill' };
    const classes = { success: 'toast', error: 'toast error', warning: 'toast warning', info: 'toast' };
    const toast = document.createElement('div');
    toast.className = classes[type] || 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${icon(icons[type] || 'check-circle-fill')}</span>
      <span class="toast-text">${message}</span>
      <button class="toast-close">&times;</button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    container.appendChild(toast);
    if (duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }
    return toast;
  }

  function removeToast(toast) {
    if (!toast || toast.classList.contains('toast-exit')) return;
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }

  /* --- Badge fabric --- */
  function createBadge(text, type, extra = '') {
    const span = document.createElement('span');
    span.className = `badge badge-${type} ${extra}`;
    span.textContent = text;
    return span;
  }

  /* --- Avatar iniciales --- */
  function createAvatar(nombre, apellido, extra = '') {
    const div = document.createElement('div');
    div.className = `avatar-circle ${extra}`;
    div.textContent = (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
    return div;
  }

  /* --- Cargar Chart.js dinámicamente --- */
  function loadChartJS(callback) {
    if (typeof Chart !== 'undefined') { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.onload = callback;
    document.head.appendChild(s);
  }

  /* --- Helpers --- */
  function formatFecha(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function getInitials(nombre) {
    return nombre.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  /* --- Modal --- */
  function showModal({ title, content, onConfirm, confirmText = 'Guardar', cancelText = 'Cancelar', showConfirm = true }) {
    let container = document.querySelector('.modal-overlay');
    if (!container) {
      container = document.createElement('div');
      container.className = 'modal-overlay';
      document.body.appendChild(container);
    }
    container.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">${content}</div>
        ${showConfirm ? `
        <div class="modal-footer">
          <button class="btn btn-outline btn-modal-cancel">${cancelText}</button>
          <button class="btn btn-primary btn-modal-confirm">${confirmText}</button>
        </div>` : ''}
      </div>
    `;
    container.classList.add('open');
    const closeModal = () => { container.classList.remove('open'); setTimeout(() => container.innerHTML = '', 300); };
    container.querySelector('.modal-close')?.addEventListener('click', closeModal);
    container.querySelector('.btn-modal-cancel')?.addEventListener('click', closeModal);
    container.addEventListener('click', (e) => { if (e.target === container) closeModal(); });
    if (showConfirm && onConfirm) {
      container.querySelector('.btn-modal-confirm')?.addEventListener('click', () => {
        const result = onConfirm();
        if (result !== false) closeModal();
      });
    }
    return container;
  }

  return { icon, showToast, createBadge, createAvatar, loadChartJS, formatFecha, getInitials, showModal };
})();
