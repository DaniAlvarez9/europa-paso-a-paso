/* Motor de Matemáticas para «Estudia con Laura».
   Cada tema define window.TEMA = {app, key, title, sub, hello, blocks:[...]} en su contenido.js.
   Bloque: {id, name, desc, ico, c, slides:[...], gen:(nivel)=>ejercicio, retoN?, fixed?:[()=>ejercicio]}
   Ejercicio: {skill, label, title, steps:[paso...], sol}
   Pasos: num · pow · pair · choice · expr · div · cells · info  */
(function () {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a };
const fmt = n => typeof n === 'number' ? n.toLocaleString('es-ES') : n;
const cssv = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const strip = h => h.replace(/<sup>(.*?)<\/sup>/g, ' elevado a $1 ').replace(/<[^>]+>/g, ' ').replace(/·/g, ' por ').replace(/√/g, ' raíz de ').replace(/\s+/g, ' ');

/* ---------- Micro ---------- */
function MIC(mood) {
  const mouth = { happy: '<path d="M31 47q9 8 18 0" fill="none" stroke="#173f3a" stroke-width="3" stroke-linecap="round"/>', wow: '<ellipse cx="40" cy="48" rx="5" ry="6" fill="#173f3a"/>', oops: '<path d="M31 50q4-4 9 0t9 0" fill="none" stroke="#173f3a" stroke-width="3" stroke-linecap="round"/>', think: '<path d="M33 49h13" stroke="#173f3a" stroke-width="3" stroke-linecap="round"/>', calm: '<path d="M33 48q7 4 14 0" fill="none" stroke="#173f3a" stroke-width="3" stroke-linecap="round"/>' }[mood || 'happy'];
  const eyes = mood === 'calm' ? '<path d="M25 36q5 4 10 0M45 36q5 4 10 0" fill="none" stroke="#173f3a" stroke-width="3" stroke-linecap="round"/>' : '<ellipse cx="30" cy="35" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="50" cy="35" rx="6.5" ry="7.5" fill="#fff"/><circle cx="31.5" cy="36.5" r="3.6" fill="#173f3a"/><circle cx="51.5" cy="36.5" r="3.6" fill="#173f3a"/><circle cx="33" cy="35" r="1.2" fill="#fff"/><circle cx="53" cy="35" r="1.2" fill="#fff"/>';
  const brows = mood === 'oops' ? '<path d="M24 26l9 3M56 26l-9 3" stroke="#173f3a" stroke-width="2.5" stroke-linecap="round"/>' : '';
  const star = mood === 'wow' ? '<path d="M66 10l2 5 5 1-4 3 1 5-4-3-5 3 2-5-4-3 5-1z" fill="#ffd34d"/>' : '';
  return `<svg class="mic" viewBox="0 0 80 80"><path d="M12 60c-6 4-8 10-4 14" fill="none" stroke="#0e7c72" stroke-width="3" stroke-linecap="round"/><path d="M40 8c18 0 30 12 30 30s-10 32-30 32S10 58 10 40 22 8 40 8z" fill="#8fe0d3" stroke="#fff" stroke-width="3"/><path d="M40 8c18 0 30 12 30 30s-10 32-30 32S10 58 10 40 22 8 40 8z" fill="none" stroke="#119c8f" stroke-width="2"/><circle cx="22" cy="58" r="2.5" fill="#5cc7b6"/><circle cx="58" cy="60" r="2" fill="#5cc7b6"/><circle cx="62" cy="22" r="2.4" fill="#5cc7b6"/>${eyes}<ellipse cx="22" cy="46" rx="4.5" ry="3" fill="#f7a6b8" opacity=".8"/><ellipse cx="58" cy="46" rx="4.5" ry="3" fill="#f7a6b8" opacity=".8"/>${brows}${mouth}${star}</svg>`
}
const guide = (mood, html) => `<div class="guide">${MIC(mood)}<div class="bubble">${html}</div></div>`;

/* ---------- sonido, voz, confeti ---------- */
let AC;
function tone(ok, big) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const seq = big ? [660, 880, 1100] : ok ? [660, 880] : [330, 262]; seq.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = ok ? 'triangle' : 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, AC.currentTime + i * .1); g.gain.exponentialRampToValueAtTime(ok ? .14 : .08, AC.currentTime + i * .1 + .02); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + i * .1 + .18); o.connect(g).connect(AC.destination); o.start(AC.currentTime + i * .1); o.stop(AC.currentTime + i * .1 + .2) }) } catch (e) { } }
function speak(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'es-ES'; u.rate = .95; const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('es-ES')); if (v) u.voice = v; speechSynthesis.speak(u) } catch (e) { } }
function confetti() { const c = document.createElement('div'); c.className = 'confetti'; const cols = ['#e07a10', '#2f6fd6', '#7a52c7', '#119c8f', '#d9467a', '#2fa866']; for (let i = 0; i < 60; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = cols[i % 6]; e.style.animationDelay = Math.random() * .5 + 's'; e.style.animationDuration = 1.2 + Math.random() * .9 + 's'; c.appendChild(e) } document.body.appendChild(c); setTimeout(() => c.remove(), 2600) }

/* ---------- notación ---------- */
const P = (b, e) => `<span class="m">${b}<sup>${e}</sup></span>`;
const R = (x, idx) => `<span class="rad m">${idx && idx != 2 ? `<span class="ri">${idx}</span>` : ''}<span class="rs">√</span><span class="rc">${x}</span></span>`;

