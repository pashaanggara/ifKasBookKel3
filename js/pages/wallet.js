// =====================================================
// BukuKas Universal — Wallet Page
// =====================================================

const WalletPage = (() => {
  let _editId = null;

  function init() {
    _renderWallets();
    _bindAddBtn();
  }

  function _renderWallets() {
    const wallets = Store.getWallets();
    const container = document.getElementById('walletGrid');
    if (!wallets.length) {
      container.innerHTML = UI.emptyState('👛', 'Belum ada dompet', 'Tambahkan dompet pertama Anda untuk mulai mencatat keuangan', 'Tambah Dompet', 'walletEmptyBtn');
      document.getElementById('walletEmptyBtn')?.addEventListener('click', () => openForm());
      return;
    }

    const total = Store.getTotalBalance();
    container.innerHTML = `
      <div style="margin-bottom:var(--space-4)">
        <div style="font-size:var(--text-small);color:var(--color-text-secondary);font-weight:600;margin-bottom:4px">Total Saldo Semua Dompet</div>
        <div style="font-size:var(--text-display);font-weight:700;font-variant-numeric:tabular-nums">${UI.formatRp(total)}</div>
      </div>
      <div class="grid grid-3" id="walletCardGrid">
        ${wallets.map(w => _walletCardHTML(w)).join('')}
        <div class="wallet-add-card" id="walletAddCard" role="button" tabindex="0">
          <div style="font-size:36px;margin-bottom:var(--space-2)">➕</div>
          <div style="font-weight:600">Tambah Dompet</div>
        </div>
      </div>`;

    container.querySelectorAll('.wallet-card-actions .btn-edit').forEach((btn, i) => {
      btn.onclick = e => { e.stopPropagation(); openForm(wallets[i].id); };
    });
    container.querySelectorAll('.wallet-card-actions .btn-del').forEach((btn, i) => {
      btn.onclick = e => {
        e.stopPropagation();
        UI.confirm({
          title: 'Hapus Dompet?',
          desc: `Dompet "${wallets[i].name}" dan semua transaksinya akan dihapus permanen.`,
          confirmText: 'Hapus', type: 'danger',
          onConfirm: () => _deleteWallet(wallets[i].id)
        });
      };
    });

    document.getElementById('walletAddCard').onclick = () => openForm();
    document.getElementById('walletAddCard').onkeydown = e => { if (e.key==='Enter') openForm(); };
  }

  function _walletCardHTML(w) {
    const typeIcon = { cash:'💵', bank:'🏦', ewallet:'📱', savings:'🏺', other:'💼' }[w.type] || '💼';
    const txCount  = Store.getTransactions().filter(t => t.walletId === w.id || t.toWalletId === w.id).length;
    return `
      <div class="wallet-card" style="background:${w.gradient}; min-height:160px">
        <div class="wallet-card-header">
          <div>
            <div class="wallet-card-name">${w.name}</div>
            <span class="wallet-card-type">${typeIcon} ${UI.walletTypeLabel(w.type)}</span>
          </div>
          <div class="wallet-card-actions" style="display:flex;gap:6px;z-index:2;position:relative">
            <button class="btn-edit" style="background:rgba(255,255,255,0.2);border:none;border-radius:8px;padding:4px 8px;color:#fff;cursor:pointer;font-size:13px" aria-label="Edit">${UI.icon('edit',14)}</button>
            <button class="btn-del" style="background:rgba(239,68,68,0.35);border:none;border-radius:8px;padding:4px 8px;color:#fff;cursor:pointer;font-size:13px" aria-label="Hapus">${UI.icon('trash',14)}</button>
          </div>
        </div>
        <div class="wallet-card-balance">
          <div class="wallet-card-balance-label">Saldo</div>
          <div class="wallet-card-balance-value">${UI.formatRp(w.balance || 0)}</div>
          <div style="font-size:11px;opacity:0.7;margin-top:4px">${txCount} transaksi</div>
        </div>
      </div>`;
  }

  function _bindAddBtn() {
    document.getElementById('btnAddWallet')?.addEventListener('click', () => openForm());
  }

  // ---- Form ----
  function openForm(id = null) {
    _editId = id;
    const wallet = id ? Store.getWalletById(id) : null;
    const title  = id ? 'Edit Dompet' : 'Tambah Dompet';

    document.getElementById('walletModalTitle').textContent = title;

    // Populate form
    document.getElementById('walletName').value        = wallet?.name || '';
    document.getElementById('walletType').value        = wallet?.type || 'cash';
    document.getElementById('walletDesc').value        = wallet?.description || '';

    const balEl = document.getElementById('walletBalance');
    if (wallet) {
      UI.setCurrencyValue(balEl, wallet.initialBalance || 0);
    } else {
      balEl.value = '';
    }

    // Gradient picker
    _renderGradientPicker(wallet?.gradient);

    UI.openModal('walletModal');
    document.getElementById('walletName').focus();
  }

  function _renderGradientPicker(selected) {
    const container = document.getElementById('walletGradientPicker');
    container.innerHTML = Store.WALLET_GRADIENTS.map((g, i) => `
      <div class="grad-option ${g === selected ? 'selected' : ''}" data-grad="${g}" id="grad-${i}"
        style="width:32px;height:32px;border-radius:8px;background:${g};cursor:pointer;border:3px solid ${g === selected ? '#fff' : 'transparent'};box-shadow:${g === selected ? '0 0 0 2px var(--color-primary)' : 'none'};transition:all 0.15s"
        role="radio" aria-checked="${g === selected}" aria-label="Warna ${i+1}" tabindex="0">
      </div>`).join('');

    container.querySelectorAll('.grad-option').forEach(el => {
      el.onclick = () => {
        container.querySelectorAll('.grad-option').forEach(o => {
          o.style.border = '3px solid transparent'; o.style.boxShadow = 'none'; o.setAttribute('aria-checked','false');
        });
        el.style.border = '3px solid #fff'; el.style.boxShadow = '0 0 0 2px var(--color-primary)'; el.setAttribute('aria-checked','true');
      };
    });
  }

  function _getSelectedGradient() {
    return document.querySelector('#walletGradientPicker .grad-option[aria-checked="true"]')?.dataset.grad || Store.WALLET_GRADIENTS[0];
  }

  function saveForm() {
    const name = document.getElementById('walletName').value.trim();
    if (!name) { UI.toast('Nama dompet wajib diisi', 'error'); return; }

    const data = {
      name,
      type:           document.getElementById('walletType').value,
      description:    document.getElementById('walletDesc').value.trim(),
      initialBalance: UI.getCurrencyValue(document.getElementById('walletBalance')),
      gradient:       _getSelectedGradient(),
    };

    if (_editId) {
      data.balance = (Store.getWalletById(_editId).balance || 0) + (data.initialBalance - (Store.getWalletById(_editId).initialBalance || 0));
      Store.updateWallet(_editId, data);
      UI.toast('Dompet berhasil diperbarui', 'success');
    } else {
      data.balance = data.initialBalance;
      Store.addWallet(data);
      UI.toast('Dompet berhasil ditambahkan 🎉', 'success');
    }

    UI.closeModal('walletModal');
    _renderWallets();
    DashboardPage.refresh();
  }

  function _deleteWallet(id) {
    Store.deleteWallet(id);
    UI.toast('Dompet dihapus', 'success');
    _renderWallets();
    DashboardPage.refresh();
  }

  return { init, openForm, saveForm };
})();
