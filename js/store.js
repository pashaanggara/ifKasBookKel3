// =====================================================
// BukuKas Universal — Store (API-based)
// Replaces localStorage with PHP API calls
// =====================================================

const Store = (() => {
  const BASE = ''; // relative to app root

  // ---- HTTP Helpers ----
  async function _get(url) {
    const res = await fetch(BASE + url, { credentials: 'same-origin' });
    if (res.status === 401) { window.location.href = 'login.php'; return null; }
    return res.json();
  }

  async function _post(url, body, method = 'POST') {
    const res = await fetch(BASE + url, {
      method, credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.status === 401) { window.location.href = 'login.php'; return null; }
    return res.json();
  }

  const _put    = (url, body) => _post(url, body, 'PUT');
  const _delete = (url, body) => _post(url, body, 'DELETE');

  // ---- USER ----
  let _currentUser = null;
  async function getUser() {
    if (_currentUser) return _currentUser;
    const res = await _get('api/auth/me.php');
    if (res?.success) { _currentUser = res.data; return _currentUser; }
    return null;
  }

  async function saveUser(data) {
    const res = await _put('api/profile/update.php', data);
    if (res?.success) _currentUser = null; // invalidate cache
    return res;
  }

  // ---- SETTINGS ----
  async function getSettings() {
    const user = await getUser();
    return { theme: user?.theme || 'light', currency: user?.currency || 'IDR', lowBalanceAlert: user?.low_balance_alert || 100000 };
  }

  async function saveSettings(s) {
    const res = await _put('api/profile/update.php', s);
    return res;
  }

  // ---- CATEGORIES ----
  let _cats = null;
  async function getCategories() {
    if (_cats) return _cats;
    const res = await _get('api/categories/index.php');
    _cats = res?.data || [];
    return _cats;
  }

  async function addCategory(cat) {
    const res = await _post('api/categories/store.php', cat);
    if (res?.success) _cats = null;
    return res;
  }

  async function updateCategory(id, data) {
    const res = await _put('api/categories/update.php', { id, ...data });
    if (res?.success) _cats = null;
    return res;
  }

  async function deleteCategory(id) {
    const res = await _delete('api/categories/destroy.php', { id });
    if (res?.success) _cats = null;
    return res;
  }

  async function getCategoryById(id) {
    const cats = await getCategories();
    return cats.find(c => c.id == id) || { name: 'Lainnya', icon: '📦', color: '#6B7280' };
  }

  // ---- WALLETS ----
  let _wallets = null;
  async function getWallets() {
    if (_wallets) return _wallets;
    const res = await _get('api/wallets/index.php');
    _wallets = res?.data?.wallets || [];
    return _wallets;
  }

  async function getTotalBalance() {
    const ws = await getWallets();
    return ws.reduce((s, w) => s + (w.balance || 0), 0);
  }

  async function addWallet(data) {
    const res = await _post('api/wallets/store.php', data);
    if (res?.success) _wallets = null;
    return res;
  }

  async function updateWallet(id, data) {
    const res = await _put('api/wallets/update.php', { id, ...data });
    if (res?.success) _wallets = null;
    return res;
  }

  async function deleteWallet(id) {
    const res = await _delete('api/wallets/destroy.php', { id });
    if (res?.success) _wallets = null;
    return res;
  }

  async function getWalletById(id) {
    const ws = await getWallets();
    return ws.find(w => w.id == id) || null;
  }

  // ---- TRANSACTIONS ----
  async function getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.walletId)   params.append('wallet_id',   filters.walletId);
    if (filters.categoryId) params.append('category_id', filters.categoryId);
    if (filters.dateFrom)   params.append('date_from',   filters.dateFrom);
    if (filters.dateTo)     params.append('date_to',     filters.dateTo);
    if (filters.search)     params.append('search',      filters.search);
    if (filters.page)       params.append('page',        filters.page);
    if (filters.perPage)    params.append('per_page',    filters.perPage);
    const res = await _get('api/transactions/index.php?' + params.toString());
    return res?.data || { transactions: [], total: 0, total_income: 0, total_expense: 0, total_pages: 1 };
  }

  async function addTransaction(data) {
    const res = await _post('api/transactions/store.php', data);
    if (res?.success) _wallets = null; // refresh wallet balances
    return res;
  }

  async function updateTransaction(id, data) {
    const res = await _put('api/transactions/update.php', { id, ...data });
    if (res?.success) _wallets = null;
    return res;
  }

  async function deleteTransaction(id) {
    const res = await _delete('api/transactions/destroy.php', { id });
    if (res?.success) _wallets = null;
    return res;
  }

  async function getMonthlySummary(year, month) {
    const from = `${year}-${String(month+1).padStart(2,'0')}-01`;
    const lastDay = new Date(year, month+1, 0).getDate();
    const to   = `${year}-${String(month+1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
    const data = await getTransactions({ dateFrom: from, dateTo: to, perPage: 1000 });
    return {
      income:  data.total_income  || 0,
      expense: data.total_expense || 0,
      net:     (data.total_income || 0) - (data.total_expense || 0),
      count:   data.total || 0,
    };
  }

  // ---- QUERY (unified) ----
  async function queryTransactions(filters) {
    return getTransactions(filters);
  }

  // ---- WALLET GRADIENTS (local constant) ----
  const WALLET_GRADIENTS = [
    'linear-gradient(135deg,#16A34A,#22C55E)',
    'linear-gradient(135deg,#2563EB,#3B82F6)',
    'linear-gradient(135deg,#7C3AED,#8B5CF6)',
    'linear-gradient(135deg,#DC2626,#EF4444)',
    'linear-gradient(135deg,#D97706,#F59E0B)',
    'linear-gradient(135deg,#0891B2,#06B6D4)',
    'linear-gradient(135deg,#BE185D,#EC4899)',
    'linear-gradient(135deg,#374151,#6B7280)',
  ];

  // ---- BACKUP / RESTORE ----
  async function exportBackup() {
    const ws  = await getWallets();
    const txRes = await getTransactions({ perPage: 9999 });
    const cats = await getCategories();
    const user = await getUser();
    return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), user, wallets: ws, transactions: txRes.transactions, categories: cats }, null, 2);
  }

  // ---- INIT ----
  async function init() {
    // No seeding needed — server handles initial state
    return true;
  }

  // Invalidate all caches (call after major operations)
  function invalidateCache() { _currentUser = null; _wallets = null; _cats = null; }

  return {
    getUser, saveUser,
    getSettings, saveSettings,
    getCategories, addCategory, updateCategory, deleteCategory, getCategoryById,
    getWallets, getTotalBalance, addWallet, updateWallet, deleteWallet, getWalletById,
    getTransactions, addTransaction, updateTransaction, deleteTransaction,
    queryTransactions, getMonthlySummary,
    exportBackup,
    WALLET_GRADIENTS,
    init, invalidateCache,
  };
})();
