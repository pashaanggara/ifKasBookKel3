// =====================================================
// BukuKas Universal — UI Helpers
// =====================================================

const UI = (() => {

  // ---- FORMAT CURRENCY ----
  function formatRp(amount, showSign = false) {
    if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(Math.abs(amount));
    if (showSign) return (amount >= 0 ? '+' : '-') + formatted;
    return formatted;
  }

  function formatNumber(n) {
    return new Intl.NumberFormat('id-ID').format(n || 0);
  }

  // ---- FORMAT DATE ----
  function formatDate(dateStr, full = false) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    if (full) return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const dd = new Date(d); dd.setHours(0,0,0,0);
    if (dd.getTime() === today.getTime()) return 'Hari ini';
    if (dd.getTime() === yesterday.getTime()) return 'Kemarin';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateInput(dateStr) {
    // returns YYYY-MM-DD for date input
    if (!dateStr) return new Date().toISOString().slice(0,10);
    return new Date(dateStr).toISOString().slice(0,10);
  }

  function getTodayStr() { return new Date().toISOString().slice(0,10); }

  function getMonthRange(offset = 0) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth() + offset;
    const from = new Date(y, m, 1);
    const to   = new Date(y, m + 1, 0);
    return {
      from: from.toISOString().slice(0,10),
      to:   to.toISOString().slice(0,10),
      label: from.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    };
  }

  // ---- INPUT CURRENCY FORMATTER ----
  function attachCurrencyInput(el) {
    el.addEventListener('input', () => {
      let raw = el.value.replace(/\D/g,'');
      el.value = raw ? formatNumber(parseInt(raw)) : '';
      el.dataset.rawValue = raw;
    });
    el.addEventListener('focus', () => {
      let raw = el.value.replace(/\D/g,'');
      el.value = raw;
    });
    el.addEventListener('blur', () => {
      let raw = el.value.replace(/\D/g,'');
      if (raw) el.value = formatNumber(parseInt(raw));
    });
  }

  function getCurrencyValue(el) {
    return parseInt((el.value || '').replace(/\D/g,'')) || 0;
  }

  function setCurrencyValue(el, val) {
    el.value = val ? formatNumber(val) : '';
    el.dataset.rawValue = val || '';
  }

  // ---- TOAST ----
  let _toastContainer = null;
  function _getToastContainer() {
    if (!_toastContainer) {
      _toastContainer = document.getElementById('toastContainer');
    }
    return _toastContainer;
  }

  const TOAST_ICONS = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`,
    error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="M12 2L2 20h20L12 2z"/><path d="M12 10v4M12 16h.01"/></svg>`,
    info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  };

  function toast(msg, type = 'success', duration = 3000) {
    const c = _getToastContainer();
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type]||TOAST_ICONS.info}</span><span class="toast-msg">${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.2s, transform 0.2s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 220);
    }, duration);
  }

  // ---- MODAL ----
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  // ---- CONFIRM DIALOG ----
  function confirm({ title, desc, confirmText = 'Hapus', type = 'danger', onConfirm }) {
    const overlay = document.getElementById('confirmModal');
    const icon    = document.getElementById('confirmIcon');
    const titleEl = document.getElementById('confirmTitle');
    const descEl  = document.getElementById('confirmDesc');
    const btnEl   = document.getElementById('confirmBtn');

    icon.className = `confirm-icon confirm-${type}`;
    icon.innerHTML = type === 'danger'
      ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`
      : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 20h20L12 2z"/><path d="M12 10v4M12 16h.01"/></svg>`;

    titleEl.textContent = title;
    descEl.textContent  = desc;
    btnEl.textContent   = confirmText;
    btnEl.className     = `btn btn-${type}`;

    btnEl.onclick = () => { closeModal('confirmModal'); onConfirm && onConfirm(); };
    openModal('confirmModal');
  }

  // ---- SVG ICONS (inline) ----
  const ICONS = {
    dashboard:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    wallet:      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M16 11a1 1 0 100 2 1 1 0 000-2z"/><path d="M2 10h20"/><path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2"/></svg>`,
    transaction: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4M3 12V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 12v3a4 4 0 01-4 4H3"/></svg>`,
    report:      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    category:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    settings:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14M12 2v2M12 20v2M2 12H4M20 12h2"/></svg>`,
    profile:     `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    plus:        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    edit:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
    sun:         `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon:        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
    bell:        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
    search:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    logout:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    income:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
    expense:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>`,
    transfer:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 1l4 4-4 4M3 12V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 12v3a4 4 0 01-4 4H3"/></svg>`,
    chevronLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>`,
    chevronRight:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>`,
    download:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    upload:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    collapse:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>`,
    expand:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>`,
    close:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    filter:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    chart:       `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    more:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
    eye:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  };

  function icon(name, size = 20) {
    const svg = ICONS[name];
    if (!svg) return '';
    return svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
  }

  // ---- WALLET TYPE LABEL ----
  function walletTypeLabel(type) {
    return { cash: 'Tunai', bank: 'Bank', ewallet: 'E-Wallet', savings: 'Tabungan', other: 'Lainnya' }[type] || type;
  }

  // ---- TX TYPE BADGE ----
  function txTypeBadge(type) {
    if (type === 'income')   return `<span class="badge badge-success">Pemasukan</span>`;
    if (type === 'expense')  return `<span class="badge badge-danger">Pengeluaran</span>`;
    if (type === 'transfer') return `<span class="badge badge-info">Transfer</span>`;
    return '';
  }

  // ---- INITIALS ----
  function initials(name) {
    if (!name) return '?';
    return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  }

  // ---- EMPTY STATE ----
  function emptyState(icon_emoji, title, desc, btnText, btnId) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon_emoji}</div>
        <div class="empty-state-title">${title}</div>
        <p class="empty-state-desc">${desc}</p>
        ${btnText ? `<button class="btn btn-primary" id="${btnId}">${btnText}</button>` : ''}
      </div>`;
  }

  // ---- TREND INDICATOR ----
  function trendBadge(current, prev) {
    if (!prev || prev === 0) return '';
    const pct = Math.round((current - prev) / prev * 100);
    const up = pct >= 0;
    return `<span class="stat-card-trend ${up ? 'trend-up':'trend-down'}">
      ${up ? '↑' : '↓'} ${Math.abs(pct)}% vs bulan lalu
    </span>`;
  }

  return {
    formatRp, formatNumber, formatDate, formatDateInput, getTodayStr,
    getMonthRange, attachCurrencyInput, getCurrencyValue, setCurrencyValue,
    toast, openModal, closeModal, closeAllModals, confirm,
    icon, walletTypeLabel, txTypeBadge, initials, emptyState, trendBadge,
    ICONS
  };
})();
