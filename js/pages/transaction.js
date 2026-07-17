// =====================================================
// BukuKas Universal — Transaction Page
// =====================================================

const TransactionPage = (() => {
  let _editId   = null;
  let _formType = 'expense';
  let _filter   = { type: 'all', walletId: '', categoryId: '', dateFrom: '', dateTo: '', search: '' };
  let _page     = 1;
  const PAGE_SIZE = 15;

  function init() {
    _renderFilterBar();
    _renderList();
  }

  // ---- Filter Bar ----
  function _renderFilterBar() {
    const wallets = Store.getWallets();
    const cats    = Store.getCategories();

    document.getElementById('txFilterType').value     = _filter.type;
    document.getElementById('txFilterWallet').innerHTML = `<option value="">Semua Dompet</option>` +
      wallets.map(w => `<option value="${w.id}" ${w.id===_filter.walletId?'selected':''}>${w.name}</option>`).join('');
    document.getElementById('txFilterCat').innerHTML  = `<option value="">Semua Kategori</option>` +
      cats.map(c => `<option value="${c.id}" ${c.id===_filter.categoryId?'selected':''}>${c.icon} ${c.name}</option>`).join('');
    document.getElementById('txFilterFrom').value = _filter.dateFrom;
    document.getElementById('txFilterTo').value   = _filter.dateTo;
    document.getElementById('txSearch').value     = _filter.search;

    ['txFilterType','txFilterWallet','txFilterCat','txFilterFrom','txFilterTo'].forEach(id => {
      document.getElementById(id).onchange = _onFilterChange;
    });
    document.getElementById('txSearch').oninput = _debounce(_onFilterChange, 400);
    document.getElementById('txResetFilter').onclick = _resetFilter;
  }

  function _onFilterChange() {
    _filter.type       = document.getElementById('txFilterType').value;
    _filter.walletId   = document.getElementById('txFilterWallet').value;
    _filter.categoryId = document.getElementById('txFilterCat').value;
    _filter.dateFrom   = document.getElementById('txFilterFrom').value;
    _filter.dateTo     = document.getElementById('txFilterTo').value;
    _filter.search     = document.getElementById('txSearch').value;
    _page = 1;
    _renderList();
  }

  function _resetFilter() {
    _filter = { type:'all', walletId:'', categoryId:'', dateFrom:'', dateTo:'', search:'' };
    _renderFilterBar();
    _page = 1;
    _renderList();
  }

  // ---- Transaction List ----
  function _renderList() {
    const all  = Store.queryTransactions(_filter);
    const total_income  = all.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const total_expense = all.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const net           = total_income - total_expense;

    // Summary row
    document.getElementById('txSummary').innerHTML = `
      <div class="stat-card" style="padding:var(--space-3) var(--space-4)">
        <div class="stat-card-label">Total Pemasukan</div>
        <div style="font-size:var(--text-h3);font-weight:700;color:var(--color-success);font-variant-numeric:tabular-nums">${UI.formatRp(total_income)}</div>
      </div>
      <div class="stat-card" style="padding:var(--space-3) var(--space-4)">
        <div class="stat-card-label">Total Pengeluaran</div>
        <div style="font-size:var(--text-h3);font-weight:700;color:var(--color-danger);font-variant-numeric:tabular-nums">${UI.formatRp(total_expense)}</div>
      </div>
      <div class="stat-card" style="padding:var(--space-3) var(--space-4)">
        <div class="stat-card-label">Selisih Bersih</div>
        <div style="font-size:var(--text-h3);font-weight:700;color:${net>=0?'var(--color-success)':'var(--color-danger)'};font-variant-numeric:tabular-nums">${net>=0?'+':''}${UI.formatRp(net)}</div>
      </div>`;

    // Paginate
    const start  = (_page - 1) * PAGE_SIZE;
    const paged  = all.slice(start, start + PAGE_SIZE);
    const totalPages = Math.ceil(all.length / PAGE_SIZE);

    const container = document.getElementById('txList');
    if (!all.length) {
      container.innerHTML = UI.emptyState('🔍', 'Tidak ada transaksi', 'Coba ubah filter pencarian atau tambah transaksi baru', null, null);
      document.getElementById('txPagination').innerHTML = '';
      document.getElementById('txCount').textContent = '0 transaksi';
      return;
    }

    document.getElementById('txCount').textContent = `${all.length} transaksi`;

    // Group by date
    const groups = {};
    paged.forEach(tx => {
      const key = tx.date || tx.createdAt?.slice(0,10) || 'Lainnya';
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });

    container.innerHTML = Object.entries(groups).map(([date, txs]) => `
      <div class="tx-date-group"><div class="tx-date-label">${UI.formatDate(date, true)}</div></div>
      <div class="tx-list">
        ${txs.map(tx => _txRowHTML(tx)).join('')}
      </div>`).join('');

    container.querySelectorAll('.tx-item').forEach(el => {
      el.onclick = () => openDetail(el.dataset.txid);
    });

    _renderPagination(totalPages);
  }

  function _txRowHTML(tx) {
    const cat    = Store.getCategoryById(tx.categoryId);
    const wallet = Store.getWalletById(tx.walletId);
    const sign   = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↕' : '-';
    const cls    = tx.type === 'income' ? 'income' : tx.type === 'transfer' ? 'transfer' : 'expense';
    return `
      <div class="tx-item" data-txid="${tx.id}" role="button" tabindex="0">
        <div class="tx-icon" style="background:${cat.color}22;color:${cat.color}">${tx.type==='transfer'?'🔄':cat.icon}</div>
        <div class="tx-info">
          <div class="tx-name">${tx.note || cat.name}</div>
          <div class="tx-meta">${cat.name} · ${wallet?.name||'—'}</div>
        </div>
        <div style="text-align:right">
          <div class="tx-amount ${cls}">${sign}${UI.formatRp(tx.amount)}</div>
          <div style="font-size:10px;color:var(--color-text-secondary)">${UI.formatDate(tx.date)}</div>
        </div>
      </div>`;
  }

  function _renderPagination(totalPages) {
    const pg = document.getElementById('txPagination');
    if (totalPages <= 1) { pg.innerHTML = ''; return; }
    let html = `<button ${_page===1?'disabled':''} id="pgPrev">${UI.icon('chevronLeft')}</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - _page) <= 1) {
        html += `<button class="${i===_page?'active':''}" data-pg="${i}">${i}</button>`;
      } else if (Math.abs(i - _page) === 2) {
        html += `<button disabled>…</button>`;
      }
    }
    html += `<button ${_page===totalPages?'disabled':''} id="pgNext">${UI.icon('chevronRight')}</button>`;
    pg.innerHTML = html;
    pg.querySelectorAll('[data-pg]').forEach(btn => {
      btn.onclick = () => { _page = parseInt(btn.dataset.pg); _renderList(); };
    });
    pg.querySelector('#pgPrev')?.addEventListener('click', () => { if (_page > 1) { _page--; _renderList(); } });
    pg.querySelector('#pgNext')?.addEventListener('click', () => { if (_page < totalPages) { _page++; _renderList(); } });
  }

  // ---- Form ----
  function openForm(type = 'expense', id = null) {
    _editId   = id;
    _formType = type;
    const tx  = id ? Store.getTransactions().find(t => t.id === id) : null;
    if (tx) _formType = tx.type;

    _renderFormTypeTabs();
    _populateForm(tx);
    UI.openModal('txModal');
    document.getElementById('txAmount').focus();
  }

  function _renderFormTypeTabs() {
    const tabs = document.getElementById('txFormTabs');
    const types = [
      { key:'income',   label:'Pemasukan',   icon:'📥' },
      { key:'expense',  label:'Pengeluaran',  icon:'📤' },
      { key:'transfer', label:'Transfer',     icon:'🔄' },
    ];
    tabs.innerHTML = types.map(t => `
      <div class="tab-item ${t.key===_formType?'active':''}" data-type="${t.key}">${t.icon} ${t.label}</div>
    `).join('');
    tabs.querySelectorAll('.tab-item').forEach(el => {
      el.onclick = () => {
        _formType = el.dataset.type;
        tabs.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.type === _formType));
        _toggleTransferField();
        _populateCategorySelect();
      };
    });
  }

  function _toggleTransferField() {
    const row = document.getElementById('txToWalletRow');
    const catRow = document.getElementById('txCategoryRow');
    if (row) row.style.display = _formType === 'transfer' ? 'flex' : 'none';
    if (catRow) catRow.style.display = _formType === 'transfer' ? 'none' : 'block';
  }

  function _populateForm(tx = null) {
    const wallets = Store.getWallets();

    // Wallet select
    const walletSel   = document.getElementById('txWallet');
    walletSel.innerHTML = wallets.map(w => `<option value="${w.id}" ${tx?.walletId===w.id?'selected':''}>${w.name}</option>`).join('');

    // To Wallet (transfer)
    const toWalletSel = document.getElementById('txToWallet');
    toWalletSel.innerHTML = wallets.map(w => `<option value="${w.id}" ${tx?.toWalletId===w.id?'selected':''}>${w.name}</option>`).join('');

    // Category
    _populateCategorySelect(tx?.categoryId);

    // Fields
    const amtEl = document.getElementById('txAmount');
    UI.attachCurrencyInput(amtEl);
    if (tx) UI.setCurrencyValue(amtEl, tx.amount);
    else amtEl.value = '';

    document.getElementById('txNote').value = tx?.note || '';
    document.getElementById('txDate').value = tx?.date || UI.getTodayStr();

    _toggleTransferField();
    document.getElementById('txModalTitle').textContent = tx ? 'Edit Transaksi' : 'Tambah Transaksi';
  }

  function _populateCategorySelect(selected) {
    const cats = Store.getCategories().filter(c => c.type === _formType || _formType === 'transfer');
    const sel  = document.getElementById('txCategory');
    sel.innerHTML = (cats.length ? cats : Store.getCategories())
      .map(c => `<option value="${c.id}" ${c.id===selected?'selected':''}>${c.icon} ${c.name}</option>`).join('');
  }

  function saveForm() {
    const amount = UI.getCurrencyValue(document.getElementById('txAmount'));
    if (!amount) { UI.toast('Nominal tidak boleh kosong atau 0', 'error'); return; }

    const walletId = document.getElementById('txWallet').value;
    if (!walletId) { UI.toast('Pilih dompet terlebih dahulu', 'error'); return; }

    if (_formType === 'transfer') {
      const toWalletId = document.getElementById('txToWallet').value;
      if (toWalletId === walletId) { UI.toast('Dompet asal dan tujuan tidak boleh sama', 'error'); return; }
    }

    const data = {
      type:        _formType,
      walletId,
      toWalletId:  _formType === 'transfer' ? document.getElementById('txToWallet').value : null,
      categoryId:  _formType !== 'transfer' ? document.getElementById('txCategory').value : null,
      amount,
      note:        document.getElementById('txNote').value.trim(),
      date:        document.getElementById('txDate').value || UI.getTodayStr(),
    };

    if (_editId) {
      Store.updateTransaction(_editId, data);
      UI.toast('Transaksi diperbarui ✓', 'success');
    } else {
      Store.addTransaction(data);
      UI.toast('Transaksi berhasil dicatat 🎉', 'success');
    }

    UI.closeModal('txModal');
    _renderList();
    DashboardPage.refresh();
  }

  // ---- Detail ----
  function openDetail(id) {
    const tx     = Store.getTransactions().find(t => t.id === id);
    if (!tx) return;
    const cat    = Store.getCategoryById(tx.categoryId);
    const wallet = Store.getWalletById(tx.walletId);
    const toWal  = tx.toWalletId ? Store.getWalletById(tx.toWalletId) : null;
    const sign   = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↕' : '-';
    const clr    = tx.type === 'income' ? 'var(--color-success)' : tx.type === 'transfer' ? 'var(--color-info)' : 'var(--color-danger)';

    document.getElementById('txDetailBody').innerHTML = `
      <div style="text-align:center;padding:var(--space-4) 0">
        <div style="font-size:48px;margin-bottom:var(--space-3)">${tx.type==='transfer'?'🔄':cat.icon}</div>
        <div style="font-size:28px;font-weight:700;color:${clr};font-variant-numeric:tabular-nums">${sign}${UI.formatRp(tx.amount)}</div>
        <div style="font-size:var(--text-small);color:var(--color-text-secondary);margin-top:4px">${UI.formatDate(tx.date, true)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--space-3)">
        ${_detailRow('Jenis', UI.txTypeBadge(tx.type))}
        ${_detailRow('Dompet', wallet?.name || '—')}
        ${toWal ? _detailRow('Ke Dompet', toWal.name) : ''}
        ${tx.type !== 'transfer' ? _detailRow('Kategori', `${cat.icon} ${cat.name}`) : ''}
        ${tx.note ? _detailRow('Catatan', tx.note) : ''}
        ${_detailRow('Dicatat', UI.formatDate(tx.createdAt, true))}
      </div>
      <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4)">
        <button class="btn btn-secondary" style="flex:1" id="txDetailEdit">${UI.icon('edit',14)} Edit</button>
        <button class="btn btn-danger"    style="flex:1" id="txDetailDel">${UI.icon('trash',14)} Hapus</button>
      </div>`;

    document.getElementById('txDetailEdit').onclick = () => {
      UI.closeModal('txDetailModal');
      openForm(tx.type, tx.id);
    };
    document.getElementById('txDetailDel').onclick = () => {
      UI.closeModal('txDetailModal');
      UI.confirm({
        title: 'Hapus Transaksi?', desc: 'Transaksi ini akan dihapus permanen dan saldo dompet akan disesuaikan.',
        confirmText: 'Hapus', type: 'danger',
        onConfirm: () => {
          Store.deleteTransaction(id);
          UI.toast('Transaksi dihapus', 'success');
          _renderList();
          DashboardPage.refresh();
        }
      });
    };

    UI.openModal('txDetailModal');
  }

  function _detailRow(label, value) {
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0;border-bottom:1px solid var(--color-border)">
      <span style="font-size:var(--text-small);color:var(--color-text-secondary)">${label}</span>
      <span style="font-size:var(--text-small);font-weight:600">${value}</span>
    </div>`;
  }

  function _debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  return { init, openForm, openDetail, saveForm };
})();