/* ---------- expresiones: fichas, prioridad y pasos ---------- */
const PR = { '+': 1, '-': 1, '·': 2, ':': 2, '^': 3, 'r': 3 };
function tokenize(s) {
  const T = []; s = s.replace(/\*/g, '·').replace(/x/g, '·').replace(/\s+/g, '');
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (/\d/.test(c)) { let j = i; while (j < s.length && /\d/.test(s[j])) j++; T.push({ t: 'n', v: +s.slice(i, j) }); i = j; continue }
    if ('+-·:^'.includes(c)) T.push({ t: 'op', v: c });
    else if (c === '√' || c === 'r') T.push({ t: 'r' });
    else if (c === '(' || c === '[') T.push({ t: '(', k: c });
    else if (c === ')' || c === ']') T.push({ t: ')', k: c });
    i++;
  }
  return T;
}
const isN = t => t && t.t === 'n';
function pairs(T) { const st = [], out = []; T.forEach((t, i) => { if (t.t === '(') st.push(i); else if (t.t === ')') out.push({ o: st.pop(), c: i }) }); return out }
function regions(T) {
  const ps = pairs(T); if (!ps.length) return [[0, T.length - 1]];
  return ps.filter(p => !T.slice(p.o + 1, p.c).some(t => t.t === '(' || t.t === ')')).map(p => [p.o + 1, p.c - 1]);
}
function opsIn(T, a, b) {
  const ops = [];
  for (let i = a; i <= b; i++) {
    const t = T[i];
    if (t.t === 'op') ops.push({ i, p: PR[t.v], ready: i - 1 >= a && i + 1 <= b && isN(T[i - 1]) && isN(T[i + 1]) && !(T[i - 2] && T[i - 2].t === 'r') });
    if (t.t === 'r') ops.push({ i, p: 3, ready: i + 1 <= b && isN(T[i + 1]) });
  }
  return ops;
}
function allowed(T) {
  const out = [];
  regions(T).forEach(([a, b]) => {
    const ops = opsIn(T, a, b); if (!ops.length) return;
    const max = Math.max(...ops.map(o => o.p));
    ops.forEach(o => {
      if (!o.ready || o.p !== max) return;
      if (o.p < 3) { const prev = T[o.i - 2]; if (o.i - 2 >= a && prev && prev.t === 'op' && PR[prev.v] === o.p) return }
      out.push(o.i);
    });
    if (!out.length) ops.filter(o => o.ready && o.p === max).forEach(o => out.push(o.i));
  });
  return out;
}
function whyNot(T, i) {
  const rs = regions(T), inside = rs.find(([a, b]) => i >= a && i <= b);
  if (!inside) return 'Primero se resuelve lo que está <b>dentro de los paréntesis</b>, de dentro hacia fuera.';
  const ops = opsIn(T, inside[0], inside[1]), me = ops.find(o => o.i === i), max = Math.max(...ops.map(o => o.p));
  if (me.p < max) return max === 3 ? 'Antes van las <b>potencias y raíces</b>.' : 'Antes van las <b>multiplicaciones y divisiones</b>.';
  if (!me.ready) return 'A esta operación aún le falta un número: primero hay que calcular lo que tiene al lado.';
  return 'Tienen la misma prioridad: se hacen <b>de izquierda a derecha</b>, como cuando lees.';
}
function subOf(T, i) { const t = T[i]; if (t.t === 'r') return { a: T[i + 1].v, op: 'r' }; return { a: T[i - 1].v, op: t.v, b: T[i + 1].v } }
function calc(s) {
  switch (s.op) {
    case '+': return s.a + s.b; case '-': return s.a - s.b; case '·': return s.a * s.b;
    case ':': return s.b && s.a % s.b === 0 ? s.a / s.b : NaN;
    case '^': return s.b <= 12 ? Math.pow(s.a, s.b) : NaN;
    case 'r': { const r = Math.round(Math.sqrt(s.a)); return r * r === s.a ? r : NaN }
  }
}
const subHTML = s => s.op === 'r' ? R(fmt(s.a)) : s.op === '^' ? P(fmt(s.a), s.b) : `<span class="m">${fmt(s.a)} ${s.op} ${fmt(s.b)}</span>`;
function applyOp(T, i, v) {
  T = T.slice();
  if (T[i].t === 'r') T.splice(i, 2, { t: 'n', v }); else T.splice(i - 1, 3, { t: 'n', v });
  let ch = true; while (ch) { ch = false; for (let k = 0; k < T.length - 2; k++) if (T[k].t === '(' && isN(T[k + 1]) && T[k + 2].t === ')') { T.splice(k + 2, 1); T.splice(k, 1); ch = true; break } }
  return T;
}
function renderT(T, opts = {}) {
  let h = '';
  for (let k = 0; k < T.length; k++) {
    const t = T[k], click = opts.click;
    const sel = opts.sel != null && (k === opts.sel || (T[opts.sel].t === 'r' ? k === opts.sel + 1 : (k === opts.sel - 1 || k === opts.sel + 1)));
    const sc = sel ? ' selbox' : '';
    if (t.t === 'n') { h += `<span class="tk${sc}" data-k="${k}">${fmt(t.v)}</span>`; continue }
    if (t.t === 'op' && t.v === '^') { const e = T[k + 1]; h += `<sup class="tk${click ? ' op' : ''}${sc}" data-i="${k}">${isN(e) ? e.v : '?'}</sup>`; k++; continue }
    if (t.t === 'op') { h += `<span class="tk${click ? ' op' : ''}${sc}" data-i="${k}">${t.v}</span>`; continue }
    if (t.t === 'r') { const n = T[k + 1]; if (isN(n)) { h += `<span class="rad tk${click ? ' op' : ''}${sc}" data-i="${k}"><span class="rs">√</span><span class="rc">${fmt(n.v)}</span></span>`; k++ } else h += `<span class="tk${click ? ' op' : ''}" data-i="${k}">√</span>`; continue }
    if (t.t === '(' || t.t === ')') h += `<span class="tk">${t.k}</span>`;
  }
  return `<span class="expr m">${h}</span>`;
}
const mx = s => renderT(tokenize(s));
function solveAll(s) { let T = tokenize(s); const steps = []; let guard = 0; while (!(T.length === 1 && isN(T[0])) && guard++ < 60) { const al = allowed(T); if (!al.length) return null; const i = al[0], sub = subOf(T, i), v = calc(sub); if (!Number.isFinite(v) || v < 0) return null; steps.push({ T, i, sub, v }); T = applyOp(T, i, v) } return guard < 60 ? { steps, result: T[0].v } : null }

