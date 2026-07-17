// =====================================================
// BukuKas Universal — Router
// =====================================================

const Router = (() => {
  const routes = {};
  let _current = null;
  let _breadcrumb = null;

  const PAGE_TITLES = {
    dashboard:   'Dashboard',
    wallet:      'Dompet & Kas',
    transaction: 'Transaksi',
    report:      'Laporan',
    category:    'Kategori',
    settings:    'Pengaturan',
    profile:     'Profil',
  };

  function register(name, initFn) {
    routes[name] = initFn;
  }

  function navigate(page, params = {}) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    const el = document.getElementById(`page-${page}`);
    if (!el) return;
    el.classList.add('active');
    _current = page;

    // Update breadcrumb
    _breadcrumb = document.getElementById('navBreadcrumb');
    if (_breadcrumb) _breadcrumb.textContent = PAGE_TITLES[page] || page;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === page);
    });

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === page);
    });

    // Call page init
    if (routes[page]) routes[page](params);

    // Update hash
    window.location.hash = page;

    // Scroll to top
    const mc = document.querySelector('.main-content');
    if (mc) mc.scrollTop = 0;

    // Close mobile sidebar if open
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('mobileOverlay')?.classList.remove('active');
  }

  function init() {
    // Listen to nav items
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', () => navigate(el.dataset.page));
    });

    // Handle hash change
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash && routes[hash]) navigate(hash);
    });

    // Initial route
    const hash = window.location.hash.slice(1);
    navigate(routes[hash] ? hash : 'dashboard');
  }

  function getCurrent() { return _current; }

  return { register, navigate, init, getCurrent };
})();
