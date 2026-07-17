// =====================================================
// BukuKas Universal — Report Page
// =====================================================

const ReportPage = (() => {
  let _chartBar  = null;
  let _chartLine = null;
  let _filter    = {};

  function init() {
    const range = UI.getMonthRange();
    _filter = { dateFrom: range.from, dateTo: range.to, walletId: '', type: 'all' };
    _renderFilterBar();
    _renderSummary();
    _renderCharts();
    _renderTable();
  }

  function _renderFilterBar() {
    const wallets = Store.getWallets();
    document.getElementById('rptFrom').value    = _filter.dateFrom;
    document.getElementById('rptTo').value      = _filter.dateTo;
    document.getElementById('rptWallet').innerHTML = `<option value="">Semua Dompet</option>` +
      wallets.map(w => `<option value="${w.id}">${w.name}</option>`).join('');

    // Month shortcuts
    ['rptFrom','rptTo','rptWallet','rptType'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.onchange = _onFilter;
    });

    // Quick date range buttons
    ['btnRptThisMonth','btnRptLastMonth','btnRptThisYear'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        if (id === 'btnRptThisMonth') {
          const r = UI.getMonthRange(0); _filter.dateFrom = r.from; _filter.dateTo = r.to;
        } else if (id === 'btnRptLastMonth') {
          const r = UI.getMonthRange(-1); _filter.dateFrom = r.from; _filter.dateTo = r.to;
        } else {
          const y = new Date().getFullYear();
          _filter.dateFrom = `${y}-01-01`; _filter.dateTo = `${y}-12-31`;
        }
        document.getElementById('rptFrom').value = _filter.dateFrom;
        document.getElementById('rptTo').value   = _filter.dateTo;
        _refresh();
      });
    });
  }

  function _onFilter() {
    _filter.dateFrom = document.getElementById('rptFrom').value;
    _filter.dateTo   = document.getElementById('rptTo').value;
    _filter.walletId = document.getElementById('rptWallet').value;
    _filter.type     = document.getElementById('rptType').value;
    _refresh();
  }

  function _refresh() {
    _renderSummary();
    _renderCharts();
    _renderTable();
  }

  function _getFilteredTxs() {
    return Store.queryTransactions({
      walletId:  _filter.walletId || undefined,
      type:      _filter.type !== 'all' ? _filter.type : undefined,
      dateFrom:  _filter.dateFrom,
      dateTo:    _filter.dateTo,
    });
  }

  // ---- Summary ----
  function _renderSummary() {
    const txs     = _getFilteredTxs();
    const income  = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const expense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const net     = income - expense;

    document.getElementById('rptIncome').textContent  = UI.formatRp(income);
    document.getElementById('rptExpense').textContent = UI.formatRp(expense);
    document.getElementById('rptNet').textContent     = (net>=0?'+':'') + UI.formatRp(net);
    document.getElementById('rptNet').style.color     = net >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
    document.getElementById('rptTxCount').textContent = txs.length + ' transaksi';
  }

  // ---- Charts ----
  function _renderCharts() {
    _renderBarChart();
    _renderLineChart();
  }

  function _renderBarChart() {
    const txs  = Store.queryTransactions({ walletId: _filter.walletId||undefined, dateFrom: _filter.dateFrom, dateTo: _filter.dateTo });
    const cats = Store.getCategories().filter(c => c.type === 'expense');

    const catData = cats.map(c => ({
      name: `${c.icon} ${c.name}`, color: c.color,
      total: txs.filter(t=>t.type==='expense'&&t.categoryId===c.id).reduce((s,t)=>s+t.amount,0)
    })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total).slice(0,8);

    const ctx = document.getElementById('rptBarChart');
    if (!ctx) return;
    if (_chartBar) { _chartBar.destroy(); _chartBar = null; }
    if (!catData.length) {
      ctx.closest('.chart-container').innerHTML = `<div class="text-center text-secondary fs-small" style="padding:40px">Tidak ada data pengeluaran pada periode ini</div>`;
      return;
    }

    _chartBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: catData.map(c=>c.name),
        datasets: [{ label: 'Pengeluaran', data: catData.map(c=>c.total), backgroundColor: catData.map(c=>c.color+'cc'), borderRadius: 8, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' ' + UI.formatRp(ctx.parsed.x) } } },
        scales: {
          x: { grid: { color:'rgba(0,0,0,0.06)' }, ticks: { callback: v => 'Rp'+UI.formatNumber(v), font:{family:'Poppins',size:11} } },
          y: { grid: { display:false }, ticks: { font:{family:'Poppins',size:12} } }
        }
      }
    });
  }

  function _renderLineChart() {
    // Build daily data within range
    const from = new Date(_filter.dateFrom || UI.getMonthRange().from);
    const to   = new Date(_filter.dateTo   || UI.getMonthRange().to);
    const txs  = Store.queryTransactions({ walletId: _filter.walletId||undefined, dateFrom: _filter.dateFrom, dateTo: _filter.dateTo });

    const labels = [], incData = [], expData = [];
    const diffDays = Math.min(Math.ceil((to - from) / 86400000), 60);

    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(from); d.setDate(d.getDate() + i);
      const ds = d.toISOString().slice(0,10);
      labels.push(d.toLocaleDateString('id-ID', { day:'2-digit', month:'short' }));
      incData.push(txs.filter(t=>t.type==='income'&&t.date===ds).reduce((s,t)=>s+t.amount,0));
      expData.push(txs.filter(t=>t.type==='expense'&&t.date===ds).reduce((s,t)=>s+t.amount,0));
    }

    const ctx = document.getElementById('rptLineChart');
    if (!ctx) return;
    if (_chartLine) { _chartLine.destroy(); _chartLine = null; }

    _chartLine = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label:'Pemasukan',   data: incData, borderColor:'#10B981', backgroundColor:'rgba(16,185,129,0.08)', tension:0.4, fill:true, pointRadius:3 },
          { label:'Pengeluaran', data: expData, borderColor:'#EF4444', backgroundColor:'rgba(239,68,68,0.08)',  tension:0.4, fill:true, pointRadius:3 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position:'top', labels:{usePointStyle:true,font:{family:'Poppins',size:12}} }, tooltip: { callbacks: { label: ctx => ' '+UI.formatRp(ctx.parsed.y) } } },
        scales: {
          x: { grid:{display:false}, ticks:{font:{family:'Poppins',size:10},maxTicksLimit:10} },
          y: { grid:{color:'rgba(0,0,0,0.06)'}, ticks:{callback:v=>'Rp'+UI.formatNumber(v),font:{family:'Poppins',size:11}} }
        }
      }
    });
  }

  // ---- Table ----
  function _renderTable() {
    const txs = _getFilteredTxs();
    const tbody = document.getElementById('rptTableBody');

    if (!txs.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:var(--space-8);color:var(--color-text-secondary)">Tidak ada transaksi pada periode ini</td></tr>`;
      return;
    }

    tbody.innerHTML = txs.slice(0,50).map(tx => {
      const cat    = Store.getCategoryById(tx.categoryId);
      const wallet = Store.getWalletById(tx.walletId);
      const sign   = tx.type==='income'?'+':tx.type==='transfer'?'↕':'-';
      const clr    = tx.type==='income'?'var(--color-success)':tx.type==='transfer'?'var(--color-info)':'var(--color-danger)';
      return `
        <tr>
          <td>${UI.formatDate(tx.date, true)}</td>
          <td>${tx.note || cat.name}</td>
          <td>${UI.txTypeBadge(tx.type)}</td>
          <td>${cat.icon} ${cat.name}</td>
          <td class="td-amount" style="color:${clr}">${sign}${UI.formatRp(tx.amount)}</td>
        </tr>`;
    }).join('');
  }

  // ---- Export ----
  function exportCSV() {
    const txs = _getFilteredTxs();
    if (!txs.length) { UI.toast('Tidak ada data untuk diexport', 'warning'); return; }
    const header = 'Tanggal,Catatan,Jenis,Kategori,Dompet,Nominal\n';
    const rows   = txs.map(tx => {
      const cat    = Store.getCategoryById(tx.categoryId);
      const wallet = Store.getWalletById(tx.walletId);
      return [tx.date, `"${tx.note||''}"`, tx.type, cat.name, wallet?.name||'', tx.amount].join(',');
    }).join('\n');
    _download('laporan-bukukas.csv', header + rows, 'text/csv');
    UI.toast('CSV berhasil didownload ✓', 'success');
  }

  function exportJSON() {
    const data = Store.exportBackup();
    _download('backup-bukukas.json', data, 'application/json');
    UI.toast('Backup JSON berhasil didownload ✓', 'success');
  }

  function _download(filename, content, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = filename; a.click(); URL.revokeObjectURL(a.href);
  }

  return { init, exportCSV, exportJSON };
})();
