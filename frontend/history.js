let currentPage = 1;
const itemsPerPage = 10;
let totalSessions = 0;
let currentFilter = 'all';

const sessionsContainer = document.getElementById('sessions-container');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const chartContainer = document.getElementById('chart-container');

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

function getModeIcon(mode) {
  const icons = {
    focus: `<div class="w-8 h-8 rounded-lg bg-focus/20 flex items-center justify-center"><svg class="w-4 h-4 text-focus" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>`,
    short_break: `<div class="w-8 h-8 rounded-lg bg-break/20 flex items-center justify-center"><svg class="w-4 h-4 text-break" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg></div>`,
    long_break: `<div class="w-8 h-8 rounded-lg bg-longbreak/20 flex items-center justify-center"><svg class="w-4 h-4 text-longbreak" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/></svg></div>`
  };
  return icons[mode] || icons.focus;
}

function getModeLabel(mode) {
  const labels = { focus: 'Focus', short_break: 'Short Break', long_break: 'Long Break' };
  return labels[mode] || 'Focus';
}

function renderSessions(sessions) {
  if (!sessions || sessions.length === 0) {
    sessionsContainer.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center">
        <svg class="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p class="text-slate-400 mb-4">No sessions recorded yet</p>
        <a href="index.html" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200">
          Start Your First Session
        </a>
      </div>
    `;
    return;
  }

  sessionsContainer.innerHTML = sessions.map(session => `
    <div class="px-6 py-4 hover:bg-slate-700/30 transition-colors duration-200 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4 min-w-0">
        ${getModeIcon(session.mode)}
        <div class="min-w-0">
          <p class="font-medium truncate">${getModeLabel(session.mode)}</p>
          <p class="text-sm text-slate-400">${new Date(session.started_at).toLocaleDateString()} ${new Date(session.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
      </div>
      <div class="flex items-center gap-6 text-sm">
        <span class="text-slate-300">${formatDuration(session.duration_seconds)}</span>
        <span class="px-2 py-1 rounded-full text-xs font-medium ${session.completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}">
          ${session.completed ? 'Completed' : 'Incomplete'}
        </span>
      </div>
    </div>
  `).join('');
}

function updatePagination() {
  const totalPages = Math.ceil(totalSessions / itemsPerPage);
  pageInfo.textContent = totalSessions > 0 
    ? `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalSessions)} of ${totalSessions} sessions`
    : 'No sessions';
  
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
}

function renderChart(dailyStats) {
  if (!dailyStats || dailyStats.length === 0) {
    chartContainer.innerHTML = `
      <div class="flex-1 h-full flex items-center justify-center">
        <p class="text-slate-500 text-sm">No data to display</p>
      </div>
    `;
    return;
  }

  const maxFocusSeconds = Math.max(...dailyStats.map(d => d.total_focus_seconds), 1);
  const reversedStats = [...dailyStats].reverse();
  
  chartContainer.innerHTML = reversedStats.map(day => {
    const height = Math.max((day.total_focus_seconds / maxFocusSeconds) * 100, 4);
    const date = new Date(day.date);
    const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const focusMinutes = Math.round(day.total_focus_seconds / 60);
    
    return `
      <div class="flex-1 flex flex-col items-center gap-2 group">
        <div class="w-full bg-slate-700/50 rounded-t-sm relative h-full flex items-end">
          <div class="w-full bg-gradient-to-t from-focus to-focus-light rounded-t-sm chart-bar hover:brightness-110 cursor-pointer relative" style="height: ${height}%;">
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              ${formatTime(focusMinutes)}
            </div>
          </div>
        </div>
        <span class="text-xs text-slate-500 truncate w-full text-center">${dateLabel}</span>
      </div>
    `;
  }).join('');
}

async function fetchSessions() {
  try {
    const offset = (currentPage - 1) * itemsPerPage;
    const res = await fetch(`/api/sessions?limit=${itemsPerPage}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    const data = await res.json();
    totalSessions = data.data.total;
    renderSessions(data.data.sessions);
    updatePagination();
  } catch (err) {
    console.error('Error:', err);
    sessionsContainer.innerHTML = `
      <div class="py-12 flex flex-col items-center justify-center">
        <p class="text-red-400 mb-2">Failed to load sessions</p>
        <button onclick="fetchSessions()" class="text-sm text-slate-400 hover:text-white">Try again</button>
      </div>
    `;
  }
}

async function fetchStats() {
  try {
    const days = currentFilter === 'today' ? 1 : currentFilter === 'week' ? 7 : currentFilter === 'month' ? 30 : 365;
    const [statsRes, dailyRes] = await Promise.all([
      fetch('/api/stats'),
      fetch(`/api/stats/daily?days=${days}`)
    ]);
    
    if (!statsRes.ok || !dailyRes.ok) throw new Error('Failed to fetch stats');
    
    const stats = await statsRes.json();
    const daily = await dailyRes.json();
    
    const todaySeconds = stats.data.today_focus_seconds || 0;
    const completedSessions = stats.data.completed_sessions || 0;
    const streak = stats.data.current_streak || 0;
    const totalSessionsCount = stats.data.total_sessions || 0;
    
    document.getElementById('stat-today').textContent = formatTime(todaySeconds / 60);
    document.getElementById('stat-sessions').textContent = completedSessions;
    document.getElementById('stat-streak').textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
    document.getElementById('stat-total').textContent = totalSessionsCount;
    
    renderChart(daily.data);
  } catch (err) {
    console.error('Error:', err);
    document.getElementById('stats-container').innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-red-400">Failed to load statistics</p>
      </div>
    `;
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchSessions();
  }
}

function nextPage() {
  const totalPages = Math.ceil(totalSessions / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    fetchSessions();
  }
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('bg-slate-800', 'text-white');
    btn.classList.add('text-slate-400');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('bg-slate-800', 'text-white');
  document.querySelector(`[data-filter="${filter}"]`).classList.remove('text-slate-400');
  fetchStats();
}

function exportCSV() {
  window.location.href = '/api/export/csv';
}

function refreshData() {
  fetchSessions();
  fetchStats();
}

async function init() {
  await Promise.all([fetchSessions(), fetchStats()]);
}

document.addEventListener('DOMContentLoaded', init);