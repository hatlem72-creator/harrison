(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ALL = [...RECORDS, ...WILBURYS];

/* theme */
const tb = $('#themeBtn');
const setTheme = d => { document.documentElement.dataset.theme = d ? 'dark' : ''; tb.setAttribute('aria-pressed', d); try { localStorage.setItem('gh-theme', d ? 'dark' : 'light'); } catch (e) {} };
tb.setAttribute('aria-pressed', document.documentElement.dataset.theme === 'dark');
tb.addEventListener('click', () => setTheme(document.documentElement.dataset.theme !== 'dark'));

/* cards */
const peak = r => { const out = []; for (const [k, v] of Object.entries(r.charts)) { out.push(`<span class="pill${v === '1' ? ' one' : ''}">${k} ${v === '—' ? '–' : '#' + v}</span>`); } return out.join(''); };
const card = r => `<button class="card reveal" data-id="${r.id}" aria-label="Open ${esc(r.title)} (${r.year})">
  <div class="art"><img src="${r.cover}" alt="Cover of ${esc(r.title)}" loading="lazy" width="500" height="500">${r.live ? '<span class="badge">Live</span>' : ''}${r.id === 'brainwashed' ? '<span class="badge">Posthumous</span>' : ''}</div>
  <div class="meta"><span class="yr">${r.year}</span><h3>${esc(r.title)}</h3><p class="tag">${esc(r.tag)}</p><div class="pk">${peak(r)}</div></div></button>`;
$('#recordGrid').innerHTML = RECORDS.map(card).join('');
$('#wilGrid').innerHTML = WILBURYS.map(card).join('');

/* timeline */
$('#timeline').innerHTML = ALL.slice().sort((a, b) => a.year - b.year).map(r =>
  `<a class="tl${r.id.startsWith('wilburys') ? ' wil' : ''}" href="#r/${r.id}" title="${esc(r.title)}"><i></i><b>${r.year}</b><span>${esc(r.title.replace('Traveling Wilburys ', 'Wilburys ').replace(/ \(.*\)/, '').split(' ').slice(0, 3).join(' '))}</span></a>`).join('');

/* compilations */
$('#compStrip').innerHTML = COMPILATIONS.map(c => `<a class="comp reveal" href="${c.src}" target="_blank" rel="noopener"><img src="${c.cover}" alt="" loading="lazy" width="72" height="72"><div><b>${c.year} · ${esc(c.title)}</b><span>${c.note}</span></div></a>`).join('');

/* beatles */
$('#bSongs').innerHTML = BEATLES_SONGS.map(([y, al, s]) => `<li><span class="y">${y}</span><span class="al">${esc(al)}</span><span class="s">${s.map(esc).join(' · ')}</span></li>`).join('');
$('#bQuotes').innerHTML = BEATLES_QUOTES.map(q => `<figure class="q"><p>${q.text}</p><cite>${esc(q.who)}</cite></figure>`).join('') +
  `<p class="small">Sources: <a href="https://en.wikipedia.org/wiki/George_Harrison" target="_blank" rel="noopener">Wikipedia</a>, <a href="http://www.beatlesinterviews.org/db1980.jlpb.beatles.html" target="_blank" rel="noopener">Playboy 1980</a>, <a href="https://en.wikipedia.org/wiki/I,_Me,_Mine_(book)" target="_blank" rel="noopener">I, Me, Mine</a>.</p>`;

/* guests */
const ROLE = {W: 'Writer', P: 'Producer', G: 'Guitar', V: 'Vocals', K: 'Instruments'};
let filt = 'all', q = '';
function renderGuests() {
  const rows = GUEST.filter(g => {
    const tags = g[4].split(' ');
    if (filt === 'alias' && !g[5]) return false;
    if (!['all', 'alias'].includes(filt) && !tags.includes(filt)) return false;
    if (q && !(g[1] + ' ' + g[2] + ' ' + g[3] + ' ' + (g[5] || '')).toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {}; rows.forEach(g => (by[g[0]] = by[g[0]] || []).push(g));
  $('#guestList').innerHTML = Object.keys(by).sort().map(y => `<div class="yeargrp"><h3>${y}</h3><div>${by[y].map(g => `<div class="g"><div><span class="who">${esc(g[1])}</span><span class="what">${esc(g[2])}</span></div><div><div class="role">${g[3]}</div><div class="tags">${[...new Set(g[4].split(' '))].map(t => `<span class="t ${t}">${ROLE[t]}</span>`).join('')}${g[5] ? `<span class="alias">as “${esc(g[5])}”</span>` : ''}</div></div></div>`).join('')}</div></div>`).join('') || '<p>No matches.</p>';
  $('#gCount').textContent = `${rows.length} of ${GUEST.length} entries`;
}
$$('.chip').forEach(c => c.addEventListener('click', () => { $$('.chip').forEach(x => x.classList.remove('on')); c.classList.add('on'); filt = c.dataset.f; renderGuests(); }));
$('#gSearch').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); renderGuests(); });
renderGuests();

/* photos */
$('#gallery').innerHTML = PHOTOS.map((p, i) => `<figure class="ph reveal" data-i="${i}"><img src="${p.src}" alt="${esc(p.cap.replace(/<[^>]+>/g, ''))}" loading="lazy"><figcaption><b>${p.year}</b>${p.cap}<small>${p.cred} · <a href="${p.url}" target="_blank" rel="noopener">${p.lic}</a></small></figcaption></figure>`).join('');
const lb = $('#lightbox');
$('#gallery').addEventListener('click', e => { if (e.target.closest('a')) return; const f = e.target.closest('.ph'); if (!f) return; const p = PHOTOS[f.dataset.i]; $('img', lb).src = p.src; $('img', lb).alt = f.querySelector('img').alt; $('p', lb).innerHTML = p.cap + ' · ' + p.cred + ' (' + p.lic + ')'; lb.hidden = false; });
lb.addEventListener('click', () => lb.hidden = true);

/* sleeve dialog */
const dlg = $('#sleeve');
function sleeve(r) {
  const i = ALL.indexOf(r), prev = ALL[i - 1], next = ALL[i + 1];
  const charts = Object.entries(r.charts).map(([k, v]) => `<div class="chart${v === '1' ? ' top' : ''}"><b>${v}</b><span>${{UK: 'UK', US: 'US', NO: 'NORWAY', NL: 'NL'}[k]}</span></div>`).join('');
  let n = 0;
  const tracks = Object.entries(r.tracks).map(([side, ts]) => `<div class="side">${esc(side)}</div><ol class="tracks" start="${n + 1}">${ts.map(t => { n++; return `<li>${esc(t)}</li>`; }).join('')}</ol>`).join('');
  const bt = r.beatles.length ? `<h4>What the other Beatles said &amp; did</h4>` + r.beatles.map(b => b.kind === 'quote'
     ? `<figure class="bt quote"><p>${b.text}</p><cite>${esc(b.who)}${b.src ? ` · <a href="${b.src}" target="_blank" rel="noopener">${esc(b.srcName)}</a>` : ''}</cite></figure>`
     : `<div class="bt"><cite>${esc(b.who)}</cite>${b.text}</div>`).join('') : '';
  $('#slBody').innerHTML = `
   <div class="sl-top"><button class="sl-close" aria-label="Close">×</button>
     <div class="sl-art"><div class="disc"></div><img src="${r.cover}" alt="Cover of ${esc(r.title)}"></div>
     <div class="sl-head"><span class="yr">${r.year}${r.live ? ' · LIVE' : ''}</span><h2 id="slTitle">${esc(r.title)}</h2><p class="tag">${esc(r.tag)}</p>
       <dl class="spec"><dt>Released</dt><dd>${esc(r.released)}</dd><dt>Label</dt><dd>${esc(r.label)}</dd><dt>Producer</dt><dd>${esc(r.producer)}</dd><dt>Recorded</dt><dd>${esc(r.recorded)}</dd><dt>Reviews</dt><dd>${esc(r.ratings)}</dd></dl>
       <div class="charts" aria-label="Chart peaks">${charts}</div></div></div>
   <div class="sl-body">
     <div><h4>The record</h4><div class="story">${r.text.map(p => `<p>${p}</p>`).join('')}</div>
       ${r.single ? `<p class="single"><b>Singles:</b> ${esc(r.single)}</p>` : ''}
       ${bt}
       <h4>Sources</h4><div class="srcs">${r.sources.map(([a, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(a)} ↗</a>`).join('')}</div></div>
     <div><h4>Tracklist</h4>${tracks}
       <h4>Who played what</h4><ul class="pers">${r.personnel.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul>
       ${r.credNote ? `<p class="small">${esc(r.credNote)}</p>` : ''}</div>
   </div>
   <div class="sl-nav">${prev ? `<button data-go="${prev.id}">← ${prev.year} · ${esc(prev.title)}</button>` : '<span></span>'}${next ? `<button data-go="${next.id}">${next.year} · ${esc(next.title)} →</button>` : ''}</div>`;
  $('.sl-inner', dlg).scrollTop = 0;
  if (!dlg.open) dlg.showModal();
}
function route() {
  const m = location.hash.match(/^#r\/([\w-]+)/);
  const r = m && ALL.find(x => x.id === m[1]);
  if (r) sleeve(r); else if (dlg.open) dlg.close();
}
document.addEventListener('click', e => {
  const c = e.target.closest('.card'); if (c) { location.hash = 'r/' + c.dataset.id; return; }
  const g = e.target.closest('[data-go]'); if (g) { history.replaceState(null, '', '#r/' + g.dataset.go); route(); return; }
  if (e.target.closest('.sl-close')) closeDlg();
});
function closeDlg() { dlg.close(); }
dlg.addEventListener('close', () => { if (location.hash.startsWith('#r/')) history.replaceState(null, '', location.pathname + location.search + '#records'); });
dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });
window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !lb.hidden) lb.hidden = true;
  if (!dlg.open) return;
  const m = location.hash.match(/^#r\/([\w-]+)/); const i = m ? ALL.findIndex(x => x.id === m[1]) : -1;
  if (e.key === 'ArrowRight' && ALL[i + 1]) { history.replaceState(null, '', '#r/' + ALL[i + 1].id); route(); }
  if (e.key === 'ArrowLeft' && i > 0) { history.replaceState(null, '', '#r/' + ALL[i - 1].id); route(); }
});
route();

/* reveal + active nav */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -8% 0px'});
$$('.reveal,.slide').forEach(el => io.observe(el));
const navs = $$('.nav a');
const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), {rootMargin: '-45% 0px -50% 0px'});
['records', 'wilburys', 'beatles', 'others', 'photos'].forEach(id => so.observe(document.getElementById(id)));
})();
