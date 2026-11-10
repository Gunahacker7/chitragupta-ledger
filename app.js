/* ════════════════════════════════════════════════════════════════
   Chitragupta Ledger — The Book of Deeds & Debts
   Zero-dependency. Specs: .kiro/specs/chitragupta-ledger/
   Sections: Store · Money · Karma · Render · Form · Verdict · Ambience
   ════════════════════════════════════════════════════════════════ */
'use strict';

/* ─────────────── Store ─────────────── */
var STORAGE_KEY = 'chitragupta-ledger-v1';

var CATEGORIES = {
  expense: ['Food', 'Travel', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Other'],
  income:  ['Salary', 'Business', 'Gift', 'Interest', 'Other'],
  saving:  ['Bank deposit', 'Mutual fund', 'Gold', 'Cash reserve', 'Other'],
  deed:    ['Helped someone', 'Donation', 'Taught/shared', 'Kindness', 'Other']
};
var GLYPHS = { expense: '📜', income: '💰', saving: '🏺', deed: '🙏' };
var SIDE   = { expense: 'papa', income: 'punya', saving: 'punya', deed: 'punya' };
var DEED_WEIGHT = 1; /* ₹1 of Punya weight per good deed (requirements §3.1) */

function emptyState() { return { version: 1, seeded: false, entries: [] }; }

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    var parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries)) return emptyState();
    return parsed;
  } catch (e) { return emptyState(); } /* corrupt data → empty state, never throw */
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
}

function isoDayOffset(daysAgo) {
  var d = new Date(); d.setDate(d.getDate() - daysAgo);
  return toISODate(d);
}
function toISODate(d) {
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}
function todayISO() { return toISODate(new Date()); }

/* Seed demo entries on the six most recent days (today + the five days
   before it), so the recording streak and current-month verdict are alive
   on first load — requirements §8. */
function seedIfNeeded() {
  if (state.seeded || state.entries.length > 0) { state.seeded = true; return; }
  var seeds = [
    { type: 'income',  amount: 45000, category: 'Salary',       note: 'Monthly salary credited',     date: isoDayOffset(0) },
    { type: 'expense', amount: 3200,  category: 'Bills',        note: 'Electricity bill',              date: isoDayOffset(1) },
    { type: 'expense', amount: 1850,  category: 'Food',         note: 'Groceries for the week',        date: isoDayOffset(2) },
    { type: 'saving',  amount: 5000,  category: 'Mutual fund',  note: 'Monthly SIP',                   date: isoDayOffset(3) },
    { type: 'deed',    amount: 0,     category: 'Helped someone', note: 'Helped a neighbour move house', date: isoDayOffset(4) },
    { type: 'expense', amount: 640,   category: 'Travel',       note: 'Fuel + metro card',             date: isoDayOffset(5) }
  ];
  seeds.forEach(function (s, i) {
    state.entries.push({ id: makeId(i), type: s.type, amount: s.amount, category: s.category, note: s.note, date: s.date });
  });
  state.seeded = true;
  saveState();
}

var idCounter = 0;
function makeId(n) {
  idCounter += 1;
  return 'e-' + Date.now().toString(36) + '-' + (n !== undefined ? n : idCounter);
}

/* ─────────────── Money ─────────────── */
var inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
function fmtINR(n) { return '₹' + inr.format(Math.round(n * 100) / 100); }

/* ─────────────── Karma ─────────────── */
function entryPunya(e) {
  if (e.type === 'income' || e.type === 'saving') return e.amount || 0;
  if (e.type === 'deed') return DEED_WEIGHT;
  return 0;
}
function entryPapa(e) { return e.type === 'expense' ? (e.amount || 0) : 0; }

function totals() {
  var punya = 0, papa = 0;
  state.entries.forEach(function (e) { punya += entryPunya(e); papa += entryPapa(e); });
  return { punya: punya, papa: papa, net: punya - papa };
}

