// =====================================================
// BukuKas Universal — Dashboard Page
// =====================================================

const DashboardPage = (() => {
  let _chartIncome  = null;
  let _chartDonut   = null;
  let _balanceHidden = false;

  function init() {
    _renderHero();
    _renderStats();
    _renderQuickActions();
    _renderWallets();
    _renderChart();
    _renderRecentTx();
  }

  // ---- Hero / Saldo ----
  function _renderHero() {
    const user    = Store.getUser();
    const balance = Store.getTotalBalance();
    const now     = new Date();
    const summary = Store.getMonthlySummary(now.getFullYear(), now.getMonth());

    const greet = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Malam';

    document.getElementById('dashGreeting').textContent = `${greet}, ${user.name.split(' ')[0]}! 👋`;
    document.getElementById('dashBalance').textContent  = UI.formatRp(balance);
    document.getElementById('dashMonthLabel').textContent = `Bulan ${now.toLocaleDateString('id-ID', {month:'long', year:'numeric'})}`;

    const el = document.getElementById('dashMeta');
    el.innerHTML = `
      <span style="color:rgba(255,255,255,0.9)">+${UI.formatRp(summary.income)} pemasukan</span>
      &nbsp;·&nbsp;
      <span style="color:rgba(255,255,255,0.9)">${UI.formatRp(summary.expense)} pengeluaran</span>
    `;

    // Toggle balance visibility
    document.getElementById('btnToggleBalance').onclick = () => {
      _balanceHidden = !_balanceHidden;
      const balEl = document.getElementById('dashBalance');
      const eyeEl = document.getElementById('btnToggleBalance');
      balEl.textContent = _balanceHidden ? '••••••••' : UI.formatRp(Store.getTotalBalance());
      eyeEl.innerHTML   = UI.icon(_balanceHidden ? 'eyeOff' : 'eye', 18);
    };
  }

  // ---- Stat Cards ----
  function _renderStats() {
    const now  = new Date();
    const curr = Store.getMonthlySummary(now.getFullYear(), now.getMonth());
    const prev = Store.getMonthlySummary(now.getFullYear(), now.getMonth() - 1);

    const cards = [
      { id: 'statIncome',  label: 'Pemasukan Bulan Ini',   value: curr.income,  prev: prev.income,
        icon: '↑', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10B981' },
      { id: 'statExpense', label: 'Pengeluaran Bulan Ini', value: curr.expense, prev: prev.expense,
        icon: '↓', iconBg: 'rgba(239,68,68,0.12)',   iconColor: '#EF4444' },
      { id: 'statNet',     label: 'Selisih Bersih',        value: curr.net,     prev: prev.net,
        icon: '=', iconBg: 'rgba(59,130,246,0.12)',  iconColor: '#3B82F6' },
    ];

    cards.forEach(c => {
      const el = document.getElementById(c.id);
      if (!el) return;
      const isNeg = c.value < 0;
      el.innerHTML = `
        <div class="stat-card-icon" style="background:${c.iconBg}; color:${c.iconColor}; font-size:18px; font-weight:700;">${c.icon}</div>
        <div class="stat-card-label">${c.label}</div>
        <div class="stat-card-value" style="color:${isNeg ? 'var(--color-danger)' : 'var(--color-text-primary)'}">${UI.formatRp(c.value)}</div>
        ${UI.trendBadge(c.value, c.prev)}
      `;
    });
  }

  // ---- Quick Actions ----
  function _renderQuickActions() {
    const actions = [
      { icon: '📥', label: 'Pemasukan',   color: 'rgba(16,185,129,0.12)',  action: () => TransactionPage.openForm('income') },
      { icon: '📤', label: 'Pengeluaran', color: 'rgba(239,68,68,0.12)',   action: () => TransactionPage.openForm('expense') },
      { icon: '🔄', label: 'Transfer',    color: 'rgba(59,130,246,0.12)',  action: () => TransactionPage.openForm('transfer') },
      { icon: '📂', label: 'Kategori',    color: 'rgba(99,102,241,0.12)',  action: () => Router.navigate('category') },
    ];

    const container = document.getElementById('dashQuickActions');
    container.innerHTML = actions.map((a,i) => `
      <div class="quick-action" id="qa-${i}" tabindex="0" role="button" aria-label="${a.label}">
        <div class="quick-action-icon" style="background:${a.color}">${a.icon}</div>
        <span class="quick-action-label">${a.label}</span>
      </div>
    `).join('');

    actions.forEach((a,i) => {
      const el = document.getElementById(`qa-${i}`);
      el.onclick = a.action;
      el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.action(); } };
    });
  }

  // ---- Wallet Cards ----
  function _renderWallets() {
    const wallets = Store.getWallets();
    const container = document.getElementById('dashWallets');
    if (!wallets.length) {
      container.innerHTML = `<p class="text-secondary fs-small">Belum ada dompet. <span style="color:var(--color-primary);cursor:pointer" id="dashAddWalletLink">Tambah dompet</span></p>`;
      document.getElementById('dashAddWalletLink')?.addEventListener('click', () => Router.navigate('wallet'));
      return;
    }
    container.innerHTML = `<div class="wallet-carousel">${wallets.map(w => _walletCardHTML(w)).join('')}</div>`;
    container.querySelectorAll('.wallet-card').forEach((el, i) => {
      el.onclick = () => Router.navigate('wallet');
    });
  }

  function _walletCardHTML(w) {
    const typeIcon = { cash: '💵', bank: '🏦', ewallet: '📱', savings: '🏺', other: '💼' }[w.type] || '💼';
    return `
      <div class="wallet-card" style="background:${w.gradient}" role="button" tabindex="0" aria-label="${w.name}">
        <div class="wallet-card-header">
          <div>
            <div class="wallet-card-name">${w.name}</div>
            <span class="wallet-card-type">${typeIcon} ${UI.walletTypeLabel(w.type)}</span>
          </div>
        </div>
        <div class="wallet-card-balance">
          <div class="wallet-card-balance-label">Saldo</div>
          <div class="wallet-card-balance-value">${UI.formatRp(w.balance || 0)}</div>
        </div>
      </div>`;
  }

  // ---- Chart ----
  function _renderChart() {
    const now  = new Date();
    const days = 7;
    const labels = [], incomes = [], expenses = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0,10);
      const txs = Store.getTransactions().filter(t => t.date === dateStr);
      labels.push(d.toLocaleDateString('id-ID', { weekday:'short', day:'numeric' }));
      incomes.push(txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0));
      expenses.push(txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0));
    }

    const ctx = document.getElementById('dashChart');
    if (!ctx) return;
    if (_chartIncome) { _chartIncome.destroy(); _chartIncome = null; }

    _chartIncome = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Pemasukan', data: incomes,  backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6, borderSkipped: false },
          { label: 'Pengeluaran', data: expenses, backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 6, borderSkipped: false },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Poppins', size: 12 }, color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary') } },
          tooltip: {
            callbacks: { label: ctx => ' ' + UI.formatRp(ctx.parsed.y) }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 }, color: '#6B7280' } },
          y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { callback: v => 'Rp' + UI.formatNumber(v), font: { family: 'Poppins', size: 11 }, color: '#6B7280' } }
        }
      }
    });

    // Donut chart
    const ctxD = document.getElementById('dashDonut');
    if (!ctxD) return;
    if (_chartDonut) { _chartDonut.destroy(); _chartDonut = null; }

    const cats = Store.getCategories().filter(c => c.type === 'expense');
    const txsMonth = Store.queryTransactions({ type: 'expense', dateFrom: UI.getMonthRange().from, dateTo: UI.getMonthRange().to });
    const catTotals = cats.map(c => ({
      name: c.name, icon: c.icon, color: c.color,
      total: txsMonth.filter(t => t.categoryId === c.id).reduce((s,t)=>s+t.amount,0)
    })).filter(c => c.total > 0).sort((a,b)=>b.total-a.total).slice(0,6);

    if (catTotals.length === 0) {
      ctxD.closest('.chart-container').innerHTML = `<div class="text-center text-secondary fs-small" style="padding:40px">Belum ada pengeluaran bulan ini</div>`;
      return;
    }

    _chartDonut = new Chart(ctxD, {
      type: 'doughnut',
      data: {
        labels: catTotals.map(c => `${c.icon} ${c.name}`),
        datasets: [{ data: catTotals.map(c=>c.total), backgroundColor: catTotals.map(c=>c.color), borderWidth: 3, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-card') }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'right', labels: { usePointStyle: true, font: { family: 'Poppins', size: 12 }, color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary'), padding: 12, boxWidth: 10 } },
          tooltip: { callbacks: { label: ctx => ' ' + UI.formatRp(ctx.parsed) } }
        }
      }
    });
  }

  // ---- Recent Transactions ----
  function _renderRecentTx() {
    const txs = Store.getTransactions().slice(0, 8);
    const container = document.getElementById('dashRecentTx');
    if (!txs.length) {
      container.innerHTML = UI.emptyState('📭', 'Belum ada transaksi', 'Mulai catat pemasukan atau pengeluaran Anda', 'Catat Sekarang', 'dashEmptyTxBtn');
      document.getElementById('dashEmptyTxBtn')?.addEventListener('click', () => TransactionPage.openForm('expense'));
      return;
    }
    container.innerHTML = `<div class="tx-list">${txs.map(t => _txItemHTML(t)).join('')}</div>`;
    container.querySelectorAll('.tx-item').forEach((el, i) => {
      el.onclick = () => TransactionPage.openDetail(txs[i].id);
    });
  }

  function _txItemHTML(tx) {
    const cat    = Store.getCategoryById(tx.categoryId);
    const wallet = Store.getWalletById(tx.walletId);
    const sign   = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '-';
    const cls    = tx.type === 'income' ? 'income' : tx.type === 'transfer' ? 'transfer' : 'expense';
    return `
      <div class="tx-item" tabindex="0" role="button">
        <div class="tx-icon" style="background:${cat.color}22; color:${cat.color}">${tx.type === 'transfer' ? '🔄' : cat.icon}</div>
        <div class="tx-info">
          <div class="tx-name">${tx.note || cat.name}</div>
          <div class="tx-meta">${cat.name} · ${wallet?.name || '—'} · ${UI.formatDate(tx.date)}</div>
        </div>
        <div class="tx-amount ${cls}">${sign}${UI.formatRp(tx.amount)}</div>
      </div>`;
  }

  function refresh() { init(); }

  return { init, refresh };
})();
