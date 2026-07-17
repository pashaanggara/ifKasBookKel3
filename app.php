<?php
// BukuKas Universal — Main App Shell (Requires Login)
// This file is served by index.php after session validation
require_once __DIR__ . '/config/app.php';
if (empty($_SESSION['user_id'])) { header('Location: login.php'); exit; }

$db   = getDB();
$stmt = $db->prepare('SELECT id, name, role, is_active FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();
if (!$user || !$user['is_active']) { session_destroy(); header('Location: login.php'); exit; }
?>
<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="BukuKas Universal — Aplikasi pencatatan keuangan pribadi, UMKM, dan organisasi." />
  <title>BukuKas Universal</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>" />
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <?php if ($user['role'] === 'admin'): ?>
  <style>
    .admin-banner {
      background: linear-gradient(90deg,#7C3AED,#8B5CF6);
      color:#fff;text-align:center;padding:6px;font-size:12px;font-weight:600;
    }
    .admin-banner a { color:#E9D5FF;text-decoration:underline;margin-left:8px; }
  </style>
  <?php endif; ?>
</head>
<body>
<?php if ($user['role'] === 'admin'): ?>
<div class="admin-banner">
  🛡️ Anda login sebagai Administrator
  <a href="admin/">Buka Admin Panel</a>
</div>
<?php endif; ?>

  <!-- [ALL THE HTML FROM index.html GOES HERE — same structure] -->
  <!-- Toast Container -->
  <div class="toast-container" id="toastContainer" aria-live="polite" aria-label="Notifikasi"></div>

  <!-- Confirm Modal -->
  <div class="modal-overlay" id="confirmModal" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
    <div class="modal" style="max-width:380px">
      <div class="modal-body" style="text-align:center">
        <div class="confirm-icon" id="confirmIcon"></div>
        <div class="confirm-text"><h3 id="confirmTitle">Konfirmasi</h3><p id="confirmDesc"></p></div>
      </div>
      <div class="modal-footer" style="justify-content:center;gap:var(--space-3)">
        <button class="btn btn-ghost" onclick="UI.closeModal('confirmModal')">Batal</button>
        <button class="btn btn-danger" id="confirmBtn">Hapus</button>
      </div>
    </div>
  </div>

  <!-- Transaction Modal -->
  <div class="modal-overlay" id="txModal" role="dialog" aria-modal="true" aria-labelledby="txModalTitle">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title" id="txModalTitle">Tambah Transaksi</h2>
        <button class="modal-close" onclick="UI.closeModal('txModal')" aria-label="Tutup"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="modal-body">
        <div class="tabs" id="txFormTabs"></div>
        <div class="form-group"><label class="form-label" for="txAmount">Nominal</label><div class="input-prefix"><span class="prefix">Rp</span><input type="text" id="txAmount" class="form-control form-control-currency currency-input" inputmode="numeric" placeholder="0" autocomplete="off" /></div></div>
        <div class="form-group"><label class="form-label" for="txDate">Tanggal</label><input type="date" id="txDate" class="form-control" /></div>
        <div class="form-group"><label class="form-label" for="txWallet">Dompet</label><select id="txWallet" class="form-control"></select></div>
        <div class="form-group" id="txToWalletRow" style="display:none"><label class="form-label" for="txToWallet">Ke Dompet</label><select id="txToWallet" class="form-control"></select></div>
        <div class="form-group" id="txCategoryRow"><label class="form-label" for="txCategory">Kategori</label><select id="txCategory" class="form-control"></select></div>
        <div class="form-group"><label class="form-label" for="txNote">Catatan (opsional)</label><input type="text" id="txNote" class="form-control" placeholder="Mis. makan siang..." autocomplete="off" /></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="UI.closeModal('txModal')">Batal</button>
        <button class="btn btn-primary btn-lg" id="btnSaveTx">💾 Simpan</button>
      </div>
    </div>
  </div>

  <!-- Transaction Detail Modal -->
  <div class="modal-overlay" id="txDetailModal" role="dialog" aria-modal="true">
    <div class="modal" style="max-width:400px">
      <div class="modal-header"><h2 class="modal-title" id="txDetailTitle">Detail Transaksi</h2><button class="modal-close" onclick="UI.closeModal('txDetailModal')" aria-label="Tutup"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="modal-body" id="txDetailBody"></div>
    </div>
  </div>

  <!-- Wallet Modal -->
  <div class="modal-overlay" id="walletModal" role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header"><h2 class="modal-title" id="walletModalTitle">Tambah Dompet</h2><button class="modal-close" onclick="UI.closeModal('walletModal')" aria-label="Tutup"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label" for="walletName">Nama Dompet</label><input type="text" id="walletName" class="form-control" placeholder="Mis. Kas Utama, BCA..." autocomplete="off" /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label" for="walletType">Jenis</label><select id="walletType" class="form-control"><option value="cash">💵 Tunai</option><option value="bank">🏦 Bank</option><option value="ewallet">📱 E-Wallet</option><option value="savings">🏺 Tabungan</option><option value="other">💼 Lainnya</option></select></div>
          <div class="form-group"><label class="form-label" for="walletBalance">Saldo Awal</label><div class="input-prefix"><span class="prefix">Rp</span><input type="text" id="walletBalance" class="form-control form-control-currency currency-input" inputmode="numeric" placeholder="0" autocomplete="off" /></div></div>
        </div>
        <div class="form-group"><label class="form-label" for="walletDesc">Deskripsi (opsional)</label><input type="text" id="walletDesc" class="form-control" placeholder="Keterangan singkat..." autocomplete="off" /></div>
        <div class="form-group"><label class="form-label">Warna Kartu</label><div id="walletGradientPicker" style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-top:4px"></div></div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="UI.closeModal('walletModal')">Batal</button><button class="btn btn-primary btn-lg" id="btnSaveWallet">💾 Simpan</button></div>
    </div>
  </div>

  <!-- Category Modal -->
  <div class="modal-overlay" id="catModal" role="dialog" aria-modal="true">
    <div class="modal" style="max-width:400px">
      <div class="modal-header"><h2 class="modal-title" id="catModalTitle">Tambah Kategori</h2><button class="modal-close" onclick="UI.closeModal('catModal')" aria-label="Tutup"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label" for="catIcon">Emoji Ikon</label><input type="text" id="catIcon" class="form-control" placeholder="📦" maxlength="4" style="font-size:24px;text-align:center" /></div>
          <div class="form-group"><label class="form-label" for="catColor">Warna</label><input type="color" id="catColor" class="form-control" value="#16A34A" style="padding:4px;height:44px;cursor:pointer" /></div>
        </div>
        <div class="form-group"><label class="form-label" for="catName">Nama Kategori</label><input type="text" id="catName" class="form-control" placeholder="Nama kategori..." autocomplete="off" /></div>
        <div class="form-group"><label class="form-label" for="catType">Jenis</label><select id="catType" class="form-control"><option value="expense">📤 Pengeluaran</option><option value="income">📥 Pemasukan</option></select></div>
      </div>
      <div class="modal-footer"><button class="btn btn-ghost" onclick="UI.closeModal('catModal')">Batal</button><button class="btn btn-primary btn-lg" id="btnSaveCategory">💾 Simpan</button></div>
    </div>
  </div>

  <!-- APP SHELL -->
  <div id="app">
    <div class="sidebar-overlay" id="mobileOverlay"></div>
    <aside class="sidebar" id="sidebar" role="navigation">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M16 11a1 1 0 100 2 1 1 0 000-2z"/><path d="M2 10h20"/><path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2"/></svg></div>
        <span class="sidebar-logo-text">BukuKas</span>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-group"><div class="nav-group-label">Utama</div>
          <div class="nav-item" data-page="dashboard"><span class="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span><span class="nav-label">Dashboard</span></div>
          <div class="nav-item" data-page="wallet"><span class="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M16 11a1 1 0 100 2 1 1 0 000-2z"/><path d="M2 10h20"/><path d="M6 6V4a1 1 0 011-1h10a1 1 0 011 1v2"/></svg></span><span class="nav-label">Dompet & Kas</span></div>
          <div class="nav-item" data-page="transaction"><span class="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 1l4 4-4 4M3 12V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 12v3a4 4 0 01-4 4H3"/></svg></span><span class="nav-label">Transaksi</span></div>
          <div class="nav-item" data-page="category"><span class="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span><span class="nav-label">Kategori</span></div>
        </div>
        <div class="nav-group"><div class="nav-group-label">Analitik</div>
          <div class="nav-item" data-page="report"><span class="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span><span class="nav-label">Laporan</span></div>
        </div>
        <div class="nav-group"><div class="nav-group-label">Sistem</div>
          <div class="nav-item" data-page="settings"><span class="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14M12 2v2M12 20v2M2 12H4M20 12h2"/></svg></span><span class="nav-label">Pengaturan</span></div>
          <?php if ($user['role'] === 'admin'): ?>
          <div class="nav-item" onclick="window.open('admin/','_blank')"><span class="nav-icon">🛡️</span><span class="nav-label">Admin Panel</span></div>
          <?php endif; ?>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user" data-page="profile">
          <div class="avatar" id="sidebarUserInitials"><?= strtoupper(substr($user['name'],0,1)) ?></div>
          <div class="sidebar-user-info"><div class="sidebar-user-name" id="sidebarUserName"><?= htmlspecialchars($user['name']) ?></div><div class="sidebar-user-role" id="sidebarUserRole"><?= $user['role'] === 'admin' ? '🛡️ Admin' : 'User' ?></div></div>
        </div>
        <button class="btn-logout" id="btnLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span class="nav-label">Keluar</span>
        </button>
      </div>
      <button class="btn-sidebar-toggle" id="btnSidebarToggle"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    </aside>

    <div class="main-wrapper" id="mainWrapper">
      <header class="navbar">
        <button class="icon-btn mobile-menu-btn" id="btnMobileMenu" aria-label="Menu"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
        <div class="navbar-breadcrumb" id="navBreadcrumb">Dashboard</div>
        <div class="navbar-search"><span class="navbar-search-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><input type="search" id="globalSearch" placeholder="Cari transaksi..." autocomplete="off" /></div>
        <div class="navbar-actions">
          <button class="btn btn-primary btn-sm" id="btnNavAddTx"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Tambah</span></button>
          <button class="icon-btn" id="btnDarkMode"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button>
          <div class="avatar" id="navbarUserInitials" data-page="profile" style="cursor:pointer"><?= strtoupper(substr($user['name'],0,1)) ?></div>
        </div>
      </header>

      <main class="main-content" id="mainContent" role="main">
        <!-- Pages are loaded dynamically by router — same as index.html -->
        <!-- All page sections below (dashboard, wallet, transaction, report, category, settings, profile) -->

        <section class="page" id="page-dashboard">
          <div class="dashboard-hero">
            <div class="hero-greeting" id="dashGreeting">Selamat Pagi! 👋</div>
            <div class="hero-balance-label">Total Saldo</div>
            <div style="display:flex;align-items:center;gap:var(--space-3)">
              <div class="hero-balance-value" id="dashBalance">Rp 0</div>
              <button class="icon-btn" id="btnToggleBalance" style="color:rgba(255,255,255,0.8);width:32px;height:32px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            </div>
            <div class="hero-meta" id="dashMeta"></div>
            <div id="dashMonthLabel" style="font-size:11px;opacity:0.7;position:relative;z-index:1;margin-top:2px"></div>
            <div class="hero-actions">
              <button class="hero-action-btn" onclick="TransactionPage.openForm('income'); Router.navigate('transaction')"><span>📥</span> Pemasukan</button>
              <button class="hero-action-btn" onclick="TransactionPage.openForm('expense'); Router.navigate('transaction')"><span>📤</span> Pengeluaran</button>
              <button class="hero-action-btn" onclick="TransactionPage.openForm('transfer'); Router.navigate('transaction')"><span>🔄</span> Transfer</button>
            </div>
          </div>
          <div class="grid grid-3" style="margin-bottom:var(--space-6)"><div class="stat-card" id="statIncome"></div><div class="stat-card" id="statExpense"></div><div class="stat-card" id="statNet"></div></div>
          <div id="dashQuickActions" class="quick-actions"></div>
          <div class="grid grid-2" style="margin-bottom:var(--space-6)">
            <div class="card"><div class="card-title">Tren 7 Hari Terakhir</div><div class="chart-container" style="height:220px"><canvas id="dashChart"></canvas></div></div>
            <div class="card"><div class="card-title">Pengeluaran Bulan Ini</div><div class="chart-container" style="height:220px"><canvas id="dashDonut"></canvas></div></div>
          </div>
          <div class="card" style="margin-bottom:var(--space-6)"><div class="card-title">Dompet & Kas<button class="btn btn-secondary btn-sm" onclick="Router.navigate('wallet')">Lihat Semua</button></div><div id="dashWallets"></div></div>
          <div class="card"><div class="card-title">Transaksi Terbaru<button class="btn btn-secondary btn-sm" onclick="Router.navigate('transaction')">Lihat Semua</button></div><div id="dashRecentTx"></div></div>
        </section>

        <section class="page" id="page-wallet">
          <div class="page-header"><div><h1 class="page-title">Dompet & Kas</h1><p class="page-subtitle">Kelola semua rekening dan dompet digital Anda</p></div><button class="btn btn-primary" id="btnAddWallet"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Tambah Dompet</button></div>
          <div id="walletGrid"></div>
        </section>

        <section class="page" id="page-transaction">
          <div class="page-header"><div><h1 class="page-title">Transaksi</h1><p class="page-subtitle" id="txCount">— transaksi</p></div><button class="btn btn-primary" onclick="TransactionPage.openForm('expense')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Tambah</button></div>
          <div class="filter-bar">
            <select id="txFilterType" class="form-control" style="width:140px"><option value="all">Semua Jenis</option><option value="income">📥 Pemasukan</option><option value="expense">📤 Pengeluaran</option><option value="transfer">🔄 Transfer</option></select>
            <select id="txFilterWallet" class="form-control" style="width:150px"></select>
            <select id="txFilterCat"    class="form-control" style="width:160px"></select>
            <input type="date" id="txFilterFrom" class="form-control" style="width:150px" />
            <input type="date" id="txFilterTo"   class="form-control" style="width:150px" />
            <div class="navbar-search" style="flex:1;min-width:160px"><span class="navbar-search-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><input type="search" id="txSearch" placeholder="Cari catatan..." autocomplete="off" /></div>
            <button class="btn btn-ghost btn-sm" id="txResetFilter">Reset</button>
          </div>
          <div class="grid grid-3" style="margin-bottom:var(--space-4)" id="txSummary"></div>
          <div class="card" style="padding:0"><div id="txList" style="padding:var(--space-2) 0"></div></div>
          <div class="pagination" id="txPagination"></div>
        </section>

        <section class="page" id="page-report">
          <div class="page-header"><div><h1 class="page-title">Laporan Keuangan</h1><p class="page-subtitle">Analisis pemasukan dan pengeluaran</p></div><div style="display:flex;gap:var(--space-2);flex-wrap:wrap"><button class="btn btn-secondary btn-sm" id="btnRptThisMonth">Bulan Ini</button><button class="btn btn-secondary btn-sm" id="btnRptLastMonth">Bulan Lalu</button><button class="btn btn-secondary btn-sm" id="btnRptThisYear">Tahun Ini</button><button class="btn btn-primary btn-sm" onclick="ReportPage.exportCSV()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export CSV</button></div></div>
          <div class="filter-bar" style="margin-bottom:var(--space-4)">
            <div class="form-group" style="flex-direction:row;align-items:center;gap:var(--space-2)"><label class="form-label" style="white-space:nowrap">Dari:</label><input type="date" id="rptFrom" class="form-control" style="width:150px" /></div>
            <div class="form-group" style="flex-direction:row;align-items:center;gap:var(--space-2)"><label class="form-label" style="white-space:nowrap">Sampai:</label><input type="date" id="rptTo" class="form-control" style="width:150px" /></div>
            <select id="rptWallet" class="form-control" style="width:160px"></select>
            <select id="rptType" class="form-control" style="width:160px"><option value="all">Semua Jenis</option><option value="income">📥 Pemasukan</option><option value="expense">📤 Pengeluaran</option></select>
          </div>
          <div class="grid grid-3" style="margin-bottom:var(--space-6)">
            <div class="stat-card"><div class="stat-card-label">Total Pemasukan</div><div class="stat-card-value text-success" id="rptIncome" style="font-size:var(--text-h2)">Rp 0</div></div>
            <div class="stat-card"><div class="stat-card-label">Total Pengeluaran</div><div class="stat-card-value text-danger" id="rptExpense" style="font-size:var(--text-h2)">Rp 0</div></div>
            <div class="stat-card"><div class="stat-card-label">Selisih Bersih</div><div class="stat-card-value" id="rptNet" style="font-size:var(--text-h2)">Rp 0</div><div id="rptTxCount" class="stat-card-label" style="margin-top:4px"></div></div>
          </div>
          <div class="grid grid-2" style="margin-bottom:var(--space-6)">
            <div class="card"><div class="card-title">Pengeluaran per Kategori</div><div class="chart-container" style="height:260px"><canvas id="rptBarChart"></canvas></div></div>
            <div class="card"><div class="card-title">Tren Harian</div><div class="chart-container" style="height:260px"><canvas id="rptLineChart"></canvas></div></div>
          </div>
          <div class="card" style="padding:0"><div style="padding:var(--space-4) var(--space-4) 0;font-size:var(--text-h3);font-weight:600">Detail Transaksi</div><div class="table-wrapper" style="margin-top:var(--space-3);border:none;border-radius:0"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Kategori</th><th class="text-right">Nominal</th></tr></thead><tbody id="rptTableBody"></tbody></table></div></div>
        </section>

        <section class="page" id="page-category">
          <div class="page-header"><div><h1 class="page-title">Kategori</h1><p class="page-subtitle">Kelola kategori pemasukan dan pengeluaran</p></div><button class="btn btn-primary" id="btnAddCategory"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Tambah Kategori</button></div>
          <div class="tabs" id="catTabs" style="margin-bottom:var(--space-4)"></div>
          <div id="catList"></div>
        </section>

        <section class="page" id="page-settings">
          <div class="page-header"><div><h1 class="page-title">Pengaturan</h1><p class="page-subtitle">Konfigurasi tampilan dan data aplikasi</p></div></div>
          <div class="settings-section"><div class="settings-section-title">Tampilan</div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label">🌙 Mode Gelap</div><div class="settings-item-desc">Aktifkan tampilan gelap</div></div><label class="switch"><input type="checkbox" id="settingDarkMode" /><span class="switch-slider"></span></label></div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label">💱 Mata Uang</div></div><select id="settingCurrency" class="form-control" style="width:120px"><option value="IDR">IDR (Rp)</option><option value="USD">USD ($)</option><option value="SGD">SGD (S$)</option></select></div>
          </div>
          <div class="settings-section"><div class="settings-section-title">Notifikasi</div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label">⚠️ Peringatan Saldo Rendah</div></div><div class="input-prefix" style="width:160px"><span class="prefix">Rp</span><input type="number" id="settingLowBalance" class="form-control" style="padding-left:36px;text-align:right" /></div></div>
          </div>
          <div class="settings-section"><div class="settings-section-title">Data & Backup</div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label">📤 Export Backup JSON</div></div><button class="btn btn-secondary btn-sm" id="btnExportJSON">Download</button></div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label">📥 Import Backup JSON</div></div><button class="btn btn-secondary btn-sm" id="btnImportJSON">Upload</button><input type="file" id="importFile" accept=".json" class="hidden" /></div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label">📊 Export CSV</div></div><button class="btn btn-secondary btn-sm" id="btnExportCSV">Download</button></div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label text-danger">⚠️ Hapus Semua Data</div><div class="settings-item-desc">Aksi ini tidak bisa dibatalkan</div></div><button class="btn btn-danger btn-sm" id="btnClearData">Hapus</button></div>
          </div>
          <div class="settings-section"><div class="settings-section-title">Tentang Aplikasi</div>
            <div class="settings-item"><div class="settings-item-info"><div class="settings-item-label">💰 BukuKas Universal</div><div class="settings-item-desc">Versi 2.0.0 — Backend PHP + MySQL. Data aman di server.</div></div><span class="badge badge-primary">v2.0</span></div>
          </div>
        </section>

        <section class="page" id="page-profile">
          <div class="profile-header">
            <div class="profile-avatar" id="profileAvatar"><?= strtoupper(substr($user['name'],0,1)) ?></div>
            <div><div class="profile-name" id="profileName"><?= htmlspecialchars($user['name']) ?></div><div class="profile-email" id="profileEmail"></div><div style="font-size:var(--text-small);opacity:0.8;margin-top:4px" id="profileJoined"></div></div>
          </div>
          <div class="grid grid-2" style="margin-bottom:var(--space-6)">
            <div class="card">
              <div class="card-title">Edit Profil</div>
              <div style="display:flex;flex-direction:column;gap:var(--space-4)">
                <div class="form-group"><label class="form-label" for="profileFormName">Nama Lengkap</label><input type="text" id="profileFormName" class="form-control" /></div>
                <div class="form-group"><label class="form-label" for="profileFormEmail">Email</label><input type="email" id="profileFormEmail" class="form-control" /></div>
                <div class="form-group"><label class="form-label" for="profileFormNewPass">Password Baru (opsional)</label><input type="password" id="profileFormNewPass" class="form-control" placeholder="Kosongkan jika tidak ingin ganti" /></div>
                <div class="form-group"><label class="form-label" for="profileFormRole">Tipe Akun</label><select id="profileFormRole" class="form-control"><option value="Individu">👤 Individu</option><option value="UMKM">🏪 UMKM</option><option value="Organisasi">🏢 Organisasi</option></select></div>
                <button class="btn btn-primary btn-lg" id="btnSaveProfile">💾 Simpan Profil</button>
              </div>
            </div>
            <div>
              <div class="card" style="margin-bottom:var(--space-4)"><div class="card-title">Ringkasan Statistik</div><div class="grid grid-3" id="profileStats"></div></div>
              <div class="card"><div class="card-title">Dompet Saya</div><div id="profileWallets"></div></div>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>

  <nav class="bottom-nav"><div class="bottom-nav-items">
    <div class="bottom-nav-item" data-page="dashboard"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span class="bottom-nav-label">Beranda</span></div>
    <div class="bottom-nav-item" data-page="transaction"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 1l4 4-4 4M3 12V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 12v3a4 4 0 01-4 4H3"/></svg><span class="bottom-nav-label">Transaksi</span></div>
    <div class="bottom-nav-item fab-placeholder"><div style="width:44px;height:44px"></div><span class="bottom-nav-label" style="opacity:0">—</span></div>
    <div class="bottom-nav-item" data-page="report"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg><span class="bottom-nav-label">Laporan</span></div>
    <div class="bottom-nav-item" data-page="profile"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span class="bottom-nav-label">Profil</span></div>
  </div></nav>
  <button class="fab" id="fabBtn"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>

  <script src="js/store.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/router.js"></script>
  <script src="js/pages/dashboard.js"></script>
  <script src="js/pages/wallet.js"></script>
  <script src="js/pages/transaction.js"></script>
  <script src="js/pages/report.js"></script>
  <script src="js/pages/other.js"></script>
  <script src="app.js"></script>
</body>
</html>