function computeStreak() {
  var days = {};
  state.entries.forEach(function (e) { days[e.date] = true; });
  var cursor = new Date();
  if (!days[toISODate(cursor)]) cursor.setDate(cursor.getDate() - 1); /* today unwritten → count from yesterday */
  var streak = 0;
  while (days[toISODate(cursor)]) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

/* ─────────────── DOM helpers ─────────────── */
function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
var freshEntryId = null; /* entry to animate with the quill write-in */

/* ─────────────── Render ─────────────── */
function renderScales() {
  var t = totals();
  $('punyaTotal').textContent = fmtINR(t.punya);
  $('papaTotal').textContent = fmtINR(t.papa);
  $('netKarma').textContent = t.net < 0 ? '−' + fmtINR(Math.abs(t.net)) : fmtINR(t.net);
  var sum = t.punya + t.papa;
  var punyaPct = sum === 0 ? 50 : (t.punya / sum) * 100;
  $('gaugePunya').style.width = punyaPct + '%';
  $('scalesState').textContent =
    sum === 0 || t.punya === t.papa ? 'The scales rest in balance' :
    t.punya > t.papa ? 'The scales tip toward Punya ✦' : '✦ The scales tip toward Papa';
  var streak = computeStreak();
  $('streakLine').textContent = '🔥 ' + streak + '-day recording streak';
}

function prettyDate(iso) {
  var d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

var currentFilter = 'all';
function renderLedger() {
  var book = $('ledgerBook');
  var entries = state.entries.slice().sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });
  if (currentFilter !== 'all') {
    entries = entries.filter(function (e) { return SIDE[e.type] === currentFilter; });
  }
  if (entries.length === 0) {
    book.innerHTML = '<div class="empty-page">The page is blank. Write your first deed.</div>';
    return;
  }
  var groups = [], byDate = {};
  entries.forEach(function (e) {
    if (!byDate[e.date]) { byDate[e.date] = []; groups.push(e.date); }
    byDate[e.date].push(e);
  });
  var html = groups.map(function (date) {
    var dayNet = 0;
    byDate[date].forEach(function (e) { dayNet += entryPunya(e) - entryPapa(e); });
    var rows = byDate[date].map(function (e) {
      var side = SIDE[e.type];
      var amt = side === 'papa' ? '− ' + fmtINR(e.amount) : '+ ' + fmtINR(e.type === 'deed' && !e.amount ? DEED_WEIGHT : e.amount);
      return '<div class="entry-row' + (e.id === freshEntryId ? ' fresh' : '') + '" data-id="' + e.id + '">' +
        '<span class="entry-glyph" aria-hidden="true">' + GLYPHS[e.type] + '</span>' +
        '<span class="entry-main"><span class="entry-cat">' + esc(e.category) + '</span>' +
        (e.note ? '<span class="entry-note">' + esc(e.note) + '</span>' : '') + '</span>' +
        '<span class="entry-side ' + side + '">' + side + '</span>' +
        '<span class="entry-amount ' + side + '">' + amt + '</span>' +
        '<span class="entry-actions"><button type="button" class="entry-del" data-action="ask-delete" aria-label="Delete entry">✕</button></span>' +
        '</div>';
    }).join('');
    return '<article class="page"><div class="page-head">' +
      '<span class="page-date">' + esc(prettyDate(date)) + '</span>' +
      '<span class="page-net">Day net <strong class="' + (dayNet < 0 ? 'neg' : 'pos') + '">' +
      (dayNet < 0 ? '− ' + fmtINR(Math.abs(dayNet)) : '+ ' + fmtINR(dayNet)) + '</strong></span></div>' +
      rows + '</article>';
  }).join('');
  book.innerHTML = html;
  freshEntryId = null;
}

/* ─────────────── Verdict ─────────────── */
function monthEntries() {
  var prefix = todayISO().slice(0, 7);
  return state.entries.filter(function (e) { return e.date.slice(0, 7) === prefix; });
}

function computeVerdict() {
  var list = monthEntries();
  var v = { count: list.length, inAmt: 0, outAmt: 0, saved: 0, deeds: 0, punya: 0, papa: 0, byCat: {} };
  list.forEach(function (e) {
    v.punya += entryPunya(e); v.papa += entryPapa(e);
    if (e.type === 'income') v.inAmt += e.amount || 0;
    if (e.type === 'expense') { v.outAmt += e.amount || 0; v.byCat[e.category] = (v.byCat[e.category] || 0) + (e.amount || 0); }
    if (e.type === 'saving') v.saved += e.amount || 0;
    if (e.type === 'deed') v.deeds += 1;
  });
  v.rate = v.inAmt > 0 ? ((v.inAmt - v.outAmt) / v.inAmt) * 100 : null;
  v.topCat = null; v.topAmt = 0;
  Object.keys(v.byCat).forEach(function (c) { if (v.byCat[c] > v.topAmt) { v.topAmt = v.byCat[c]; v.topCat = c; } });
  /* Rule table, requirements §5.5 — evaluated in order */
  if (v.count === 0) v.line = 'The court awaits your first deed.';
  else if (v.rate !== null && v.rate >= 30 && v.deeds >= 1) v.line = 'Swarga\u2019s gates stand open \u2014 a month of merit.';
  else if (v.rate !== null && v.rate >= 30) v.line = 'The scales smile upon you. Swarga path is clear.';
  else if (v.rate !== null && v.rate >= 10) v.line = 'A guarded month. Yamadutas find little to seize.';
  else if (v.rate !== null && v.rate >= 0) v.line = 'The court watches. Spend with a steadier hand.';
  else if (v.rate !== null && v.rate < 0 && v.papa > v.punya) v.line = 'Naraka\u2019s clerks are sharpening their quills \u2014 debts outweigh deeds.';
  else v.line = 'Yama drums his fingers. Turn the page and do better.';
  return v;
}

