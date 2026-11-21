/* Matemáticas 1º ESO · Los números naturales
   Basado en las fichas de la profesora: «Operaciones combinadas N» (50 ejercicios con soluciones),
   «Ejercicios repaso división» (fichas de divisiones de dos cifras) y la situación de aprendizaje (clases de tenis de Diego). */
(function () {
const { P, R, mx, fmt, rnd, pick, shuffle } = M;

/* ---------- operaciones de la ficha (1–40) ---------- */
const FICHA = ['8+3·2-4·2', '10-2·3+5·(7-3)', '7+3·[1+5-(6-3)]', '3·(12-7)-[15-2·(7-4)]', '(10-6):2+4·2-2·3', '20-3·(8-4):2', '15·4-90:5-2·(15-5)', '3+(3+3·13):7', '25:(11-6)+(40-22):6', '10·9-8·7+6·5-4·3+2·1', '3·5+4·(5-2)-(14-3)·2', '4·[3+5·(2+1)-4]+30:6', '7·(14-2)-4·(5+7)+3·4', '8·(5+40:2)-4·30-20·2·2', '40-[5·4-3·(2+3)+5]·3', '3·(5+2·3-5)+4·3:2-(4+7)·2', '30-5·8:4-[20:4+(8-6)·2-2·3]', '3·40-120:3-(30+20-10·8:5)-5', '[45-(3+1)·9]·2-3·[(6-4)·2-2]', '8·5-4·(3+2)-40:8·3', '9·25-[(5+4)·12+20·2]+320:4', '[(2+3)·5+4·(30:5+1)]·2-8·9', '21-5·(8-2·3)-[(3+1)·5-3·5]', '32:4·2+(4+32)·3-(40-12)·4', '[(7+5):3+4·2]·3-144:12', '(14+7+28):7-[(10+2):3]:2', '[18-(35-10):5]·2-(21:3-3)·4', '[(4-3)·5+7·6+1]:6-15:5·2-2', '3·5+16·3-4·(13+7)+2·120:5-10', '3·8+5·(4+2)-40:5·3-5·4:2', '40:4·5-3·(4+8)-(10-3)·2', '[(10-5)·7-4·(7-2)]:5-6:2', '(38-4-2):4+7·[5·2-5·(4-3)]', '(3+4)·7+(2·3+1)·[14:(5+2)-1]', '35·4-(15+5)·5-(40-30)·2', '[(4+5-2-1)·(40-7·5)·10]:30+2', '[(4+12)·3-7·6]·(10:2+1)-25', '(20-3·5)+14:(12-5)-(23-20)·2', '(70-22):6-12·2:4+6·(2·5-9)', '2·(6·4+1)+16-4·(5+7)+(9-4)·3'];
// nº 29 tiene un paso intermedio negativo (no se puede en N): se deja fuera
const FOK = FICHA.map((s, i) => [s, i + 1]).filter(([s]) => M.solveAll(s));
function solText(s) { const r = M.solveAll(s); return r.steps.map(x => `${x.sub.a} ${x.sub.op} ${x.sub.b} = ${fmt(x.v)}`).join('<br>') + `<br>Resultado: <b>${fmt(r.result)}</b>` }
const exFicha = (s, n) => ({ skill: 'comb', label: 'Operaciones combinadas', title: `Calcula paso a paso <span style="color:var(--muted);font-size:14px">(ficha de la profe, nº ${n})</span>:`, steps: [{ type: 'expr', expr: s }], sol: solText(s) });

function genExpr(l, auto) {
  const T = l === 1 ? ['a+b·c', 'a·b+c', 'a·b-c', 'a+b:c', 'a·b-c·d', 'a:b+c·d', 'a-b·c', 'a·b:c', '(a+b)·c', 'a-(b+c)'] : l === 2 ? ['(a+b)·c-d', 'a·(b-c)+d', '(a+b):c+d', 'a-(b+c):d', 'a·(b+c)-d:e', '(a-b)·c+d·e', 'a+b·c-d:e', 'a·b-(c+d)·e'] : ['[a-(b-c)]·d', 'a+b·[c-(d-e)]', '(a+b)·c-[d+e·f]', '[a·(b+c)-d]:e', 'a·[b+c·(d-e)]-f', '(a+b·c)-[d·(e-f)+g]', '[(a+b)·c-d]:e+f'];
  for (let g = 0; g < 500; g++) {
    const s = pick(T).replace(/[a-g]/g, () => String(rnd(l === 1 ? 2 : 1, l === 1 ? 9 : 12)));
    const r = M.solveAll(s); if (r && r.result <= (l === 3 ? 300 : 150) && r.steps.length >= 2) return { skill: auto ? 'orden' : 'comb', label: auto ? 'Orden de las operaciones' : 'Operaciones combinadas', title: auto ? '👆 Toca las operaciones en el orden correcto (yo hago las cuentas):' : 'Calcula paso a paso:', steps: [{ type: 'expr', expr: s, auto }], sol: solText(s) };
  }
  return exFicha(...FOK[0]);
}
function exPrimero(l) {
  const T = ['a+b·c', 'a-b:c', 'a·b+c·d', 'a+(b-c)·d', 'a:b·c', 'a-b-c', '(a+b)·c', 'a+b·(c-d)', 'a·b-c:d'];
  for (let g = 0; g < 300; g++) {
    const s = pick(T).replace(/[a-d]/g, () => String(rnd(2, 9))), r = M.solveAll(s); if (!r) continue;
    const T0 = M.tokenize(s), ok = M.allowed(T0), ops = T0.map((t, i) => ({ t, i })).filter(o => o.t.t === 'op');
    if (ok.length !== 1) continue;
    const opts = ops.map(o => { const a = T0[o.i - 1], b = T0[o.i + 1]; return `${a && a.t === 'n' ? a.v : '…'} ${o.t.v} ${b && b.t === 'n' ? b.v : '…'}` });
    const ansI = ops.findIndex(o => o.i === ok[0]);
    return { skill: 'primero', label: '¿Qué operación va primero?', title: `En ${mx(s)}, ¿qué se hace <b>primero</b>?`, steps: [{ type: 'choice', q: 'Elige la operación:', opts, ans: ansI, why: () => 'Recuerda PA-PO-MU-SU: paréntesis, potencias, multiplicaciones y divisiones, sumas y restas. Si empatan, de izquierda a derecha.' }], sol: `Primero va <b>${opts[ansI]}</b>.` };
  }
}
function gen1(l) { return l === 1 ? (Math.random() < .5 ? exPrimero(1) : genExpr(1, true)) : l === 2 ? pick([() => genExpr(1, true), () => genExpr(2, true), () => exPrimero(2), () => genExpr(1)])() : pick([() => genExpr(2, true), () => genExpr(1), () => genExpr(2)])() }
function gen2(l) { return Math.random() < .35 ? (() => { const k = l === 1 ? rnd(0, 9) : l === 2 ? rnd(5, 24) : rnd(14, FOK.length - 1); return exFicha(...FOK[k]) })() : genExpr(l) }

/* ---------- división ---------- */
const DIVS = [[6839, 2], [1970, 3], [2475, 4], [7102, 51], [6819, 52], [5280, 73], [6834, 61], [7346, 42], [4172, 43], [86, 21], [95, 23], [326, 14], [541, 25], [9054, 28], [4287, 35], [138, 43], [345, 53], [271, 92], [157, 34], [2176, 64], [6345, 71]];
const exDiv = (D, d, story) => ({ skill: d < 10 ? 'div1' : 'div2', label: d < 10 ? 'División entre una cifra' : 'División entre dos cifras', title: story || `Haz la división: <span class="m">${fmt(D)} : ${d}</span>`, steps: [{ type: 'div', D, d }], sol: `${fmt(D)} : ${d} → cociente <b>${fmt(Math.floor(D / d))}</b>, resto <b>${D % d}</b>. Prueba: ${d} × ${fmt(Math.floor(D / d))} + ${D % d} = ${fmt(D)}` });
function gen3(l) {
  if (Math.random() < .3) { const [D, d] = pick(l === 1 ? DIVS.slice(0, 3) : l === 2 ? DIVS.slice(9, 21) : DIVS.slice(3, 9)); return exDiv(D, d) }
  const d = l === 1 ? rnd(2, 9) : rnd(11, l === 2 ? 49 : 89), D = l === 1 ? rnd(100, 999) : l === 2 ? rnd(d * 3, 999) : rnd(1000, 9999);
  return exDiv(D, d);
}

/* ---------- problemas ---------- */
const TEN = { A: { cols: ['L, X y V', 'M y J'], rows: [[60, 40], [48, 33], [36, 24]] }, B: { cols: ['3 días', '2 días', '1 día'], rows: [[63, 42, 25], [51, 35, 18], [39, 26, 14]] } };
function tenTable(max) {
  const okIds = []; Object.entries(TEN).forEach(([k, t]) => t.rows.forEach((r, i) => r.forEach((v, j) => { if (v <= max) okIds.push(`${k}${i}${j}`) })));
  const table = attr => Object.entries(TEN).map(([k, t]) => `<div style="font-weight:800;margin-top:6px">🎾 Escuela ${k}</div><table class="tt"><tr><th>Personas</th>${t.cols.map(c => `<th>${c}</th>`).join('')}</tr>${t.rows.map((r, i) => `<tr><th>${i + 1}</th>${r.map((v, j) => `<td ${attr(`${k}${i}${j}`)}>${v} €</td>`).join('')}</tr>`).join('')}</table>`).join('');
  return { table, okIds };
}
const PROBS = [
  () => { const t = tenTable(40); return { skill: 'prob', label: 'Problemas (situación de aprendizaje)', title: '🎾 Diego quiere ir a clases de tenis de <b>septiembre a junio</b>. Sus abuelos le pagan las clases, pero no puede gastar más de <b>400 € al año</b>. ¿Qué opciones puede elegir?', steps: [{ q: '1️⃣ ¿Cuántos meses hay de septiembre a junio (ambos incluidos)?', post: ' meses', ans: 10, hints: ['Cuéntalos con los dedos: sep, oct, nov, dic, ene, feb, mar, abr, may, jun.'] }, { q: '2️⃣ ¿Cuánto puede gastar como máximo cada mes?', pre: '400 : 10 = ', post: ' €', ans: 40, hints: ['Reparte los 400 € entre los 10 meses.'] }, { type: 'cells', q: '3️⃣ Toca <b>todas</b> las opciones que cuestan <b>40 € o menos</b> al mes:', table: t.table, ok: t.okIds, hints: ['Mira casilla por casilla: ¿es 40 o menos?'] }], sol: 'De septiembre a junio son 10 meses; 400 : 10 = 40 € al mes. Valen todas las opciones de 40 € o menos.' } },
  () => { const t = tenTable(36); return { skill: 'prob', label: 'Problemas (situación de aprendizaje)', title: '🎾 Ahora Diego también quiere comprarse una <b>raqueta de 35 €</b> con los mismos 400 € del año. ¿Qué opciones de clases puede elegir?', steps: [{ q: '1️⃣ ¿Cuánto dinero le queda para clases?', pre: '400 − 35 = ', post: ' €', ans: 365 }, { q: '2️⃣ Repartido en 10 meses, son 36,50 € al mes. Como mucho, ¿cuántos euros enteros puede costar la clase al mes?', post: ' €', ans: 36, hints: ['36,50 está entre 36 y 37. ¿Le llega para 37 €?'] }, { type: 'cells', q: '3️⃣ Toca todas las opciones de <b>36 € o menos</b>:', table: t.table, ok: t.okIds }], sol: '400 − 35 = 365 €; 365 : 10 = 36,50 € al mes. Valen las opciones de 36 € o menos.' } },
  () => ({ skill: 'prob', label: 'Problemas con divisiones', title: '🐎 ¿Qué caballo ganó? Los tres ganadores son los que tienen el <b>cociente más pequeño</b>. Calcula el de Imperial: <span class="m">2.947 : 7</span>', steps: [{ type: 'div', D: 2947, d: 7 }, { type: 'choice', q: 'Los demás cocientes son: Volador 507, Tor 759, Ligero 703, Pegaso 1.109 y Aquiles 686. ¿Quién ganó la carrera?', opts: ['Imperial (421)', 'Volador (507)', 'Aquiles (686)', 'Pegaso (1.109)'], ans: 0, hints: ['Gana el cociente más pequeño.'] }], sol: 'Imperial: 2.947 : 7 = 421. Es el más pequeño, así que gana Imperial; luego Volador (507) y Aquiles (686).' }),
  () => ({ skill: 'prob', label: 'Problemas con divisiones', title: '🐎 Volador participó en <b>357 carreras</b> y Ligero en <b>un tercio menos</b>. ¿En cuántas participó Ligero?', steps: [{ q: '1️⃣ Un tercio de 357:', pre: '357 : 3 = ', ans: 119, hints: ['Un tercio es dividir entre 3.'] }, { q: '2️⃣ «Un tercio menos» → réstalo:', pre: '357 − 119 = ', post: ' carreras', ans: 238 }], sol: '357 : 3 = 119; 357 − 119 = <b>238 carreras</b>.' }),
  () => { const a = pick([[3264, 96, 'pesa', 'kilos', 'Este lince'], [4640, 32, 'mide', 'centímetros', 'Este oso panda'], [7125, 57, 'mide', 'centímetros', 'Esta foca'], [8024, 68, 'pesa', 'kilos', 'Esta foca'], [12580, 74, 'mide', 'centímetros', 'Este delfín'], [22825, 83, 'pesa', 'kilos', 'Este delfín']]); return exDiv(a[0], a[1], `🐾 ${a[4]} ${a[2]} lo que da la división <span class="m">${fmt(a[0])} : ${a[1]}</span>. ¿Cuántos ${a[3]}?`) },
  () => { const n = rnd(3, 9), per = rnd(12, 40), tot = n * per + rnd(0, n - 1); return { skill: 'prob', label: 'Problemas con divisiones', title: `🃏 ${pick(['Laura', 'Nico', 'Lucía', 'Mario'])} tiene <b>${tot} cromos</b> y los reparte a partes iguales entre <b>${n} amigos</b>. ¿Cuántos le tocan a cada uno? ¿Cuántos sobran?`, steps: [{ type: 'pair', q: `Haz ${tot} : ${n}`, fields: [{ label: 'A cada uno:', v: Math.floor(tot / n), max: 3 }, { label: 'Sobran:', v: tot % n, max: 2 }], hints: [`Busca en la tabla del ${n} el número más cercano a ${tot} sin pasarte.`, `${n} × ${Math.floor(tot / n)} = ${n * Math.floor(tot / n)}`] }], sol: `${tot} : ${n} = <b>${Math.floor(tot / n)}</b> y sobran <b>${tot % n}</b>.` } },
  () => { const c = rnd(3, 8), p = rnd(4, Math.floor(95 / c)), b = c * p < 50 ? pick([50, 100]) : 100; return { skill: 'prob', label: 'Problemas de dos operaciones', title: `🛒 Compras <b>${c} camisetas</b> a <b>${p} €</b> cada una y pagas con un billete de <b>${b} €</b>. ¿Cuánto te devuelven?`, steps: [{ q: '1️⃣ ¿Cuánto cuestan todas?', pre: `${c} · ${p} = `, post: ' €', ans: c * p }, { q: '2️⃣ ¿Cuánto te devuelven?', pre: `${b} − ${c * p} = `, post: ' €', ans: b - c * p }], sol: `${c} · ${p} = ${c * p} €; ${b} − ${c * p} = <b>${b - c * p} €</b>. En una sola expresión: ${b} − ${c} · ${p}.` } }
];
function gen4(l) { return pick(l === 1 ? [PROBS[5], PROBS[6], PROBS[3]] : PROBS)() }

window.TEMA = {
  app: 'mat-nat', key: 'laura-mat-nat-v1', title: 'Los números naturales',
  htitle: 'Los números <span>naturales</span>',
  hello: '¡Hola, Laura! Soy <b>Micro</b> 👋 Aquí vamos a dominar las <b>operaciones combinadas</b> y las <b>divisiones</b>. Sin prisa: yo te explico, tú practicas con pistas, y cuando te veas segura, al Reto.',
  blocks: [
    { id: 'n1', name: 'El orden de las operaciones', desc: 'PA-PO-MU-SU: qué va primero', ico: '1·2', c: '--c0', gen: gen1,
      hello: 'Este es el secreto de las operaciones combinadas: <b>saber qué va primero</b>. Aquí solo tienes que elegir el orden; ¡las cuentas las hago yo! 😉',
      slides: [
        { t: '¿Por qué hay un orden?', html: `<p>¿Cuánto es ${mx('2+3·4')}?</p><div class="box"><p style="margin:0">🙅 Si sumo primero: 5 · 4 = 20<br>🙆 Si multiplico primero: 2 + 12 = <b>14</b></p></div><p>¡Dos resultados distintos! Para que todo el mundo obtenga lo mismo, los matemáticos acordaron un <b>orden</b>. El bueno es <b>14</b>.</p>` },
        { t: 'La escalera PA-PO-MU-SU 🐼', html: `<div class="box"><p style="margin:0;font-size:18px">1️⃣ <b>PA</b>réntesis y corchetes<br>2️⃣ <b>PO</b>tencias y raíces<br>3️⃣ <b>MU</b>ltiplicaciones y divisiones<br>4️⃣ <b>SU</b>mas y restas</p></div><p>PA-PO-MU-SU… ¡parece el nombre de un panda! Si te lo aprendes, nunca más te equivocas de orden.</p>`, check: ['¿Qué va antes?', ['Las multiplicaciones', 'Las sumas', 'Da igual'], 'MU va antes que SU.', 'Repasa: PA-PO-MU-SU.'] },
        { t: 'Empate: de izquierda a derecha', html: `<p>Cuando dos operaciones están en el <b>mismo escalón</b>, se hacen <b>de izquierda a derecha</b>, como cuando lees:</p><div class="box" style="font-family:Fredoka;font-size:20px;text-align:center">${mx('40:4·5')} = 10 · 5 = <b>50</b><br><span style="font-size:16px;color:var(--muted)">(¡no 40 : 20 = 2!)</span></div><div class="box" style="font-family:Fredoka;font-size:20px;text-align:center">${mx('10-2-3')} = 8 − 3 = <b>5</b></div>` },
        { t: 'Míralo paso a paso', html: `<p>Una de la ficha de tu profe. Fíjate en que en cada paso se hace <b>una sola</b> operación y se vuelve a escribir todo:</p>`, demo: { type: 'expr', expr: '8+3·2-4·2' } },
        { t: 'Paréntesis y corchetes', html: `<p>Los <b>corchetes [ ]</b> son paréntesis grandes. Se empieza siempre por el de <b>más adentro</b>:</p>`, demo: { type: 'expr', expr: '7+3·[1+5-(6-3)]' } },
        { t: '¡Tu turno!', html: `<p>Toca las operaciones en el orden correcto. Yo hago las cuentas por ti.</p>`, try: () => genExpr(1, true) }
      ] },
    { id: 'n2', name: 'Operaciones combinadas', desc: 'Las 40 de la ficha y muchas más', ico: '=?', c: '--c1', gen: gen2, fixed: FOK.map(([s, n]) => () => exFicha(s, n)),
      hello: 'Ahora eliges el orden <b>y</b> haces tú las cuentas. Si en algún momento te atascas, pide una pista: ¡para eso estoy! 💡',
      slides: [
        { t: 'El método para no perderte', html: `<div class="box"><p style="margin:0">1️⃣ Busca qué va primero (PA-PO-MU-SU).<br>2️⃣ Haz <b>solo esa</b> operación.<br>3️⃣ Vuelve a escribir todo con el resultado.<br>4️⃣ Repite hasta que quede un número.</p></div><div class="tip"><span>💡</span><div>En el cuaderno, escribe cada paso en una línea nueva, uno debajo de otro, con el «=» delante. ¡Igual que lo hace la app!</div></div>` },
        { t: 'Un ejemplo con corchetes', html: `<p>De la ficha de tu profe (nº 4):</p>`, demo: { type: 'expr', expr: '3·(12-7)-[15-2·(7-4)]' } },
        { t: 'Los errores típicos', html: `<div class="warn"><span>⚠️</span><div>Restar o sumar <b>antes</b> de multiplicar: en ${mx('20-3·4')} primero va 3 · 4.</div></div><div class="warn"><span>⚠️</span><div>Copiar mal un número al pasar a la línea siguiente. ¡Revisa cada línea!</div></div><div class="warn"><span>⚠️</span><div>En una resta seguida de una suma, ir de derecha a izquierda: ${mx('10-2+3')} = 8 + 3 = 11.</div></div>`, try: () => genExpr(1) }
      ] },
    { id: 'n3', name: 'División de dos cifras', desc: 'La casita paso a paso', ico: '÷', c: '--c3', gen: gen3, fixed: DIVS.map(([D, d]) => () => exDiv(D, d)),
      hello: 'Las divisiones largas asustan, pero son siempre los <b>mismos 4 pasos</b> repetidos. Vamos a hacerlas juntas. 🏠',
      slides: [
        { t: 'Las partes de la división', html: `<div class="div" style="justify-content:center"><div class="L"><div class="row">504</div><div class="row muted">084</div><div class="row muted"> 00</div></div><div class="R"><div class="dv">21</div><div class="q">24</div></div></div><div class="box"><p style="margin:0"><b>504</b> es el <b>dividendo</b> (lo que repartes).<br><b>21</b> es el <b>divisor</b> (entre cuántos).<br><b>24</b> es el <b>cociente</b> (lo que toca a cada uno).<br><b>0</b> es el <b>resto</b> (lo que sobra).</p></div>` },
        { t: '¿Cuántas cifras cojo al empezar?', html: `<div class="box"><p style="margin:0">✅ Si las <b>dos primeras cifras</b> forman un número <b>mayor o igual</b> que el divisor, cojo dos.<br><span style="font-family:Fredoka">504 : 21 → 50 ≥ 21 → cojo <b>50</b></span></p></div><div class="box"><p style="margin:0">✅ Si forman un número <b>menor</b>, cojo <b>tres</b>.<br><span style="font-family:Fredoka">1.358 : 24 → 13 &lt; 24 → cojo <b>135</b></span></p></div>` },
        { t: 'Los 4 pasos que se repiten', html: `<div class="box"><p style="margin:0;font-size:18px">1️⃣ <b>¿Cuántas veces cabe?</b> el divisor en el número<br>2️⃣ <b>Multiplica</b> divisor × lo que has puesto<br>3️⃣ <b>Resta</b> para ver cuánto sobra<br>4️⃣ <b>Baja</b> la siguiente cifra… ¡y vuelta al 1!</p></div><div class="tip"><span>💡</span><div><b>El truco:</b> antes de empezar, escribe al lado la <b>tabla del divisor</b> (21, 42, 63, 84…). Así el paso 1 es mirar la tabla. ¡En la app tienes el botón 📋!</div></div><div class="tip"><span>✅</span><div><b>La prueba:</b> divisor × cociente + resto = dividendo. Y el resto siempre tiene que ser <b>más pequeño</b> que el divisor.</div></div>` },
        { t: '¡Hazla conmigo!', html: `<p>La del ejemplo de tu profe. Yo te voy preguntando y tú respondes:</p>`, demo: { type: 'div', D: 504, d: 21 } }
      ] },
    { id: 'n4', name: 'Problemas', desc: 'Tenis, caballos, cromos y compras', ico: '🎾', c: '--c4', gen: gen4, fixed: PROBS,
      hello: 'Los problemas son las matemáticas de la vida real. El secreto: <b>leer despacio</b> y hacerlos por partes. 🕵️‍♀️',
      slides: [
        { t: 'Los 4 pasos del detective', html: `<div class="box"><p style="margin:0;font-size:18px">🔍 <b>1. Leo despacio</b>: ¿qué me preguntan?<br>📝 <b>2. Datos</b>: ¿qué números me dan?<br>🧮 <b>3. Operación</b>: ¿sumar, restar, multiplicar o dividir?<br>✅ <b>4. Compruebo</b>: ¿tiene sentido el resultado?</p></div><div class="tip"><span>💡</span><div><b>Repartir</b> a partes iguales → dividir. <b>Varias veces lo mismo</b> → multiplicar. <b>Un tercio, la mitad</b> → dividir entre 3, entre 2.</div></div>` },
        { t: 'Un problema por partes', html: `<p>Los problemas largos se hacen en varias preguntas pequeñas. ¡Pruébalo!</p>`, try: () => PROBS[6]() }
      ] }
  ]
};
startMates();
})();
