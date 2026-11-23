/* Matemáticas 1º ESO · Cálculo mental y divisiones de dos cifras («gimnasio de cálculo»).
   Encargo de la familia (23-11-2026): a Laura le cuestan mucho el cálculo mental y las divisiones de dos cifras.
   Idea pedagógica: automatizar las tablas, dar estrategias de cálculo mental (partir, redondear y compensar,
   contar hacia arriba, quitar ceros) y entrenar por separado el paso que más bloquea en las divisiones de dos cifras:
   «¿cuántas veces cabe?» (redondear el divisor, probar y ajustar). Sin cronómetro obligatorio: la «ronda relámpago»
   es voluntaria y compite solo contra su propio récord. */
(function () {
const { fmt, rnd, pick, shuffle } = M;
const { slot, val, padOn, padOff, tone, CALM, confetti } = M.ui;
const m = x => `<span class="m">${x}</span>`;
const clear = s => setTimeout(() => { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') }, 700);

/* ---------- estrategias (pistas) ---------- */
function mulTrick(a, b) {
  const t = [9, 8, 6, 7, 5, 4, 11, 12].find(x => x === a || x === b), x = t === a ? b : a;
  switch (t) {
    case 9: return `Truco del 9: ${x} · 10 = ${10 * x}, y le quitas ${x}.`;
    case 8: return `Truco del 8: dobla tres veces: ${x} → ${2 * x} → ${4 * x} → …`;
    case 6: return `Truco del 6: ${x} · 5 = ${5 * x}, y le sumas otro ${x}.`;
    case 7: return `Truco del 7: ${x} · 5 = ${5 * x} y ${x} · 2 = ${2 * x}. Súmalos.`;
    case 5: return `Truco del 5: es la mitad de ${x} · 10 = ${10 * x}.`;
    case 4: return `Truco del 4: dobla dos veces: ${x} → ${2 * x} → …`;
    case 11: return `Truco del 11: ${x} · 10 = ${10 * x}, y le sumas ${x}.`;
    case 12: return `Truco del 12: ${x} · 10 = ${10 * x} y ${x} · 2 = ${2 * x}. Súmalos.`;
  }
  return `Recita la tabla del ${Math.min(a, b)}.`;
}
function mulHint(a, b) {
  const x = Math.max(a, b), y = Math.min(a, b);
  if (x <= 12) return mulTrick(a, b);
  if (x % 10 === 0) return `Quita el 0: ${x / 10} · ${y} = ${fmt(x / 10 * y)}, y le pones el 0 al final.`;
  if (y <= 12) return `Pártelo: ${fmt(x - x % 10)} · ${y} = ${fmt((x - x % 10) * y)} y ${x % 10} · ${y} = ${(x % 10) * y}. Súmalos.`;
  return `Pártelo: ${fmt(x)} · ${y - y % 10} = ${fmt(x * (y - y % 10))} y ${fmt(x)} · ${y % 10} = ${fmt(x * (y % 10))}. Súmalos.`;
}
function divHint(n, p) {
  if (n % 10 === 0 && p % 10 === 0) return `Quita un 0 a cada número: ${fmt(n / 10)} : ${p / 10}. ¡Da lo mismo!`;
  if (n % 10 === 0 && (n / 10) % p === 0) return `Quita el 0: ${fmt(n / 10)} : ${p} = ${fmt(n / 10 / p)}, y luego le vuelves a poner el 0.`;
  const big = Math.floor(n / (10 * p)) * 10 * p;
  if (big && big < n && (n - big) % p === 0) return `Pártelo en trozos fáciles: <b>${fmt(big)}</b> : ${p} = ${fmt(big / p)} y <b>${n - big}</b> : ${p} = ${(n - big) / p}. Junta los dos.`;
  return `Piensa al revés: ¿${p} por cuánto da ${fmt(n)}?`;
}
function addHint(a, b) {
  const u = b % 10;
  if (u >= 7) { const r = b + (10 - u); return `Redondea: ${fmt(a)} + ${r} = ${fmt(a + r)}, y quita los ${10 - u} que has puesto de más.` }
  return `Por partes: ${fmt(a)} + ${b - u} = ${fmt(a + b - u)}, y luego + ${u}.`;
}
function subHint(a, b) {
  const u = b % 10;
  if (u >= 7) { const r = b + (10 - u); return `Redondea: ${fmt(a)} − ${r} = ${fmt(a - r)}, y devuelve los ${10 - u} que has quitado de más.` }
  const up = Math.ceil(b / 10) * 10; return `Cuenta hacia arriba: de ${b} a ${up} van ${up - b}; de ${up} a ${fmt(a)} van ${fmt(a - up)}. Súmalos.`;
}

/* ---------- paso: ronda relámpago (voluntaria, contra su propio récord) ---------- */
const RK = 'laura-calc-records';
const getRec = id => { try { return (JSON.parse(localStorage.getItem(RK) || '{}'))[id] || null } catch (e) { return null } };
const setRec = (id, v) => { try { const o = JSON.parse(localStorage.getItem(RK) || '{}'); o[id] = v; localStorage.setItem(RK, JSON.stringify(o)) } catch (e) { } };
const secs = ms => (ms / 1000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' s';
M.addType('blitz', (w, st, api) => {
  const items = st.items, N = items.length, rec = getRec(st.id); let k = 0, t0 = 0, miss = 0, tries = 0, iv;
  w.innerHTML = `<div class="blz"><div class="bt"><span>⚡ ${N} cuentas</span><span class="bclock">⏱️ 0,0 s</span><span>${rec ? `🏆 Tu récord: ${secs(rec)}` : '🏆 Aún sin récord'}</span></div>
    <div class="go"><p style="font-weight:700;margin:10px 0">Responde lo más rápido que puedas. Si fallas, no pasa nada: lo corriges y sigues. Solo compites contra ti misma. 😉</p><button class="big">¡Preparada! ▶️</button></div>
    <div class="run" style="display:none"><div class="bq"></div><div class="ans">${slot('', 5)}</div><div class="bbar"><i></i></div><div style="text-align:right;margin-top:2px"><span class="rocket">🚀</span></div></div><div class="end"></div></div>`;
  const run = w.querySelector('.run'), bq = w.querySelector('.bq'), bar = w.querySelector('.bbar i'), clock = w.querySelector('.bclock'), s = w.querySelector('.slot'), rk = w.querySelector('.rocket');
  const tl = w.closest('.ex') && w.closest('.ex').querySelector('.tools'); if (tl) tl.style.display = 'none';
  const show = () => { bq.innerHTML = items[k].q + ' = ?'; bar.style.width = (100 * k / N) + '%'; rk.style.transform = `translateX(-${(1 - k / N) * 260}px)`; tries = 0 };
  w.querySelector('.go .big').onclick = () => {
    w.querySelector('.go').remove(); run.style.display = ''; t0 = Date.now(); iv = setInterval(() => clock.textContent = '⏱️ ' + secs(Date.now() - t0), 100); show();
    padOn([s], () => {
      const v = val(s); if (v === null) return;
      if (v === items[k].a) { tone(true); s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; k++; w.closest('.ex').querySelector('.fbk').innerHTML = ''; if (k >= N) return end(); show() }
      else { miss++; tries++; tone(false); s.classList.add('no'); api.say('info', tries >= 2 ? `${items[k].q} = <b>${fmt(items[k].a)}</b>. Escríbelo y seguimos.` : (items[k].hint || 'Casi, prueba otra vez.'), 'think'); clear(s) }
    });
  };
  function end() {
    clearInterval(iv); padOff(); const t = Date.now() - t0; bar.style.width = '100%'; rk.style.transform = 'translateX(0) rotate(-20deg)';
    const best = !rec || t < rec; if (best) setRec(st.id, t);
    run.querySelector('.ans').remove(); bq.innerHTML = '🏁';
    w.querySelector('.end').innerHTML = `${best ? (rec ? '🏆 ¡NUEVO RÉCORD!' : '🏆 ¡Primer récord!') : '💪 ¡Ronda completada!'}<div style="font-size:18px;color:var(--muted)">${secs(t)}${rec ? ` · récord ${secs(best ? t : rec)}` : ''} · ${miss ? `${miss} fallo${miss > 1 ? 's' : ''} corregido${miss > 1 ? 's' : ''}` : '¡sin fallos!'}</div>`;
    if (best) confetti(); tone(true, true); GAME.lastBlitz = { rec: best, beat: best && !!rec };
    if (window.Cuenta) Cuenta.ev('blitz', { id: st.id, l: st.label, s: Math.round(t / 100) / 10, miss, rec: best });
    api.next();
    const fb = w.closest('.ex') && w.closest('.ex').querySelector('.fbk'); if (fb) fb.innerHTML = '';
  }
});

/* ---------- bloque 1: tablas ---------- */
const TB = { 1: [2, 3, 4, 5, 10], 2: [6, 7, 8, 9], 3: [6, 7, 8, 9, 11, 12] };
const HARD = [[6, 7], [6, 8], [6, 9], [7, 7], [7, 8], [7, 9], [8, 8], [8, 9], [9, 9], [6, 6], [4, 7], [4, 8], [3, 8], [3, 7]];
function exTabla(l, pair) {
  const [a, b] = pair || [pick(TB[l]), rnd(2, l === 3 ? 12 : 10)], p = a * b, f = pair ? 0 : Math.random();
  const lab = 'Tablas de multiplicar';
  if (l === 1 ? f < .7 : f < .5) return { skill: 'tabla-' + a, label: lab, title: `¿Cuánto es ${m(`${a} · ${b}`)}?`, steps: [{ pre: m(`${a} · ${b} =`) + ' ', ans: p, max: 3, hints: [mulTrick(a, b), `${a} · ${b} = ${p}`], why: v => v === a + b ? '¡Ojo! Has <b>sumado</b>. Aquí hay que multiplicar.' : v === a * (b + 1) || v === a * (b - 1) ? `Te has ido a la casilla de al lado: ${a} · ${v === a * (b + 1) ? b + 1 : b - 1} = ${v}.` : mulTrick(a, b) }], sol: `${a} · ${b} = <b>${p}</b>` };
  if (f < .8) return { skill: 'tabla-hueco', label: 'Tablas: el número que falta', title: `¿Qué número falta? ${m(`${a} · ? = ${p}`)}`, steps: [{ pre: m(`${a} ·`) + ' ', post: ' ' + m(`= ${p}`), ans: b, max: 2, hints: [`Recita la tabla del ${a} hasta llegar a ${p}.`, `${a} · ${b} = ${p}`], why: v => `${a} · ${v} = ${a * v}${a * v > p ? ', te pasas' : ', te quedas corta'}.` }], sol: `${a} · <b>${b}</b> = ${p}` };
  return { skill: 'tabla-div', label: 'Tablas al revés (dividir)', title: `¿Cuánto es ${m(`${p} : ${a}`)}?`, steps: [{ pre: m(`${p} : ${a} =`) + ' ', ans: b, max: 2, hints: [`Piensa al revés: ${a} · ? = ${p}`, `${a} · ${b} = ${p}, así que ${p} : ${a} = ${b}.`], why: v => `${a} · ${v} = ${a * v}, no ${p}.` }], sol: `${p} : ${a} = <b>${b}</b>, porque ${a} · ${b} = ${p}.` };
}
function exBingo(l) {
  const t = pick(l === 1 ? [3, 4, 6] : [6, 7, 8, 9]); const yes = shuffle(Array(9).fill(0).map((_, i) => t * (i + 2))).slice(0, 5);
  const no = []; while (no.length < 7) { const c = pick([...yes.map(y => y + pick([1, -1, 2, -2])), rnd(12, t * 10)]); if (c % t && !no.includes(c) && c > 0) no.push(c) }
  const ns = shuffle(yes.concat(no)).slice(0, 12);
  return { skill: 'bingo', label: 'Bingo de tablas', title: `🎱 <b>Bingo</b>: marca todos los resultados de la <b>tabla del ${t}</b>`, steps: [{ type: 'cells', q: 'Toca los que estén en la tabla y pulsa «Comprobar»:', table: a => `<table class="tt">${[0, 1, 2].map(r => `<tr>${ns.slice(r * 4, r * 4 + 4).map(n => `<td ${a(n)}>${n}</td>`).join('')}</tr>`).join('')}</table>`, ok: ns.filter(n => n % t === 0).map(String), hints: [`Tabla del ${t}: ${Array(10).fill(0).map((_, i) => t * (i + 1)).join(', ')}`] }], sol: `Tabla del ${t}: ${Array(10).fill(0).map((_, i) => t * (i + 1)).join(', ')}.` };
}
function blitz(id, label, make, n = 10) { const items = []; const seen = new Set(); for (let g = 0; items.length < n && g < 200; g++) { const it = make(); if (!seen.has(it.q)) { seen.add(it.q); items.push(it) } } return { skill: 'blitz-' + id, label: 'Ronda relámpago: ' + label, title: `⚡ <b>Ronda relámpago</b>: ${label}`, steps: [{ type: 'blitz', id, label, items }], sol: items.map(i => `${i.q} = ${fmt(i.a)}`).join(' · ') } }
const blTablas = l => blitz('tablas' + (l > 1 ? '-dificiles' : ''), l > 1 ? 'tablas del 6 al 9' : 'tablas', () => { const [a, b] = l > 1 ? pick(HARD) : [pick([2, 3, 4, 5, 6, 7, 8, 9]), rnd(2, 9)]; return Math.random() < .5 ? { q: `${a} · ${b}`, a: a * b, hint: mulTrick(a, b) } : { q: `${b} · ${a}`, a: a * b, hint: mulTrick(a, b) } });
const blTablasDiv = () => blitz('tablas-div', 'tablas al revés', () => { const [a, b] = pick(HARD); return { q: `${a * b} : ${a}`, a: b, hint: `${a} · ? = ${a * b}` } });
function gen1(l, mode) { if (mode === 'prac' && l >= 2 && Math.random() < .18) return pick([blTablas, blTablasDiv])(l); return Math.random() < .15 ? exBingo(l) : exTabla(l) }

/* ---------- bloque 2: sumar y restar de cabeza ---------- */
function exSuma(l) {
  let a, b; do { a = l === 1 ? rnd(21, 79) : l === 2 ? rnd(25, 89) : rnd(120, 780); b = l === 1 ? rnd(12, 49) : l === 2 ? rnd(16, 69) : pick([rnd(23, 89), 98, 99, 199, 49]) } while (l < 3 && (a % 10) + (b % 10) < 10);
  const s = a + b, u = b % 10, dec = b - u;
  if (l === 1) return { skill: 'suma', label: 'Sumar de cabeza', title: `Suma por partes: ${m(`${a} + ${b}`)}`, steps: [{ q: `Primero las decenas: suma ${dec}.`, pre: m(`${a} + ${dec} =`) + ' ', ans: a + dec, hints: [`${a} + 10 = ${a + 10}, + 10 = ${a + 20}…`] }, { q: `Ahora las unidades: suma ${u}.`, pre: m(`${a + dec} + ${u} =`) + ' ', ans: s, hints: [`Hasta la siguiente decena faltan ${10 - (a + dec) % 10}…`] }], sol: `${a} + ${b} = ${a} + ${dec} + ${u} = ${a + dec} + ${u} = <b>${s}</b>` };
  return { skill: 'suma', label: 'Sumar de cabeza', title: `¿Cuánto es ${m(`${fmt(a)} + ${b}`)}?`, steps: [{ pre: m(`${fmt(a)} + ${b} =`) + ' ', ans: s, max: 4, hints: [addHint(a, b), `${fmt(a)} + ${b} = ${fmt(s)}`], why: v => v === s - 10 || v === s + 10 ? 'Revisa las decenas: ¿te has llevado una?' : addHint(a, b) }], sol: `${addHint(a, b)}<br>${fmt(a)} + ${b} = <b>${fmt(s)}</b>` };
}
function exResta(l) {
  let a, b; do { a = l === 1 ? rnd(41, 98) : l === 2 ? rnd(52, 99) : rnd(121, 905); b = l === 1 ? rnd(13, a - 10) : l === 2 ? rnd(17, a - 8) : pick([rnd(27, 89), 98, 99, 49, 199]) } while ((a % 10) >= (b % 10) && l < 3 || a - b < 3);
  const r = a - b, u = b % 10, dec = b - u;
  if (l === 1) return { skill: 'resta', label: 'Restar de cabeza', title: `Resta por partes: ${m(`${a} − ${b}`)}`, steps: [{ q: `Primero quita las decenas: ${dec}.`, pre: m(`${a} − ${dec} =`) + ' ', ans: a - dec, hints: [`${a} − 10 = ${a - 10}…`] }, { q: `Ahora quita las unidades: ${u}.`, pre: m(`${a - dec} − ${u} =`) + ' ', ans: r, hints: [`Baja primero hasta la decena: ${a - dec} − ${(a - dec) % 10} = ${a - dec - (a - dec) % 10}, y quita lo que falta.`] }], sol: `${a} − ${b} = ${a} − ${dec} − ${u} = ${a - dec} − ${u} = <b>${r}</b>` };
  return { skill: 'resta', label: 'Restar de cabeza', title: `¿Cuánto es ${m(`${fmt(a)} − ${b}`)}?`, steps: [{ pre: m(`${fmt(a)} − ${b} =`) + ' ', ans: r, max: 4, hints: [subHint(a, b), `${fmt(a)} − ${b} = ${fmt(r)}`], why: v => v === r + 10 ? 'Casi: cuando las unidades no llegan, hay que «pedir prestada» una decena.' : subHint(a, b) }], sol: `${subHint(a, b)}<br>${fmt(a)} − ${b} = <b>${fmt(r)}</b>` };
}
const blSumas = () => blitz('sumas', 'sumas y restas', () => { if (Math.random() < .5) { const a = rnd(15, 79), b = rnd(6, 19); return { q: `${a} + ${b}`, a: a + b, hint: addHint(a, b) } } const a = rnd(31, 99), b = rnd(6, 19); return { q: `${a} − ${b}`, a: a - b, hint: subHint(a, b) } });
function gen2(l, mode) { if (mode === 'prac' && l >= 2 && Math.random() < .18) return blSumas(); return Math.random() < .5 ? exSuma(l) : exResta(l) }

/* ---------- bloque 3: multiplicar de cabeza ---------- */
function exMulPartir(l, A, B) {
  let a = A || (l === 3 ? rnd(112, 389) : rnd(13, 89)); if (!A && a % 10 === 0) a++; const b = B || rnd(3, 9), dec = a - a % 10, u = a % 10;
  if (l === 1 || A) return { skill: 'mul-partir', label: 'Multiplicar partiendo el número', title: `Multiplica partiendo: ${m(`${a} · ${b}`)}`, steps: [{ q: `Primero ${dec} · ${b} (es ${dec / 10} · ${b} con un 0 detrás):`, pre: m(`${dec} · ${b} =`) + ' ', ans: dec * b, max: 4, hints: [`${dec / 10} · ${b} = ${dec / 10 * b}, y le pones un 0.`] }, { q: `Ahora ${u} · ${b}:`, pre: m(`${u} · ${b} =`) + ' ', ans: u * b, hints: [mulTrick(u, b)] }, { q: 'Junta los dos trozos:', pre: m(`${fmt(dec * b)} + ${u * b} =`) + ' ', ans: a * b, max: 4, hints: [addHint(dec * b, u * b)] }], sol: `${a} · ${b} = ${dec} · ${b} + ${u} · ${b} = ${fmt(dec * b)} + ${u * b} = <b>${fmt(a * b)}</b>` };
  return { skill: 'mul-partir', label: 'Multiplicar partiendo el número', title: `¿Cuánto es ${m(`${fmt(a)} · ${b}`)}?`, steps: [{ pre: m(`${fmt(a)} · ${b} =`) + ' ', ans: a * b, max: 5, hints: [mulHint(a, b), `${fmt(a)} · ${b} = ${fmt(a * b)}`], why: () => mulHint(a, b) }], sol: `${mulHint(a, b)}<br>${fmt(a)} · ${b} = <b>${fmt(a * b)}</b>` };
}
function exCeros(l) {
  const a = l === 1 ? rnd(3, 99) : rnd(12, 450), z = pick(l === 1 ? [10, 100] : [10, 100, 1000]);
  return { skill: 'mul-ceros', label: 'Multiplicar por 10, 100 y 1.000', title: `¿Cuánto es ${m(`${a} · ${fmt(z)}`)}?`, steps: [{ pre: m(`${a} · ${fmt(z)} =`) + ' ', ans: a * z, max: 7, hints: [`Por ${fmt(z)}: añade ${String(z).length - 1} cero${z > 10 ? 's' : ''} al final.`] }], sol: `${a} · ${fmt(z)} = <b>${fmt(a * z)}</b> (se añaden ${String(z).length - 1} ceros)` };
}
function exTruco(l) {
  const t = pick([5, 9, 11]), a = t === 11 ? rnd(12, 45) : rnd(12, l === 3 ? 98 : 48);
  const hint = t === 5 ? `${a} · 10 = ${a * 10}, y la mitad: ${a * 10} : 2.` : t === 9 ? `${a} · 10 = ${a * 10}, y le quitas ${a}.` : `${a} · 10 = ${a * 10}, y le sumas ${a}.`;
  return { skill: 'mul-truco' + t, label: `Truco para multiplicar por ${t}`, title: `Truco del ${t}: ${m(`${a} · ${t}`)}`, steps: [{ q: 'Primero, por 10:', pre: m(`${a} · 10 =`) + ' ', ans: a * 10, max: 4 }, { q: t === 5 ? 'Ahora la mitad:' : t === 9 ? `Ahora quítale ${a}:` : `Ahora súmale ${a}:`, pre: m(t === 5 ? `${a * 10} : 2 =` : t === 9 ? `${a * 10} − ${a} =` : `${a * 10} + ${a} =`) + ' ', ans: a * t, max: 4, hints: [t === 5 ? divHint(a * 10, 2) : t === 9 ? subHint(a * 10, a) : addHint(a * 10, a)] }], sol: `${hint}<br>${a} · ${t} = <b>${fmt(a * t)}</b>` };
}
const blMul = () => blitz('multiplicar', 'multiplicar de cabeza', () => { if (Math.random() < .3) { const a = rnd(2, 99), z = pick([10, 100]); return { q: `${a} · ${z}`, a: a * z, hint: 'Añade los ceros.' } } const a = rnd(11, 49), b = rnd(2, 5); return { q: `${a} · ${b}`, a: a * b, hint: mulHint(a, b) } }, 8);
function gen3(l, mode) { if (mode === 'prac' && l >= 2 && Math.random() < .18) return blMul(); const r = Math.random(); return l === 1 ? (r < .3 ? exCeros(1) : exMulPartir(1)) : r < .5 ? exMulPartir(l) : r < .75 ? exTruco(l) : exCeros(l) }

/* ---------- bloque 4: dividir de cabeza ---------- */
function exDivPartir(l, N, P) {
  const p = P || (l === 1 ? pick([2, 2, 3, 4, 5]) : pick([3, 4, 6, 7, 8])), q = N ? N / p : (l === 3 ? rnd(41, 199) : rnd(12, 49)), n = N || p * q, big = Math.floor(n / (10 * p)) * 10 * p, rest = n - big;
  if ((l === 1 || N) && big && rest) return { skill: 'div-partir', label: 'Dividir de cabeza partiendo', title: `Divide partiendo: ${m(`${fmt(n)} : ${p}`)}`, steps: [{ q: `Parte ${fmt(n)} en ${fmt(big)} + ${rest} (trozos que se dividen bien entre ${p}). Primero:`, pre: m(`${fmt(big)} : ${p} =`) + ' ', ans: big / p, max: 3, hints: [`Quita el 0: ${big / 10} : ${p} = ${big / 10 / p}, y vuelve a ponerlo.`] }, { q: 'Ahora el otro trozo:', pre: m(`${rest} : ${p} =`) + ' ', ans: rest / p, hints: [`¿${p} por cuánto da ${rest}?`] }, { q: 'Junta los resultados:', pre: m(`${big / p} + ${rest / p} =`) + ' ', ans: q, max: 3 }], sol: `${fmt(n)} : ${p} = ${fmt(big)} : ${p} + ${rest} : ${p} = ${big / p} + ${rest / p} = <b>${q}</b>` };
  return { skill: 'div-partir', label: 'Dividir de cabeza partiendo', title: `¿Cuánto es ${m(`${fmt(n)} : ${p}`)}?`, steps: [{ pre: m(`${fmt(n)} : ${p} =`) + ' ', ans: q, max: 3, hints: [divHint(n, p), `${fmt(n)} : ${p} = ${q}, porque ${p} · ${q} = ${fmt(n)}.`], why: v => `${p} · ${v} = ${fmt(p * v)}, no ${fmt(n)}. ${divHint(n, p)}` }], sol: `${divHint(n, p)}<br>${fmt(n)} : ${p} = <b>${q}</b>` };
}
function exCerosDiv(l) {
  const d = pick([20, 30, 40, 50, 60, 70, 80, 90, 200, 300]), q = pick(l === 1 ? [2, 3, 4, 5, 6] : [4, 6, 7, 8, 9, 12, 15]), n = d * q * pick([1, 10]);
  const ans = n / d;
  return { skill: 'div-ceros', label: 'Dividir quitando ceros', title: `¿Cuánto es ${m(`${fmt(n)} : ${d}`)}?`, steps: [{ pre: m(`${fmt(n)} : ${d} =`) + ' ', ans, max: 4, hints: [`Quita los mismos ceros a los dos: ${fmt(n / (d % 100 === 0 ? 100 : 10))} : ${d / (d % 100 === 0 ? 100 : 10)}.`, `${fmt(n)} : ${d} = ${ans}`], why: v => v === ans * 10 || v * 10 === ans ? '¡Cuidado con los ceros! Quita <b>los mismos</b> en los dos números.' : 'Quita los mismos ceros a los dos y divide.' }], sol: `${fmt(n)} : ${d} = ${fmt(n / (d % 100 === 0 ? 100 : 10))} : ${d / (d % 100 === 0 ? 100 : 10)} = <b>${ans}</b>` };
}
function exMitad(l) { const n = l === 1 ? 2 * rnd(12, 49) : 2 * rnd(56, 499); return { skill: 'div-mitad', label: 'Calcular la mitad', title: `¿Cuál es la mitad de ${m(fmt(n))}?`, steps: [{ pre: m(`${fmt(n)} : 2 =`) + ' ', ans: n / 2, max: 4, hints: [divHint(n, 2)] }], sol: `${divHint(n, 2)}<br>Mitad de ${fmt(n)} = <b>${fmt(n / 2)}</b>` } }
const blDiv = () => blitz('dividir', 'dividir de cabeza', () => { const p = pick([2, 3, 4, 5]), q = rnd(11, 29); return { q: `${p * q} : ${p}`, a: q, hint: divHint(p * q, p) } }, 8);
function gen4(l, mode) { if (mode === 'prac' && l >= 2 && Math.random() < .18) return blDiv(); const r = Math.random(); return l === 1 ? (r < .3 ? exMitad(1) : exDivPartir(1)) : r < .5 ? exDivPartir(l) : r < .75 ? exCerosDiv(l) : exMitad(l) }

/* ---------- bloque 5: ¿cuántas veces cabe? (el paso clave de las divisiones de dos cifras) ---------- */
const rdTen = d => Math.round(d / 10) * 10;
function cabeCase(l, fixed) {
  for (let g = 0; g < 500; g++) {
    const d = fixed ? fixed[0] : l === 1 ? rnd(11, 29) : l === 2 ? rnd(12, 49) : rnd(21, 89), q = fixed ? Math.floor(fixed[1] / fixed[0]) : rnd(2, 9), r = fixed ? fixed[1] % fixed[0] : rnd(0, d - 1), P = fixed ? fixed[1] : d * q + r;
    const R = rdTen(d), est = Math.floor(P / R);
    if (d % 10 === 0) continue;
    if (fixed || (P < (l === 1 ? 100 : 1000) && est >= 1 && est <= 9 && Math.abs(est - q) <= 1 && (l > 1 || P >= 20))) return { d, q, r, P, R, est };
  }
}
function exCabe(l, fixed) {
  const { d, q, r, P, R, est } = cabeCase(l, fixed), steps = [];
  const what = est === q ? 0 : est > q ? 1 : 2;
  const tail = [{ q: `Lo que sobra (el resto):`, pre: m(`${P} − ${fmt(d * q)} =`) + ' ', ans: r, max: 3, hints: [subHint(P, d * q)] }, { type: 'info', q: `✅ ${d} cabe <b>${q}</b> veces en ${P} y sobra${r === 1 ? '' : 'n'} <b>${r}</b>. Comprueba: el resto (${r}) es menor que ${d}. ✔️` }];
  if (l === 3) {
    steps.push({ q: `¿Cuántas veces cabe <b>${d}</b> en <b>${P}</b>?`, pre: '', ans: q, max: 1, hints: [`Redondea ${d} a ${R} y piensa: ¿cuántas veces cabe ${R / 10} en ${Math.floor(P / 10)}? Prueba con ${est} y ajusta.`, `${d} · ${q} = ${fmt(d * q)} y ${d} · ${q + 1} = ${fmt(d * (q + 1))}.`], why: v => d * v > P ? `Te pasas: ${d} · ${v} = ${fmt(d * v)}, que es más que ${P}.` : `Cabe alguna vez más: ${d} · ${v} = ${fmt(d * v)} y sobran ${P - d * v}, que es más que ${d}.` }, ...tail);
    return { skill: 'cabe', label: '¿Cuántas veces cabe? (estimar)', title: `🎯 ¿Cuántas veces cabe ${m(d)} en ${m(P)}?`, steps, sol: solCabe(d, q, r, P, R, est) };
  }
  if (l === 1) { const opts = [String(R), String(R + 10), String(R === 10 ? 30 : R - 10)]; steps.push({ type: 'choice', q: `1️⃣ <b>Redondea</b> ${d} a la decena más cercana:`, opts, ans: 0, why: () => `${d} está más cerca de ${R}${d % 10 === 5 ? ' (si termina en 5, se redondea hacia arriba)' : ''}.` }) }
  else steps.push({ type: 'info', q: `1️⃣ Redondea: ${d} ≈ <b>${R}</b>` });
  steps.push({ q: `2️⃣ <b>Estima</b>: ¿cuántas veces cabe ${R} en ${P}? (quita los ceros: ¿cuántas veces cabe ${R / 10} en ${Math.floor(P / 10)}?)`, pre: '', ans: est, max: 1, hints: [`Tabla del ${R / 10}: ¿qué número por ${R / 10} se acerca más a ${Math.floor(P / 10)} sin pasarse?`, `${R / 10} · ${est} = ${R / 10 * est}`] });
  steps.push({ q: `3️⃣ <b>Prueba</b> con el número de verdad:`, pre: m(`${d} · ${est} =`) + ' ', ans: d * est, max: 3, hints: [mulHint(d, est)] });
  steps.push({ type: 'choice', q: `${d} · ${est} = ${fmt(d * est)} y tenemos ${P}. ¿Qué pasa?`, opts: ['¡Justo! Está bien', `Me paso de ${P}: bajo uno`, `Sobra demasiado (más que ${d}): subo uno`], keep: true, ans: what, why: () => what === 0 ? `${fmt(d * est)} no se pasa de ${P}, y sobran ${P - d * est}, que es menos que ${d}.` : what === 1 ? `${fmt(d * est)} es más que ${P}: te pasas.` : `Sobran ${P - d * est}, y eso es más que ${d}: ¡cabe otra vez!` });
  if (what) steps.push({ q: `4️⃣ <b>Ajusta</b>: ${what === 1 ? 'bajamos' : 'subimos'} uno.`, pre: m(`${d} · ${q} =`) + ' ', ans: d * q, max: 3, hints: [what === 1 ? `Es ${fmt(d * est)} − ${d}.` : `Es ${fmt(d * est)} + ${d}.`] });
  steps.push(...tail);
  return { skill: 'cabe', label: '¿Cuántas veces cabe? (estimar)', title: `🎯 ¿Cuántas veces cabe ${m(d)} en ${m(P)}?`, steps, sol: solCabe(d, q, r, P, R, est) };
}
function solCabe(d, q, r, P, R, est) { return `Redondeo ${d} ≈ ${R}. ${R / 10} en ${Math.floor(P / 10)} → ${est}. Pruebo: ${d} · ${est} = ${fmt(d * est)}${est > q ? ' (me paso → bajo uno)' : est < q ? ' (sobra demasiado → subo uno)' : ' ✔️'}.<br>${d} cabe <b>${q}</b> veces en ${P} y sobra${r === 1 ? '' : 'n'} <b>${r}</b>.` }
function gen5(l) { return exCabe(l) }

/* ---------- bloque 6: divisiones de dos cifras ---------- */
function exDiv2(l, D, d) {
  if (!D) { d = l === 1 ? rnd(11, 19) : l === 2 ? rnd(12, 49) : rnd(21, 99); if (d % 10 === 0) d++; const q = l === 1 ? rnd(10, 49) : l === 2 ? rnd(12, 89) : rnd(24, 199); D = d * q + (Math.random() < .4 ? 0 : rnd(1, d - 1)) }
  const q = Math.floor(D / d), r = D % d;
  return { skill: 'div2', label: l === 1 ? 'Divisiones entre 11 y 19' : 'Divisiones de dos cifras', title: `Divide: ${m(`${fmt(D)} : ${d}`)}`, steps: [{ type: 'div', D, d }], sol: `${fmt(D)} : ${d} = <b>${q}</b>, resto <b>${r}</b>. Prueba: ${d} · ${q} + ${r} = ${fmt(D)}.` };
}
function gen6(l) { return Math.random() < .2 ? exCabe(Math.min(3, l + 1)) : exDiv2(l) }

/* ---------- gamificación: puntos, rangos, racha de días, meta diaria y medallas ---------- */
const GOAL = 10;
const RANKS = [[0, '🐣', 'Novata'], [100, '🐥', 'Aprendiz'], [300, '🏃‍♀️', 'Atleta'], [600, '🥇', 'Campeona'], [1000, '🌟', 'Superestrella'], [1600, '🚀', 'Astronauta del cálculo'], [2500, '👑', 'Leyenda']];
const MEDALS = [
  ['primer', '🎉', 'Primer entreno', 'Haz tu primer ejercicio'],
  ['meta', '🎯', 'Meta cumplida', `Haz ${GOAL} ejercicios en un día`],
  ['racha3', '🔥', 'Racha de 3', 'Entrena 3 días seguidos'],
  ['racha5', '🔥', 'Racha de 5', 'Entrena 5 días seguidos'],
  ['racha7', '🌋', 'Semana de fuego', 'Entrena 7 días seguidos'],
  ['rayo', '⚡', 'Rayo', 'Termina una ronda relámpago'],
  ['record', '🏆', 'Supera tu récord', 'Bate tu propio récord en una ronda'],
  ['diez', '💯', 'Diez seguidos', '10 ejercicios seguidos sin fallos'],
  ['tablas', '✖️', 'Reina de las tablas', '25 ejercicios de tablas'],
  ['cabe', '🎯', 'Ojo de halcón', '15 ejercicios de «¿cuántas veces cabe?»'],
  ['casita', '🏠', 'Arquitecta', '10 divisiones de dos cifras'],
  ['cien', '💪', 'Cien', '100 ejercicios en total'],
  ['estrella', '⭐', 'Primera estrella', 'Supera un Reto'],
  ['gym', '👑', 'Gimnasio completo', 'Supera el Desafío final']
];
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') };
const dayKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function streak(S) { const D = S.days || {}; let n = 0; const d = new Date(); if (!D[dayKey(d)]) d.setDate(d.getDate() - 1); while (D[dayKey(d)]) { n++; d.setDate(d.getDate() - 1) } return n }
const rankOf = xp => { let i = 0; RANKS.forEach((r, k) => { if (xp >= r[0]) i = k }); return i };
const GAME = { lastBlitz: null };
function toast(html) {
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('on')); setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 500) }, 3800);
}
let toastQ = Promise.resolve();
const queueToast = html => { toastQ = toastQ.then(() => new Promise(r => { toast(html); setTimeout(r, 1800) })) };
function award(S, id) {
  S.med = S.med || {}; if (S.med[id]) return; S.med[id] = Date.now();
  const md = MEDALS.find(x => x[0] === id); if (!md) return;
  queueToast(`<span class="tbig">${md[1]}</span><div><small>¡Medalla nueva!</small><b>${md[2]}</b></div>`); confetti(); tone(true, true);
  if (window.Cuenta) Cuenta.ev('medalla', { id, l: md[2] });
}
function gainXP(S, n) {
  const before = rankOf(S.xp || 0); S.xp = (S.xp || 0) + n; const after = rankOf(S.xp);
  if (after > before) { const r = RANKS[after]; queueToast(`<span class="tbig">${r[1]}</span><div><small>¡Subes de rango!</small><b>Ahora eres ${r[2]}</b></div>`); confetti(); if (window.Cuenta) Cuenta.ev('rango', { l: r[2], xp: S.xp }) }
}
function onEx(S, b, ex, r) {
  S.days = S.days || {}; const k = today(), was = S.days[k] || 0; S.days[k] = was + 1;
  let xp = r.ok ? 10 + (r.perfect ? 5 : 0) : 3;
  if (ex.skill && ex.skill.startsWith('blitz')) { xp += 15; award(S, 'rayo'); if (GAME.lastBlitz && GAME.lastBlitz.beat) { xp += 15; award(S, 'record') } GAME.lastBlitz = null }
  gainXP(S, xp);
  S.row = r.perfect ? (S.row || 0) + 1 : 0;
  award(S, 'primer');
  if (was + 1 === GOAL) { award(S, 'meta'); queueToast(`<span class="tbig">🎯</span><div><small>¡Meta de hoy cumplida!</small><b>${GOAL} ejercicios · ¡racha de ${streak(S)} día${streak(S) > 1 ? 's' : ''}! 🔥</b></div>`); confetti() }
  const st = streak(S); if (st >= 3) award(S, 'racha3'); if (st >= 5) award(S, 'racha5'); if (st >= 7) award(S, 'racha7');
  if (S.row >= 10) award(S, 'diez');
  if ((S.done.c1 || 0) >= 25) award(S, 'tablas'); if ((S.done.c5 || 0) >= 15) award(S, 'cabe'); if ((S.done.c6 || 0) >= 10) award(S, 'casita');
  if (Object.values(S.done || {}).reduce((a, c) => a + c, 0) >= 100) award(S, 'cien');
  if (Object.values(S.stars || {}).some(Boolean)) award(S, 'estrella'); if ((S.stars || {}).final) award(S, 'gym');
}
function onStar(S, id) { gainXP(S, id === 'final' ? 100 : 40); award(S, 'estrella'); if (id === 'final') award(S, 'gym') }
function homeMsg(S, msg) {
  const st = streak(S), hoy = (S.days || {})[today()] || 0;
  if (!S.xp) return msg;
  if (hoy >= GOAL) return `¡Meta de hoy cumplida! 🎉 Llevas <b>${st} día${st > 1 ? 's' : ''} seguido${st > 1 ? 's' : ''}</b>. Si quieres, bate tu récord en una ronda relámpago. ⚡`;
  if (hoy > 0) return `¡Vas genial! Te quedan <b>${GOAL - hoy} ejercicios</b> para la meta de hoy. 💪`;
  if (st > 0) return `¡Tienes una racha de <b>${st} día${st > 1 ? 's' : ''}</b>! 🔥 Haz el entreno de hoy para no perderla.`;
  return '¡Hola de nuevo! ¿Empezamos una racha nueva hoy? 🔥 Con 10 ejercicios basta.';
}
function homeExtra(S) {
  const xp = S.xp || 0, ri = rankOf(xp), r = RANKS[ri], nx = RANKS[ri + 1], st = streak(S), hoy = Math.min(GOAL, (S.days || {})[today()] || 0), med = S.med || {};
  const pr = nx ? (xp - r[0]) / (nx[0] - r[0]) : 1;
  const week = Array(7).fill(0).map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return [d, (S.days || {})[dayKey(d)] || 0] });
  const L = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  return `<div class="gym">
    <div class="gtop">
      <div class="ring" style="--p:${100 * hoy / GOAL}"><div><b>${hoy}/${GOAL}</b><small>hoy</small></div></div>
      <div class="gmid"><div class="fire ${st ? 'on' : ''}">🔥 <b>${st}</b> <span>día${st === 1 ? '' : 's'} seguido${st === 1 ? '' : 's'}</span></div>
        <div class="week">${week.map(([d, n]) => `<i class="${n >= GOAL ? 'full' : n ? 'some' : ''} ${dayKey(d) === today() ? 'td' : ''}"><span>${L[d.getDay()]}</span></i>`).join('')}</div></div>
    </div>
    <button class="big" id="gogym">${hoy >= GOAL ? '⚡ ¡Seguir entrenando!' : hoy ? '▶️ Seguir con el entreno de hoy' : '▶️ Empezar el entreno de hoy'}</button>
    <div class="rank"><span class="ri">${r[1]}</span><div style="flex:1"><div class="rl"><b>${r[2]}</b><span>${xp} puntos${nx ? ` · ${nx[0] - xp} para ${nx[2]}` : ''}</span></div><div class="rbar"><i style="width:${Math.round(100 * pr)}%"></i></div></div></div>
    <details class="meds"><summary>🏅 Medallas: <b>${Object.keys(med).filter(k => MEDALS.some(m => m[0] === k)).length}/${MEDALS.length}</b> <span>ver todas</span></summary><div class="mgrid">${MEDALS.map(([id, ic, n, d]) => `<div class="${med[id] ? 'got' : ''}"><span>${med[id] ? ic : '🔒'}</span><b>${n}</b><small>${d}</small></div>`).join('')}</div></details>
  </div>`;
}
function homeBind(el, S, api) {
  el.querySelector('#gogym').onclick = () => {
    const BL = window.TEMA.blocks; let i = BL.findIndex((b, k) => api.unlocked(k) && !api.has(b.id));
    if (i < 0) { const open = BL.map((b, k) => k).filter(k => api.unlocked(k)); i = open.sort((a, b) => (S.done[BL[a].id] || 0) - (S.done[BL[b].id] || 0))[0] || 0 }
    api.openBlock(i, S.seen[BL[i].id + '-0'] ? 'prac' : 'learn');
  };
}