function renderVerdict() {
  var v = computeVerdict();
  var monthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  $('verdictMonth').textContent = monthName;
  $('vIn').textContent = fmtINR(v.inAmt);
  $('vOut').textContent = fmtINR(v.outAmt);
  $('vSaved').textContent = fmtINR(v.saved);
  $('vDeeds').textContent = String(v.deeds);
  $('vRate').textContent = v.rate === null ? '—' : (Math.round(v.rate * 10) / 10) + '%';
  $('vLeak').textContent = v.topCat ? 'Greatest leak: ' + v.topCat + ' · ' + fmtINR(v.topAmt) : '';
  $('vLine').textContent = v.line;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = String(text).split(' '), line = '', yy = y;
  for (var i = 0; i < words.length; i++) {
    var test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, yy); line = words[i]; yy += lineHeight; }
    else line = test;
  }
  if (line) { ctx.fillText(line, x, yy); yy += lineHeight; }
  return yy;
}

function downloadVerdictCard() {
  var v = computeVerdict();
  var monthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  var canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  /* background + double gold border */
  ctx.fillStyle = '#171410'; ctx.fillRect(0, 0, 1080, 1350);
  var grad = ctx.createRadialGradient(540, 240, 60, 540, 420, 700);
  grad.addColorStop(0, 'rgba(224,93,42,0.20)'); grad.addColorStop(1, 'rgba(224,93,42,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 6; ctx.strokeRect(36, 36, 1008, 1278);
  ctx.lineWidth = 2; ctx.strokeRect(58, 58, 964, 1234);
  /* seal */
  ctx.beginPath(); ctx.arc(540, 230, 92, 0, Math.PI * 2);
  var seal = ctx.createRadialGradient(505, 195, 12, 540, 230, 92);
  seal.addColorStop(0, '#8f271b'); seal.addColorStop(1, '#5c130c');
  ctx.fillStyle = seal; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(201,162,39,0.6)'; ctx.stroke();
  ctx.fillStyle = '#e8c85a'; ctx.font = '84px serif'; ctx.textAlign = 'center';
  ctx.fillText('⚖', 540, 262);
  /* headings */
  ctx.fillStyle = '#c9a227'; ctx.font = '700 34px system-ui, sans-serif';
  ctx.fillText('T H E   C O U R T   P R O N O U N C E S', 540, 420);
  ctx.fillStyle = '#e8c85a'; ctx.font = '800 92px Catamaran, "Noto Sans Tamil", system-ui, sans-serif';
  ctx.fillText('Yama\u2019s Verdict', 540, 530);
  ctx.fillStyle = '#a89f8d'; ctx.font = '600 40px system-ui, sans-serif';
  ctx.fillText(monthName, 540, 596);
  /* figures */
  var rows = [
    ['Money in', fmtINR(v.inAmt)],
    ['Money out', fmtINR(v.outAmt)],
    ['Saved', fmtINR(v.saved)],
    ['Good deeds', String(v.deeds)],
    ['Savings rate', v.rate === null ? '—' : (Math.round(v.rate * 10) / 10) + '%']
  ];
  ctx.textAlign = 'left';
  var y = 700;
  rows.forEach(function (r) {
    ctx.fillStyle = '#a89f8d'; ctx.font = '600 36px system-ui, sans-serif';
    ctx.fillText(r[0].toUpperCase(), 170, y);
    ctx.fillStyle = '#f2ead8'; ctx.font = '800 44px system-ui, sans-serif';
    ctx.textAlign = 'right'; ctx.fillText(r[1], 910, y); ctx.textAlign = 'left';
    y += 74;
  });
  if (v.topCat) {
    ctx.fillStyle = '#f0936b'; ctx.font = '600 36px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Greatest leak: ' + v.topCat + ' · ' + fmtINR(v.topAmt), 540, y + 16);
    y += 66;
  }
  /* verdict line */
  ctx.fillStyle = '#e8c85a'; ctx.font = '700 40px Catamaran, system-ui, sans-serif'; ctx.textAlign = 'center';
  wrapText(ctx, v.line, 540, y + 8, 780, 50);
  /* footer */
  ctx.fillStyle = '#a89f8d'; ctx.font = '600 32px system-ui, sans-serif';
  ctx.fillText('Chitragupta Ledger · Built with Kiro · Kiroween 2026', 540, 1252);
  canvas.toBlob(function (blob) {
    if (!blob) return;
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'yamas-verdict.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }, 'image/png');
}

function renderAll() { renderScales(); renderLedger(); renderVerdict(); }

/* ─────────────── Form ─────────────── */
var selectedType = 'expense';

function fillCategories() {
  var sel = $('categorySelect');
  sel.innerHTML = CATEGORIES[selectedType].map(function (c) {
    return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
  }).join('');
}

function setType(type) {
  selectedType = type;
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    var active = chip.getAttribute('data-type') === type;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-checked', active ? 'true' : 'false');
  });
  $('amountInput').required = type !== 'deed';
  fillCategories();
}

