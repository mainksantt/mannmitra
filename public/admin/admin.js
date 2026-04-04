'use strict';

const STATUSES = ['Pending', 'Contacted', 'In Progress', 'Completed'];
let allBookings = [];

async function loadBookings() {
  const tbody = document.getElementById('table-body');
  try {
    const res = await fetch('/admin/api/bookings');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allBookings = await res.json();
    document.getElementById('booking-count').textContent = `${allBookings.length} booking${allBookings.length !== 1 ? 's' : ''}`;
    renderTable(allBookings);
  } catch (err) {
    showError('Failed to load bookings: ' + err.message);
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading data.</td></tr>';
  }
}

function renderTable(bookings) {
  const tbody = document.getElementById('table-body');
  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No bookings found.</td></tr>';
    return;
  }
  tbody.innerHTML = bookings.map(b => `
    <tr data-id="${escHtml(b.id)}">
      <td><strong>${escHtml(b.name)}</strong></td>
      <td><a href="mailto:${escHtml(b.email)}">${escHtml(b.email)}</a></td>
      <td>${escHtml(b.phone)}</td>
      <td>${escHtml(b.preferredTime)}</td>
      <td class="msg-cell" title="${escHtml(b.message)}">${escHtml(b.message || '—')}</td>
      <td class="date-cell">${formatDate(b.createdAt)}</td>
      <td>
        <select class="status-select status-${escHtml(b.status.replace(' ', ''))}">
          ${STATUSES.map(s => `<option value="${s}"${s === b.status ? ' selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('select.status-select').forEach(sel => {
    sel.addEventListener('change', onStatusChange);
  });
}

async function onStatusChange(e) {
  const sel = e.target;
  const row = sel.closest('tr');
  const id = row.dataset.id;
  const newStatus = sel.value;

  try {
    const res = await fetch(`/admin/api/bookings/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Update class to reflect new colour
    STATUSES.forEach(s => sel.classList.remove('status-' + s.replace(' ', '')));
    sel.classList.add('status-' + newStatus.replace(' ', ''));
    // Update in-memory list
    const booking = allBookings.find(b => b.id === id);
    if (booking) booking.status = newStatus;
  } catch (err) {
    showError('Failed to update status: ' + err.message);
    // Revert select
    const booking = allBookings.find(b => b.id === id);
    if (booking) sel.value = booking.status;
  }
}

function applyFilters() {
  const query = document.getElementById('search').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  const filtered = allBookings.filter(b => {
    const matchesSearch =
      !query ||
      b.name.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.phone.toLowerCase().includes(query);
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  renderTable(filtered);
}

function showError(msg) {
  const banner = document.getElementById('error-banner');
  document.getElementById('error-msg').textContent = msg;
  banner.classList.remove('hidden');
  setTimeout(() => banner.classList.add('hidden'), 6000);
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('filter-status').addEventListener('change', applyFilters);

loadBookings();
