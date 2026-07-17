// =====================================================
// BukuKas Universal — Category Page
// =====================================================

const CategoryPage = (() => {
  let _editId   = null;
  let _activeTab = 'expense';

  function init() {
    _renderTabs();
    _renderList();
    document.getElementById('btnAddCategory')?.addEventListener('click', () => openForm());
  }

  function _renderTabs() {
    const tabs = document.getElementById('catTabs');
    if (!tabs) return;
    tabs.innerHTML = `
      <div class="tab-item ${_activeTab==='expense'?'active':''}" data-tab="expense">📤 Pengeluaran</div>
      <div class="tab-item ${_activeTab==='income' ?'active':''}" data-tab="income">📥 Pemasukan</div>`;
    tabs.querySelectorAll('.tab-item').forEach(t => {
      t.onclick = () => { _activeTab = t.dataset.tab; _renderTabs(); _renderList(); };
    });
  }

  function _renderList() {
    const cats = Store.getCategories().filter(c => c.type === _activeTab);
    const container = document.getElementById('catList');
    if (!container) return;

    if (!cats.length) {
      container.innerHTML = UI.emptyState('🏷️', 'Belum ada kategori', 'Tambahkan kategori untuk mengorganisir transaksi Anda', 'Tambah Kategori', 'catEmptyBtn');
      document.getElementById('catEmptyBtn')?.addEventListener('click', () => openForm());
      return;
    }

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--space-3)">
        ${cats.map(c => _catCardHTML(c)).join('')}
      </div>`;

    container.querySelectorAll('.cat-edit').forEach(btn => {
      btn.onclick = () => openForm(btn.dataset.id);
    });
    container.querySelectorAll('.cat-del').forEach(btn => {
      btn.onclick = () => {
        const cat = Store.getCategories().find(c => c.id === btn.dataset.id);
        UI.confirm({
          title: 'Hapus Kategori?',
          desc: `Kategori "${cat?.name}" akan dihapus. Transaksi terkait tidak akan terhapus.`,
          confirmText: 'Hapus', type: 'danger',
          onConfirm: () => { Store.deleteCategory(btn.dataset.id); UI.toast('Kategori dihapus','success'); _renderList(); }
        });
      };
    });
  }

  function _catCardHTML(c) {
    const txCount = Store.getTransactions().filter(t => t.categoryId === c.id).length;
    return `
      <div class="card" style="display:flex;align-items:center;gap:var(--space-3)">
        <div style="width:48px;height:48px;border-radius:var(--radius-md);background:${c.color}22;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${c.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:var(--text-body)">${c.name}</div>
          <div style="font-size:var(--text-caption);color:var(--color-text-secondary)">${txCount} transaksi</div>
        </div>
        <div style="display:flex;gap:var(--space-2)">
          <button class="btn btn-icon btn-sm cat-edit" data-id="${c.id}" aria-label="Edit">${UI.icon('edit',14)}</button>
          <button class="btn btn-icon btn-sm cat-del" data-id="${c.id}" aria-label="Hapus" style="color:var(--color-danger)">${UI.icon('trash',14)}</button>
        </div>
      </div>`;
  }

  // ---- Form ----
  function openForm(id = null) {
    _editId = id;
    const cat = id ? Store.getCategories().find(c => c.id === id) : null;
    document.getElementById('catModalTitle').textContent = id ? 'Edit Kategori' : 'Tambah Kategori';
    document.getElementById('catName').value  = cat?.name || '';
    document.getElementById('catIcon').value  = cat?.icon || '📦';
    document.getElementById('catColor').value = cat?.color || '#16A34A';
    document.getElementById('catType').value  = cat?.type || _activeTab;
    UI.openModal('catModal');
    document.getElementById('catName').focus();
  }

  function saveForm() {
    const name = document.getElementById('catName').value.trim();
    if (!name) { UI.toast('Nama kategori wajib diisi', 'error'); return; }
    const data = {
      name,
      icon:  document.getElementById('catIcon').value.trim() || '📦',
      color: document.getElementById('catColor').value,
      type:  document.getElementById('catType').value,
    };
    if (_editId) {
      Store.updateCategory(_editId, data);
      UI.toast('Kategori diperbarui ✓', 'success');
    } else {
      Store.addCategory(data);
      UI.toast('Kategori ditambahkan 🎉', 'success');
    }
    UI.closeModal('catModal');
    _renderList();
  }

  return { init, openForm, saveForm };
})();


// =====================================================
// BukuKas Universal — Settings Page
// =====================================================

const SettingsPage = (() => {
  function init() {
    _renderSettings();
    _bindActions();
  }

  function _renderSettings() {
    const s = Store.getSettings();
    document.getElementById('settingDarkMode').checked = s.theme === 'dark';
    document.getElementById('settingCurrency').value   = s.currency || 'IDR';
    document.getElementById('settingLowBalance').value = s.lowBalanceAlert || 100000;
  }

  function _bindActions() {
    document.getElementById('settingDarkMode').onchange = e => {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      const s = Store.getSettings(); s.theme = theme; Store.saveSettings(s);
      UI.toast(`Mode ${theme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'info');
    };

    document.getElementById('settingCurrency').onchange = e => {
      const s = Store.getSettings(); s.currency = e.target.value; Store.saveSettings(s);
    };

    document.getElementById('settingLowBalance').onblur = e => {
      const s = Store.getSettings(); s.lowBalanceAlert = parseInt(e.target.value)||0; Store.saveSettings(s);
    };

    // Backup
    document.getElementById('btnExportJSON')?.addEventListener('click', () => ReportPage.exportJSON());
    document.getElementById('btnExportCSV')?.addEventListener('click',  () => ReportPage.exportCSV());

    document.getElementById('btnImportJSON')?.addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        UI.confirm({
          title: 'Import Backup?',
          desc: 'Semua data saat ini akan digantikan dengan data dari file backup. Aksi ini tidak bisa dibatalkan.',
          confirmText: 'Import', type: 'warning',
          onConfirm: () => {
            try {
              Store.importBackup(ev.target.result);
              UI.toast('Backup berhasil diimport! Halaman akan dimuat ulang.', 'success');
              setTimeout(() => location.reload(), 1500);
            } catch(err) {
              UI.toast('Format file tidak valid: ' + err.message, 'error');
            }
          }
        });
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // Clear data
    document.getElementById('btnClearData')?.addEventListener('click', () => {
      UI.confirm({
        title: 'Hapus Semua Data?',
        desc: 'PERHATIAN: Semua transaksi, dompet, dan kategori akan dihapus permanen. Pastikan sudah backup data terlebih dahulu.',
        confirmText: 'Hapus Semua', type: 'danger',
        onConfirm: () => {
          Store.clearAllData();
          UI.toast('Semua data dihapus. Halaman akan dimuat ulang...', 'info');
          setTimeout(() => location.reload(), 1500);
        }
      });
    });
  }

  return { init };
})();