/* ---------- tema ---------- */
const TT = (a, b) => `<div class="hard">${HARD.slice(0, 10).map(([x, y]) => `<div>${x} · ${y} = ${x * y}</div>`).join('')}</div>`;
window.TEMA = {
  app: 'mat-calc', key: 'laura-mat-calc-v1', title: 'Cálculo mental y divisiones',
  onEx, onStar, homeMsg, homeExtra, homeBind,
  htitle: 'Gimnasio de <span>cálculo</span> 💪',
  hello: '¡Hola, Laura! Bienvenida al <b>gimnasio de cálculo</b> 💪 Aquí entrenamos lo que más se usa en mates: las <b>tablas</b>, calcular <b>de cabeza</b> y las <b>divisiones de dos cifras</b>. Como en un gimnasio, lo que funciona es entrenar <b>un poco cada día</b>: cada ejercicio te da puntos para subir de rango, y si haces <b>10 al día</b> mantienes tu racha 🔥 y ganas medallas. 🏅',
  blocks: [
    { id: 'c1', name: 'Tablas a tope', desc: 'Las tablas al derecho y al revés, con trucos', ico: '×', c: '--c4', gen: gen1,
      fixed: HARD.map(p => () => exTabla(2, p)),
      hello: 'Las tablas son tu <b>superpoder</b>: si las sabes de memoria, las divisiones, el m.c.m. y todo lo demás va el doble de rápido. 🦸‍♀️',
      slides: [
        { t: 'Solo 10 cuestan de verdad', html: `<p>De todas las tablas, casi todo es fácil (la del 2, la del 5, la del 10…). Las que de verdad cuestan son <b>estas 10</b>. ¡Son tu objetivo!</p>${TT()}<div class="tip"><span>💡</span><div>Truco para la más difícil: <b>5, 6, 7, 8</b> → 56 = 7 · 8.</div></div>`, check: ['¿Cuánto es 7 · 8?', ['56', '54', '63'], '5, 6, 7, 8 → 56 = 7 · 8.', 'Recuerda el truco: 5, 6, 7, 8.'] },
        { t: 'Trucos para no atascarte', html: `<div class="box"><p style="margin:0">9️⃣ <b>Por 9</b>: por 10 y quitas uno → 7 · 9 = 70 − 7 = <b>63</b><br>8️⃣ <b>Por 8</b>: dobla tres veces → 6 → 12 → 24 → <b>48</b><br>6️⃣ <b>Por 6</b>: por 5 y uno más → 7 · 5 = 35 + 7 = <b>42</b><br>4️⃣ <b>Por 4</b>: dobla dos veces → 7 → 14 → <b>28</b></p></div>`, try: () => exTabla(2, [8, 7]) },
        { t: 'Multiplicar y dividir: la misma familia', html: `<p>Si sabes una multiplicación, ¡sabes cuatro cuentas!</p><div style="text-align:center"><div class="fam"><span>7 · 8 = 56</span><span>8 · 7 = 56</span><span>56 : 7 = 8</span><span>56 : 8 = 7</span></div></div><p>Para dividir, piensa al revés: <b>56 : 7</b> → «¿7 por cuánto da 56?» → <b>8</b>.</p>`, check: ['¿Cuánto es 63 : 9?', ['7', '8', '6'], '9 · 7 = 63.', 'Piensa: ¿9 por cuánto da 63?'] },
        { t: '⚡ Ronda relámpago', html: '<p>¡Un juego! 10 cuentas lo más rápido que puedas. No hay límite de tiempo: solo compites contra <b>tu propio récord</b>. Repítela otro día y verás cómo bajas el tiempo. 🚀</p>', try: () => blTablas(2) }
      ] },
    { id: 'c2', name: 'Sumar y restar de cabeza', desc: 'Por partes, redondeando y contando hacia arriba', ico: '±', c: '--c1', gen: gen2,
      hello: 'Para sumar y restar de cabeza no hace falta «ver» la cuenta en columna: hay atajos mucho más rápidos. 🏎️',
      slides: [
        { t: 'Sumar por partes', html: `<div class="big-math" style="font-size:24px">47 + 38</div><div class="steps3"><div><b class="n">1</b>Primero las decenas: 47 + 30 = <b>77</b></div><div><b class="n">2</b>Luego las unidades: 77 + 8 = <b>85</b></div></div>`, try: () => exSuma(1) },
        { t: 'Redondear y devolver', html: `<p>Cuando un número termina en 7, 8 o 9, ¡redondéalo!</p><div class="box" style="font-family:Fredoka;font-size:19px;text-align:center">47 + 39 → 47 + 40 = 87 → quito 1 → <b>86</b><br>245 + 98 → 245 + 100 = 345 → quito 2 → <b>343</b><br>83 − 29 → 83 − 30 = 53 → devuelvo 1 → <b>54</b></div>`, check: ['¿Cuánto es 56 + 19?', ['75', '65', '76'], '56 + 20 = 76, y quito 1 → 75.', 'Suma 20 y quita 1.'] },
        { t: 'Restar contando hacia arriba', html: `<p>Para <b>83 − 47</b>, piensa: «¿cuánto me falta para ir de 47 a 83?»</p><div class="steps3"><div><b class="n">1</b>De 47 a 50 → <b>3</b></div><div><b class="n">2</b>De 50 a 83 → <b>33</b></div><div><b class="n">3</b>3 + 33 = <b>36</b></div></div><p>¡Como cuando te devuelven el cambio en una tienda! 🛒</p>`, try: () => exResta(1) }
      ] },
    { id: 'c3', name: 'Multiplicar de cabeza', desc: 'Partir el número, ceros y trucos del 5, 9 y 11', ico: '×10', c: '--c2', gen: gen3,
      hello: 'Multiplicar «partiendo» es justo lo que necesitas en las divisiones de dos cifras (por ejemplo, 23 · 4). ¡Vamos a por ello!',
      slides: [
        { t: 'Por 10, 100 y 1.000', html: `<div class="box" style="font-family:Fredoka;font-size:20px;text-align:center">37 · 10 = 37<b>0</b><br>37 · 100 = 3.7<b>00</b><br>37 · 1.000 = 37.<b>000</b></div><p>Se añaden tantos <b>ceros</b> como tenga el 10, el 100 o el 1.000.</p>`, check: ['¿Cuánto es 45 · 100?', ['4.500', '450', '45.000'], '100 tiene dos ceros: 4.500.', 'Cuenta los ceros del 100.'] },
        { t: 'Partir el número', html: `<div class="big-math" style="font-size:24px">23 · 4</div><div class="steps3"><div><b class="n">1</b>20 · 4 = <b>80</b> (2 · 4 = 8, con un 0)</div><div><b class="n">2</b>3 · 4 = <b>12</b></div><div><b class="n">3</b>80 + 12 = <b>92</b></div></div><div class="tip"><span>💡</span><div>Esto es lo que haces en cada paso de una división de dos cifras. ¡Si lo dominas, las divisiones serán mucho más fáciles!</div></div>`, try: () => exMulPartir(1, 34, 6) },
        { t: 'Trucos del 5, del 9 y del 11', html: `<div class="box"><p style="margin:0;font-family:Fredoka;font-size:18px">✋ <b>Por 5</b>: por 10 y la mitad → 48 · 5 = 480 : 2 = <b>240</b><br>9️⃣ <b>Por 9</b>: por 10 y quita uno → 26 · 9 = 260 − 26 = <b>234</b><br>1️⃣1️⃣ <b>Por 11</b>: por 10 y suma uno → 34 · 11 = 340 + 34 = <b>374</b></p></div>`, try: () => exTruco(1) }
      ] },
    { id: 'c4', name: 'Dividir de cabeza', desc: 'Mitades, partir en trozos y quitar ceros', ico: '½', c: '--c3', gen: gen4,
      hello: 'Dividir de cabeza es pensar al revés que multiplicar. Con estos trucos, verás que es más fácil de lo que parece. 🧠',
      slides: [
        { t: 'Partir en trozos fáciles', html: `<div class="big-math" style="font-size:24px">96 : 3</div><div class="steps3"><div><b class="n">1</b>Parto 96 en 90 + 6</div><div><b class="n">2</b>90 : 3 = <b>30</b> y 6 : 3 = <b>2</b></div><div><b class="n">3</b>30 + 2 = <b>32</b></div></div><div class="box" style="font-family:Fredoka;font-size:18px;text-align:center">84 : 4 → 80 : 4 = 20 y 4 : 4 = 1 → <b>21</b><br>135 : 5 → 100 : 5 = 20 y 35 : 5 = 7 → <b>27</b></div>`, try: () => exDivPartir(1, 78, 3) },
        { t: 'Quitar ceros', html: `<p>Si los dos números terminan en 0, puedes quitar <b>el mismo número de ceros</b> a los dos. ¡El resultado no cambia!</p><div class="box" style="font-family:Fredoka;font-size:20px;text-align:center">600 : 20 → 60 : 2 = <b>30</b><br>4.800 : 60 → 480 : 6 = <b>80</b></div><div class="warn"><span>⚠️</span><div>Quita los <b>mismos</b> ceros en los dos números.</div></div>`, check: ['¿Cuánto es 350 : 70?', ['5', '50', '0,5'], '35 : 7 = 5.', 'Quita un 0 a cada uno: 35 : 7.'] },
        { t: 'La mitad', html: `<p>Dividir entre 2 es calcular la <b>mitad</b>. Pártelo:</p><div class="box" style="font-family:Fredoka;font-size:20px;text-align:center">76 : 2 → 70 : 2 = 35 y 6 : 2 = 3 → <b>38</b><br>150 : 2 → 100 : 2 = 50 y 50 : 2 = 25 → <b>75</b></div>`, try: () => exMitad(1) }
      ] },
    { id: 'c5', name: '¿Cuántas veces cabe?', desc: 'El secreto de las divisiones de dos cifras', ico: '🎯', c: '--c0', gen: gen5,
      fixed: [[23, 87], [19, 95], [34, 157], [21, 84], [17, 120], [28, 200], [42, 300], [36, 250]].map(f => () => exCabe(2, f)),
      hello: 'Este es <b>el paso que más se atasca</b> en las divisiones de dos cifras: saber cuántas veces cabe el divisor. Hay un método que funciona siempre: <b>redondear, probar y ajustar</b>. 🎯',
      slides: [
        { t: 'El paso difícil', html: `<p>En una división como <b>875 : 23</b>, todo es fácil menos una pregunta que se repite:</p><div class="big-math" style="font-size:24px">¿Cuántas veces cabe <span class="hi">23</span> en <span class="hi">87</span>?</div><p>No hace falta saberse la tabla del 23. Hay un método de <b>3 pasos</b>:</p><div class="steps3"><div><b class="n">1</b><b>Redondea</b> el divisor: 23 ≈ 20</div><div><b class="n">2</b><b>Estima</b>: ¿cuántas veces cabe 2 en 8? → 4</div><div><b class="n">3</b><b>Prueba</b>: 23 · 4 = 92… ¡me paso de 87! → <b>ajusto</b> a 3: 23 · 3 = 69 ✔️</div></div>` },
        { t: 'Ajustar: bajar o subir', html: `<div class="box"><p style="margin:0">⬇️ Si al probar <b>te pasas</b>, baja uno.<br><span style="font-family:Fredoka">87 : 23 → pruebo 4: 23 · 4 = 92 > 87 → <b>3</b></span></p></div><div class="box"><p style="margin:0">⬆️ Si <b>sobra más que el divisor</b>, sube uno.<br><span style="font-family:Fredoka">95 : 19 → 19 ≈ 20 → pruebo 4: 19 · 4 = 76, sobran 19… ¡cabe otra! → <b>5</b></span></p></div><div class="tip"><span>💡</span><div>El resto <b>siempre</b> tiene que ser más pequeño que el divisor.</div></div>`, check: ['84 : 21. Pruebo 4: 21 · 4 = 84. ¿Qué pasa?', ['¡Justo! Cabe 4 veces', 'Me paso: bajo uno', 'Sobra demasiado: subo uno'], '21 · 4 = 84 exacto, resto 0.', 'Compara 84 con 84.'] },
        { t: '¡Ahora tú!', html: '<p>Vamos con el ejemplo: ¿cuántas veces cabe 23 en 87? Te guío paso a paso.</p>', try: () => exCabe(1, [23, 87]) }
      ] },
    { id: 'c6', name: 'Divisiones de dos cifras', desc: 'La casita completa, con el método de estimar', ico: '÷', c: '--c5', gen: gen6,
      fixed: [[504, 21], [875, 23], [1358, 24], [696, 29], [912, 38], [2475, 45]].map(([D, d]) => () => exDiv2(2, D, d)),
      hello: 'Ahora todo junto: la casita con divisor de dos cifras. Usa lo que has entrenado: <b>redondear y probar</b> para saber cuántas veces cabe. 🏠',
      slides: [
        { t: 'Los pasos de siempre', html: `<div class="box"><p style="margin:0;font-size:17px">0️⃣ ¿Cuántas cifras cojo? (las justas para que quepa el divisor)<br>1️⃣ ¿Cuántas veces cabe? → <b>redondea, prueba y ajusta</b> 🎯<br>2️⃣ Multiplica (partiendo el número)<br>3️⃣ Resta<br>4️⃣ Baja la siguiente cifra… ¡y vuelta al 1!</p></div><div class="tip"><span>💡</span><div>Si te atascas en «¿cuántas veces cabe?», pulsa <b>💡 Pista</b>: te ayudo a redondear.</div></div>` },
        { t: '¡Hazla conmigo!', html: '<p>Una de dos cifras, paso a paso:</p>', demo: { type: 'div', D: 875, d: 23 } },
        { t: 'La prueba', html: `<p>Para saber si está bien:</p><div class="big-math" style="font-size:22px">divisor · cociente + resto = dividendo</div><div class="box" style="font-family:Fredoka;font-size:19px;text-align:center">875 : 23 = 38, resto 1 → 23 · 38 + 1 = 874 + 1 = <b>875</b> ✔️</div><div class="warn"><span>⚠️</span><div>Y recuerda: el resto <b>siempre</b> es menor que el divisor.</div></div>` }
      ] }
  ]
};
startMates();
})();
