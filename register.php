<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daftar — BukuKas Universal</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Poppins', sans-serif; background: #0F172A; color: #F1F5F9; min-height: 100vh; display: flex; }
    a { color: inherit; text-decoration: none; }
    button, input, select { font-family: inherit; }

    .auth-split { display: flex; min-height: 100vh; width: 100%; }
    .auth-brand {
      display: none; flex: 1;
      background: linear-gradient(135deg, #7C3AED 0%, #1E1B4B 60%, #0F172A 100%);
      padding: 60px; flex-direction: column; justify-content: space-between;
      position: relative; overflow: hidden;
    }
    .auth-brand::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; border-radius: 50%; background: rgba(255,255,255,0.05); }
    @media (min-width: 1024px) { .auth-brand { display: flex; } }

    .brand-logo { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
    .brand-logo-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .brand-logo-name { font-size: 24px; font-weight: 700; }
    .brand-title { font-size: 38px; font-weight: 700; line-height: 1.2; margin-bottom: 16px; position: relative; z-index: 1; }
    .brand-desc  { font-size: 15px; opacity: 0.8; line-height: 1.7; max-width: 380px; position: relative; z-index: 1; }
    .brand-steps { display: flex; flex-direction: column; gap: 16px; position: relative; z-index: 1; }
    .brand-step  { display: flex; align-items: flex-start; gap: 12px; }
    .brand-step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
    .brand-step-info h4 { font-size: 14px; font-weight: 600; }
    .brand-step-info p  { font-size: 12px; opacity: 0.7; }

    .auth-form-panel {
      width: 100%; max-width: 520px; margin: 0 auto;
      display: flex; flex-direction: column; justify-content: center;
      padding: 40px 32px; background: #1E293B;
    }
    @media (min-width: 1024px) { .auth-form-panel { min-width: 480px; max-width: 480px; } }
    @media (max-width: 480px) { .auth-form-panel { padding: 32px 20px; } }

    .auth-header { margin-bottom: 28px; }
    .auth-title  { font-size: 26px; font-weight: 700; }
    .auth-sub    { font-size: 13px; color: #94A3B8; margin-top: 4px; }
    .auth-sub a  { color: #22C55E; font-weight: 600; }
    .auth-sub a:hover { text-decoration: underline; }

    .form-group  { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .form-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
    .form-label  { font-size: 12px; font-weight: 600; color: #CBD5E1; }
    .form-control {
      height: 44px; padding: 0 14px;
      background: #0F172A; border: 1.5px solid #334155; border-radius: 10px;
      color: #F1F5F9; font-size: 13px; outline: none; width: 100%;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-control:focus { border-color: #22C55E; box-shadow: 0 0 0 3px rgba(34,197,94,0.2); }
    .form-control.has-icon { padding-right: 44px; }
    .input-wrap { position: relative; }
    .input-icon-right { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #64748B; background: none; border: none; padding: 0; display: flex; align-items: center; }

    .pw-strength { height: 4px; border-radius: 2px; margin-top: 4px; background: #334155; overflow: hidden; }
    .pw-strength-bar { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; width: 0; }
    .pw-hint { font-size: 11px; color: #64748B; margin-top: 4px; }

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

    .alert { padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; display: none; align-items: center; gap: 8px; }
    .alert.show { display: flex; }
    .alert-error   { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #FCA5A5; }
    .alert-success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); color: #86EFAC; }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .mobile-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
    @media (min-width: 1024px) { .mobile-logo { display: none; } }
    .mobile-logo-icon { width: 40px; height: 40px; background: #16A34A; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .mobile-logo-name { font-size: 20px; font-weight: 700; }
  </style>
</head>
<body>
<div class="auth-split">
  <!-- Brand -->
  <div class="auth-brand">
    <div class="brand-logo">
      <div class="brand-logo-icon">💰</div>
      <span class="brand-logo-name">BukuKas Universal</span>
    </div>
    <div>
      <h1 class="brand-title">Mulai Perjalanan<br/>Finansialmu</h1>
      <p class="brand-desc" style="margin-top:12px">Daftar gratis dan mulai catat keuangan Anda dalam hitungan menit.</p>
    </div>
    <div class="brand-steps">
      <div class="brand-step"><div class="brand-step-num">1</div><div class="brand-step-info"><h4>Daftar akun</h4><p>Isi form di sebelah kanan</p></div></div>
      <div class="brand-step"><div class="brand-step-num">2</div><div class="brand-step-info"><h4>Tambah dompet</h4><p>Kas tunai, bank, atau e-wallet</p></div></div>
      <div class="brand-step"><div class="brand-step-num">3</div><div class="brand-step-info"><h4>Catat transaksi</h4><p>Pemasukan, pengeluaran, transfer</p></div></div>
      <div class="brand-step"><div class="brand-step-num">4</div><div class="brand-step-info"><h4>Lihat laporan</h4><p>Grafik & analisis otomatis</p></div></div>
    </div>
  </div>

  <!-- Form -->
  <div class="auth-form-panel">
    <div class="mobile-logo">
      <div class="mobile-logo-icon">💰</div>
      <span class="mobile-logo-name">BukuKas</span>
    </div>

    <div class="auth-header">
      <h2 class="auth-title">Buat Akun Baru</h2>
      <p class="auth-sub">Sudah punya akun? <a href="login.php">Masuk di sini</a></p>
    </div>

    <div class="alert alert-error" id="alertError" role="alert"><span>⚠️</span><span id="alertMsg"></span></div>
    <div class="alert alert-success" id="alertSuccess" role="alert"><span>🎉</span><span id="alertSuccessMsg"></span></div>

    <form id="regForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="regName">Nama Lengkap</label>
        <input type="text" id="regName" class="form-control" placeholder="Nama Anda" autocomplete="name" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="regEmail">Email</label>
        <input type="email" id="regEmail" class="form-control" placeholder="email@contoh.com" autocomplete="email" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="regPass">Password</label>
          <div class="input-wrap">
            <input type="password" id="regPass" class="form-control has-icon" placeholder="Min. 6 karakter" autocomplete="new-password" required />
            <button type="button" class="input-icon-right" id="togglePass1" aria-label="Tampilkan password">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <div class="pw-strength"><div class="pw-strength-bar" id="pwBar"></div></div>
          <div class="pw-hint" id="pwHint">Minimal 6 karakter</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="regPassConf">Konfirmasi Password</label>
          <div class="input-wrap">
            <input type="password" id="regPassConf" class="form-control has-icon" placeholder="Ulangi password" autocomplete="new-password" required />
            <button type="button" class="input-icon-right" id="togglePass2" aria-label="Tampilkan password">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      </div>

      <button type="submit" class="btn-primary-auth" id="btnReg">
        <span id="btnRegText">Daftar Sekarang</span>
      </button>
    </form>

    <p style="text-align:center;margin-top:20px;font-size:12px;color:#64748B">
      Sudah punya akun? <a href="login.php" style="color:#22C55E;font-weight:600">Masuk</a>
    </p>
  </div>
</div>

<script>
// Toggle password
['1','2'].forEach(n => {
  document.getElementById('togglePass'+n).addEventListener('click', () => {
    const inp = document.getElementById(n==='1'?'regPass':'regPassConf');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

// Password strength
document.getElementById('regPass').addEventListener('input', function() {
  const v = this.value, bar = document.getElementById('pwBar'), hint = document.getElementById('pwHint');
  let strength = 0, msg = 'Terlalu pendek';
  if (v.length >= 6)  { strength = 25; msg = 'Lemah'; }
  if (v.length >= 8)  { strength = 50; msg = 'Cukup'; }
  if (/[A-Z]/.test(v) && /[0-9]/.test(v)) { strength = 75; msg = 'Kuat'; }
  if (v.length >= 10 && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) { strength = 100; msg = 'Sangat kuat'; }
  const colors = { 25:'#EF4444', 50:'#F59E0B', 75:'#3B82F6', 100:'#10B981' };
  bar.style.width = strength + '%';
  bar.style.background = colors[strength] || '#334155';
  hint.textContent = v.length === 0 ? 'Minimal 6 karakter' : msg;
});

const form = document.getElementById('regForm');
const btnReg = document.getElementById('btnReg');
const alertError = document.getElementById('alertError');
const alertSuccess = document.getElementById('alertSuccess');

function showErr(msg) { alertError.classList.add('show'); document.getElementById('alertMsg').textContent = msg; }
function hideAlerts() { alertError.classList.remove('show'); alertSuccess.classList.remove('show'); }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlerts();
  const name   = document.getElementById('regName').value.trim();
  const email  = document.getElementById('regEmail').value.trim();
  const pass   = document.getElementById('regPass').value;
  const conf   = document.getElementById('regPassConf').value;

  if (!name || !email || !pass) { showErr('Semua kolom wajib diisi.'); return; }
  if (pass.length < 6)          { showErr('Password minimal 6 karakter.'); return; }
  if (pass !== conf)            { showErr('Konfirmasi password tidak cocok.'); return; }

  btnReg.disabled = true;
  document.getElementById('btnRegText').innerHTML = '<div class="spinner"></div>';

  try {
    const res  = await fetch('api/auth/register.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();

    if (data.success) {
      alertSuccess.classList.add('show');
      document.getElementById('alertSuccessMsg').textContent = data.message;
      document.getElementById('btnRegText').textContent = '✓ Berhasil!';
      setTimeout(() => {
        window.location.href = data.data.role === 'admin' ? 'admin/' : 'app.php';
      }, 1000);
    } else {
      showErr(data.message || 'Pendaftaran gagal.');
      btnReg.disabled = false;
      document.getElementById('btnRegText').textContent = 'Daftar Sekarang';
    }
  } catch(err) {
    showErr('Koneksi gagal. Pastikan server berjalan.');
    btnReg.disabled = false;
    document.getElementById('btnRegText').textContent = 'Daftar Sekarang';
  }
});
</script>
</body>
</html>
