let currentUser = null;
let selectedAgents = [];
const BASE_PATH = window.location.pathname.replace(/\/$/, '');

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initAgentInput();
  document.getElementById('reportDate').valueAsDate = new Date();
});

async function checkAuth() {
  try {
    const res = await fetch(`${BASE_PATH}/api/auth/me`);
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      showApp();
    }
  } catch {}
}

function showApp() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'block';
  document.getElementById('navUser').style.display = 'flex !important';
  document.getElementById('navUserName').textContent = currentUser.name;
  loadRecentReports();
}

function showAuth() {
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('appSection').style.display = 'none';
  document.getElementById('navUser').style.display = 'none !important';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${BASE_PATH}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
      showApp();
      showToast('Success', 'Logged in successfully');
    } else {
      showToast('Error', data.error, 'danger');
    }
  } catch (err) {
    showToast('Error', 'Connection failed', 'danger');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch(`${BASE_PATH}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
      showApp();
      showToast('Success', 'Account created successfully');
    } else {
      showToast('Error', data.error, 'danger');
    }
  } catch (err) {
    showToast('Error', 'Connection failed', 'danger');
  }
}

async function logout() {
  await fetch(`${BASE_PATH}/api/auth/logout`, { method: 'POST' });
  currentUser = null;
  showAuth();
}

function initAgentInput() {
  const input = document.getElementById('agentInput');
  const dropdown = document.getElementById('agentDropdown');
  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 1) {
      dropdown.style.display = 'none';
      return;
    }
    debounceTimer = setTimeout(() => searchAgents(q), 250);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 1) {
      searchAgents(input.value.trim());
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tag-input-container')) {
      dropdown.style.display = 'none';
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const first = dropdown.querySelector('.dropdown-item');
      if (first) first.click();
    }
  });
}

async function searchAgents(q) {
  const dropdown = document.getElementById('agentDropdown');
  try {
    const res = await fetch(`${BASE_PATH}/api/agents/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    const filtered = data.agents.filter(a => !selectedAgents.some(s => s.nik === a.nik));

    if (filtered.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-item text-muted">No results</div>';
    } else {
      dropdown.innerHTML = filtered.map(a =>
        `<div class="dropdown-item" data-nik="${a.nik}" data-name="${a.name}">
          <span class="nik">${a.nik}</span>
          <span class="name">${a.name}</span>
        </div>`
      ).join('');

      dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          addAgent(item.dataset.nik, item.dataset.name);
          dropdown.style.display = 'none';
          document.getElementById('agentInput').value = '';
        });
      });
    }
    dropdown.style.display = 'block';
  } catch {}
}

function addAgent(nik, name) {
  if (selectedAgents.some(a => a.nik === nik)) return;
  selectedAgents.push({ nik, name });
  renderAgentTags();
}

function removeAgent(nik) {
  selectedAgents = selectedAgents.filter(a => a.nik !== nik);
  renderAgentTags();
}

function renderAgentTags() {
  const container = document.getElementById('agentTags');
  container.innerHTML = selectedAgents.map(a =>
    `<span class="agent-tag">${a.nik} - ${a.name}<span class="remove-tag" onclick="removeAgent('${a.nik}')">&times;</span></span>`
  ).join('');
  document.getElementById('agentNiks').value = JSON.stringify(selectedAgents.map(a => a.nik));
}