// =====================================================
// BukuKas Universal — Profile Page
// =====================================================

const ProfilePage = (() => {
  function init() {
    _renderProfile();
    _bindForm();
  }

  function _renderProfile() {
    const user    = Store.getUser();
    const wallets = Store.getWallets();
    const initials = UI.initials(user.name);

    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('profileName').textContent   = user.name;
    document.getElementById('profileEmail').textContent  = user.email;

    // Form
    document.getElementById('profileFormName').value  = user.name;
    document.getElementById('profileFormEmail').value = user.email;
    document.getElementById('profileFormRole').value  = user.role || 'Individu';

    // Wallets summary
    const wContainer = document.getElementById('profileWallets');
    if (wallets.length) {
      wContainer.innerHTML = wallets.map(w => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--color-border)">
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <div style="width:32px;height:32px;border-radius:var(--radius-md);background:${w.gradient};flex-shrink:0"></div>
            <div>
              <div style="font-weight:600;font-size:var(--text-body)">${w.name}</div>
              <div style="font-size:var(--text-caption);color:var(--color-text-secondary)">${UI.walletTypeLabel(w.type)}</div>
            </div>
          </div>
          <div style="font-weight:700;font-variant-numeric:tabular-nums;font-size:var(--text-body)">${UI.formatRp(w.balance||0)}</div>
        </div>`).join('');
    } else {
      wContainer.innerHTML = `<p class="text-secondary fs-small">Belum ada dompet</p>`;
    }

    // Stats
    const txs    = Store.getTransactions();
    const joined = new Date(user.joined).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
    document.getElementById('profileStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-card-label">Total Transaksi</div>
        <div class="stat-card-value" style="font-size:var(--text-h1)">${txs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Total Dompet</div>
        <div class="stat-card-value" style="font-size:var(--text-h1)">${wallets.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">Total Saldo</div>
        <div class="stat-card-value" style="font-size:var(--text-h3)">${UI.formatRp(Store.getTotalBalance())}</div>
      </div>`;

    document.getElementById('profileJoined').textContent = `Bergabung ${joined}`;
  }

  function _bindForm() {
    document.getElementById('btnSaveProfile')?.addEventListener('click', () => {
      const name  = document.getElementById('profileFormName').value.trim();
      const email = document.getElementById('profileFormEmail').value.trim();
      if (!name)  { UI.toast('Nama tidak boleh kosong', 'error'); return; }
      if (!email) { UI.toast('Email tidak boleh kosong', 'error'); return; }
      const user = Store.getUser();
      Store.saveUser({ ...user, name, email, role: document.getElementById('profileFormRole').value });
      UI.toast('Profil berhasil disimpan ✓', 'success');
      // Update sidebar user display
      document.getElementById('sidebarUserName').textContent = name;
      document.getElementById('navbarUserInitials').textContent = UI.initials(name);
      _renderProfile();
    });
  }

  return { init };
})();
