// =====================================================
// BukuKas Universal — App Entry Point
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize store
  await Store.init();

  // 2. Fetch user and settings
  const user = await Store.getUser();
  if (!user) {
    // If somehow not logged in, but app.php is rendered
    window.location.href = 'login.php';
    return;
  }
  const settings = await Store.getSettings();

  // Apply saved theme
  document.documentElement.setAttribute('data-theme', settings.theme || 'light');

  // 3. Setup sidebar user info
  document.getElementById('sidebarUserName').textContent  = user.name;
  document.getElementById('sidebarUserRole').textContent  = user.role === 'admin' ? '🛡️ Admin' : 'User';
  document.getElementById('sidebarUserInitials').textContent = UI.initials(user.name);
  document.getElementById('navbarUserInitials').textContent  = UI.initials(user.name);

  // 4. Register routes
  Router.register('dashboard',   () => DashboardPage.init());
  Router.register('wallet',      () => WalletPage.init());
  Router.register('transaction', () => TransactionPage.init());
  Router.register('report',      () => ReportPage.init());
  Router.register('category',    () => CategoryPage.init());
  Router.register('settings',    () => SettingsPage.init());
  Router.register('profile',     () => ProfilePage.init());

  // 5. Init router
  Router.init();

  // 6. Sidebar toggle
  const sidebar      = document.getElementById('sidebar');
  const mainWrapper  = document.getElementById('mainWrapper');
  const toggleBtn    = document.getElementById('btnSidebarToggle');
  let _collapsed     = window.innerWidth < 1024;

  function applySidebarState() {
    sidebar.classList.toggle('collapsed', _collapsed);
    mainWrapper.classList.toggle('sidebar-collapsed', _collapsed);
    toggleBtn.innerHTML = _collapsed ? UI.icon('expand', 14) : UI.icon('collapse', 14);
  }

  applySidebarState();

  toggleBtn.addEventListener('click', () => {
    _collapsed = !_collapsed;
    applySidebarState();
  });

  // 7. Mobile overlay close sidebar
  document.getElementById('mobileOverlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('mobileOverlay')?.classList.remove('active');
  });

  // Mobile Menu button open sidebar
  document.getElementById('btnMobileMenu')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('mobileOverlay')?.classList.add('active');
  });

  // 8. Dark mode toggle (navbar)
  document.getElementById('btnDarkMode')?.addEventListener('click', async () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    
    // Save to server
    const s = await Store.getSettings();
    s.theme = next; 
    await Store.saveSettings(s);
    
    document.getElementById('btnDarkMode').innerHTML = UI.icon(next === 'dark' ? 'sun' : 'moon', 20);
  });

  // Update dark mode btn icon based on current theme
  const dm = document.getElementById('btnDarkMode');
  if (dm) dm.innerHTML = UI.icon(settings.theme === 'dark' ? 'sun' : 'moon', 20);

  // 9. FAB button
  document.getElementById('fabBtn')?.addEventListener('click', () => {
    TransactionPage.openForm('expense');
    Router.navigate('transaction');
  });

  // 10. Navbar quick add
  document.getElementById('btnNavAddTx')?.addEventListener('click', () => {
    TransactionPage.openForm('expense');
    if (Router.getCurrent() !== 'transaction') Router.navigate('transaction');
  });

  // 11. Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) UI.closeAllModals();
    });
  });

  // Close modals with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') UI.closeAllModals();
  });

  // 12. Modal save buttons
  document.getElementById('btnSaveWallet')?.addEventListener('click', () => WalletPage.saveForm());
  document.getElementById('btnSaveTx')?.addEventListener('click', () => TransactionPage.saveForm());
  document.getElementById('btnSaveCategory')?.addEventListener('click', () => CategoryPage.saveForm());

  // 13. Currency input
  document.querySelectorAll('.currency-input').forEach(el => UI.attachCurrencyInput(el));

  // 14. Logout btn
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    UI.confirm({
      title: 'Keluar?', desc: 'Anda akan keluar dari sesi ini.', confirmText: 'Keluar', type: 'danger',
      onConfirm: async () => { 
        await fetch('api/auth/logout.php', { method: 'POST' });
        window.location.href = 'login.php'; 
      }
    });
  });

  // 15. Global search
  document.getElementById('globalSearch')?.addEventListener('input', e => {
    const q = e.target.value.trim();
    if (q.length < 2) return;
    Router.navigate('transaction');
    setTimeout(() => {
      const txSearch = document.getElementById('txSearch');
      if (txSearch) { txSearch.value = q; txSearch.dispatchEvent(new Event('input')); }
    }, 100);
  });

  // 16. Responsive — handle resize
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
      // Always collapsed on mobile (sidebar hidden via CSS)
    }
  });
});
