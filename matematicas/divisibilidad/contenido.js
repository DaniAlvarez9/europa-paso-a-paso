/* Matemáticas 1º ESO · Divisibilidad: m.c.m. y m.c.d.
   Alineado con los apuntes de clase de Laura (noviembre de 2026):
   - divisible = al dividir, el resto es 0; criterios del 2, 3 y 5;
   - descomposición en factores primos con la columna;
   - m.c.m. = comunes y no comunes al exponente más alto; m.c.d. = solo comunes al exponente más bajo
     (colores del cuaderno: verde comunes, naranja no comunes; siempre en minúsculas);
   - problemas con Datos / Operación / Solución y el truco «m.c.m. → coincidencias; m.c.d. → el más grande, repartir».
   Ejercicios del cuaderno: libro pág. 72 (8, 9, 10), pág. 75 (2, 6, 8, 9, 10), ficha pág. 12-13. */
(function () {
const { P, fmt, rnd, pick, shuffle } = M;
const { slot, val, padOn, padOff, focusSlot, tone, CALM } = M.ui;

/* ---------- aritmética ---------- */
const isPrime = n => { if (n < 2) return false; for (let p = 2; p * p <= n; p++) if (n % p === 0) return false; return true };
const spf = n => { for (let p = 2; p * p <= n; p++) if (n % p === 0) return p; return n };
function factor(n) { const f = []; let m = n; for (let p = 2; p * p <= m; p++) { let e = 0; while (m % p === 0) { m /= p; e++ } if (e) f.push([p, e]) } if (m > 1) f.push([m, 1]); return f }
const gcd = (a, b) => b ? gcd(b, a % b) : a, lcm = (a, b) => a / gcd(a, b) * b;
const G = a => a.reduce(gcd), L = a => a.reduce(lcm);
const fval = f => f.reduce((a, [p, e]) => a * Math.pow(p, e), 1);
const digits = n => String(n).split('').map(Number);
const pe = (p, e) => e > 1 ? P(p, e) : `<span class="m">${p}</span>`;
const fs = f => f.map(([p, e]) => pe(p, e)).join(' · ');
const nm = a => a.join(', ');
const yl = a => a.length <= 2 ? a.join(' y ') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];
const clear = s => setTimeout(() => { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') }, 900);

/* ---------- pistas de cálculo mental ---------- */
function divHint(n, p) {
  if (n % 10 === 0 && (n / 10) % p === 0) return `Quita el 0: ${fmt(n / 10)} : ${p} = ${fmt(n / 10 / p)}. Ahora vuelve a ponerle el 0.`;
  const big = Math.floor(n / (10 * p)) * 10 * p;
  if (big && big < n) return `Pártelo en trozos fáciles: <b>${fmt(big)}</b> : ${p} = ${fmt(big / p)} y <b>${n - big}</b> : ${p} = ${(n - big) / p}. Junta los dos resultados.`;
  return `Piensa en la tabla del ${p}: ¿${p} por cuánto da ${fmt(n)}?`;
}
function mulHint(a, b) {
  const x = Math.max(a, b), y = Math.min(a, b);
  if (x <= 10) return `Tabla del ${y}.`;
  if (x % 10 === 0) return `Quita el 0: ${x / 10} · ${y} = ${fmt(x / 10 * y)}, y le pones el 0 al final.`;
  if (y <= 10) return `Pártelo: ${x - x % 10} · ${y} = ${fmt((x - x % 10) * y)} y ${x % 10} · ${y} = ${(x % 10) * y}. Súmalos.`;
  return `Pártelo: ${fmt(x)} · ${y - y % 10} = ${fmt(x * (y - y % 10))} y ${fmt(x)} · ${y % 10} = ${fmt(x * (y % 10))}. Súmalos.`;
}
function whyNo(n, p) {
  if (p === 2) return `${fmt(n)} termina en <b>${n % 10}</b>, que es impar: no se puede dividir entre 2.`;
  if (p === 5) return `${fmt(n)} no termina en 0 ni en 5: no se puede dividir entre 5.`;
  if (p === 3) { const d = digits(n), s = d.reduce((a, b) => a + b, 0); return `Suma sus cifras: ${d.join(' + ')} = <b>${s}</b>, que no es múltiplo de 3. No se puede dividir entre 3.` }
  const q = Math.floor(n / p); return `${p} · ${q} = ${fmt(p * q)} y sobra${n - p * q > 1 ? 'n' : ''} ${n - p * q}: el resto no es 0, así que no se puede dividir entre ${p}.`;
}
function whyYes(n, p) {
  if (p === 2) return `Termina en <b>${n % 10}</b>, que es par → se puede dividir entre 2.`;
  if (p === 5) return `Termina en <b>${n % 10}</b> → se puede dividir entre 5.`;
  if (p === 3) { const d = digits(n), s = d.reduce((a, b) => a + b, 0); return `Sus cifras suman ${d.join(' + ')} = <b>${s}</b>, que es múltiplo de 3 → se puede dividir entre 3.` }
  return `${p} · ${fmt(n / p)} = ${fmt(n)} → se puede dividir entre ${p}.`;
}
function pickHint(n, i) {
  const s = spf(n);
  if (i >= 1) return s === n ? `${fmt(n)} es primo: no se puede dividir entre 2, 3, 5, 7…` : `Prueba con el <b>${s}</b>. ${whyYes(n, s)}`;
  if (s === 2) return 'Empieza siempre por el más pequeño: el 2. Mira la última cifra: ¿es par?';
  if (s === 3) return 'No es par, así que el 2 no sirve. Prueba el 3: suma sus cifras.';
  if (s === 5) return 'No sirve el 2 (no es par) ni el 3 (suma las cifras y mira). ¿En qué termina?';
  if (s === n) return n < 121 ? `Prueba 2, 3, 5 y 7. Si ninguno sirve y el número es menor que 121, es primo.` : 'Prueba 2, 3, 5, 7, 11 y 13. Si ninguno sirve…';
  return 'Ni el 2, ni el 3, ni el 5. Prueba con los siguientes primos: 7, 11, 13… (haz la división).';
}

/* ---------- paso: descomposición en columna ---------- */
M.addType('fact', (w, st, api) => {
  const N = st.N, CH = [2, 3, 5, 7, 11, 13]; let cur = N; const rows = [];
  w.innerHTML = `<div class="q">${st.q || ''}</div><div class="fwrap"><div class="fcol"></div></div><div class="q fq"></div><div class="fin"></div>`;
  const col = w.querySelector('.fcol'), fq = w.querySelector('.fq'), fin = w.querySelector('.fin');
  const draw = pend => { col.innerHTML = rows.map(r => `<div class="fr"><span class="fn">${fmt(r.n)}</span><span class="fp">${r.p}</span></div>`).join('') + `<div class="fr cur"><span class="fn">${fmt(cur)}</span><span class="fp">${pend || (cur === 1 ? '' : '?')}</span></div>` };
  function pickPhase() {
    draw(); padOff();
    if (cur === 1) return powPhase();
    fq.innerHTML = `${rows.length ? '' : '👆 '}¿Entre qué número <b>primo</b> se puede dividir <b>${fmt(cur)}</b>?`;
    fin.innerHTML = `<div class="choices" style="justify-content:center">${CH.map(p => `<button data-p="${p}">${p}</button>`).join('')}<button data-p="0">Ninguno: ¡es primo!</button></div>`;
    api.setHint(i => pickHint(cur, i));
    fin.querySelectorAll('button').forEach(b => b.onclick = () => {
      const p = +b.dataset.p;
      if (p === 0) {
        if (isPrime(cur)) { rows.push({ n: cur, p: cur }); api.right(`¡Eso es! ${fmt(cur)} es primo: solo se puede dividir entre 1 y entre él mismo. ${fmt(cur)} : ${fmt(cur)} = 1.`); cur = 1; return pickPhase() }
        b.classList.add('bad'); b.disabled = true; return api.wrong(`${fmt(cur)} no es primo. ${whyYes(cur, spf(cur))}`);
      }
      if (p > cur || cur % p) { b.classList.add('bad'); b.disabled = true; return api.wrong(p > cur ? `${p} es más grande que ${fmt(cur)}.` : whyNo(cur, p)) }
      if (p === cur) { rows.push({ n: cur, p }); api.right(`${fmt(cur)} es primo: ${fmt(cur)} : ${fmt(cur)} = 1.`); cur = 1; return pickPhase() }
      const s = spf(cur); api.right(p === s ? '' : `Vale, también se puede. Truco: empieza siempre por el más pequeño (aquí, el ${s}).`); qPhase(p);
    });
  }
  function qPhase(p) {
    draw(p); fq.innerHTML = `Divide de cabeza: ¿cuánto es <b>${fmt(cur)} : ${p}</b>?`;
    fin.innerHTML = `<div class="ans"><span class="m">${fmt(cur)} : ${p} =</span> ${slot('', 4)}</div>`;
    const s = fin.querySelector('.slot'); let tr = 0;
    api.setHint(i => i === 0 ? divHint(cur, p) : `${fmt(cur)} : ${p} = ${fmt(cur / p)}, porque ${p} · ${fmt(cur / p)} = ${fmt(cur)}.`);
    padOn([s], () => {
      const v = val(s); if (v === null) return;
      if (v === cur / p) { padOff(); tone(true); CALM.wrongRow = 0; rows.push({ n: cur, p }); cur = v; fin.innerHTML = ''; api.say('info', `⬇️ Escribimos el <b>${fmt(v)}</b> debajo.${v === 1 ? '' : ' Seguimos.'}`, 'happy'); pickPhase() }
      else { tr++; s.classList.add('no'); api.wrong(`${p} · ${fmt(v)} = ${fmt(p * v)}, no ${fmt(cur)}. ${tr >= 2 ? divHint(cur, p) : ''}`); clear(s) }
    });
  }
  function powPhase() {
    const f = factor(N); col.parentElement.classList.add('fdone');
    if (st.noPow) { fq.innerHTML = `🎉 <span class="m" style="font-size:22px">${fmt(N)} = ${fs(f)}</span>`; fin.innerHTML = ''; api.right(); return api.next() }
    fq.innerHTML = '¡Has llegado al 1! 🎉 Ahora escríbelo con potencias: <b>¿cuántas veces aparece cada primo</b> en la columna de la derecha?';
    fin.innerHTML = `<div class="ans">${fmt(N)} = ${f.map(([p]) => `<span class="supbox">${p}${slot('small', 1)}</span>`).join('<span style="margin:0 3px">·</span>')}</div>`;
    const ss = [...fin.querySelectorAll('.slot')];
    api.setHint(i => i === 0 ? 'Cuenta en la columna de la derecha cuántas veces está cada número. Si solo está una vez, escribe 1 (al final no se pone).' : `${fmt(N)} = ${fs(f)}`);
    padOn(ss, () => {
      const vs = ss.map(val); if (vs.some(v => v === null)) { focusSlot(vs.findIndex(v => v === null)); return }
      const bad = f.map(([p, e], i) => vs[i] !== e);
      if (!bad.some(Boolean)) {
        padOff(); ss.forEach(s => s.classList.add('ok'));
        fin.insertAdjacentHTML('beforeend', `<div class="box" style="font-weight:700;text-align:center">✅ <span class="m" style="font-size:22px">${fmt(N)} = ${fs(f)}</span>${f.length > 1 || f[0][1] > 1 ? `<br><span style="color:var(--muted);font-size:14px">Comprobación: ${f.map(([p, e]) => fmt(Math.pow(p, e))).join(' · ')} = ${fmt(N)} ✔️</span>` : ''}</div>`);
        api.right(); api.next();
      } else { const k = bad.indexOf(true); ss.forEach((s, i) => { if (bad[i]) s.classList.add('no') }); api.wrong(`Cuenta otra vez cuántas veces aparece el <b>${f[k][0]}</b> en la columna.`); setTimeout(() => { ss.forEach((s, i) => { if (bad[i]) { s.dataset.v = ''; s.innerHTML = '<span class="ph">?</span>'; s.classList.remove('no') } }); focusSlot(k) }, 900) }
    });
  }
  pickPhase();
});

/* ---------- paso: comunes y no comunes → m.c.m. o m.c.d. ---------- */
M.addType('cm', (w, st, api) => {
  const nums = st.nums, F = nums.map(factor), kind = st.kind, name = kind === 'mcm' ? 'm.c.m.' : 'm.c.d.';
  const allP = [...new Set(F.flat().map(x => x[0]))].sort((a, b) => a - b);
  const com = allP.filter(p => F.every(f => f.some(x => x[0] === p))), nocom = allP.filter(p => !com.includes(p));
  const chips = []; F.forEach((f, r) => f.forEach(([p, e]) => chips.push({ id: r + '-' + p, r, p, e })));
  let phase = st.known ? 'take' : 'com'; const sel = new Set();
  w.innerHTML = `<div class="q cq"></div><div class="crows"></div><div class="cbt"></div><div class="cres"></div>`;
  const Q = w.querySelector('.cq'), RW = w.querySelector('.crows'), BT = w.querySelector('.cbt'), RS = w.querySelector('.cres');
  function draw() {
    RW.innerHTML = F.map((f, r) => `<div class="cmrow"><span class="m cmn">${fmt(nums[r])} =</span>${f.map(([p, e]) => { const id = r + '-' + p; let c = 'chip'; if (phase !== 'com') c += com.includes(p) ? ' com' : ' nocom'; if (sel.has(id)) c += ' on'; return `<button class="${c}" data-id="${id}">${pe(p, e)}</button>` }).join('<span class="dot">·</span>')}</div>`).join('')
      + (phase !== 'com' ? `<div class="legend"><span><i style="background:#c9f0b7"></i>comunes</span><span><i style="background:#ffd7ad"></i>no comunes</span></div>` : '');
    RW.querySelectorAll('.chip').forEach(b => b.onclick = () => { if (phase === 'done') return; const id = b.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle('on') });
  }
  function comPhase() {
    Q.innerHTML = `${st.title ? st.title + '<br>' : ''}🎨 Toca los factores <b>comunes</b>: los que están en <b>todos</b> los números.`; draw();
    BT.innerHTML = `<div class="choices" style="justify-content:center"><button class="ck">Comprobar</button><button class="cn">No hay ninguno común</button></div>`;
    api.setHint(i => i === 0 ? 'Un factor es común si su número (la base) aparece en <b>todas</b> las filas, aunque tenga distinto exponente.' : `Los comunes son: ${com.length ? com.join(', ') : 'ninguno'}.`);
    BT.querySelector('.cn').onclick = () => { if (!com.length) { sel.clear(); phase = 'take'; api.right('Correcto: no hay ningún factor común.'); return takePhase() } api.wrong(`Sí hay alguno: mira el <b>${com[0]}</b>, está en todas las filas.`) };
    BT.querySelector('.ck').onclick = () => {
      const picked = [...sel].map(id => chips.find(c => c.id === id));
      if (!picked.length) return api.wrong('Toca las fichas que son comunes, o pulsa «No hay ninguno común».');
      const badc = picked.filter(c => !com.includes(c.p)), miss = chips.filter(c => com.includes(c.p) && !sel.has(c.id));
      if (badc.length) { badc.forEach(c => sel.delete(c.id)); draw(); return api.wrong(`El <b>${badc[0].p}</b> no está en todos los números: es <b>no común</b>.`) }
      if (miss.length) return api.wrong(`Casi: el <b>${miss[0].p}</b> también es común. Márcalo en ${F.length > 2 ? 'todas las filas' : 'las dos filas'}.`);
      sel.clear(); phase = 'take'; api.right(`Comunes: <b>${com.join(', ')}</b>.${nocom.length ? ` No comunes: <b>${nocom.join(', ')}</b>.` : ''}`); takePhase();
    };
  }
  function takePhase() {
    draw();
    if (kind === 'mcd' && !com.length) {
      Q.innerHTML = 'No hay factores comunes… Entonces, ¿cuánto vale el m.c.d.?'; BT.innerHTML = '';
      RS.innerHTML = `<div class="ans"><span class="m">m.c.d.(${nm(nums)}) =</span> ${slot('', 3)}</div>`; const s = RS.querySelector('.slot');
      api.setHint(() => 'Todos los números se pueden dividir entre 1.');
      padOn([s], () => { const v = val(s); if (v === null) return; if (v === 1) { padOff(); phase = 'done'; s.classList.add('ok'); api.right('Si no hay comunes, el m.c.d. es <b>1</b>. ¡Nunca 0!'); api.next() } else { s.classList.add('no'); api.wrong(v === 0 ? '¡Nunca es 0! Todos los números se pueden dividir entre <b>1</b>, así que el m.c.d. es 1.' : 'Si no hay comunes, el único divisor que comparten es el 1.'); clear(s) } });
      return;
    }
    Q.innerHTML = kind === 'mcm' ? `<b>m.c.m.(${nm(nums)})</b>: comunes <b>y no comunes</b>, con el exponente <b>más alto</b>. Toca las fichas que entran (una ficha por cada número primo).` : `<b>m.c.d.(${nm(nums)})</b>: <b>solo los comunes</b>, con el exponente <b>más bajo</b>. Toca las fichas que entran.`;
    const need = (kind === 'mcm' ? allP : com).map(p => { const es = chips.filter(c => c.p === p).map(c => c.e); return [p, kind === 'mcm' ? Math.max(...es) : Math.min(...es)] });
    BT.innerHTML = `<div class="choices" style="justify-content:center"><button class="ck">Comprobar</button></div>`;
    api.setHint(i => i === 0 ? (kind === 'mcm' ? 'Coge <b>todos</b> los números que aparecen (verdes y naranjas). Si uno sale en varias filas, coge el de exponente más grande.' : 'Coge solo los <b>verdes</b> (comunes). De cada uno, el de exponente más pequeño.') : `Entran: ${fs(need)}.`);
    BT.querySelector('.ck').onclick = () => {
      const picked = [...sel].map(id => chips.find(c => c.id === id));
      if (!picked.length) return api.wrong(`Toca las fichas que entran en el ${name}`);
      if (kind === 'mcd') { const nc = picked.find(c => !com.includes(c.p)); if (nc) { sel.delete(nc.id); draw(); return api.wrong(`El <b>${nc.p}</b> es no común: en el m.c.d. <b>solo entran los comunes</b>.`) } }
      const byP = {}; picked.forEach(c => (byP[c.p] = byP[c.p] || []).push(c));
      const dup = Object.keys(byP).find(p => byP[p].length > 1);
      if (dup) { byP[dup].forEach(c => sel.delete(c.id)); draw(); return api.wrong(`Del <b>${dup}</b> solo se coge <b>una</b> ficha: la de exponente más ${kind === 'mcm' ? 'alto' : 'bajo'}.`) }
      for (const [p, e] of need) {
        const c = (byP[p] || [])[0];
        if (!c) return api.wrong(kind === 'mcm' ? `Te falta el <b>${p}</b>. En el m.c.m. entran los comunes <b>y también los no comunes</b>.` : `Te falta el <b>${p}</b>, que es común.`);
        if (c.e !== e) { sel.delete(c.id); draw(); return api.wrong(`Del <b>${p}</b> hay que coger el de exponente más ${kind === 'mcm' ? 'alto' : 'bajo'}: ${pe(p, e)}, no ${pe(p, c.e)}.`) }
      }
      phase = 'done'; draw(); BT.innerHTML = ''; api.right(); valuePhase(need);
    };
  }
  function valuePhase(need) {
    const vals = need.map(([p, e]) => Math.pow(p, e)), res = fval(need);
    const showVals = need.some(x => x[1] > 1) && need.length > 1;
    RS.innerHTML = `<div class="box" style="text-align:center;font-family:Fredoka;font-size:21px">${name}(${nm(nums)}) = ${fs(need)}${showVals ? ` = ${vals.map(fmt).join(' · ')}` : ''}</div><div class="chain"></div>`;
    const C = RS.querySelector('.chain'); let acc = vals[0], k = 1;
    const end = () => { C.insertAdjacentHTML('beforeend', `<div class="q" style="text-align:center;margin-top:6px">🎉 <b>${name}(${nm(nums)}) = ${fmt(res)}</b></div>`); api.right(); api.next() };
    if (vals.length === 1) {
      if (need[0][1] === 1) return end();
      Q.innerHTML = 'Calcula el resultado:';
      C.insertAdjacentHTML('beforeend', `<div class="ans" style="font-size:24px">${pe(...need[0])} = ${slot('', 5)}</div>`); const s = C.querySelector('.slot');
      api.setHint(() => `${Array(need[0][1]).fill(need[0][0]).join(' · ')}`);
      return padOn([s], () => { const v = val(s); if (v === null) return; if (v === res) { padOff(); s.classList.add('ok'); end() } else { s.classList.add('no'); api.wrong(`${pe(...need[0])} = ${Array(need[0][1]).fill(need[0][0]).join(' · ')}`); clear(s) } });
    }
    Q.innerHTML = 'Ahora calcula el resultado multiplicando <b>de dos en dos</b>:';
    const stepMul = () => {
      if (k >= vals.length) return end();
      const b = vals[k]; C.insertAdjacentHTML('beforeend', `<div class="ans" style="font-size:24px"><span class="m">${fmt(acc)} · ${fmt(b)} =</span> ${slot('', 6)}</div>`);
      const s = [...C.querySelectorAll('.slot')].pop(); let tr = 0;
      api.setHint(i => i === 0 ? mulHint(acc, b) : `${fmt(acc)} · ${fmt(b)} = ${fmt(acc * b)}`);
      padOn([s], () => { const v = val(s); if (v === null) return; if (v === acc * b) { padOff(); s.classList.add('ok'); s.onclick = null; tone(true); CALM.wrongRow = 0; acc = v; k++; stepMul() } else { tr++; s.classList.add('no'); api.wrong(tr >= 2 ? mulHint(acc, b) : `${fmt(acc)} · ${fmt(b)} no es ${fmt(v)}.`); clear(s) } });
    };
    stepMul();
  }
  phase === 'com' ? comPhase() : takePhase();
});

/* ---------- demos para «Entiende» ---------- */
M.addDemo('colum', (host, d) => {
  const rows = []; let m = d.n; while (m > 1) { const p = spf(m); rows.push([m, p]); m /= p }
  host.innerHTML = `<div class="box" style="text-align:center"><div class="fwrap"><div class="fcol fdemo">${rows.map(([n, p]) => `<div class="fr"><span class="fn">${fmt(n)}</span><span class="fp">${p}</span></div>`).join('')}<div class="fr"><span class="fn">1</span><span class="fp"></span></div></div></div><div class="cap" style="font-weight:800;min-height:26px;margin:6px 0"></div><button class="big alt" style="width:auto;padding:8px 16px;margin:0">▶️ Míralo paso a paso</button></div>`;
  const frs = [...host.querySelectorAll('.fr')], cap = host.querySelector('.cap'), btn = host.querySelector('button');
  btn.onclick = () => {
    btn.disabled = true; frs.forEach(f => f.classList.remove('in')); let k = 0;
    const tick = () => {
      if (k < rows.length) { const [n, p] = rows[k]; frs[k].classList.add('in'); cap.innerHTML = `${fmt(n)} : ${p} = ${fmt(n / p)}`; k++; setTimeout(tick, 1500); return }
      frs[k].classList.add('in'); cap.innerHTML = `¡Llegamos al 1! → <span class="m" style="font-size:20px">${fmt(d.n)} = ${fs(factor(d.n))}</span>`; btn.disabled = false; btn.textContent = '🔁 Otra vez';
    }; tick();
  };
});
M.addDemo('ranas', (host, d) => {
  const a = d.a, b = d.b, Mx = lcm(a, b), W = 340, x = n => 22 + (W - 44) * n / Mx, la = d.la || '🐸', lb = d.lb || '🐰', YA = 70, YB = 150;
  const track = (y, s, col) => `<line x1="12" y1="${y}" x2="${W - 12}" y2="${y}" stroke="#8a8172" stroke-width="2.5"/>${Array(Mx / s + 1).fill(0).map((_, i) => { const n = i * s; return `<line x1="${x(n)}" y1="${y - 4}" x2="${x(n)}" y2="${y + 4}" stroke="${col}" stroke-width="2"/><text x="${x(n)}" y="${y + 18}" font-size="${n === Mx ? 14 : 11}" text-anchor="middle" font-family="Fredoka" font-weight="700" fill="${n === Mx ? '#d9467a' : col}">${n}</text>` }).join('')}`;
  host.innerHTML = `<div class="box" style="text-align:center"><svg viewBox="0 0 ${W} 178" style="width:100%;max-width:440px">${track(YA, a, '#3c9a3c')}${track(YB, b, '#c2630a')}<g class="arcs"></g><line class="meet" x1="${x(Mx)}" y1="${YA}" x2="${x(Mx)}" y2="${YB}" stroke="#d9467a" stroke-width="2.5" stroke-dasharray="5 4" opacity="0"/><text class="fa" x="${x(0)}" y="${YA - 6}" font-size="22" text-anchor="middle">${la}</text><text class="fb" x="${x(0)}" y="${YB - 6}" font-size="22" text-anchor="middle">${lb}</text></svg>
    <div class="cap" style="font-weight:800;min-height:46px;line-height:1.4"></div><button class="big alt" style="width:auto;padding:8px 16px;margin:0">▶️ ¡Que salten!</button></div>`;
  const arcs = host.querySelector('.arcs'), fa = host.querySelector('.fa'), fb = host.querySelector('.fb'), meet = host.querySelector('.meet'), cap = host.querySelector('.cap'), btn = host.querySelector('button');
  const arc = (y, p, s, col) => `<path d="M${x(p)} ${y} Q${(x(p) + x(p + s)) / 2} ${y - Math.max(16, Math.min(40, 260 * s / Mx))} ${x(p + s)} ${y}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="4 3"/>`;
  btn.onclick = () => {
    btn.disabled = true; arcs.innerHTML = ''; meet.setAttribute('opacity', 0); fa.setAttribute('x', x(0)); fb.setAttribute('x', x(0)); let pa = 0, pb = 0; const sa = [], sb = [];
    const tick = () => {
      const ga = pa < Mx, gb = pb < Mx;
      if (!ga && !gb) { meet.setAttribute('opacity', 1); arcs.insertAdjacentHTML('beforeend', `<text x="${x(Mx)}" y="${(YA + YB) / 2 + 6}" font-size="20" text-anchor="middle">⭐</text>`); cap.innerHTML = `${la} ${sa.join(', ')}<br>${lb} ${sb.join(', ')}<br>¡Coinciden por primera vez en el <span style="color:#d9467a">${Mx}</span>! Ese es el <b>m.c.m.(${a}, ${b})</b>.`; tone(true, true); btn.disabled = false; btn.textContent = '🔁 Otra vez'; return }
      if (ga) { arcs.insertAdjacentHTML('beforeend', arc(YA, pa, a, '#3c9a3c')); pa += a; sa.push(pa); fa.setAttribute('x', x(pa)) }
      if (gb) { arcs.insertAdjacentHTML('beforeend', arc(YB, pb, b, '#e07a10')); pb += b; sb.push(pb); fb.setAttribute('x', x(pb)) }
      cap.innerHTML = `${la} salta de ${a} en ${a}: ${sa.join(', ')}<br>${lb} salta de ${b} en ${b}: ${sb.join(', ')}`; tone(true); setTimeout(tick, 1000);
    }; tick();
  };
});
M.addDemo('cintas', (host, d) => {
  const a = d.a, b = d.b, big = Math.max(a, b), u = d.u || 'cm', tries = []; for (let k = Math.min(a, b); k >= 1; k--) if (Math.min(a, b) % k === 0) { tries.push(k); if (Math.max(a, b) % k === 0) break }
  const bar = (len, k) => { const n = Math.floor(len / k), r = len - n * k, wpx = 100 * len / big; return `<div style="display:flex;width:${wpx}%;height:30px;border-radius:8px;overflow:hidden;border:2px solid #8a8172;margin:4px 0">${Array(n).fill(0).map((_, i) => `<div style="flex:${k};background:${i % 2 ? '#c9f0b7' : '#9ad97f'};border-right:2px solid #fff;font:700 12px Fredoka;display:grid;place-items:center">${k}</div>`).join('')}${r ? `<div style="flex:${r};background:repeating-linear-gradient(45deg,#fdecec,#fdecec 4px,#f5c2c3 4px,#f5c2c3 8px);font:700 11px Fredoka;color:#9b1c1f;display:grid;place-items:center">sobra ${r}</div>` : ''}</div>` };
  host.innerHTML = `<div class="box"><div style="font-weight:800;font-size:14px">Cinta de ${a} ${u}</div><div class="b1">${bar(a, a)}</div><div style="font-weight:800;font-size:14px;margin-top:6px">Cinta de ${b} ${u}</div><div class="b2">${bar(b, b)}</div><div class="cap" style="font-weight:800;min-height:46px;line-height:1.4;text-align:center;margin:6px 0"></div><div style="text-align:center"><button class="big alt" style="width:auto;padding:8px 16px;margin:0">✂️ ¡A cortar!</button></div></div>`;
  const b1 = host.querySelector('.b1'), b2 = host.querySelector('.b2'), cap = host.querySelector('.cap'), btn = host.querySelector('button');
  btn.onclick = () => {
    btn.disabled = true; let i = 0;
    const tick = () => {
      const k = tries[i]; b1.innerHTML = bar(a, k); b2.innerHTML = bar(b, k); const ok = a % k === 0 && b % k === 0;
      cap.innerHTML = ok ? `✅ Trozos de <b>${k} ${u}</b>: ¡caben exactos en las dos cintas!<br>Es el trozo más grande posible → <b>m.c.d.(${a}, ${b}) = ${k}</b>` : `❌ Trozos de ${k} ${u}: en una cinta sobra un trozo. Probamos más pequeño…`;
      tone(ok, ok); if (ok) { btn.disabled = false; btn.textContent = '🔁 Otra vez'; return } i++; setTimeout(tick, 1700);
    }; tick();
  };
});
const chipsHTML = (nums, mark) => nums.map(n => `<div class="cmrow"><span class="m cmn">${fmt(n)} =</span>${factor(n).map(([p, e]) => `<span class="chip ${mark ? (nums.every(x => x % p === 0) ? 'com' : 'nocom') : ''}">${pe(p, e)}</span>`).join('<span class="dot">·</span>')}</div>`).join('');

/* ---------- generadores · bloque 1: divisibilidad ---------- */
function exCrit(l, force) {
  const d = force || pick(l === 1 ? [2, 5, 3, 3] : [2, 3, 5, 3]), yes = Math.random() < .5; let n;
  do { n = l === 1 ? rnd(10, 99) : l === 2 ? rnd(100, 999) : rnd(1000, 9999) } while ((n % d === 0) !== yes);
  const rule = { 2: 'termina en 0 o en cifra par', 3: 'la suma de sus cifras es múltiplo de 3', 5: 'termina en 0 o en 5' }[d];
  const steps = [];
  if (d === 3) {
    const ds = digits(n), s = ds.reduce((a, b) => a + b, 0);
    steps.push({ q: 'Criterio del 3: suma sus cifras.', pre: `<span class="m">${ds.join(' + ')} =</span> `, ans: s, max: 2, hints: ['Suma de una en una.', `${ds.join(' + ')} = ${s}`] });
    steps.push({ type: 'choice', q: `¿${s} está en la tabla del 3? Entonces, ¿${fmt(n)} es divisible entre 3?`, opts: ['Sí', 'No'], keep: true, ans: yes ? 0 : 1, why: () => yes ? `${s} = 3 · ${s / 3}: sí está en la tabla del 3.` : `${s} no está en la tabla del 3 (3, 6, 9, 12, 15, 18, 21, 24, 27, 30…).` });
  } else steps.push({ type: 'choice', q: 'Elige:', opts: ['Sí', 'No'], keep: true, ans: yes ? 0 : 1, why: () => d === 2 ? `Mira la última cifra: <b>${n % 10}</b>. ${yes ? 'Es par, así que sí.' : 'Es impar, así que no.'}` : `Mira la última cifra: <b>${n % 10}</b>. ${yes ? 'Termina en 0 o en 5, así que sí.' : 'No termina en 0 ni en 5, así que no.'}` });
  return { skill: 'crit' + d, label: `Criterio de divisibilidad del ${d}`, title: `¿Es <b>${fmt(n)}</b> divisible entre <b>${d}</b>?`, steps, sol: `Un número es divisible entre ${d} si ${rule}. ${fmt(n)} <b>${yes ? 'sí' : 'no'}</b> lo es.` };
}
function exMarca(l) {
  const d = pick([2, 3, 5, 3]); let ns;
  do { ns = []; while (ns.length < 8) { const n = l === 1 ? rnd(10, 99) : rnd(100, 999); if (!ns.includes(n)) ns.push(n) } } while (ns.filter(n => n % d === 0).length < 2 || ns.filter(n => n % d).length < 3);
  const ok = ns.filter(n => n % d === 0).map(String);
  const rule = { 2: 'Divisible entre 2: termina en 0 o en cifra par.', 3: 'Divisible entre 3: la suma de sus cifras es múltiplo de 3.', 5: 'Divisible entre 5: termina en 0 o en 5.' }[d];
  return { skill: 'marca' + d, label: `Reconocer números divisibles entre ${d}`, title: `Marca todos los números <b>divisibles entre ${d}</b>`, steps: [{ type: 'cells', q: 'Toca los que lo sean y pulsa «Comprobar»:', table: a => `<table class="tt">${[0, 1].map(r => `<tr>${ns.slice(r * 4, r * 4 + 4).map(n => `<td ${a(n)}>${fmt(n)}</td>`).join('')}</tr>`).join('')}</table>`, ok, hints: [rule] }], sol: `${rule}<br>Lo son: <b>${yl(ok.map(Number).map(fmt))}</b>.` };
}
const PRIM = { 1: [7, 11, 13, 17, 19, 23, 29, 9, 15, 21, 25, 27, 14, 22], 2: [31, 37, 41, 43, 47, 33, 39, 49, 51, 35, 45, 57], 3: [53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 51, 57, 87, 91, 69, 77, 93, 119] };
function exPrimo(l) {
  const n = pick(PRIM[l]), pr = isPrime(n), s = spf(n);
  return { skill: 'primo', label: 'Reconocer números primos', title: `¿El <b>${n}</b> es primo o compuesto?`, steps: [{ type: 'choice', q: 'Elige:', opts: ['Primo', 'Compuesto'], keep: true, ans: pr ? 0 : 1, why: () => pr ? `Prueba a dividirlo entre 2, 3, 5, 7…: ninguno da resto 0. Solo se divide entre 1 y ${n}: <b>es primo</b>.` : `${n} = ${s} · ${n / s}: se puede dividir entre ${s}, así que es <b>compuesto</b>.` }], sol: pr ? `${n} es <b>primo</b>: solo se puede dividir entre 1 y entre él mismo.` : `${n} es <b>compuesto</b>: ${n} = ${s} · ${n / s}.` };
}
function exDivisores(l) {
  const n = pick(l === 1 ? [6, 8, 10, 12, 15] : [12, 18, 20, 24, 30, 36]), ok = []; for (let k = 1; k <= n; k++) if (n % k === 0) ok.push(String(k));
  const cells = Array(n).fill(0).map((_, i) => i + 1), cols = 6;
  return { skill: 'divisores', label: 'Divisores de un número', title: `Marca <b>todos los divisores</b> de ${n}`, steps: [{ type: 'cells', q: `Toca los números que dividen a ${n} con resto 0 (no te olvides del 1 ni del ${n}):`, table: a => `<table class="tt">${Array(Math.ceil(n / cols)).fill(0).map((_, r) => `<tr>${cells.slice(r * cols, r * cols + cols).map(k => `<td ${a(k)}>${k}</td>`).join('')}</tr>`).join('')}</table>`, ok, hints: ['Busca parejas que multiplicadas den ' + n + ': 1 · ' + n + ', 2 · …'] }], sol: `Divisores de ${n}: <b>${ok.join(', ')}</b>. Van por parejas: ${ok.slice(0, Math.ceil(ok.length / 2)).map(k => `${k} · ${n / k}`).join(', ')}.` };
}
function exDivCasita(l) {
  const d = l === 1 ? pick([3, 4, 6, 7, 8, 9]) : pick([12, 13, 14, 15, 16, 18, 21, 24, 25]), yes = Math.random() < .55;
  const q = l === 1 ? rnd(12, 60) : rnd(11, 45), r = yes ? 0 : rnd(1, d - 1), D = d * q + r;
  return { skill: 'divcasita', label: l === 1 ? '¿Es divisible? (división)' : '¿Es divisible? (división de dos cifras)', title: `¿Es <b>${fmt(D)}</b> divisible entre <b>${d}</b>? Haz la división:`, steps: [{ type: 'div', D, d }, { type: 'choice', q: `El resto es ${r}. Entonces, ¿${fmt(D)} es divisible entre ${d}?`, opts: ['Sí', 'No'], keep: true, ans: yes ? 0 : 1, why: () => 'Es divisible solo si el resto es <b>0</b>.' }], sol: `${fmt(D)} : ${d} = ${q}${r ? `, y sobra${r > 1 ? 'n' : ''} ${r}` : ' con resto 0'}. ${yes ? '<b>Sí</b> es divisible.' : '<b>No</b> es divisible.'}` };
}
function gen1(l) { return (l === 1 ? pick([exCrit, exCrit, exPrimo, exMarca, exDivCasita, exMental]) : l === 2 ? pick([exCrit, exPrimo, exMarca, exDivisores, exDivCasita]) : pick([exCrit, exPrimo, exDivisores, exDivCasita, exMarca]))(l) }

/* ---------- bloque 2: descomponer ---------- */
const FA = { 1: [12, 18, 20, 24, 28, 30, 36, 40, 44, 45, 50, 54, 16, 27], 2: [42, 48, 56, 60, 63, 70, 72, 75, 80, 84, 90, 96, 98, 100, 108], 3: [120, 126, 132, 135, 140, 144, 150, 168, 180, 200, 210, 240, 252, 300, 360, 65, 52, 91, 266, 123, 119, 85] };
function factSol(n) { const L = []; let m = n; while (m > 1) { const p = spf(m); L.push(`${fmt(m)} | ${p}`); m /= p } L.push('1'); return `<div style="font-family:'Courier New',monospace;font-weight:700">${L.join('<br>')}</div>${fmt(n)} = <b>${fs(factor(n))}</b>` }
function exFact(l, n) { n = n || pick(FA[l]); return { skill: 'fact', label: 'Descomponer en factores primos', title: `Descompón <b>${fmt(n)}</b> en factores primos`, steps: [{ type: 'fact', N: n }], sol: factSol(n) } }
function exComprueba(l, fixed) {
  let n, g, ok;
  for (let t = 0; t < 50; t++) {
    n = fixed ? fixed[0] : pick([120, 140, 180, 144, 56, 70, 84, 60, 90, 200, 300, 150, 72, 126]); const f = factor(n);
    ok = fixed ? false : Math.random() < .4; g = f.map(x => x.slice());
    if (fixed) g = fixed[1];
    else if (!ok) { if (g.length > 1 && Math.random() < .5) g.splice(rnd(0, g.length - 1), 1); else { const i = g.findIndex(x => x[1] > 1); if (i >= 0) g[i][1]--; else g.pop() } }
    if (g.length && (ok || fval(g) !== n)) break;
  }
  const v = fval(g), f = factor(n);
  return { skill: 'comprueba', label: 'Comprobar una descomposición', title: `Alguien ha escrito: <span class="m" style="font-size:22px">${fmt(n)} = ${fs(g)}</span><br>¿Está bien?`, steps: [{ q: 'Multiplica para comprobarlo:', pre: `<span class="m">${fs(g)} =</span> `, ans: v, max: 5, hints: [g.length > 1 ? `${g.map(([p, e]) => fmt(Math.pow(p, e))).join(' · ')}. Multiplica de dos en dos.` : `${fs(g)} = ${Array(g[0][1]).fill(g[0][0]).join(' · ')}`, `Da ${fmt(v)}.`] }, { type: 'choice', q: `Da ${fmt(v)}. Entonces, ¿está bien la descomposición de ${fmt(n)}?`, opts: ['Sí, está bien', 'No, está mal'], keep: true, ans: v === n ? 0 : 1, why: () => v === n ? `Da justo ${fmt(n)}.` : `${fmt(v)} no es ${fmt(n)}.` }], sol: `${fs(g)} = ${fmt(v)}. ${v === n ? '<b>Está bien.</b>' : `<b>Está mal</b>: lo correcto es ${fmt(n)} = ${fs(f)}.`}` };
}
function exMental(l) {
  const t = l === 1 ? pick([2, 2, 3, 5]) : l === 2 ? pick([2, 3, 5, 7]) : pick([3, 7, 12, 15, 16]);
  const q = l === 1 ? rnd(11, 49) : l === 2 ? rnd(13, 99) : (t > 10 ? rnd(11, 30) : rnd(21, 99)), n = t * q;
  return { skill: 'mental-' + (t > 10 ? 'dos' : t), label: t > 10 ? 'Dividir de cabeza entre dos cifras' : `Dividir de cabeza entre ${t}`, title: `⚡ Cálculo rápido: <b>${fmt(n)} : ${t}</b>`, steps: [{ pre: `<span class="m">${fmt(n)} : ${t} =</span> `, ans: q, max: 4, hints: [divHint(n, t), `${fmt(n)} : ${t} = ${q}, porque ${t} · ${q} = ${fmt(n)}.`], why: v => `${t} · ${v} = ${fmt(t * v)}, no ${fmt(n)}. ${divHint(n, t)}` }], sol: `${divHint(n, t)}<br>${fmt(n)} : ${t} = <b>${q}</b>, porque ${t} · ${q} = ${fmt(n)}.` };
}
function gen2(l) { const r = Math.random(); return r < .2 ? exMental(l) : r < (l === 3 ? .32 : .4) ? exComprueba(l) : exFact(l) }

/* ---------- bloque 3: m.c.m. y m.c.d. ---------- */
const PAIRS = {
  1: [[10, 15], [16, 24], [12, 18], [20, 24], [24, 36], [20, 25], [50, 75], [24, 30], [6, 8], [20, 30], [12, 16], [18, 24], [15, 20], [8, 12], [9, 12], [14, 21]],
  2: [[24, 42], [45, 40], [50, 70], [54, 60], [60, 80], [21, 30], [36, 48], [42, 56], [28, 42], [30, 45], [40, 60], [8, 15], [9, 20], [12, 35]],
  3: [[135, 84], [56, 70], [120, 144], [140, 180], [200, 300], [180, 240], [90, 126], [84, 126], [150, 180], [72, 120], [100, 150], [96, 144]]
};
const TRES = [{ n: [8, 12, 15], k: 'mcm' }, { n: [65, 30, 45], k: 'mcd' }, { n: [6, 10, 15], k: 'mcm' }, { n: [12, 18, 30], k: 'mcd' }, { n: [4, 6, 10], k: 'mcm' }, { n: [24, 36, 60], k: 'mcd' }, { n: [52, 80, 10, 65], k: 'mcd' }];
const COPR = [[8, 15], [9, 20], [14, 25], [12, 35], [16, 27], [21, 10], [266, 123], [22, 15]];
function exCM(l, nums) {
  nums = nums || pick(PAIRS[l]); const [a, b] = nums, steps = [];
  if (l === 3) { const big = Math.max(a, b); steps.push({ type: 'fact', N: big, noPow: true, q: `Primero descompón el <b>${big}</b> (el otro ya te lo doy):` }) }
  steps.push({ type: 'cm', nums, kind: 'mcm' }, { type: 'cm', nums, kind: 'mcd', known: true });
  return { skill: 'cm', label: 'Calcular el m.c.m. y el m.c.d.', title: `Calcula el <b>m.c.m.</b> y el <b>m.c.d.</b> de <b>${a} y ${b}</b>`, steps, sol: solCM(nums) };
}
function solCM(nums) {
  const F = nums.map(factor), allP = [...new Set(F.flat().map(x => x[0]))].sort((x, y) => x - y), com = allP.filter(p => F.every(f => f.some(x => x[0] === p)));
  const mx = allP.map(p => [p, Math.max(...F.map(f => (f.find(x => x[0] === p) || [0, 0])[1]))]), mn = com.map(p => [p, Math.min(...F.map(f => f.find(x => x[0] === p)[1]))]);
  return nums.map((n, i) => `${n} = ${fs(F[i])}`).join('<br>') + `<br>m.c.m.(${nm(nums)}) = ${fs(mx)} = <b>${fmt(L(nums))}</b><br>m.c.d.(${nm(nums)}) = ${com.length ? fs(mn) + ' = ' : '(no hay comunes) '}<b>${G(nums)}</b>`;
}
function exSolo(l, kind, nums) {
  kind = kind || pick(['mcm', 'mcd']); nums = nums || pick(PAIRS[l]);
  return { skill: 'cm-' + kind, label: kind === 'mcm' ? 'Calcular el m.c.m.' : 'Calcular el m.c.d.', title: `Calcula el <b>${kind === 'mcm' ? 'm.c.m.' : 'm.c.d.'}(${nm(nums)})</b>`, steps: [{ type: 'cm', nums, kind }], sol: solCM(nums) };
}
function exCopr(l) { const nums = pick(l < 3 ? COPR.slice(0, 6) : COPR); return { skill: 'cm-copr', label: 'm.c.d. sin factores comunes', title: `Calcula el <b>m.c.d.(${nm(nums)})</b> y el <b>m.c.m.(${nm(nums)})</b>`, steps: [{ type: 'cm', nums, kind: 'mcd' }, { type: 'cm', nums, kind: 'mcm', known: true }], sol: solCM(nums) } }
function exTres(l, t) { t = t || pick(TRES); return { skill: 'cm-tres', label: 'm.c.m. o m.c.d. de tres o más números', title: `Calcula el <b>${t.k === 'mcm' ? 'm.c.m.' : 'm.c.d.'}(${nm(t.n)})</b>`, steps: [{ type: 'cm', nums: t.n, kind: t.k }], sol: solCM(t.n) } }
function exSentido(l) {
  const [s, k] = pick([[6, 3], [12, 2], [15, 3], [8, 5], [9, 4], [7, 3], [10, 4], [14, 2]]), b = s * k;
  return { skill: 'sentido', label: 'Atajo: cuando uno es múltiplo del otro', title: `${b} es múltiplo de ${s} (${s} · ${k} = ${b}). Sin hacer cuentas largas:`, steps: [{ type: 'choice', q: `¿Cuál es el m.c.m.(${s}, ${b})?`, opts: [String(b), String(s), String(s * b)], ans: 0, why: () => `El m.c.m. es el múltiplo común más pequeño. ${b} ya es múltiplo de ${s} y de sí mismo.` }, { type: 'choice', q: `¿Y el m.c.d.(${s}, ${b})?`, opts: [String(s), String(b), '1'], ans: 0, why: () => `${s} divide a ${s} y también a ${b}. Ningún divisor común puede ser mayor que el número más pequeño.` }], sol: `Si uno es múltiplo del otro: m.c.m. = el <b>grande</b> (${b}); m.c.d. = el <b>pequeño</b> (${s}).` };
}
function examWhy(nums, vm, vd) {
  const m = L(nums), g = G(nums), mn = Math.min(...nums), mxn = Math.max(...nums), tips = [];
  if (vm === g && vd === m) return '¡Los has cambiado! El <b>m.c.m.</b> es el grande (exponente más alto) y el <b>m.c.d.</b> el pequeño (exponente más bajo).';
  if (vm !== m) { if (vm < mxn) tips.push(`El m.c.m. no puede ser más pequeño que ${mxn}.`); else if (nums.some(n => vm % n)) tips.push(`Comprueba: ${fmt(vm)} : ${nums.find(n => vm % n)} no da exacto, así que ${fmt(vm)} no es múltiplo de los dos.`); else tips.push(`${fmt(vm)} es múltiplo común, pero no el más pequeño: ¿has cogido algún exponente de más?`) }
  if (vd !== g) { if (vd === 0) tips.push('El m.c.d. <b>nunca es 0</b>: si no hay comunes, es 1.'); else if (vd > mn) tips.push(`El m.c.d. no puede ser más grande que ${mn}.`); else if (nums.some(n => n % vd)) tips.push(`Comprueba: ${nums.find(n => n % vd)} : ${vd} no da exacto, así que ${vd} no divide a los dos.`); else tips.push(`${vd} divide a los dos, pero hay uno más grande: revisa los exponentes de los comunes.`) }
  return tips.join(' ') + ' Revisa la descomposición en tu cuaderno.';
}
function exExamen(l, nums) {
  nums = nums || pick(PAIRS[Math.max(2, l)].concat(COPR.slice(0, 4)));
  return { skill: 'examen', label: 'Modo examen: m.c.m. y m.c.d. en el cuaderno', title: `🎯 <b>Modo examen</b>: hazlo en tu cuaderno, como en el examen, y escribe solo los resultados.<br><span class="m" style="font-size:22px">m.c.m.(${nm(nums)}) y m.c.d.(${nm(nums)})</span>`, steps: [{ type: 'pair', q: 'Toca ⇅ para cambiar de casilla:', fields: [{ label: 'm.c.m. =', v: L(nums), max: 5 }, { label: 'm.c.d. =', v: G(nums), max: 4 }], hints: ['Paso 1: descompón los dos números. Paso 2: colorea comunes y no comunes. Paso 3: m.c.m. → todos, exponente más alto; m.c.d. → solo comunes, exponente más bajo.', `${nums.map(n => `${n} = ${fs(factor(n))}`).join(' · ')}`], why: vs => examWhy(nums, vs[0], vs[1]) }], sol: solCM(nums) };
}
function gen3(l) { return (l === 1 ? pick([() => exCM(1), () => exSolo(1), () => exSolo(1), exSentido]) : l === 2 ? pick([() => exCM(2), exCopr, () => exSolo(2), exTres, () => exCM(2), exExamen]) : pick([() => exCM(3), exTres, exExamen, exExamen, exCopr]))(l) }

/* ---------- bloque 4: problemas ---------- */
const hh = m => { const t = 14 * 60 + m, h = Math.floor(t / 60), mi = t % 60; return `${h}:${String(mi).padStart(2, '0')}` };
const PR = [
  { k: 'mcm', sets: [[6, 8], [4, 6], [8, 12], [10, 15], [6, 9], [12, 18]], t: (a, b) => `🚚 Una fábrica envía mercancía a Valencia cada <b>${a} días</b> y a Sevilla cada <b>${b} días</b>. Hoy han coincidido los dos envíos. ¿Cuándo volverán a coincidir?`, d: (a, b) => `Valencia → cada ${a} días · Sevilla → cada ${b} días`, sol: v => `Volverán a coincidir dentro de <b>${v} días</b>.` },
  { k: 'mcm', sets: [[20, 30], [15, 20], [12, 20], [10, 15], [20, 25]], t: (a, b) => `🚦 Una luz roja se enciende cada <b>${a} minutos</b> y una verde cada <b>${b} minutos</b>. A las <b>2 de la tarde</b> (14:00) se han encendido a la vez. ¿A qué hora volverán a coincidir?`, d: (a, b) => `Roja → cada ${a} minutos · Verde → cada ${b} minutos · Coinciden a las 14:00`, f: (a, b, v) => [{ type: 'choice', q: `Coinciden cada ${v} minutos${v === 60 ? ' (¡1 hora!)' : ''}. Si coincidieron a las 14:00, ¿a qué hora vuelven a coincidir?`, opts: [hh(v), hh(a + b), hh(2 * v)], ans: 0, why: () => `Suma ${v} minutos a las 14:00.` }], sol: v => `Volverán a coincidir a las <b>${hh(v)}</b>.` },
  { k: 'mcm', sets: [[12, 18], [15, 20], [10, 12], [8, 10], [12, 15]], t: (a, b) => `🚌 De una parada salen dos autobuses: uno cada <b>${a} minutos</b> y otro cada <b>${b} minutos</b>. Acaban de salir juntos. ¿Cuántos minutos tardarán en volver a salir a la vez?`, d: (a, b) => `Autobús A → cada ${a} min · Autobús B → cada ${b} min`, sol: v => `Volverán a salir juntos dentro de <b>${v} minutos</b>.` },
  { k: 'mcm', sets: [[3, 4], [4, 6], [6, 10], [5, 6], [4, 10]], t: (a, b) => `🏊 Lucía va a la piscina cada <b>${a} días</b> y su amiga Marta cada <b>${b} días</b>. Hoy se han encontrado allí. ¿Dentro de cuántos días se volverán a encontrar?`, d: (a, b) => `Lucía → cada ${a} días · Marta → cada ${b} días`, sol: v => `Se volverán a encontrar dentro de <b>${v} días</b>.` },
  { k: 'mcm', sets: [[8, 12], [9, 12], [10, 25], [14, 21]], t: (a, b) => `💡 Un faro se enciende cada <b>${a} segundos</b> y otro cada <b>${b} segundos</b>. Ahora se han encendido a la vez. ¿Cuántos segundos pasarán hasta que vuelvan a coincidir?`, d: (a, b) => `Faro 1 → cada ${a} s · Faro 2 → cada ${b} s`, sol: v => `Volverán a coincidir dentro de <b>${v} segundos</b>.` },
  { k: 'mcd', sets: [[60, 80], [40, 60], [24, 36], [30, 45], [48, 72]], t: (a, b) => `🫒 Tenemos <b>${a} litros</b> de aceite de girasol y <b>${b} litros</b> de aceite de oliva. Queremos envasarlos en garrafas iguales, <b>lo más grandes posible</b>, sin mezclar los aceites y sin que sobre nada. ¿Qué capacidad tendrá cada garrafa? ¿Cuántas habrá de cada aceite?`, d: (a, b) => `Girasol → ${a} litros · Oliva → ${b} litros`, f: (a, b, v) => [{ q: 'Garrafas de girasol:', pre: `<span class="m">${a} : ${v} =</span> `, ans: a / v, hints: [divHint(a, v)] }, { q: 'Garrafas de oliva:', pre: `<span class="m">${b} : ${v} =</span> `, ans: b / v, hints: [divHint(b, v)] }], sol: (v, a, b) => `Cada garrafa tendrá <b>${v} litros</b>: ${a / v} de girasol y ${b / v} de oliva.` },
  { k: 'mcd', sets: [[180, 240], [120, 150], [90, 120], [60, 84], [48, 80]], t: (a, b) => `🪵 Tenemos un listón de <b>${a} cm</b> y otro de <b>${b} cm</b>. Queremos cortarlos en trozos iguales, <b>lo más largos posible</b>, sin que sobre nada. ¿Cuánto medirá cada trozo? ¿Cuántos trozos saldrán en total?`, d: (a, b) => `Listón 1 → ${a} cm · Listón 2 → ${b} cm`, f: (a, b, v) => [{ q: 'Trozos del primer listón:', pre: `<span class="m">${a} : ${v} =</span> `, ans: a / v, hints: [divHint(a, v)] }, { q: 'Trozos del segundo listón:', pre: `<span class="m">${b} : ${v} =</span> `, ans: b / v, hints: [divHint(b, v)] }, { q: 'Trozos en total:', pre: `<span class="m">${a / v} + ${b / v} =</span> `, ans: (a + b) / v }], sol: (v, a, b) => `Cada trozo medirá <b>${v} cm</b> y saldrán <b>${(a + b) / v} trozos</b>.` },
  { k: 'mcd', sets: [[21, 30], [24, 36], [18, 30], [20, 32], [28, 42]], t: (a, b) => `🟩 Una cartulina mide <b>${a} cm × ${b} cm</b>. Queremos cortarla en cuadrados iguales, <b>lo más grandes posible</b>, sin que sobre nada. ¿Cuánto medirá el lado de cada cuadrado? ¿Cuántos cuadrados saldrán?`, d: (a, b) => `Lado corto → ${a} cm · Lado largo → ${b} cm`, f: (a, b, v) => [{ q: `Cuadrados a lo ancho:`, pre: `<span class="m">${a} : ${v} =</span> `, ans: a / v }, { q: `Cuadrados a lo largo:`, pre: `<span class="m">${b} : ${v} =</span> `, ans: b / v }, { q: 'Cuadrados en total (filas · columnas):', pre: `<span class="m">${a / v} · ${b / v} =</span> `, ans: (a / v) * (b / v), hints: [mulHint(a / v, b / v)] }], sol: (v, a, b) => `Los cuadrados serán de <b>${v} × ${v} cm</b> y saldrán <b>${(a / v) * (b / v)} cuadrados</b>.` },
  { k: 'mcd', sets: [[24, 36], [30, 42], [45, 60], [16, 40], [18, 27]], t: (a, b) => `🍬 Tenemos <b>${a} caramelos de fresa</b> y <b>${b} de limón</b>. Queremos hacer bolsas con el mismo número de caramelos, <b>el mayor número posible</b>, sin mezclar sabores y sin que sobre ninguno. ¿Cuántos caramelos llevará cada bolsa? ¿Cuántas bolsas haremos?`, d: (a, b) => `Fresa → ${a} · Limón → ${b}`, f: (a, b, v) => [{ q: 'Bolsas de fresa:', pre: `<span class="m">${a} : ${v} =</span> `, ans: a / v }, { q: 'Bolsas de limón:', pre: `<span class="m">${b} : ${v} =</span> `, ans: b / v }], sol: (v, a, b) => `Cada bolsa llevará <b>${v} caramelos</b>: ${a / v} bolsas de fresa y ${b / v} de limón (${(a + b) / v} en total).` },
  { k: 'mcd', sets: [[12, 18], [16, 20], [15, 25], [14, 21], [18, 24]], t: (a, b) => `👧👦 En una excursión van <b>${a} chicas</b> y <b>${b} chicos</b>. Hay que hacer grupos del mismo tamaño, <b>lo más grandes posible</b>, sin mezclar chicas y chicos. ¿Cuántas personas habrá en cada grupo?`, d: (a, b) => `Chicas → ${a} · Chicos → ${b}`, sol: (v, a, b) => `Cada grupo tendrá <b>${v} personas</b>: ${a / v} grupos de chicas y ${b / v} de chicos.` }
];
function exProb(l, T, set) {
  T = T || pick(PR); const [a, b] = set || pick(T.sets), v = T.k === 'mcm' ? lcm(a, b) : gcd(a, b);
  const steps = [
    { type: 'info', q: `📋 <b>Datos:</b> ${T.d(a, b)}` },
    { type: 'choice', q: '🤔 ¿Qué hay que calcular?', opts: ['El m.c.m.', 'El m.c.d.'], keep: true, ans: T.k === 'mcm' ? 0 : 1, why: i => T.k === 'mcm' ? 'Habla de <b>volver a coincidir</b> → coincidencias → <b>m.c.m.</b>' : 'Pide <b>lo más grande posible</b> para <b>repartir</b> sin que sobre → <b>m.c.d.</b>', okMsg: T.k === 'mcm' ? 'Coincidencias → m.c.m.' : 'Lo más grande / repartir → m.c.d.' },
    { type: 'info', q: `🧮 <b>Operación:</b> ${T.k === 'mcm' ? 'm.c.m.' : 'm.c.d.'}(${a}, ${b})` },
    { type: 'cm', nums: [a, b], kind: T.k },
    ...(T.f ? T.f(a, b, v) : []),
    { type: 'info', q: `✍️ <b>Solución:</b> ${T.sol(v, a, b)}` }
  ];
  return { skill: 'prob-' + T.k, label: T.k === 'mcm' ? 'Problemas de m.c.m. (coincidencias)' : 'Problemas de m.c.d. (repartir)', title: T.t(a, b), steps, sol: `${T.k === 'mcm' ? 'm.c.m.' : 'm.c.d.'}(${a}, ${b}) = <b>${v}</b>. ${T.sol(v, a, b)}` };
}
function exRopa() {
  const nums = [8, 12, 15], v = 120;
  return { skill: 'prob-mcm', label: 'Problemas de m.c.m. (coincidencias)', title: '👕 Ana quiere gastar <b>la misma cantidad</b> en camisetas (<b>8 €</b> cada una), en pantalones (<b>12 €</b>) y en sudaderas (<b>15 €</b>), y que sea <b>la menor cantidad posible</b>. ¿Cuánto gastará en cada tipo de prenda? ¿Cuántas prendas de cada tipo comprará?', steps: [
    { type: 'info', q: '📋 <b>Datos:</b> Camisetas → 8 € · Pantalones → 12 € · Sudaderas → 15 €' },
    { type: 'choice', q: '🤔 ¿Qué hay que calcular?', opts: ['El m.c.m.', 'El m.c.d.'], keep: true, ans: 0, why: () => 'Buscamos una cantidad que sea múltiplo de 8, de 12 y de 15 a la vez (que «coincida» en los tres), la más pequeña → <b>m.c.m.</b>' },
    { type: 'info', q: '🧮 <b>Operación:</b> m.c.m.(8, 12, 15)' }, { type: 'cm', nums, kind: 'mcm' },
    { q: 'Camisetas:', pre: '<span class="m">120 : 8 =</span> ', ans: 15, hints: [divHint(120, 8)] }, { q: 'Pantalones:', pre: '<span class="m">120 : 12 =</span> ', ans: 10 }, { q: 'Sudaderas:', pre: '<span class="m">120 : 15 =</span> ', ans: 8, hints: [divHint(120, 15)] },
    { type: 'info', q: '✍️ <b>Solución:</b> gastará <b>120 €</b> en cada tipo: 15 camisetas, 10 pantalones y 8 sudaderas.' }], sol: 'm.c.m.(8, 12, 15) = 2³ · 3 · 5 = <b>120 €</b>. 120 : 8 = 15 camisetas, 120 : 12 = 10 pantalones, 120 : 15 = 8 sudaderas.' };
}
function exQue(l) {
  const it = pick([['volver a coincidir', 0], ['salir juntos otra vez', 0], ['encenderse a la vez de nuevo', 0], ['repartir en partes iguales sin que sobre', 1], ['los trozos más largos posible', 1], ['las bolsas más grandes posible', 1], ['el menor número que sea múltiplo de los dos', 0], ['el mayor número que divida a los dos', 1]]);
  return { skill: 'que', label: 'Elegir entre m.c.m. y m.c.d.', title: `Un problema pregunta por «<b>${it[0]}</b>». ¿Qué calculas?`, steps: [{ type: 'choice', q: 'Elige:', opts: ['El m.c.m.', 'El m.c.d.'], keep: true, ans: it[1], why: () => 'Truco de tu profe: m.c.m. → <b>coincidencias</b>; m.c.d. → <b>el más grande, repartir</b>.' }], sol: it[1] ? '<b>m.c.d.</b>: el más grande / repartir.' : '<b>m.c.m.</b>: coincidencias.' };
}
function exProbExamen(l, T, set) {
  T = T || pick(PR); const [a, b] = set || pick(T.sets), v = T.k === 'mcm' ? lcm(a, b) : gcd(a, b), w = T.k === 'mcm' ? gcd(a, b) : lcm(a, b);
  const unit = { 0: 'días', 1: 'min', 2: 'minutos', 3: 'días', 4: 'segundos', 5: 'litros', 6: 'cm', 7: 'cm', 8: 'caramelos', 9: 'personas' }[PR.indexOf(T)];
  return { skill: 'prob-examen', label: 'Modo examen: problemas', title: `🎯 <b>Modo examen</b>: resuélvelo en tu cuaderno (Datos, Operación, Solución) y escribe el resultado.<br>${T.t(a, b)}`, steps: [{ type: 'choice', q: '¿Qué has calculado?', opts: ['El m.c.m.', 'El m.c.d.'], keep: true, ans: T.k === 'mcm' ? 0 : 1, why: () => T.k === 'mcm' ? 'Pregunta cuándo vuelven a <b>coincidir</b> → m.c.m.' : 'Pide lo <b>más grande posible</b> para repartir → m.c.d.' }, { q: PR.indexOf(T) === 1 ? '¿Cada cuántos minutos coinciden?' : `Resultado (en ${unit}):`, pre: `${T.k === 'mcm' ? 'm.c.m.' : 'm.c.d.'}(${a}, ${b}) = `, ans: v, max: 4, hints: [`${a} = ${fs(factor(a))} · ${b} = ${fs(factor(b))}`], why: x => x === w ? `Ese número es el ${T.k === 'mcm' ? 'm.c.d.' : 'm.c.m.'}: ¿has elegido bien el método?` : examWhy([a, b], T.k === 'mcm' ? x : lcm(a, b), T.k === 'mcd' ? x : gcd(a, b)) }], sol: `${T.k === 'mcm' ? 'm.c.m.' : 'm.c.d.'}(${a}, ${b}) = <b>${v}</b>. ${T.sol(v, a, b)}` };
}
function gen4(l) { return l === 1 && Math.random() < .3 ? exQue(l) : l === 3 && Math.random() < .45 ? exProbExamen(l) : exProb(l) }

/* ---------- tema ---------- */
window.TEMA = {
  app: 'mat-div', key: 'laura-mat-div-v1', title: 'Divisibilidad: m.c.m. y m.c.d.',
  htitle: 'Divisibilidad: <span>m.c.m. y m.c.d.</span>',
  hello: '¡Hola, Laura! Soy <b>Micro</b> 👋 Este es el tema que estáis dando ahora en clase. Lo he preparado <b>igual que te lo explica tu profe</b>: descomponer en la columna, colorear comunes y no comunes, y elegir el exponente. ¡Vamos paso a paso!',
  blocks: [
    { id: 'd1', name: 'Divisibilidad', desc: 'Resto 0, criterios del 2, 3 y 5, y números primos', ico: '÷', c: '--c1', gen: gen1,
      fixed: [() => exCrit(1, 3), () => exDivCasita(2), () => exPrimo(2)],
      hello: 'Empezamos por la base de todo el tema: saber si un número <b>se puede dividir</b> entre otro sin hacer la división entera.',
      slides: [
        { t: '¿Qué es ser divisible?', html: `<p>Un número es <b>divisible</b> entre otro cuando, al dividirlo, <b>el resto es 0</b>.</p><div class="box" style="display:flex;gap:26px;justify-content:center;font-family:'Courier New',monospace;font-size:22px;font-weight:700"><div>25 <span style="border-left:3px solid;border-bottom:3px solid;padding:0 6px">5</span><br><span class="hl-y">0</span>&nbsp;&nbsp;&nbsp;5</div><div>132 <span style="border-left:3px solid;border-bottom:3px solid;padding:0 6px">3</span><br>&nbsp;12&nbsp;&nbsp;44<br>&nbsp;&nbsp;<span class="hl-y">0</span></div></div><p>25 es divisible entre 5, y 132 es divisible entre 3. ¡Son los ejemplos de tu cuaderno!</p>`, check: ['17 : 5 = 3 y sobran 2. ¿Es 17 divisible entre 5?', ['No, porque el resto no es 0', 'Sí, porque se puede dividir'], 'Para ser divisible, el resto tiene que ser 0.', 'Mira el resto.'] },
        { t: 'Múltiplos y divisores', html: `<p>Como 3 · 5 = 15, decimos:</p><div class="box"><p style="margin:0">✅ 15 es <b>múltiplo</b> de 3 (está en la tabla del 3).<br>✅ 3 es <b>divisor</b> de 15 (lo divide con resto 0).</p></div><div class="tip"><span>💡</span><div>Los <b>múltiplos</b> son infinitos (3, 6, 9, 12…). Los <b>divisores</b> son pocos y nunca pasan del número.</div></div>`, check: ['¿Cuál de estos es divisor de 12?', ['4', '24', '5'], '12 : 4 = 3, con resto 0.', 'Busca uno que divida a 12 con resto 0.'] },
        { t: 'Criterios del 2 y del 5', html: `<div class="rule"><span style="font-size:24px">2</span> → termina en <b>0</b> o es <b>par</b> &nbsp; (29<span class="hl-y">0</span>, 13<span class="hl-y">4</span>)</div><div class="rule"><span style="font-size:24px">5</span> → termina en <b>0</b> o en <b>5</b> &nbsp; (29<span class="hl-y">0</span>, 43<span class="hl-y">5</span>)</div><p>¡Solo hay que mirar la <b>última cifra</b>!</p>`, check: ['¿Cuál es divisible entre 2 y también entre 5?', ['290', '435', '134'], 'Termina en 0: sirve para los dos.', 'Tiene que terminar en 0.'] },
        { t: 'Criterio del 3', html: `<div class="rule"><span style="font-size:24px">3</span> → la <b>suma de sus cifras</b> es múltiplo de 3</div><div class="box"><p style="margin:0">75 → 7 + 5 = <b>12</b> → 12 está en la tabla del 3 ✅<br>258 → 2 + 5 + 8 = <b>15</b> ✅<br>134 → 1 + 3 + 4 = <b>8</b> ❌</p></div>`, try: () => exCrit(1, 3) },
        { t: 'Números primos', html: `<p>Un número es <b>primo</b> si solo se puede dividir entre <b>1 y entre él mismo</b>. Si tiene más divisores, es <b>compuesto</b>.</p><div class="chuleta" style="grid-template-columns:repeat(5,1fr)">${[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47].map(p => `<div><b>${p}</b></div>`).join('')}</div><div class="tip"><span>💡</span><div>El <b>2</b> es el único primo par. El <b>1</b> no es primo. Truco: si un número menor que 121 no se puede dividir entre 2, 3, 5 ni 7, es primo.</div></div>`, check: ['¿Cuál de estos es primo?', ['23', '21', '25'], '23 solo se divide entre 1 y 23.', '21 = 3 · 7 y 25 = 5 · 5.'] },
        { t: 'Divisiones de dos cifras', html: `<p>Para los números «difíciles» no hay criterio: hay que <b>hacer la división</b> y mirar el resto. Usa la tabla del divisor si la necesitas.</p>`, try: () => exDivCasita(2) }
      ] },
    { id: 'd2', name: 'Descomponer en primos', desc: 'La columna: dividir entre primos hasta llegar a 1', ico: '2·3', c: '--c0', gen: gen2,
      fixed: [84, 56, 70, 135, 120, 144, 140, 180, 65, 300, 266, 123].map(n => () => exFact(3, n)).concat([() => exComprueba(3, [120, [[2, 2], [3, 1]]]), () => exComprueba(3, [70, [[3, 1], [5, 2]]])]),
      hello: 'Esto es <b>lo más importante del tema</b>: si descompones bien, el m.c.m. y el m.c.d. salen solos. Vamos despacio y comprobando.',
      slides: [
        { t: 'Romper un número en primos', html: `<p>Todos los números compuestos se pueden escribir como una <b>multiplicación de primos</b>, como piezas de LEGO:</p><div class="big-math" style="font-size:24px">24 = 2 · 2 · 2 · 3 = ${P(2, 3)} · 3</div><p>Eso es <b>descomponer en factores primos</b>.</p>` },
        { t: 'La columna de tu profe', html: `<div class="box"><p style="margin:0">1️⃣ Divide entre el <b>primo más pequeño</b> que puedas (2, 3, 5, 7…).<br>2️⃣ Escribe el resultado <b>debajo</b>.<br>3️⃣ Repite hasta llegar a <b>1</b>.<br>4️⃣ Cuenta cuántas veces sale cada primo → <b>potencias</b>.</p></div>`, demo: { type: 'colum', n: 24 }, try: () => exFact(1, 42) },
        { t: 'Dividir de cabeza', html: `<p>Para no atascarte en la columna, <b>parte el número</b> en trozos fáciles:</p><div class="box" style="font-family:Fredoka;font-size:19px;text-align:center">84 : 2 → 80 : 2 = 40 y 4 : 2 = 2 → <b>42</b><br>135 : 3 → 120 : 3 = 40 y 15 : 3 = 5 → <b>45</b><br>120 : 2 → quita el 0: 12 : 2 = 6 → <b>60</b></div>`, check: ['¿Cuánto es 96 : 2?', ['48', '43', '46'], '90 : 2 = 45 y 6 : 2 = 3 → 48.', 'Pártelo: 90 : 2 y 6 : 2.'] },
        { t: '¡Comprueba siempre!', html: `<div class="warn"><span>⚠️</span><div>Si escribes <b>120 = ${P(2, 2)} · 3</b>, multiplica: 4 · 3 = <b>12</b>. ¡No es 120! Falta algo.</div></div><p>Lo correcto: <b>120 = ${P(2, 3)} · 3 · 5</b> → 8 · 3 · 5 = 120 ✔️</p><p>Multiplicar al final te dice si te has dejado algún primo.</p>`, try: () => exComprueba(1, [70, [[3, 1], [5, 2]]]) },
        { t: 'Primos grandes', html: `<p>A veces, al final de la columna queda un número que no se puede dividir entre 2, 3, 5 ni 7. Si es <b>primo</b>, se divide entre él mismo y llegas a 1:</p><div class="box" style="font-family:Fredoka;font-size:19px;text-align:center">65 = 5 · <b>13</b> &nbsp;&nbsp; 266 = 2 · 7 · <b>19</b> &nbsp;&nbsp; 123 = 3 · <b>41</b></div><p>En los ejercicios, pulsa «<b>Ninguno: ¡es primo!</b>».</p>`, try: () => exFact(3, 123) }
      ] },
    { id: 'd3', name: 'm.c.m. y m.c.d.', desc: 'Comunes y no comunes, exponente más alto o más bajo', ico: '🎨', c: '--c5', gen: gen3,
      fixed: [[10, 15], [16, 24], [12, 18], [50, 70], [20, 24], [24, 36], [54, 60], [56, 70], [120, 144], [140, 180], [20, 25], [12, 24], [50, 75], [200, 300], [24, 42], [135, 84], [45, 40]].map(n => () => exCM(n[0] > 100 ? 2 : 1, n)).concat([() => exTres(2, TRES[1]), () => exTres(2, TRES[6]), () => exCopr(3)]),
      hello: 'Ahora el método de tu profe con colores: <span class="hl-g">verde</span> para los comunes y <span class="hl-o">naranja</span> para los no comunes. Y recuerda: siempre en minúsculas, <b>m.c.m.</b> y <b>m.c.d.</b>',
      slides: [
        { t: '¿Qué es el m.c.m.?', html: `<p><b>m.c.m.</b> = <b>m</b>ínimo <b>c</b>omún <b>m</b>últiplo: el número <b>más pequeño</b> que está en la tabla de los dos.</p><div class="box" style="font-family:Fredoka;font-size:17px">Tabla del 6: 6, 12, 18, <span class="hl-y">24</span>, 30…<br>Tabla del 8: 8, 16, <span class="hl-y">24</span>, 32…</div><p>Imagina una rana que salta de 6 en 6 y un conejo que salta de 8 en 8. ¿Dónde coinciden?</p>`, demo: { type: 'ranas', a: 6, b: 8 }, check: ['m.c.m.(4, 6) = ? (piensa en las tablas)', ['12', '24', '2'], 'Tabla del 4: 4, 8, 12… Tabla del 6: 6, 12… ¡12!', 'Escribe las tablas del 4 y del 6 hasta que coincidan.'] },
        { t: '¿Qué es el m.c.d.?', html: `<p><b>m.c.d.</b> = <b>m</b>áximo <b>c</b>omún <b>d</b>ivisor: el número <b>más grande</b> que divide a los dos (con resto 0).</p><div class="box" style="font-family:Fredoka;font-size:17px">Divisores de 12: 1, 2, 3, 4, <span class="hl-y">6</span>, 12<br>Divisores de 18: 1, 2, 3, <span class="hl-y">6</span>, 9, 18</div><p>Es como cortar dos cintas en trozos iguales, <b>lo más largos posible</b>, sin que sobre nada:</p>`, demo: { type: 'cintas', a: 12, b: 18 }, check: ['m.c.d.(8, 12) = ?', ['4', '2', '24'], 'Divisores comunes de 8 y 12: 1, 2, 4. El más grande, 4.', 'Busca el número más grande que divide a los dos.'] },
        { t: 'Con números grandes…', html: `<p>Con 135 y 84, hacer listas de tablas y divisores sería <b>larguísimo</b>. 😵</p><p>Por eso tu profe usa un atajo con <b>tres pasos</b>:</p><div class="box"><p style="margin:0">1️⃣ <b>Descomponer</b> en primos.<br>2️⃣ <b>Colorear</b> comunes y no comunes.<br>3️⃣ <b>Elegir</b> exponentes y multiplicar.</p></div>` },
        { t: 'Paso 1: descomponer', html: `<p>Ejemplo de tu cuaderno: <b>m.c.m.(24, 42)</b> y <b>m.c.d.(24, 42)</b>.</p>${chipsHTML([24, 42], false)}<p>Primero, siempre, descomponemos los números con la columna.</p>` },
        { t: 'Paso 2: colorear', html: `${chipsHTML([24, 42], true)}<div class="box"><p style="margin:0"><span class="hl-g">Comunes</span>: están en <b>todos</b> los números (se repiten): el 2 y el 3.<br><span class="hl-o">No comunes</span>: solo están en uno (no se repiten): el 7.</p></div>` },
        { t: 'm.c.m.: el más alto', html: `<div class="rule">m.c.m. → comunes <b>y no comunes</b><br>al exponente <b>más alto</b></div><div class="big-math" style="font-size:22px">m.c.m.(24, 42) = ${P(2, 3)} · 3 · 7 = 8 · 3 · 7 = <span class="hi">168</span></div><p>Del 2 hay ${P(2, 3)} y 2: cogemos ${P(2, 3)}, el más alto.</p>`, try: () => exSolo(1, 'mcm', [12, 18]) },
        { t: 'm.c.d.: el más bajo', html: `<div class="rule">m.c.d. → <b>solo comunes</b><br>al exponente <b>más bajo</b></div><div class="big-math" style="font-size:22px">m.c.d.(24, 42) = 2 · 3 = <span class="hi">6</span></div><p>El 7 no entra porque es no común. Del 2 cogemos el exponente más bajo: 2.</p>`, try: () => exSolo(1, 'mcd', [12, 18]) },
        { t: 'Si no hay comunes', html: `${chipsHTML([8, 15], true)}<div class="warn"><span>⚠️</span><div>Si no hay ningún factor común, el <b>m.c.d. es 1</b>. ¡<b>Nunca 0</b>! Todos los números se pueden dividir entre 1.</div></div><p>Y el m.c.m. es multiplicarlos todos: m.c.m.(8, 15) = ${P(2, 3)} · 3 · 5 = 120.</p>`, check: ['m.c.d.(9, 20) = ?', ['1', '0', '180'], '9 = 3² y 20 = 2² · 5: no hay comunes → 1.', 'Si no hay comunes…'] },
        { t: '¿Tiene sentido?', html: `<div class="box"><p style="margin:0">✅ El <b>m.c.d.</b> nunca es más grande que el número <b>más pequeño</b>.<br>✅ El <b>m.c.m.</b> nunca es más pequeño que el número <b>más grande</b>.<br>✅ Si uno es múltiplo del otro (12 y 24): m.c.m. = <b>24</b> (el grande) y m.c.d. = <b>12</b> (el pequeño).</p></div>`, check: ['m.c.m.(12, 24) = ?', ['24', '12', '4'], '24 ya es múltiplo de 12.', 'Si uno es múltiplo del otro, el m.c.m. es el grande.'] }
      ] },
    { id: 'd4', name: 'Problemas', desc: '¿Coincidencias o repartir? Datos, operación y solución', ico: '🧩', c: '--c4', gen: gen4,
      fixed: [() => exProb(2, PR[0], [6, 8]), () => exProb(2, PR[1], [20, 30]), exRopa, () => exProb(2, PR[5], [60, 80]), () => exProb(2, PR[6], [180, 240]), () => exProb(2, PR[7], [21, 30])],
      hello: 'Los problemas de tu libro. Lo difícil es saber si es de <b>m.c.m.</b> o de <b>m.c.d.</b>: te enseño el truco de tu profe.',
      slides: [
        { t: 'El truco de tu profe', html: `<div class="rule" style="text-align:left">m.c.m. → <span class="hl-g">COINCIDENCIAS</span> (volver a coincidir, a la vez, juntos otra vez)<br><br>m.c.d. → <span class="hl-o">EL MÁS GRANDE</span> posible, <b>repartir</b> en partes iguales sin que sobre</div><div class="tip"><span>💡</span><div><b>¿Dudas?</b> Haz los dos y <b>descarta la solución ilógica</b>.</div></div>`, check: ['«¿Cuándo volverán a salir juntos los dos autobuses?»', ['m.c.m.', 'm.c.d.'], 'Volver a salir juntos = coincidencia.', 'Piensa: ¿coincidir o repartir?'] },
        { t: 'Coincidencias = saltos', html: `<p>Los envíos a Valencia (cada 6 días) y a Sevilla (cada 8 días) son como dos animales saltando. Coinciden en el <b>m.c.m.</b>:</p>`, demo: { type: 'ranas', a: 6, b: 8, la: '🚚', lb: '🚛' } },
        { t: 'Repartir = cortar', html: `<p>60 litros de girasol y 80 de oliva en garrafas iguales, <b>lo más grandes posible</b>: es cortar dos cintas en trozos iguales. Es el <b>m.c.d.</b>:</p>`, demo: { type: 'cintas', a: 60, b: 80, u: 'L' } },
        { t: '🦗 Curiosidad: las cigarras', html: `<p>En Estados Unidos hay cigarras que pasan <b>13 o 17 años</b> bajo tierra y luego salen todas a la vez. ¡13 y 17 son <b>primos</b>!</p><p>Una explicación que dan los científicos: si un depredador aparece cada 4 años, coincide con la cigarra de 17 años solo cada m.c.m.(4, 17) = <b>68 años</b>. Con 16 años coincidiría cada 16. Ser «prima» la protege. 😎</p>`, check: ['¿Cada cuántos años coincide una cigarra de 13 años con un depredador que sale cada 2 años?', ['26', '13', '15'], 'm.c.m.(2, 13) = 2 · 13 = 26: no tienen comunes, se multiplican.', 'Son primos entre sí: multiplica.'] },
        { t: 'Datos, Operación, Solución', html: `<p>Igual que en tu cuaderno, escribe siempre las tres partes:</p><div class="dap"><div><span class="h">📋 Datos</span>Valencia → cada 6 días · Sevilla → cada 8 días</div><div><span class="h">🧮 Operación</span>m.c.m.(6, 8): 6 = 2 · 3, 8 = ${P(2, 3)} → ${P(2, 3)} · 3 = 24</div><div><span class="h">✍️ Solución</span>Volverán a coincidir dentro de <b>24 días</b>.</div></div><div class="warn"><span>⚠️</span><div>La solución se escribe con una <b>frase</b> y con las <b>unidades</b> (días, cm, litros…).</div></div>` },
        { t: '¡Ahora tú!', html: '<p>El de las garrafas de aceite, de tu libro (pág. 75, ej. 9):</p>', try: () => exProb(1, PR[5], [60, 80]) }
      ] }
  ]
};
startMates();
})();