/* ---------- teclado ---------- */
const Pad = { el: null, slots: [], cur: 0, onGo: null, extra: null };
function padInit() {
  const p = document.createElement('div'); p.className = 'pad'; p.id = 'pad';
  p.innerHTML = `<div class="in">${[7, 8, 9, '⌫', 4, 5, 6, 'sw', 1, 2, 3, 'go', 'x', 0, 'x2', 'go2'].map(k => k === 'x' || k === 'x2' || k === 'go2' ? '<span></span>' : `<button data-k="${k}" class="${k === 'go' ? 'go' : (k === '⌫' || k === 'sw') ? 'fn' : ''}" ${k === 'go' ? 'style="grid-row:span 2"' : ''}>${k === 'go' ? '✓' : k === 'sw' ? '⇅' : k}</button>`).join('')}</div>`;
  document.body.appendChild(p); Pad.el = p;
  p.querySelectorAll('button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); key(b.dataset.k) }));
  addEventListener('keydown', e => { if (!Pad.el.classList.contains('on')) return; if (/^\d$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('⌫'); else if (e.key === 'Enter') key('go'); else if (e.key === 'Tab') { e.preventDefault(); key('sw') } });
}
function key(k) {
  const s = Pad.slots[Pad.cur]; if (!s && k !== 'go') return;
  if (k === 'go') { Pad.onGo && Pad.onGo(); return }
  if (k === 'sw') { focusSlot((Pad.cur + 1) % Pad.slots.length); return }
  s.classList.remove('no', 'ok');
  let v = s.dataset.v || '';
  if (k === '⌫') v = v.slice(0, -1); else if (v.length < (+s.dataset.max || 8)) v = (v === '0' ? '' : v) + k;
  s.dataset.v = v; s.innerHTML = v ? fmt(+v) : '<span class="ph">?</span>';
  if (k !== '⌫' && s.dataset.max && v.length >= +s.dataset.max && Pad.slots.length > 1 && Pad.cur < Pad.slots.length - 1) focusSlot(Pad.cur + 1);
}
function focusSlot(i) { Pad.cur = i; Pad.slots.forEach((s, j) => s.classList.toggle('on', j === i)) }
function padOn(slots, onGo) {
  Pad.slots = slots; Pad.onGo = onGo; Pad.cur = 0; focusSlot(0);
  slots.forEach((s, i) => s.onclick = () => focusSlot(i));
  Pad.el.querySelector('[data-k="sw"]').style.visibility = slots.length > 1 ? 'visible' : 'hidden';
  Pad.el.classList.add('on'); $('#body').classList.add('withpad');
  setTimeout(() => { const s = slots[0]; if (s) s.scrollIntoView({ block: 'center', behavior: 'smooth' }) }, 60);
}
function padOff() { Pad.el.classList.remove('on'); Pad.slots = []; Pad.onGo = null; const b = $('#body'); if (b) b.classList.remove('withpad') }
const slot = (cls = '', max = 7) => `<span class="slot ${cls}" data-max="${max}"><span class="ph">?</span></span>`;
const val = s => s.dataset.v === undefined || s.dataset.v === '' ? null : +s.dataset.v;

/* ---------- motor de ejercicios (paso a paso) ---------- */
const OKM = ['¡Bien!', '¡Eso es!', '¡Muy bien!', '¡Genial!', '¡Exacto!', '¡Lo tienes!'];
const NOM = ['Casi…', 'Uy, revisa.', 'No pasa nada, otra vez.', 'Mmm, no es eso.'];
const CALM = { wrongRow: 0, lastCalm: 0, onCalm: null };

function runExercise(host, ex, done, opts = {}) {
  let si = -1, revealed = false, errs = 0, hints = 0, hintI = 0;
  host.innerHTML = `<div class="ex"><div class="exhead">${opts.head || ''}</div><div class="extitle">${ex.title}</div><div class="steps"></div>
    <div class="tools"><button data-t="hint">💡 Pista</button><button data-t="sol" style="display:none">👀 Ver la solución</button></div><div class="fbk"></div></div>`;
  const stepsEl = host.querySelector('.steps'), fbk = host.querySelector('.fbk'), tools = host.querySelector('.tools');
  let curHint = () => null;
  tools.querySelector('[data-t="hint"]').onclick = () => { const h = curHint(hintI++); hints++; if (h) say('info', h, 'think'); else say('info', 'Ya te he dado todas las pistas de este paso. Si quieres, mira la solución y luego hacemos otro parecido.', 'think'); tools.querySelector('[data-t="sol"]').style.display = '' };
  tools.querySelector('[data-t="sol"]').onclick = () => { revealed = true; showSol() };
  function say(kind, html, mood) { fbk.innerHTML = `<div class="msg ${kind}">${MIC(mood || (kind === 'okk' ? 'happy' : kind === 'no' ? 'think' : 'think'))}<div>${html}</div></div>`; setTimeout(() => fbk.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 30) }
  function wrong(html) {
    errs++; CALM.wrongRow++; tone(false); say('no', `<b>${pick(NOM)}</b> ${html || ''}`);
    if (errs >= 2) tools.querySelector('[data-t="sol"]').style.display = '';
    if (CALM.wrongRow >= 3 && Date.now() - CALM.lastCalm > 4 * 60000 && CALM.onCalm) { CALM.lastCalm = Date.now(); CALM.wrongRow = 0; setTimeout(CALM.onCalm, 900) }
  }
  function right(html) { CALM.wrongRow = 0; tone(true); if (html) say('okk', `<b>${pick(OKM)}</b> ${html}`); else fbk.innerHTML = '' }
  function showSol() {
    padOff(); host.querySelectorAll('.slot').forEach(s => s.onclick = null);
    stepsEl.insertAdjacentHTML('beforeend', `<div class="step"><div class="q">👀 Así se hace:</div><div class="box" style="font-size:17px;line-height:1.6">${ex.sol}</div></div>`);
    finish();
  }
  function next() { hintI = 0; si++; if (si >= ex.steps.length) return finish(); const st = ex.steps[si]; const wrap = document.createElement('div'); wrap.className = 'step'; stepsEl.appendChild(wrap); TYPES[st.type || 'num'](wrap, st, { right, wrong, say, next: () => { wrap.classList.add('done'); next() }, setHint: f => curHint = f }) }
  function finish() {
    padOff(); tools.style.display = 'none';
    const good = !revealed;
    const msg = revealed ? 'No pasa nada: mira bien cómo se hace y el siguiente lo haces tú. 💪' : errs === 0 ? (hints ? '¡Muy bien! Con una pista, pero lo has hecho tú.' : '¡Perfecto, sin ningún fallo! 🌟') : errs <= 2 ? '¡Lo has peleado y lo has conseguido! 💪' : '¡No te has rendido! Así se aprende. 💪';
    say(good ? 'okk' : 'info', msg, good ? (errs ? 'happy' : 'wow') : 'calm');
    if (good && !errs) tone(true, true);
    done({ ok: good, perfect: good && errs === 0, errs, hints, revealed });
  }
  next();
}

const TYPES = {
  info(w, st, api) { w.innerHTML = `<div class="q">${st.q || ""}</div>`; setTimeout(api.next, 50) },
  num(w, st, api) {
    w.innerHTML = `<div class="q">${st.q || ""}</div><div class="ans">${st.pre || ''}${slot('', st.max || 7)}${st.post || ''}</div>`;
    const s = w.querySelector('.slot'); let tries = 0;
    api.setHint(i => (st.hints || [])[i]);
    padOn([s], () => { const v = val(s); if (v === null) return; if (v === st.ans) { s.classList.add('ok'); s.onclick = null; padOff(); api.right(st.okMsg); api.next() } else { tries++; s.classList.add('no'); api.wrong(st.why ? st.why(v, tries) : (tries >= 2 && st.hints && st.hints[0] ? st.hints[0] : 'Revisa la cuenta.')); setTimeout(() => { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') }, 900) } });
  },
  pair(w, st, api) {
    w.innerHTML = `<div class="q">${st.q || ""}</div><div class="ans" style="font-size:20px">${st.fields.map((f, i) => `<span style="display:inline-flex;align-items:center;gap:6px">${f.label} ${slot('', f.max || 6)}</span>`).join('<span style="width:10px"></span>')}</div>`;
    const ss = [...w.querySelectorAll('.slot')];
    api.setHint(i => (st.hints || [])[i]);
    padOn(ss, () => {
      const vs = ss.map(val); if (vs.some(v => v === null)) { const k = vs.findIndex(v => v === null); focusSlot(k); return }
      const bad = st.fields.map((f, i) => vs[i] !== f.v);
      if (!bad.some(Boolean)) { ss.forEach(s => s.classList.add('ok')); padOff(); api.right(st.okMsg); api.next() }
      else { ss.forEach((s, i) => { if (bad[i]) s.classList.add('no') }); api.wrong(st.why ? st.why(vs) : 'Revisa la casilla en rojo.'); setTimeout(() => ss.forEach((s, i) => { if (bad[i]) { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') } }), 900) }
    });
  },
  pow(w, st, api) {
    const b = st.fixB != null ? `<span>${st.fixB}</span>` : slot('', 4), e = st.fixE != null ? `<sup style="font-size:.6em">${st.fixE}</sup>` : slot('small', 3);
    w.innerHTML = `<div class="q">${st.q || ""}</div><div class="ans">${st.pre || ''}<span class="supbox">${b}${st.fixE != null ? e : e}</span>${st.post || ''}</div>`;
    const ss = [...w.querySelectorAll('.slot')];
    api.setHint(i => (st.hints || [])[i]);
    padOn(ss, () => {
      const vs = ss.map(val); if (vs.some(v => v === null)) return;
      let vb = st.fixB != null ? st.b : vs[0], ve = st.fixE != null ? st.e : vs[vs.length - 1];
      if (vb === st.b && ve === st.e) { ss.forEach(s => s.classList.add('ok')); padOff(); api.right(st.okMsg); api.next() }
      else { ss.forEach(s => s.classList.add('no')); api.wrong(st.why ? st.why(vb, ve) : 'Revisa.'); setTimeout(() => ss.forEach(s => { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') }), 900); focusSlot(0) }
    });
  },
  choice(w, st, api) {
    const order = st.keep ? st.opts.map((_, i) => i) : shuffle(st.opts.map((_, i) => i));
    w.innerHTML = `<div class="q">${st.q || ""}</div><div class="choices">${order.map(i => `<button data-i="${i}">${st.opts[i]}</button>`).join('')}</div>`;
    api.setHint(i => (st.hints || [])[i]);
    w.querySelectorAll('.choices button').forEach(b => b.onclick = () => {
      if (+b.dataset.i === st.ans) { w.querySelectorAll('.choices button').forEach(x => { x.disabled = true; if (x === b) x.classList.add('ok'); else x.classList.add('dim') }); api.right(st.okMsg); api.next() }
      else { b.classList.add('bad'); b.disabled = true; api.wrong(st.why ? st.why(+b.dataset.i) : '') }
    });
  },
  cells(w, st, api) {
    const sel = new Set();
    w.innerHTML = `<div class="q">${st.q || ""}</div>${st.table(id => `data-id="${id}"`)}<button class="big" style="margin-top:6px">Comprobar</button>`;
    w.querySelectorAll('td[data-id]').forEach(td => { td.classList.add('pick'); td.onclick = () => { const id = td.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); td.classList.toggle('on') } });
    api.setHint(i => (st.hints || [])[i]);
    w.querySelector('.big').onclick = () => {
      const good = new Set(st.ok), miss = st.ok.filter(x => !sel.has(x)), extra = [...sel].filter(x => !good.has(x));
      if (!miss.length && !extra.length) { w.querySelectorAll('td.on').forEach(td => td.classList.add('ok')); w.querySelector('.big').remove(); w.querySelectorAll('td.pick').forEach(td => td.onclick = null); api.right(st.okMsg); api.next() }
      else { extra.forEach(id => w.querySelector(`td[data-id="${id}"]`).classList.add('no')); setTimeout(() => extra.forEach(id => { const td = w.querySelector(`td[data-id="${id}"]`); td.classList.remove('no', 'on'); sel.delete(id) }), 1200); api.wrong(extra.length ? 'Las casillas en rojo no cumplen la condición.' : `Te falta${miss.length > 1 ? 'n' : ''} ${miss.length} casilla${miss.length > 1 ? 's' : ''} por marcar.`) }
    };
  },
  expr(w, st, api) {
    let T = tokenize(st.expr); const lines = [];
    w.innerHTML = `<div class="trail"></div><div class="q" id="xq"></div><div class="xcalc"></div>`;
    const trail = w.querySelector('.trail'), xq = w.querySelector('#xq'), xc = w.querySelector('.xcalc');
    let tapErr = 0, calcErr = 0, sel = null;
    function draw() {
      const done = T.length === 1 && isN(T[0]);
      trail.innerHTML = lines.map((l, i) => `<div class="ln">${i ? '= ' : ''}${l}</div>`).join('') + `<div class="ln cur">${lines.length ? '= ' : ''}${renderT(T, { click: !done && sel == null, sel })}</div>`;
      if (done) { xq.innerHTML = `🎉 Resultado: <b class="m" style="font-size:22px">${fmt(T[0].v)}</b>`; xc.innerHTML = ''; padOff(); api.right(); api.next(); return }
      if (sel == null) {
        xq.innerHTML = '👆 Toca la operación que va <b>primero</b>.'; xc.innerHTML = '';
        api.setHint(i => { const al = allowed(T); const el = trail.querySelector(`.cur [data-i="${al[0]}"]`); if (el) el.classList.add('hint'); return ruleFor(T, al[0]) });
        trail.querySelectorAll('.cur .op').forEach(el => el.onclick = () => tap(+el.dataset.i, el));
      }
    }
    function tap(i, el) {
      const al = allowed(T);
      if (al.includes(i)) {
        sel = i; tapErr = 0; CALM.wrongRow = 0; const sub = subOf(T, i);
        if (st.auto) { const v = calc(sub); tone(true); xq.innerHTML = `${subHTML(sub)} = <b>${fmt(v)}</b>`; setTimeout(() => { lines.push(renderT(T)); T = applyOp(T, i, v); sel = null; draw() }, 900); draw(); xq.innerHTML = `✅ ${subHTML(sub)} = <b>${fmt(v)}</b>`; return }
        draw(); xq.innerHTML = `✅ ¡Esa! Ahora calcula: ¿cuánto es ${subHTML(sub)}?`;
        xc.innerHTML = `<div class="ans">${subHTML(sub)} = ${slot()}</div>`;
        const s = xc.querySelector('.slot'); calcErr = 0;
        api.setHint(k => calcHint(sub, k));
        padOn([s], () => {
          const v = val(s); if (v === null) return; const ans = calc(sub);
          if (v === ans) { tone(true); CALM.wrongRow = 0; padOff(); lines.push(renderT(T)); T = applyOp(T, i, v); sel = null; draw() }
          else { calcErr++; s.classList.add('no'); api.wrong(calcErr >= 2 ? `${calcHint(sub, 1) || ''} <br>Es <b>${fmt(ans)}</b>. Escríbelo y seguimos.` : `${subHTML(sub)} no da ${fmt(v)}. ${calcHint(sub, 0) || ''}`); setTimeout(() => { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') }, 900) }
        });
      } else { tapErr++; el.classList.add('bad'); setTimeout(() => el.classList.remove('bad'), 600); api.wrong(whyNot(T, i)) }
    }
    draw();
  },
  div(w, st, api) {
    const D = String(st.D), d = st.d; let take = 0; for (let k = 1; k <= D.length; k++) if (+D.slice(0, k) >= d) { take = k; break }
    let pos = take, Pv = +D.slice(0, take), q = '', rows = [], phase = st.skipTake ? 'q' : 'take', lastR = null, qd = null;
    if (st.skipTake) rows.push({ txt: String(Pv), end: take - 1, cur: true });
    w.innerHTML = `<div class="dv-wrap"></div><div class="q" id="dq"></div><div class="dcalc"></div><div class="tools" style="margin-top:4px"><button class="tb">📋 Tabla del ${d}</button></div><div class="chul" style="display:none"></div>`;
    const wrap = w.querySelector('.dv-wrap'), dq = w.querySelector('#dq'), dc = w.querySelector('.dcalc');
    w.querySelector('.tb').onclick = () => { const c = w.querySelector('.chul'); c.style.display = c.style.display === 'none' ? '' : 'none'; drawChul() };
    function drawChul(hi) { w.querySelector('.chul').innerHTML = `<div class="chuleta">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<div class="${hi && d * k <= hi && d * (k + 1) > hi ? 'hi' : ''}">${d} × ${k} = ${fmt(d * k)}</div>`).join('')}</div>` }
    function draw() {
      const L = [`<div class="row">${D.split('').map((c, k) => `<span class="dg ${phase === 'take' ? 'tap' : ''} ${phase !== 'take' && k < take && rows.length <= 1 ? 'take' : ''}" data-k="${k}">${c}</span>`).join('')}</div>`];
      rows.forEach(r => L.push(`<div class="row ${r.cur ? 'cur' : ''} ${r.muted ? 'muted' : ''}">${' '.repeat(Math.max(0, r.end + 1 - r.txt.length))}${r.txt}</div>`));
      wrap.innerHTML = `<div class="div"><div class="L">${L.join('')}</div><div class="R"><div class="dv">${d}</div><div class="q">${q || '&nbsp;'}</div></div></div>`;
      if (phase === 'take') wrap.querySelectorAll('.dg').forEach(g => g.onclick = () => takeTap(+g.dataset.k + 1));
    }
    function takeTap(k) {
      const v = +D.slice(0, k);
      if (k === take) { phase = 'q'; tone(true); rows.push({ txt: String(Pv), end: take - 1, cur: true }); api.right(`Cogemos <b>${Pv}</b>, que ya es mayor o igual que ${d}.`); step() }
      else if (v < d) api.wrong(`<b>${v}</b> es más pequeño que ${d}: no cabe ninguna vez. Coge una cifra más.`);
      else api.wrong(`Con <b>${+D.slice(0, take)}</b> ya es suficiente: es mayor o igual que ${d}. Coge las cifras justas.`);
    }
    function step() {
      draw();
      if (phase === 'take') { dq.innerHTML = `👆 ¿Con cuántas cifras empezamos? <b>Toca la última cifra</b> que cogerías.`; api.setHint(() => `Necesitas el número más pequeño que sea mayor o igual que ${d}. ¿${D[0]} cabe? ${+D[0] >= d ? 'Sí.' : 'No, es más pequeño. Prueba con dos cifras.'}`); return }
      if (phase === 'q') {
        dq.innerHTML = `¿Cuántas veces cabe <b>${d}</b> en <b>${fmt(Pv)}</b>?`;
        dc.innerHTML = `<div class="ans">${slot('', 1)}</div>`; const s = dc.querySelector('.slot'); let tr = 0;
        api.setHint(i => i === 0 ? (drawChul(Pv), w.querySelector('.chul').style.display = '', `Mira la tabla del ${d}: busca el resultado más grande que <b>no se pase</b> de ${fmt(Pv)}.`) : `Cabe <b>${Math.floor(Pv / d)}</b> veces: ${d} × ${Math.floor(Pv / d)} = ${fmt(d * Math.floor(Pv / d))}.`);
        padOn([s], () => {
          const v = val(s); if (v === null) return; const ans = Math.floor(Pv / d);
          if (v === ans) { tone(true); CALM.wrongRow = 0; padOff(); qd = v; q += v; phase = 'r'; step() }
          else { tr++; s.classList.add('no'); api.wrong(v * d > Pv ? `Te pasas: ${d} × ${v} = <b>${fmt(v * d)}</b>, que es más que ${fmt(Pv)}.` : `¡Cabe alguna vez más! ${d} × ${v} = ${fmt(v * d)} y aún sobran ${fmt(Pv - v * d)}, que es ${Pv - v * d >= d ? 'más que' : ''} ${d}.`); setTimeout(() => { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') }, 900) }
        });
        return;
      }
      if (phase === 'r') {
        const prod = d * qd;
        dq.innerHTML = `${d} × ${qd} = <b>${fmt(prod)}</b>. Ahora resta: ¿cuánto sobra?`;
        dc.innerHTML = `<div class="ans">${fmt(Pv)} − ${fmt(prod)} = ${slot('', 3)}</div>`; const s = dc.querySelector('.slot');
        api.setHint(i => i === 0 ? `Resta ${fmt(Pv)} − ${fmt(prod)}. Puedes contar desde ${fmt(prod)} hasta ${fmt(Pv)}.` : `Sobran <b>${Pv - prod}</b>.`);
        padOn([s], () => {
          const v = val(s); if (v === null) return;
          if (v === Pv - prod) {
            tone(true); CALM.wrongRow = 0; padOff(); lastR = v; rows.forEach(r => r.cur = false);
            if (pos < D.length) { const dg = D[pos]; Pv = v * 10 + +dg; rows.push({ txt: String(v).padStart(1) + dg, end: pos, cur: true }); pos++; phase = 'q'; api.say('info', `⬇️ Bajamos el <b>${dg}</b>: ahora tenemos <b>${fmt(Pv)}</b>.`, 'happy'); step() }
            else { rows.push({ txt: String(v), end: pos - 1, cur: true }); phase = 'end'; draw(); const c = +q; dq.innerHTML = `🎉 <b>Cociente: ${fmt(c)}</b> · <b>Resto: ${v}</b>`; dc.innerHTML = `<div class="box" style="font-weight:700">✅ La prueba: ${d} × ${fmt(c)} + ${v} = <b>${fmt(d * c + v)}</b>, que es el dividendo.</div>`; w.querySelector('.tools').remove(); w.querySelector('.chul').remove(); api.right(); api.next() }
          } else { s.classList.add('no'); api.wrong(`${fmt(Pv)} − ${fmt(prod)} no es ${v}.`); setTimeout(() => { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') }, 900) }
        });
      }
    }
    if (!st.skipTake) phase = 'take';
    step();
  }
};
function ruleFor(T, i) {
  const t = T[i];
  if (regions(T).length && pairs(T).length) { const r = regions(T).find(([a, b]) => i >= a && i <= b); if (r && pairs(T).length) return 'Busca el paréntesis de <b>más adentro</b> y empieza por ahí. Te he marcado la operación en amarillo.' }
  if (t.t === 'r' || t.v === '^') return 'Primero las <b>potencias y raíces</b>. Te la he marcado en amarillo.';
  if (t.v === '·' || t.v === ':') return 'Ahora tocan las <b>multiplicaciones y divisiones</b>, de izquierda a derecha. Te la he marcado.';
  return 'Ya solo quedan <b>sumas y restas</b>: de izquierda a derecha. Te la he marcado.';
}
function calcHint(s, k) {
  const { a, b, op } = s;
  if (op === '·') return k === 0 ? (b <= 10 || a <= 10 ? `Piensa en la tabla del ${Math.min(a, b)}.` : `Descompón: ${a} · ${b} = ${a} · ${b - b % 10} + ${a} · ${b % 10}.`) : `${a} · ${b} = ${fmt(a * b)}`;
  if (op === ':') return k === 0 ? `¿Qué número multiplicado por ${b} da ${fmt(a)}?` : `${fmt(a)} : ${b} = ${fmt(a / b)}, porque ${b} · ${fmt(a / b)} = ${fmt(a)}.`;
  if (op === '^') return k === 0 ? `${P(a, b)} = ${Array(b).fill(a).join(' · ') || '1'} ${b === 0 ? '(¡todo número elevado a 0 es 1!)' : ''}` : `${P(a, b)} = ${fmt(Math.pow(a, b))}`;
  if (op === 'r') return k === 0 ? `¿Qué número multiplicado por sí mismo da ${a}?` : `${R(a)} = ${Math.round(Math.sqrt(a))}, porque ${Math.round(Math.sqrt(a))} · ${Math.round(Math.sqrt(a))} = ${a}.`;
  if (op === '+') return k === 0 ? 'Suma con calma, primero las unidades.' : `${a} + ${b} = ${a + b}`;
  if (op === '-') return k === 0 ? `Cuenta desde ${b} hasta ${a}.` : `${a} − ${b} = ${a - b}`;
}

function startApp() {
/* ---------- estado ---------- */
const TM = window.TEMA; const KEY = TM.key; if (TM.htitle) document.getElementById('htitle').innerHTML = TM.htitle; document.title = TM.title + ' · Mates';
let S = { stars: {}, best: {}, seen: {}, lvl: {}, unlockAll: false, done: {} };
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)) } catch (e) { }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) { } Cuenta.save(TM.app, S) }
const BL = TM.blocks, NB = BL.length;
const has = id => !!S.stars[id];
const TSTARS = NB + 1;
function unlocked(i) { if (S.unlockAll || i === 0) return true; if (i === NB) return BL.every(b => has(b.id)); return has(BL[i - 1].id) || (S.done[BL[i - 1].id] || 0) >= 8 }

/* ---------- pantallas ---------- */
function show(id) { $$('.screen').forEach(s => s.classList.toggle('on', s.id === id)); padOff() }
function sheet(h) { $('#sheet').innerHTML = h; $('#over').classList.add('on') }
function closeSheet() { $('#over').classList.remove('on') }
window.closeSheet = closeSheet;

function renderHome() {
  const n = Object.values(S.stars).filter(Boolean).length;
  $('#tot').textContent = n + '/' + TSTARS; $('#totbar').style.width = (100 * n / TSTARS) + '%';
  const items = BL.concat([{ id: 'final', name: 'Desafío del tema', desc: '10 ejercicios mezclados, sin prisa', ico: '🏁', c: '--c6' }]);
  const curI = items.findIndex((b, i) => unlocked(i) && !has(b.id));
  const msg = n === 0 ? TM.hello : n < TSTARS ? `¡Llevas <b>${n} ${n === 1 ? 'estrella' : 'estrellas'}</b>! ${curI >= 0 ? `Te toca: <b>${items[curI].name}</b>.` : ''} Paso a paso, sin prisa. 💪` : '¡Has completado el tema entero! Eres una crack. 🏆';
  $('#hguide').innerHTML = guide(n ? 'wow' : 'happy', msg);
  $('#path').innerHTML = `<svg class="trail" id="trail"></svg>` + items.map((b, i) => {
    const u = unlocked(i), p = has(b.id) ? 100 : Math.min(90, 100 * (S.done[b.id] || 0) / 10);
    return `<div class="stop ${i % 2 ? 'r' : ''} ${u ? '' : 'locked'} ${i === curI ? 'cur' : ''}" data-i="${i}">
      <div class="node" style="--c:var(${b.c});--p:${p}"><span class="ni">${b.ico}</span>${u ? (has(b.id) ? '<span class="lk">⭐</span>' : '') : '<span class="lk">🔒</span>'}</div>
      <div class="plabel"><h3>${i < NB ? (i + 1) + '. ' : ''}${b.name}</h3><p>${b.desc}</p><div class="stars"><span class="${has(b.id) ? 'got' : ''}">${has(b.id) ? '⭐ Reto superado' : '☆ Reto'}</span>${S.done[b.id] ? `<span>✏️ ${S.done[b.id]} hechos</span>` : ''}</div></div></div>`
  }).join('');
  requestAnimationFrame(drawTrail);
  $$('.stop').forEach(el => el.onclick = () => {
    const i = +el.dataset.i;
    if (!unlocked(i)) return sheet(`${MIC('think')}<h2>Todavía no</h2><p>${i === NB ? 'Consigue la estrella de todos los bloques para abrir el Desafío.' : 'Consigue la estrella del bloque anterior (o practica un poco más en él) para abrir este.'}</p><button class="big" onclick="closeSheet()">Vale</button>`);
    if (i === NB) return openFinal();
    openBlock(i, S.seen[BL[i].id + '-0'] ? 'prac' : 'learn');
  });
}
function drawTrail() { const path = $('#path'), svg = $('#trail'); if (!svg) return; const R0 = path.getBoundingClientRect(); const pts = $$('.node').map(n => { const r = n.getBoundingClientRect(); return [r.left - R0.left + r.width / 2, r.top - R0.top + r.height / 2] }); let d = ''; pts.forEach((p, i) => { if (!i) { d = `M${p[0]} ${p[1]}`; return } const q = pts[i - 1], my = (q[1] + p[1]) / 2; d += ` C${q[0]} ${my} ${p[0]} ${my} ${p[0]} ${p[1]}` }); svg.innerHTML = `<path d="${d}" fill="none" stroke="#d9cfbd" stroke-width="6" stroke-dasharray="2 12" stroke-linecap="round"/>` }
addEventListener('resize', () => { if ($('#home').classList.contains('on')) drawTrail() });

let CUR = 0, MODE = 'learn';
function openBlock(i, mode) { CUR = i; const b = BL[i]; document.documentElement.style.setProperty('--blk', cssv(b.c)); $('#btitle').textContent = (i + 1) + '. ' + b.name; $('#bsub').textContent = b.desc; $('#tabs').style.display = ''; show('block'); Cuenta.ev('block', { b: b.id }); setMode(mode) }
function setMode(m) { MODE = m; const b = BL[CUR]; $$('.tab').forEach(t => { t.classList.toggle('on', t.dataset.m === m); const st = t.querySelector('.st'); if (st) st.textContent = has(b.id) ? '⭐' : '' }); $('#body').scrollTop = 0; padOff(); Cuenta.ev('mode', { b: b.id, m }); if (m === 'learn') learn(0); else if (m === 'prac') practice(); else reto() }
$$('.tab').forEach(t => t.onclick = () => setMode(t.dataset.m));
$('#back').onclick = () => { if (RUN && RUN.live && !confirm('¿Salir? Perderás esta ronda.')) return; RUN = null; show('home'); renderHome() };

/* entiende */
function learn(k) {
  const b = BL[CUR], L = b.slides, c = L[k];
  S.seen[b.id + '-' + k] = 1; save(); Cuenta.ev('card', { b: b.id, i: k, l: c.t });
  $('#body').innerHTML = `${k === 0 && b.hello ? guide('happy', b.hello) : ''}<div class="slide"><h3>${c.t}<button class="say" title="Escuchar">🔊</button></h3>${c.html}<div class="demo"></div><div class="try"></div></div>
   <div class="nav"><button class="arrow" id="prev" ${k === 0 ? 'disabled' : ''}>‹</button><div class="dots">${L.map((_, j) => `<i class="${j === k ? 'on' : S.seen[b.id + '-' + j] ? 'seen' : ''}"></i>`).join('')}</div><button class="arrow" id="next" ${k === L.length - 1 ? 'disabled' : ''}>›</button></div>
   ${k === L.length - 1 ? `<button class="big" id="topr">¡A practicar! ✏️</button>` : ''}`;
  $('.slide .say').onclick = () => speak(strip(c.t + '. ' + c.html));
  $('#prev').onclick = () => learn(k - 1); $('#next').onclick = () => learn(k + 1);
  if ($('#topr')) $('#topr').onclick = () => setMode('prac');
  if (c.demo) DEMOS[c.demo.type]($('.slide .demo'), c.demo);
  if (c.check) { const ch = c.check, d = document.createElement('div'); d.className = 'box'; d.innerHTML = `<div class="q" style="margin:0">🤔 ${ch[0]}</div><div class="choices">${shuffle(ch[1].map((o, i) => [o, i])).map(([o, i]) => `<button data-i="${i}">${o}</button>`).join('')}</div><div class="cfb" style="margin-top:6px;font-weight:700"></div>`; $('.slide .try').appendChild(d); d.querySelectorAll('button').forEach(bt => bt.onclick = () => { const ok = bt.dataset.i === '0'; tone(ok); Cuenta.ev('check', { b: b.id, i: k, ok }); if (ok) { d.querySelectorAll('button').forEach(x => { x.disabled = true; if (x === bt) x.classList.add('ok'); else x.classList.add('dim') }); d.querySelector('.cfb').innerHTML = '✅ ' + pick(OKM) + ' ' + (ch[2] || '') } else { bt.classList.add('bad'); bt.disabled = true; d.querySelector('.cfb').innerHTML = '🤔 Casi. ' + (ch[3] || 'Prueba otra.') } }) }
  if (c.try) { const host = document.createElement('div'); host.innerHTML = `<div class="q" style="margin-top:10px">✋ ¡Tu turno!</div><div class="h"></div>`; $('.slide .try').appendChild(host); runExercise(host.querySelector('.h'), c.try(), r => { Cuenta.ev('q', { b: b.id, m: 'learn', id: b.id + ':try' + k, l: 'Tu turno: ' + c.t, ok: r.perfect, first: true, errs: r.errs, hints: r.hints }) }, { head: '' }) }
}
const DEMOS = {
  expr(host, d) {
    const sol = solveAll(d.expr); if (!sol) return;
    host.innerHTML = `<div class="box"><div class="trail"></div><div style="text-align:center;margin-top:6px"><button class="big alt" style="width:auto;padding:8px 16px;margin:0">▶️ Míralo paso a paso</button></div></div>`;
    const tr = host.querySelector('.trail'), btn = host.querySelector('button');
    const play = () => {
      btn.disabled = true; let k = 0; const lines = [];
      tr.innerHTML = `<div class="ln cur">${renderT(tokenize(d.expr))}</div>`;
      const tick = () => {
        if (k >= sol.steps.length) { tr.innerHTML = lines.map((l, i) => `<div class="ln">${i ? '= ' : ''}${l}</div>`).join('') + `<div class="ln cur">= <b>${fmt(sol.result)}</b> 🎉</div>`; btn.disabled = false; btn.textContent = '🔁 Otra vez'; return }
        const s = sol.steps[k];
        tr.innerHTML = lines.map((l, i) => `<div class="ln">${i ? '= ' : ''}${l}</div>`).join('') + `<div class="ln cur">${lines.length ? '= ' : ''}${renderT(s.T, { sel: s.i })}</div><div style="text-align:center;font-weight:800;color:var(--muted);font-size:15px">${subHTML(s.sub)} = ${fmt(s.v)}</div>`;
        lines.push(renderT(s.T)); k++; setTimeout(tick, 1900);
      }; tick();
    };
    btn.onclick = play; tr.innerHTML = `<div class="ln cur">${renderT(tokenize(d.expr))}</div>`;
  },
  pow(host, d) {
    host.innerHTML = `<div class="box" style="text-align:center"><div class="big-math" style="margin:4px 0">${P(d.b, d.e)}</div><div class="chain big-math" style="font-size:22px"></div><button class="big alt" style="width:auto;padding:8px 16px;margin:0">▶️ Calcúlalo conmigo</button></div>`;
    const ch = host.querySelector('.chain'), btn = host.querySelector('button');
    btn.onclick = () => { btn.disabled = true; let k = 1, acc = d.b; ch.innerHTML = `${Array(d.e).fill(d.b).join(' · ')}`; const tick = () => { if (k >= d.e) { ch.innerHTML += `<div style="margin-top:6px">= <b class="hi">${fmt(acc)}</b> 🎉</div>`; btn.disabled = false; btn.textContent = '🔁 Otra vez'; return } const nx = acc * d.b; ch.innerHTML += `<div style="font-size:18px;color:var(--muted)">${fmt(acc)} · ${d.b} = <b style="color:var(--ink)">${fmt(nx)}</b></div>`; acc = nx; k++; setTimeout(tick, 1300) }; setTimeout(tick, 900) };
  },
  html(host, d) { host.innerHTML = d.html },
  squares(host, d) {
    host.innerHTML = `<div class="box" style="text-align:center"><div style="display:inline-grid;grid-template-columns:repeat(${d.n},18px);gap:3px">${Array(d.n * d.n).fill(0).map((_, i) => `<i style="width:18px;height:18px;border-radius:4px;background:${i < (d.extra || 0) + d.n * d.n ? 'color-mix(in srgb,var(--blk) 55%,white)' : '#eee'}"></i>`).join('')}</div><div style="font-weight:800;margin-top:6px">${d.cap}</div></div>`;
  },
  fiesta(host, d) {
    const idx = d.idx, f = d.f;
    host.innerHTML = `<div class="box"><div class="big-math" style="font-size:26px">${R(f.map(([p, e]) => e > 1 ? P(p, e) : p).join('·'), idx)}</div>
      <div style="text-align:center;font-weight:800;margin-bottom:6px">🎟️ Para entrar a la fiesta hacen falta <b>${idx} papeletas</b> por persona</div>
      <div class="party">${f.map(([p, e]) => `<div class="grp"><b>Grupo del ${p}</b><span class="tix">${Array(e).fill('🎟️').map((x, i) => `<i>${x}</i>`).join('')}</span></div>`).join('')}</div>
      <div style="text-align:center"><button class="big alt" style="width:auto;padding:8px 16px;margin:0">▶️ ¡Que empiece la fiesta!</button></div><div class="res"></div></div>`;
    host.querySelector('button').onclick = () => {
      host.querySelectorAll('.grp').forEach((g, k) => { const [p, e] = f[k], q = Math.floor(e / idx), r = e % idx; g.querySelector('.tix').innerHTML = Array(q).fill(`<span class="set">${'🎟️'.repeat(idx)}</span>`).join('') + (r ? `<span class="left">${'🎟️'.repeat(r)}</span>` : ''); g.insertAdjacentHTML('beforeend', `<span style="font-weight:800">→ entran <b>${q}</b> ${q === 1 ? 'persona' : 'personas'}${r ? `, sobra${r > 1 ? 'n' : ''} <b>${r}</b> papeleta${r > 1 ? 's' : ''}` : ', no sobra ninguna'}</span>`) });
      const out = f.filter(([p, e]) => e >= idx).map(([p, e]) => Math.floor(e / idx) > 1 ? P(p, Math.floor(e / idx)) : p).join('·'), inn = f.filter(([p, e]) => e % idx).map(([p, e]) => e % idx > 1 ? P(p, e % idx) : p).join('·');
      host.querySelector('.res').innerHTML = `<div class="big-math" style="font-size:26px">= ${out || ''}${out && inn ? '·' : ''}${inn ? R(inn, idx) : ''}</div><p style="text-align:center;font-weight:700;margin:0">Los que entran salen <b>fuera</b> de la raíz; las papeletas que sobran se quedan <b>dentro</b> (en el bolsillo).</p>`;
    };
  },
  div(host, d) { const h = document.createElement('div'); host.appendChild(h); h.innerHTML = '<div class="q" style="margin-top:10px">✋ ¡Hazla conmigo!</div><div class="h"></div>'; runExercise(h.querySelector('.h'), { skill: 'div-demo', title: `<span class="m">${fmt(d.D)} : ${d.d}</span>`, steps: [{ type: 'div', D: d.D, d: d.d }], sol: '' }, () => { }) }
};

/* ---------- práctica ---------- */
let RUN = null;
const LV = ['🌱 Nivel 1', '🌿 Nivel 2', '🌳 Nivel 3'];
function logQ(b, ex, r, m) { Cuenta.ev('q', { b: b.id, m, id: b.id + ':' + ex.skill, l: ex.label, ok: r.perfect, first: true, errs: r.errs, hints: r.hints, rev: r.revealed }); S.done[b.id] = (S.done[b.id] || 0) + 1; save() }
function practice() {
  const b = BL[CUR]; let lvl = S.lvl[b.id] || 1, row = 0, bad = 0, count = 0;
  RUN = { live: false };
  const fixed = (b.fixed || []).slice(); let fi = S.best['fix-' + b.id] || 0;
  const nextEx = () => {
    const ex = fi < fixed.length && Math.random() < .5 ? (fi++, S.best['fix-' + b.id] = fi, fixed[fi - 1]()) : b.gen(lvl);
    const host = $('#body'); host.innerHTML = `<div class="h"></div><div class="after"></div>`;
    runExercise(host.querySelector('.h'), ex, r => {
      logQ(b, ex, r, 'practica'); count++;
      if (r.perfect) { row++; bad = 0 } else if (!r.ok || r.errs > 2) { bad++; row = 0 } else row = 0;
      let note = '';
      if (row >= 3 && lvl < 3) { lvl++; row = 0; note = `🚀 ¡Subes a <b>${LV[lvl - 1]}</b>!` }
      if (bad >= 2 && lvl > 1) { lvl--; bad = 0; note = `🌱 Vamos a bajar un poquito a <b>${LV[lvl - 1]}</b> para coger confianza.` }
      S.lvl[b.id] = lvl; save();
      host.querySelector('.after').innerHTML = `${note ? `<div class="msg info">${MIC('wow')}<div>${note}</div></div>` : ''}<button class="big" id="nx">Siguiente →</button>${count >= 5 && !has(b.id) ? `<button class="big alt" id="gor">⭐ Me veo preparada: ¡al Reto!</button>` : ''}`;
      if (count % 5 === 0) { confetti(); tone(true, true) }
      $('#nx').onclick = nextEx; if ($('#gor')) $('#gor').onclick = () => setMode('reto');
      $('#nx').scrollIntoView({ block: 'end', behavior: 'smooth' });
    }, { head: `<span class="lvl">${LV[lvl - 1]}</span><span class="sp"></span><span>✏️ Práctica libre · ${count} hechos</span>` });
  };
  nextEx();
}
function reto() {
  const b = BL[CUR], N = b.retoN || 8, lv = N === 8 ? [1, 1, 2, 2, 2, 3, 3, 3] : Array(N).fill(0).map((_, i) => 1 + Math.floor(3 * i / N));
  const res = []; RUN = { live: true };
  const host = $('#body');
  host.innerHTML = guide('happy', `<b>Reto de ${N} ejercicios.</b> Sin prisa y sin vidas: puedes pedir pistas. Para la estrella necesitas ${Math.ceil(N * .75)} bien: resueltos por ti, sin ver la solución y con un fallo como mucho.`) + `<button class="big" id="go">¡Empezar!</button>`;
  $('#go').onclick = () => { let k = 0; const one = () => { if (k >= N) return end(); const ex = b.gen(lv[k]); host.innerHTML = `<div class="h"></div><div class="after"></div>`; runExercise(host.querySelector('.h'), ex, r => { res.push(r); logQ(b, ex, r, 'reto'); k++; host.querySelector('.after').innerHTML = `<button class="big" id="nx">${k < N ? 'Siguiente →' : 'Ver resultado'}</button>`; $('#nx').onclick = one; $('#nx').scrollIntoView({ block: 'end', behavior: 'smooth' }) }, { head: `<span class="pdots">${Array(N).fill(0).map((_, i) => `<i class="${i < res.length ? (res[i].ok && res[i].errs <= 1 ? 'ok' : 'no') : i === k ? 'cur' : ''}"></i>`).join('')}</span><span class="sp"></span><span>⭐ Reto ${k + 1}/${N}</span>` }) }; one() };
  function end() {
    RUN = null; const good = res.filter(r => r.ok && r.errs <= 1).length, got = good >= Math.ceil(N * .75), was = has(b.id);
    if (got) { S.stars[b.id] = 1; confetti() } S.best[b.id] = Math.max(S.best[b.id] || 0, good / N); save();
    Cuenta.ev('round', { b: b.id, m: 'reto', sc: Math.round(100 * good / N), n: N, first: good, star: got });
    sheet(`${MIC(got ? 'wow' : 'calm')}<h2>${got ? (was ? '¡Otra vez genial!' : '¡Estrella conseguida! ⭐') : '¡Buen trabajo!'}</h2><p>${good} de ${N} bien.${got ? '' : ` Para la estrella hacen falta ${Math.ceil(N * .75)}. Practica un poco más y vuelve: ¡seguro que lo consigues!`}</p>
      ${got && CUR < NB - 1 ? `<button class="big" id="s1">Siguiente bloque: ${BL[CUR + 1].name} →</button>` : ''}${!got ? `<button class="big" id="s2">Practicar un poco más ✏️</button>` : ''}<button class="big alt" id="s3">Volver al camino 🗺️</button>`);
    if ($('#s1')) $('#s1').onclick = () => { closeSheet(); openBlock(CUR + 1, 'learn') };
    if ($('#s2')) $('#s2').onclick = () => { closeSheet(); setMode('prac') };
    $('#s3').onclick = () => { closeSheet(); show('home'); renderHome() };
  }
}
function openFinal() {
  CUR = NB; document.documentElement.style.setProperty('--blk', cssv('--c6'));
  $('#btitle').textContent = '🏁 Desafío del tema'; $('#bsub').textContent = TM.title; $('#tabs').style.display = 'none'; show('block');
  const N = 10; const host = $('#body');
  host.innerHTML = `<div style="text-align:center;padding:8px">${MIC('wow')}</div>` + guide('happy', `¡El Desafío! <b>${N} ejercicios</b> de todo el tema mezclados, como en un examen. Sin prisa y sin vidas. Para el 🏆 necesitas <b>8 bien</b>.`) + `<button class="big" id="go">¡Empezar!</button>`;
  host.querySelector('svg').style.cssText = 'width:110px;height:110px';
  $('#go').onclick = () => { Cuenta.ev('final-start'); const res = []; let k = 0; const order = shuffle(Array(N).fill(0).map((_, i) => BL[i % NB])); RUN = { live: true }; const one = () => { if (k >= N) return end(res, order); const b = order[k], ex = b.gen(k < 4 ? 2 : 3); host.innerHTML = `<div class="h"></div><div class="after"></div>`; runExercise(host.querySelector('.h'), ex, r => { res.push(r); logQ(b, ex, r, 'final'); k++; host.querySelector('.after').innerHTML = `<button class="big" id="nx">${k < N ? 'Siguiente →' : 'Ver resultado'}</button>`; $('#nx').onclick = one; $('#nx').scrollIntoView({ block: 'end', behavior: 'smooth' }) }, { head: `<span class="pdots">${Array(N).fill(0).map((_, i) => `<i class="${i < res.length ? (res[i].ok && res[i].errs <= 1 ? 'ok' : 'no') : i === k ? 'cur' : ''}"></i>`).join('')}</span><span class="sp"></span><span style="color:var(${b.c})">${b.name}</span>` }) }; one() };
  function end(res) { RUN = null; const good = res.filter(r => r.ok && r.errs <= 1).length, won = good >= 8; if (won) { S.stars.final = 1; confetti() } S.best.final = Math.max(S.best.final || 0, good); save(); Cuenta.ev('final', { pts: good, won, ok: good, n: N }); sheet(`${MIC(won ? 'wow' : 'calm')}<h2>${won ? '¡Desafío superado! 🏆' : '¡Muy buen intento!'}</h2><p>${good} de ${N} bien.${won ? ' ¡Estás preparada para el examen!' : ' Repasa los bloques donde fallaste y vuelve a intentarlo.'}</p><button class="big" id="f1">Jugar otra vez</button><button class="big alt" id="f2">Volver al camino 🗺️</button>`); $('#f1').onclick = () => { closeSheet(); openFinal() }; $('#f2').onclick = () => { closeSheet(); show('home'); renderHome() } }
}

/* ---------- calma y descansos ---------- */
CALM.onCalm = () => {
  Cuenta.ev('calm', { b: (BL[CUR] || {}).id });
  sheet(`${MIC('calm')}<h2>Vamos con calma</h2><p>Llevas unos cuantos fallos seguidos. Es normal: <b>equivocarse es parte de aprender</b>. ¿Qué te apetece?</p>
    <div class="calm"><button data-a="breath"><span>🫁</span>Respirar 20 segundos</button><button data-a="example"><span>💡</span>Ver la explicación</button><button data-a="easy"><span>🙂</span>Uno más fácil</button><button data-a="go"><span>▶️</span>Seguir intentándolo</button></div>`);
  $$('.calm button').forEach(b => b.onclick = () => {
    const a = b.dataset.a; Cuenta.ev('calm-' + a);
    if (a === 'breath') return breathe();
    closeSheet();
    if (a === 'example' && CUR < NB) setMode('learn');
    if (a === 'easy' && CUR < NB) { S.lvl[BL[CUR].id] = 1; save(); if (MODE === 'prac') practice() }
  });
};
function breathe() {
  sheet(`<h2>Respira conmigo</h2><div class="breath" id="bt">Inspira…</div><p id="bc">Cuando el círculo crece, coge aire. Cuando se hace pequeño, suéltalo despacio.</p><button class="big alt" onclick="closeSheet()">Ya estoy mejor</button>`);
  let t = 0; const lab = () => { const el = $('#bt'); if (!el || !$('#over').classList.contains('on')) return clearInterval(iv); t++; el.textContent = (t % 2) ? 'Suelta…' : 'Inspira…'; if (t >= 6) { clearInterval(iv); $('#bc').textContent = '¡Muy bien! Ahora, a por ello con calma. 💪' } }; const iv = setInterval(lab, 4000);
}
let activeMs = 0, lastIn = Date.now(), breakShown = 0;
['pointerdown', 'keydown'].forEach(e => addEventListener(e, () => lastIn = Date.now(), true));
setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastIn < 60000) activeMs += 5000; if (activeMs >= 15 * 60000 * (breakShown + 1) && !$('#over').classList.contains('on')) { breakShown++; Cuenta.ev('break-offer'); sheet(`${MIC('calm')}<h2>¡Llevas ${15 * breakShown} minutos!</h2><p>Has trabajado un montón. Tu cerebro aprende mejor si descansas un poco: estira, bebe agua y vuelve en 2 minutos.</p><button class="big" id="br">Descansar 2 minutos ⏸️</button><button class="big alt" onclick="closeSheet()">Prefiero seguir</button>`); $('#br').onclick = () => { Cuenta.ev('break'); let s = 120; sheet(`${MIC('calm')}<h2>Descanso</h2><div class="breath" style="animation-duration:6s" id="bt">2:00</div><p>Levántate, estira los brazos, mira por la ventana… 🌤️</p><button class="big alt" onclick="closeSheet()">Volver ya</button>`); const iv = setInterval(() => { s--; const el = $('#bt'); if (!el) return clearInterval(iv); el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); if (s <= 0) { clearInterval(iv); el.textContent = '¡Listo!' } }, 1000) } } }, 5000);

/* ---------- arranque ---------- */
$('#unlockAll').onclick = () => { S.unlockAll = !S.unlockAll; save(); renderHome() };
$('#reset').onclick = () => { if (confirm('¿Borrar todo el progreso de este tema?')) { S = { stars: {}, best: {}, seen: {}, lvl: {}, unlockAll: false, done: {} }; save(); renderHome() } };
$('#over').onclick = e => { if (e.target.id === 'over') closeSheet() };
padInit();
function refreshFoot(me) { $('#unlockAll').textContent = S.unlockAll ? 'Volver a cerrar los bloques' : 'Abrir todos los bloques'; $('#home .foot').style.display = (!me || me.tutor) ? '' : 'none' }
renderHome(); refreshFoot(null);
(async () => { const me = await Cuenta.gate(); if (me) { S = Object.assign({ stars: {}, best: {}, seen: {}, lvl: {}, unlockAll: false, done: {} }, await Cuenta.load(TM.app, S)); try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) { } } refreshFoot(me); renderHome() })();

window.__test = { get S() { return S }, BL, runExercise, setMode, openBlock, get CUR() { return CUR } };
}
window.M = { P, R, mx, fmt, rnd, pick, shuffle, solveAll, tokenize, allowed, calc, subOf, applyOp, runExercise, MIC };
window.startMates = startApp;
})();