function showFormError(msg) {
  var err = $('formError');
  if (msg) { err.textContent = msg; err.hidden = false; } else { err.hidden = true; err.textContent = ''; }
}

function handleSubmit(ev) {
  ev.preventDefault();
  showFormError('');
  $('formOk').hidden = true;
  var amountRaw = $('amountInput').value.trim();
  var amount = amountRaw === '' ? NaN : parseFloat(amountRaw);
  var isDeed = selectedType === 'deed';
  if (isDeed && amountRaw === '') amount = 0;
  if (isNaN(amount) || amount < 0 || (!isDeed && amount <= 0)) {
    showFormError(isDeed ? 'Enter an amount of ₹0 or more for the deed.' : 'The court needs an amount greater than ₹0.');
    return;
  }
  amount = Math.round(amount * 100) / 100;
  var date = $('dateInput').value || todayISO();
  if (date > todayISO()) { showFormError('Chitragupta records what has happened — future dates are refused.'); return; }
  var entry = {
    id: makeId(), type: selectedType, amount: amount,
    category: $('categorySelect').value,
    note: $('noteInput').value.trim(), date: date
  };
  state.entries.push(entry);
  saveState();
  freshEntryId = entry.id;
  currentFilter = 'all'; $('filterSelect').value = 'all';
  renderAll();
  $('formOk').hidden = false;
  $('amountInput').value = ''; $('noteInput').value = '';
  $('dateInput').value = todayISO();
  setTimeout(function () { $('formOk').hidden = true; }, 2600);
}

/* Inline-confirm delete (requirements §2.2) */
function handleLedgerClick(ev) {
  var btn = ev.target.closest ? ev.target.closest('button') : null;
  if (!btn) return;
  var row = btn.closest('.entry-row');
  if (!row) return;
  var id = row.getAttribute('data-id');
  var action = btn.getAttribute('data-action');
  if (action === 'ask-delete') {
    var actions = row.querySelector('.entry-actions');
    actions.innerHTML = '<span class="entry-confirm">Strike out? ' +
      '<button type="button" class="yes" data-action="confirm-delete">Strike it</button>' +
      '<button type="button" data-action="cancel-delete">Keep</button></span>';
  } else if (action === 'cancel-delete') {
    renderLedger();
  } else if (action === 'confirm-delete') {
    row.classList.add('leaving');
    setTimeout(function () {
      state.entries = state.entries.filter(function (e) { return e.id !== id; });
      saveState(); renderAll();
    }, 280);
  }
}

/* ─────────────── Ambience ─────────────── */
function setAmbience(on) {
  document.body.classList.toggle('no-ambience', !on);
  $('ambienceState').textContent = on ? 'lit' : 'dimmed';
  $('ambienceToggle').setAttribute('aria-pressed', on ? 'true' : 'false');
}

/* ─────────────── Init ─────────────── */
var state = loadState();
seedIfNeeded();

document.querySelectorAll('.chip').forEach(function (chip) {
  chip.addEventListener('click', function () { setType(chip.getAttribute('data-type')); });
});
$('entryForm').addEventListener('submit', handleSubmit);
$('filterSelect').addEventListener('change', function () { currentFilter = this.value; renderLedger(); });
$('ledgerBook').addEventListener('click', handleLedgerClick);
$('downloadVerdict').addEventListener('click', downloadVerdictCard);
$('ambienceToggle').addEventListener('click', function () {
  setAmbience(document.body.classList.contains('no-ambience'));
});
$('clearBook').addEventListener('click', function () {
  $('clearBook').hidden = true; $('clearConfirm').hidden = false;
});
$('clearNo').addEventListener('click', function () {
  $('clearConfirm').hidden = true; $('clearBook').hidden = false;
});
$('clearYes').addEventListener('click', function () {
  state = emptyState(); state.seeded = true; /* cleared book stays empty on reload */
  saveState(); renderAll();
  $('clearConfirm').hidden = true; $('clearBook').hidden = false;
});

var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setAmbience(!prefersReduced);
$('dateInput').value = todayISO();
$('dateInput').max = todayISO();
setType('expense');
renderAll();