async function handleGenerate(e) {
  e.preventDefault();

  const btn = document.getElementById('btnGenerate');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

  const formData = new FormData();
  formData.append('slaFile', document.getElementById('slaFile').files[0]);
  formData.append('reportFile', document.getElementById('reportFile').files[0]);
  formData.append('reportDate', document.getElementById('reportDate').value);
  formData.append('agentNiks', document.getElementById('agentNiks').value);

  try {
    const res = await fetch(`${BASE_PATH}/api/reports/generate`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (res.ok) {
      renderResults(data.data, data.excelLink, data.csvLink);
      showToast('Success', 'Report generated successfully');
      loadRecentReports();
    } else {
      showToast('Error', data.error, 'danger');
    }
  } catch (err) {
    showToast('Error', 'Request failed: ' + err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-gear"></i> Generate Report';
  }
}

function renderResults(data, excelLink, csvLink) {
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('resultsArea').style.display = 'block';

  const alertDiv = document.querySelector('#resultsArea .alert-success');
  let alertHtml = '<i class="bi bi-check-circle-fill me-2"></i><span>Report generated successfully!</span>';

  if (excelLink) {
    alertHtml += `<a href="${BASE_PATH}${excelLink}" class="btn btn-sm btn-success ms-2" download>
      <i class="bi bi-file-earmark-excel"></i> Download XLS
    </a>`;
  }

  if (csvLink) {
    alertHtml += `<a href="${BASE_PATH}${csvLink}" class="btn btn-sm btn-info ms-2" download>
      <i class="bi bi-filetype-csv"></i> Download CSV
    </a>`;
  }

  alertDiv.innerHTML = alertHtml;

  renderPivotTable('tableCancelled', data.cancelled);
  renderPivotTable('tableResolved', data.resolved);
  renderSimpleTable('tableInprogress', data.inprogress, 'User', 'Count');
  renderSimpleTable('tableAssigned', data.assigned, 'User', 'Count');
  renderPivotTable('tableOla', data.olaResponse);
  renderSimpleTable('tableTop5', data.topCategories, 'Category', 'Count');
}

function renderPivotTable(tableId, data) {
  const table = document.getElementById(tableId);
  if (!data || data.length === 0) {
    table.innerHTML = '<tr><td class="text-muted text-center py-3">No data</td></tr>';
    return;
  }

  const allCols = new Set();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      if (key !== '_total') allCols.add(key);
    }
  }
  const columns = [...allCols];

  let html = '<thead><tr>';
  for (const col of columns) html += `<th>${col}</th>`;
  html += '</tr></thead><tbody>';

  for (const row of data) {
    html += '<tr>';
    for (const col of columns) html += `<td>${row[col] ?? '-'}</td>`;
    html += '</tr>';
  }
  html += '</tbody>';
  table.innerHTML = html;
}

function renderSimpleTable(tableId, data, col1, col2) {
  const table = document.getElementById(tableId);
  if (!data || data.length === 0) {
    table.innerHTML = '<tr><td class="text-muted text-center py-3">No data</td></tr>';
    return;
  }

  const keys = Object.keys(data[0]);
  let html = '<thead><tr>';
  for (const k of keys) html += `<th>${k}</th>`;
  html += '</tr></thead><tbody>';

  for (const row of data) {
    html += '<tr>';
    for (const k of keys) html += `<td>${row[k]}</td>`;
    html += '</tr>';
  }
  html += '</tbody>';
  table.innerHTML = html;
}

async function loadRecentReports() {
  try {
    const res = await fetch(`${BASE_PATH}/api/reports`);
    const data = await res.json();
    const container = document.getElementById('recentReports');

    if (!data.reports.length) {
      container.innerHTML = '<div class="text-center text-muted py-3">No reports yet</div>';
      return;
    }

    container.innerHTML = data.reports.map(r => {
      const statusIcon = r.status === 'completed' ? 'bi-check-circle text-success' :
                         r.status === 'failed' ? 'bi-x-circle text-danger' :
                         'bi-clock text-warning';
      return `<div class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <i class="bi ${statusIcon} me-1"></i>
            <strong>${r.report_date}</strong>
          </div>
          <small class="text-muted">${new Date(r.created_at).toLocaleTimeString()}</small>
        </div>
      </div>`;
    }).join('');
  } catch {}
}

function showToast(title, body, type = 'info') {
  const toast = document.getElementById('liveToast');
  const header = toast.querySelector('.toast-header');
  header.className = `toast-header ${type === 'danger' ? 'bg-danger text-white' : ''}`;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastBody').textContent = body;
  new bootstrap.Toast(toast).show();
}
