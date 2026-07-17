<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Login ke BukuKas Universal — Aplikasi pencatatan keuangan" />
  <title>Login — BukuKas Universal</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Poppins', sans-serif; background: #0F172A; color: #F1F5F9; min-height: 100vh; display: flex; }
    a { color: inherit; text-decoration: none; }
    button { cursor: pointer; font-family: inherit; }
    input  { font-family: inherit; }

    /* Split Layout */
    .auth-split { display: flex; min-height: 100vh; width: 100%; }

    /* Left Panel — Branding */
    .auth-brand {
      display: none;
      flex: 1;
      background: linear-gradient(135deg, #16A34A 0%, #166534 60%, #0F172A 100%);
      padding: 60px;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .auth-brand::before {
      content: '';
      position: absolute; top: -100px; right: -100px;
      width: 400px; height: 400px; border-radius: 50%;
      background: rgba(255,255,255,0.05);
    }
    .auth-brand::after {
      content: '';
      position: absolute; bottom: -80px; left: 40px;
      width: 250px; height: 250px; border-radius: 50%;
      background: rgba(255,255,255,0.04);
    }
    @media (min-width: 1024px) { .auth-brand { display: flex; } }

    .brand-logo { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
    .brand-logo-icon {
      width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 14px;
      display: flex; align-items: center; justify-content: center; font-size: 24px;
    }
    .brand-logo-name { font-size: 24px; font-weight: 700; }

    .brand-hero { position: relative; z-index: 1; }
    .brand-title { font-size: 40px; font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
    .brand-desc  { font-size: 16px; opacity: 0.8; line-height: 1.7; max-width: 380px; }

    .brand-features { display: flex; flex-direction: column; gap: 16px; position: relative; z-index: 1; }
    .brand-feature { display: flex; align-items: center; gap: 12px; font-size: 14px; opacity: 0.85; }
    .brand-feature-icon {
      width: 36px; height: 36px; background: rgba(255,255,255,0.12); border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
    }

    /* Right Panel — Form */
    .auth-form-panel {
      width: 100%; max-width: 480px; margin: 0 auto;
      display: flex; flex-direction: column; justify-content: center;
      padding: 40px 32px;
      background: #1E293B;
    }
    @media (min-width: 1024px) { .auth-form-panel { min-width: 440px; max-width: 440px; } }

    .auth-header { margin-bottom: 32px; }
    .auth-title  { font-size: 28px; font-weight: 700; }
    .auth-sub    { font-size: 14px; color: #94A3B8; margin-top: 4px; }

    .form-group  { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
    .form-label  { font-size: 13px; font-weight: 600; color: #CBD5E1; }
    .form-control {
      height: 48px; padding: 0 16px;
      background: #0F172A; border: 1.5px solid #334155; border-radius: 10px;
      color: #F1F5F9; font-size: 14px; outline: none; width: 100%;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-control:focus { border-color: #22C55E; box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
    .form-control.has-icon { padding-right: 48px; }

    .input-wrap { position: relative; }
    .input-icon-right {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      cursor: pointer; color: #64748B;
      background: none; border: none; padding: 0; display: flex; align-items: center;
    }
    .input-icon-right:hover { color: #94A3B8; }

    .btn-primary-auth {
      width: 100%; height: 48px; background: #16A34A; color: #fff;
      border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: background 0.15s, transform 0.1s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin-top: 8px;
    }
    .btn-primary-auth:hover { background: #15803D; }
    .btn-primary-auth:active { transform: scale(0.98); }
    .btn-primary-auth:disabled { background: #334155; color: #64748B; cursor: not-allowed; }

    .auth-footer { margin-top: 24px; text-align: center; font-size: 13px; color: #94A3B8; }
    .auth-footer a { color: #22C55E; font-weight: 600; }
    .auth-footer a:hover { text-decoration: underline; }

    .alert {
      padding: 12px 16px; border-radius: 10px; font-size: 13px;
      margin-bottom: 18px; display: none; align-items: center; gap: 8px;
    }
    .alert.show { display: flex; }
    .alert-error   { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #FCA5A5; }
    .alert-success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); color: #86EFAC; }

    .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #334155; }
    .divider span { font-size: 12px; color: #64748B; white-space: nowrap; }

    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .mobile-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    @media (min-width: 1024px) { .mobile-logo { display: none; } }
    .mobile-logo-icon { width: 40px; height: 40px; background: #16A34A; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .mobile-logo-name { font-size: 20px; font-weight: 700; }
  </style>
</head>
<body>
<div class="auth-split">
  <!-- Brand Panel -->
  <div class="auth-brand">
    <div class="brand-logo">
      <div class="brand-logo-icon">💰</div>
      <span class="brand-logo-name">BukuKas Universal</span>
    </div>
    <div class="brand-hero">
      <h1 class="brand-title">Catat Keuangan<br/>Lebih Cerdas</h1>
      <p class="brand-desc">Kelola kas pribadi, UMKM, masjid, organisasi, dan event — semua dalam satu aplikasi yang sederhana namun powerful.</p>
    </div>
    <div class="brand-features">
      <div class="brand-feature"><div class="brand-feature-icon">👛</div><span>Multi-wallet: Tunai, Bank, E-Wallet</span></div>
      <div class="brand-feature"><div class="brand-feature-icon">📊</div><span>Laporan & grafik otomatis</span></div>
      <div class="brand-feature"><div class="brand-feature-icon">🔒</div><span>Data aman tersimpan di server</span></div>
      <div class="brand-feature"><div class="brand-feature-icon">📱</div><span>Responsif di semua perangkat</span></div>
    </div>
  </div>

  <!-- Form Panel -->
  <div class="auth-form-panel">
    <div class="mobile-logo">
      <div class="mobile-logo-icon">💰</div>
      <span class="mobile-logo-name">BukuKas</span>
    </div>

    <div class="auth-header">
      <h2 class="auth-title">Masuk ke Akun</h2>
      <p class="auth-sub">Belum punya akun? <a href="register.php">Daftar di sini</a></p>
    </div>

    <div class="alert alert-error" id="alertError" role="alert">
      <span>⚠️</span><span id="alertErrorMsg">Terjadi kesalahan</span>
    </div>

    <form id="loginForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input type="email" id="email" class="form-control" placeholder="email@contoh.com" autocomplete="email" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <div class="input-wrap">
          <input type="password" id="password" class="form-control has-icon" placeholder="••••••••" autocomplete="current-password" required />
          <button type="button" class="input-icon-right" id="togglePass" aria-label="Tampilkan password">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <button type="submit" class="btn-primary-auth" id="btnLogin">
        <span id="btnLoginText">Masuk</span>
      </button>
    </form>

    <div class="auth-footer">
      Belum punya akun? <a href="register.php">Daftar sekarang</a>
    </div>
  </div>
</div>

<script>
const loginForm = document.getElementById('loginForm');
const alertError = document.getElementById('alertError');
const alertErrorMsg = document.getElementById('alertErrorMsg');
const btnLogin = document.getElementById('btnLogin');
const btnLoginText = document.getElementById('btnLoginText');

// Toggle password visibility
document.getElementById('togglePass').addEventListener('click', function() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

function showError(msg) {
  alertError.classList.add('show');
  alertErrorMsg.textContent = msg;
}
function hideError() { alertError.classList.remove('show'); }

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) { showError('Email dan password wajib diisi.'); return; }

  btnLogin.disabled = true;
  btnLoginText.innerHTML = '<div class="spinner"></div>';

  try {
    const res  = await fetch('api/auth/login.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      btnLoginText.textContent = '✓ Berhasil!';
      const user = data.data;
      // Redirect based on role
      if (user.role === 'admin') {
        window.location.href = 'admin/';
      } else {
        window.location.href = 'app.php';
      }
    } else {
      showError(data.message || 'Login gagal. Coba lagi.');
      btnLogin.disabled = false;
      btnLoginText.textContent = 'Masuk';
    }
  } catch (err) {
    showError('Koneksi gagal. Pastikan server berjalan.');
    btnLogin.disabled = false;
    btnLoginText.textContent = 'Masuk';
  }
});
</script>
</body>
</html>
