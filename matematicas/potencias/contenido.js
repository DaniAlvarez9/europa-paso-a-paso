/* Matemáticas 1º ESO · Potencias y raíces
   Basado en las fichas de la profesora: «Propiedades de las potencias», «Método fiesta» (radicales)
   y «Potencias y Raíces en N» (ejercicios 1–25 con soluciones). */
(function () {
const { P, R, mx, fmt, rnd, pick, shuffle } = M;
const pw = (b, e) => P(b, e);
const times = (b, e) => Array(e).fill(b).join(' · ');
const LET = ['a', 'x', 'm', 'b'];

/* ---------- generadores ---------- */
function exValor(l) {
  const b = l === 1 ? rnd(2, 5) : l === 2 ? rnd(2, 10) : pick([2, 3, 10, 4, 5]), e = l === 1 ? rnd(2, 3) : l === 2 ? rnd(2, 4) : (b === 10 ? rnd(3, 6) : b === 2 ? rnd(4, 7) : rnd(3, 4));
  const v = Math.pow(b, e);
  if (l === 1) {
    const steps = []; let acc = b;
    for (let k = 1; k < e; k++) { const nx = acc * b; steps.push({ q: k === 1 ? `Primero ${b} · ${b}:` : `Ahora sigue multiplicando por ${b}:`, pre: `${fmt(acc)} · ${b} = `, ans: nx, hints: [`Piensa en la tabla del ${b}.`, `${fmt(acc)} · ${b} = ${fmt(nx)}`] }); acc = nx }
    return { skill: 'valor', label: 'Calcular el valor de una potencia', title: `Calcula ${pw(b, e)} <span style="color:var(--muted);font-size:16px">= ${times(b, e)}</span>`, steps, sol: `${pw(b, e)} = ${times(b, e)} = <b>${fmt(v)}</b>` };
  }
  return { skill: 'valor', label: 'Calcular el valor de una potencia', title: `¿Cuánto es ${pw(b, e)}?`, steps: [{ pre: `${pw(b, e)} = `, ans: v, max: 9, hints: [`${pw(b, e)} = ${times(b, e)}. Ve multiplicando de uno en uno.`, b === 10 ? `Con base 10, es un 1 seguido de ${e} ceros.` : `${times(b, e)} = ${fmt(v)}`], why: x => x === b * e ? `¡Ojo, la trampa! ${pw(b, e)} no es ${b} · ${e}. Es ${times(b, e)}.` : 'Revisa la multiplicación.' }], sol: `${pw(b, e)} = ${times(b, e)} = <b>${fmt(v)}</b>` };
}
function exEscribe(l) {
  const b = l === 1 ? rnd(2, 6) : rnd(2, 12), e = l === 1 ? rnd(3, 5) : rnd(4, 7);
  return { skill: 'escribe', label: 'Escribir un producto como potencia', title: `Escribe en forma de potencia: <span class="m">${times(b, e)}</span>`, steps: [{ type: 'pow', q: 'Escribe la base y el exponente (toca ⇅ para cambiar de casilla):', b, e, hints: ['La base es el número que se repite; el exponente, cuántas veces aparece.', `Se repite el ${b}, y aparece ${e} veces.`], why: (vb, ve) => vb !== b ? 'La base es el número que se repite.' : 'Cuenta cuántas veces aparece el número.' }], sol: `${times(b, e)} = ${pw(b, e)}` };
}
function exLee(l) {
  const b = rnd(2, 9), e = pick([2, 3, 4, 5]), names = { 2: 'al cuadrado', 3: 'al cubo', 4: 'a la cuarta', 5: 'a la quinta' }, num = ['', '', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const opts = [`${num[b]} ${names[e]}`, `${num[e]} ${names[Math.min(5, Math.max(2, b))] || 'al cuadrado'}`, `${num[b]} por ${num[e]}`];
  return { skill: 'lee', label: 'Leer potencias', title: `¿Cómo se lee ${pw(b, e)}?`, steps: [{ type: 'choice', q: 'Elige:', opts: [...new Set(opts)], ans: 0, why: i => 'Primero se dice la base y luego el exponente: «al cuadrado» (2), «al cubo» (3), «a la cuarta» (4)…' }], sol: `${pw(b, e)} se lee «${opts[0]}».` };
}
function exCero(l) {
  const b = pick([rnd(2, 99), rnd(2, 9), 1000, 'a']), e = pick([0, 1]);
  const ans = e === 0 ? 1 : b;
  if (b === 'a') return { skill: 'cero', label: 'Exponente 0 y 1', title: `¿Cuánto es ${pw('a', e)}?`, steps: [{ type: 'choice', q: 'Elige:', opts: e === 0 ? ['1', 'a', '0'] : ['a', '1', '0'], ans: 0, why: () => e === 0 ? 'Cualquier número elevado a 0 vale 1.' : 'Elevado a 1 se queda igual.' }], sol: e === 0 ? `${pw('a', 0)} = 1` : `${pw('a', 1)} = a` };
  return { skill: 'cero', label: 'Exponente 0 y 1', title: `¿Cuánto es ${pw(fmt(b), e)}?`, steps: [{ pre: `${pw(fmt(b), e)} = `, ans, hints: [e === 0 ? 'Recuerda: todo número elevado a 0 vale…' : 'Elevado a 1: se multiplica una sola vez.', e === 0 ? '¡Siempre 1!' : `Es el mismo número: ${fmt(b)}.`], why: v => e === 0 && v === 0 ? '¡Trampa! Elevado a 0 no da 0: da 1.' : e === 0 ? 'Todo número elevado a 0 vale 1.' : 'Elevado a 1 se queda igual.' }], sol: e === 0 ? `${pw(fmt(b), 0)} = 1 (¡siempre!)` : `${pw(fmt(b), 1)} = ${fmt(b)}` };
}
function exCuadradoProb(l) {
  const t = pick(['cuad', 'cubo', 'finca']);
  if (t === 'cuad') { const s = rnd(3, 12); return { skill: 'prob-pot', label: 'Problemas con cuadrados y cubos', title: `🟧 ¿Cuántos metros cuadrados tiene un cuadrado de <b>${s} metros</b> de lado?`, steps: [{ type: 'pow', q: 'Escríbelo como potencia:', b: s, e: 2, fixB: null, hints: ['El área de un cuadrado es lado · lado.', `${s} · ${s} = ${pw(s, 2)}`] }, { pre: `${pw(s, 2)} = `, post: ' m²', ans: s * s, hints: [`${s} · ${s}`] }], sol: `Área = ${s} · ${s} = ${pw(s, 2)} = <b>${s * s} m²</b>` } }
  if (t === 'cubo') { const s = pick([2, 3, 4, 5]); return { skill: 'prob-pot', label: 'Problemas con cuadrados y cubos', title: `🧊 Un cubo de Rubik de <b>${s}×${s}×${s}</b>. ¿Cuántos cubitos tiene?`, steps: [{ type: 'pow', q: 'Escríbelo como potencia:', b: s, e: 3, hints: ['Tiene el mismo número de cubitos de largo, de ancho y de alto.', `${s} · ${s} · ${s} = ${pw(s, 3)}`] }, { pre: `${pw(s, 3)} = `, post: ' cubitos', ans: s * s * s, hints: [`${s} · ${s} · ${s}`] }], sol: `${s} · ${s} · ${s} = ${pw(s, 3)} = <b>${s * s * s} cubitos</b>` } }
  const s = pick([20, 30, 40]); return { skill: 'prob-pot', label: 'Problemas con cuadrados y cubos', title: `🌾 Una finca cuadrada tiene <b>${s * s} m²</b>. ¿Cuánto mide su lado? ¿Cuántos metros de alambrada hacen falta para cercarla?`, steps: [{ q: 'Lado (¿qué número al cuadrado da el área?):', pre: `${R(s * s)} = `, post: ' m', ans: s, hints: [`Busca un número que multiplicado por sí mismo dé ${s * s}.`, `${s} · ${s} = ${s * s}`] }, { q: 'Alambrada (los 4 lados):', pre: `4 · ${s} = `, post: ' m', ans: 4 * s, hints: ['Un cuadrado tiene 4 lados iguales.'] }], sol: `Lado = ${R(s * s)} = <b>${s} m</b>. Alambrada = 4 · ${s} = <b>${4 * s} m</b>.` };
}
function gen1(l) { const f = l === 1 ? pick([exValor, exValor, exEscribe, exLee, exCero]) : l === 2 ? pick([exValor, exEscribe, exCero, exCuadradoProb, exValor]) : pick([exValor, exCuadradoProb, exEscribe, exCero]); return f(l) }

function exProd(l) {
  const b = l === 3 ? pick([pick(LET), rnd(2, 9)]) : rnd(2, 9), n = l === 1 ? 2 : rnd(2, 3), es = Array(n).fill(0).map(() => rnd(1, l === 1 ? 5 : 9)), e = es.reduce((a, c) => a + c, 0);
  const tt = es.map(x => x === 1 && l > 1 ? `${b}` : pw(b, x)).join(' · ');
  return { skill: 'prod', label: 'Producto de potencias de la misma base', title: `Reduce a una única potencia: <span class="m">${tt}</span>`, steps: [{ type: 'pow', q: `La base es la misma (${b}): ¿qué pasa con los exponentes?`, fixB: b, b, e, hints: ['Misma base y multiplicando → <b>se suman</b> los exponentes.', es.some(x => x === 1) ? `Ojo: si un número no lleva exponente, es como si tuviera un 1. ${es.join(' + ')} = ${e}` : `${es.join(' + ')} = ${e}`], why: (vb, ve) => ve === es.reduce((a, c) => a * c, 1) ? '¡Ojo! Al <b>multiplicar</b> potencias de la misma base, los exponentes se <b>suman</b>, no se multiplican.' : `Suma los exponentes: ${es.join(' + ')}.` }], sol: `${tt} = ${pw(b, es.join('+'))} = ${pw(b, e)}` };
}
function exCoc(l) {
  const b = l === 3 ? pick([pick(LET), rnd(2, 9)]) : rnd(2, 9), m = rnd(4, l === 1 ? 8 : 15), n = rnd(1, m - 1);
  return { skill: 'coc', label: 'Cociente de potencias de la misma base', title: `Reduce a una única potencia: <span class="m">${pw(b, m)} : ${n === 1 && l > 1 ? b : pw(b, n)}</span>`, steps: [{ type: 'pow', q: 'Misma base y dividiendo: ¿qué hacemos con los exponentes?', fixB: b, b, e: m - n, hints: ['Misma base y dividiendo → <b>se restan</b> los exponentes (el de arriba menos el de abajo).', `${m} − ${n} = ${m - n}`], why: (vb, ve) => ve === m + n ? 'Al <b>dividir</b> se <b>restan</b>, no se suman.' : ve * n === m ? 'No se dividen los exponentes: se <b>restan</b>.' : `Resta: ${m} − ${n}.` }], sol: `${pw(b, m)} : ${pw(b, n)} = ${pw(b, `${m}−${n}`)} = ${pw(b, m - n)}` };
}
function exProdCoc(l) {
  const b = rnd(2, 9), a = rnd(2, 6), c = rnd(2, 6), d = rnd(1, a + c - 1);
  return { skill: 'prodcoc', label: 'Producto y cociente combinados', title: `Reduce a una única potencia: <span class="m">${pw(b, a)} · ${pw(b, c)} : ${pw(b, d)}</span>`, steps: [{ type: 'pow', q: `Primero la multiplicación: ${pw(b, a)} · ${pw(b, c)} =`, fixB: b, b, e: a + c, hints: ['Multiplicar → sumar exponentes.'] }, { type: 'pow', q: `Ahora divide entre ${pw(b, d)}:`, pre: `${pw(b, a + c)} : ${pw(b, d)} = `, fixB: b, b, e: a + c - d, hints: ['Dividir → restar exponentes.'] }], sol: `${pw(b, a)} · ${pw(b, c)} : ${pw(b, d)} = ${pw(b, a + c)} : ${pw(b, d)} = ${pw(b, a + c - d)}` };
}
function gen2(l) { return (l === 1 ? pick([exProd, exCoc]) : l === 2 ? pick([exProd, exCoc, exProd, exCoc]) : pick([exProd, exCoc, exProdCoc, exProdCoc]))(l) }

function exPotPot(l) {
  const b = l === 3 ? pick([pick(LET), rnd(2, 9)]) : rnd(2, 9), m = rnd(2, l === 1 ? 4 : 6), n = rnd(2, l === 1 ? 3 : 5);
  if (l === 3 && Math.random() < .4) { const k = rnd(2, 3); return { skill: 'potpot', label: 'Potencia de una potencia', title: `Reduce: <span class="m">[(${pw(b, m)})<sup>${n}</sup>]<sup>${k}</sup></span>`, steps: [{ type: 'pow', q: 'Potencia de potencia (de dentro afuera):', fixB: b, b, e: m * n * k, hints: ['Se <b>multiplican</b> todos los exponentes.', `${m} · ${n} · ${k} = ${m * n * k}`], why: (vb, ve) => ve === m + n + k ? 'En potencia de potencia los exponentes se <b>multiplican</b>.' : `Multiplica ${m} · ${n} · ${k}.` }], sol: `${m} · ${n} · ${k} = ${m * n * k} → ${pw(b, m * n * k)}` } }
  return { skill: 'potpot', label: 'Potencia de una potencia', title: `Reduce a una única potencia: <span class="m">(${pw(b, m)})<sup>${n}</sup></span>`, steps: [{ type: 'pow', q: 'Potencia de una potencia:', fixB: b, b, e: m * n, hints: [`(${pw(b, m)})<sup>${n}</sup> = ${Array(n).fill(pw(b, m)).join(' · ')}`, `Se <b>multiplican</b> los exponentes: ${m} · ${n} = ${m * n}`], why: (vb, ve) => ve === m + n ? 'Aquí los exponentes se <b>multiplican</b>, no se suman.' : `Multiplica ${m} · ${n}.` }], sol: `(${pw(b, m)})<sup>${n}</sup> = ${pw(b, `${m}·${n}`)} = ${pw(b, m * n)}` };
}
function exMismoExp(l) {
  const div = Math.random() < .45, e = rnd(2, l === 1 ? 4 : 7);
  if (!div) { const [a, c] = pick([[2, 5], [2, 3], [3, 4], [5, 4], [2, 6], [3, 3], [5, 3], [7, 2], [4, 5], [6, 2]]); return { skill: 'pexp', label: 'Producto de potencias con el mismo exponente', title: `Reduce a una única potencia: <span class="m">${pw(a, e)} · ${pw(c, e)}</span>`, steps: [{ type: 'pow', q: 'Mismo exponente: ¿qué hacemos con las bases?', fixE: e, b: a * c, e, hints: ['Si el <b>exponente es el mismo</b>, se <b>multiplican las bases</b> y se deja el exponente.', `${a} · ${c} = ${a * c}`], why: (vb) => vb === a + c ? 'Las bases se <b>multiplican</b>, no se suman.' : `Multiplica las bases: ${a} · ${c}.` }], sol: `${pw(a, e)} · ${pw(c, e)} = (${a} · ${c})<sup>${e}</sup> = ${pw(a * c, e)}` } }
  const [a, c] = pick([[10, 5], [10, 2], [12, 3], [12, 4], [18, 6], [20, 4], [15, 5], [25, 5], [8, 2], [9, 3]]);
  return { skill: 'cexp', label: 'Cociente de potencias con el mismo exponente', title: `Reduce a una única potencia: <span class="m">${pw(a, e)} : ${pw(c, e)}</span>`, steps: [{ type: 'pow', q: 'Mismo exponente: ¿qué hacemos con las bases?', fixE: e, b: a / c, e, hints: ['Si el <b>exponente es el mismo</b>, se <b>dividen las bases</b>.', `${a} : ${c} = ${a / c}`], why: () => `Divide las bases: ${a} : ${c}.` }], sol: `${pw(a, e)} : ${pw(c, e)} = (${a} : ${c})<sup>${e}</sup> = ${pw(a / c, e)}` };
}
function exCombo(l) {
  const T = pick([
    { t: `(${pw(5, 8)} · ${pw(5, 4)}) : (${pw(5, 2)})<sup>5</sup>`, s: [['Arriba: ' + `${pw(5, 8)} · ${pw(5, 4)}`, 5, 12], ['Abajo: ' + `(${pw(5, 2)})<sup>5</sup>`, 5, 10], ['Ahora divide: ' + `${pw(5, 12)} : ${pw(5, 10)}`, 5, 2]] },
    { t: `[(${pw(2, 6)}) · (${pw(2, 3)})] : [(${pw(2, 3)})<sup>2</sup>]`, s: [['Primer corchete: ' + `${pw(2, 6)} · ${pw(2, 3)}`, 2, 9], ['Segundo corchete: ' + `(${pw(2, 3)})<sup>2</sup>`, 2, 6], ['Divide:', 2, 3]] },
    { t: `${pw(10, 6)} : (${pw(5, 4)} · ${pw(2, 4)})`, s: [['El paréntesis (mismo exponente): ' + `${pw(5, 4)} · ${pw(2, 4)}`, 10, 4], ['Divide: ' + `${pw(10, 6)} : ${pw(10, 4)}`, 10, 2]] },
    { t: `(${pw(9, 5)} · ${pw(2, 5)}) : ${pw(18, 4)}`, s: [['El paréntesis (mismo exponente): ' + `${pw(9, 5)} · ${pw(2, 5)}`, 18, 5], ['Divide: ' + `${pw(18, 5)} : ${pw(18, 4)}`, 18, 1]] },
    { t: `(${pw(5, 7)} · ${pw(4, 7)}) : ${pw(20, 4)}`, s: [['El paréntesis (mismo exponente): ' + `${pw(5, 7)} · ${pw(4, 7)}`, 20, 7], ['Divide: ' + `${pw(20, 7)} : ${pw(20, 4)}`, 20, 3]] },
    { t: `${pw(2, 10)} : (${pw(2, 5)} · ${pw(4, 2)})`, s: [['Escribe 4² como potencia de 2: 4 = 2², así que 4² = (2²)² =', 2, 4], ['El paréntesis: ' + `${pw(2, 5)} · ${pw(2, 4)}`, 2, 9], ['Divide: ' + `${pw(2, 10)} : ${pw(2, 9)}`, 2, 1]] },
    { t: `${pw(25, 3)} : (${pw(15, 5)} : ${pw(3, 5)})`, s: [['El paréntesis (mismo exponente, se dividen bases): ' + `${pw(15, 5)} : ${pw(3, 5)}`, 5, 5], ['Escribe 25³ como potencia de 5: 25 = 5², así que 25³ =', 5, 6], ['Divide: ' + `${pw(5, 6)} : ${pw(5, 5)}`, 5, 1]] },
    { t: `${pw(3, 2)} · ${pw(3, 3)} · (${pw(3, 3)} · ${pw(3, 4)}) : (${pw(3, 4)} · ${pw(3, 2)})`, s: [['Lo de dentro del segundo paréntesis: ' + `${pw(3, 3)} · ${pw(3, 4)}`, 3, 7], ['Lo del tercer paréntesis: ' + `${pw(3, 4)} · ${pw(3, 2)}`, 3, 6], ['Ahora: ' + `${pw(3, 2)} · ${pw(3, 3)} · ${pw(3, 7)} : ${pw(3, 6)}`, 3, 6]] }
  ]);
  return { skill: 'combo', label: 'Combinar varias propiedades', title: `Reduce a una única potencia: <span class="m">${T.t}</span>`, steps: T.s.map(([q, b, e]) => ({ type: 'pow', q, b, e, fixB: b === 10 || b === 18 || b === 20 ? null : b, hints: ['Misma base: multiplicar → sumar; dividir → restar. Potencia de potencia → multiplicar. Mismo exponente → operar las bases.'] })), sol: T.s.map(([q, b, e]) => `${q.replace(/:$/, '')} → ${pw(b, e)}`).join('<br>') };
}
function gen3(l) { return (l === 1 ? pick([exPotPot, exMismoExp]) : l === 2 ? pick([exPotPot, exMismoExp, exMismoExp, exProd]) : pick([exCombo, exPotPot, exMismoExp, exCombo]))(l) }

const SQ = n => n * n;
function exRaiz(l) {
  const r = l === 1 ? rnd(2, 10) : l === 2 ? pick([rnd(2, 15), 20, 30]) : pick([11, 12, 13, 14, 15, 20, 30, 40, 50, 16, 25]);
  return { skill: 'raiz', label: 'Raíces cuadradas exactas', title: `Calcula ${R(fmt(SQ(r)))}`, steps: [{ pre: `${R(fmt(SQ(r)))} = `, ans: r, hints: [`¿Qué número multiplicado por sí mismo da ${fmt(SQ(r))}?`, r % 10 === 0 ? `Piensa: ${r / 10} · ${r / 10} = ${SQ(r / 10)}, y con los ceros…` : `Prueba con ${r - 1} · ${r - 1} = ${SQ(r - 1)}… ¿y uno más?`], why: v => v * 2 === SQ(r) ? '¡Ojo! La raíz no es dividir entre 2. Busca un número que multiplicado por sí mismo dé ' + fmt(SQ(r)) + '.' : v * v > SQ(r) ? `${v} · ${v} = ${fmt(v * v)}, te pasas.` : `${v} · ${v} = ${fmt(v * v)}, te quedas corta.` }], sol: `${R(fmt(SQ(r)))} = <b>${r}</b>, porque ${r} · ${r} = ${fmt(SQ(r))}` };
}
function exEntera(l) {
  const r = l === 1 ? rnd(2, 6) : rnd(4, 10), n = SQ(r) + rnd(1, 2 * r);
  return { skill: 'rentera', label: 'Raíz entera y resto', title: `Calcula la raíz entera de ${R(n)} y su resto`, steps: [{ q: `¿Qué cuadrado perfecto está justo por debajo de ${n}?`, pre: `${R(n)} ≈ `, ans: r, hints: [`Busca el número más grande que al cuadrado no se pase de ${n}.`, `${r}² = ${SQ(r)} y ${r + 1}² = ${SQ(r + 1)}: ${n} está entre los dos.`], why: v => v * v > n ? `${v}² = ${v * v}, que se pasa de ${n}.` : `Prueba uno más: ${v + 1}² = ${SQ(v + 1)}.` }, { q: 'Ahora el resto: lo que sobra.', pre: `${n} − ${r}² = ${n} − ${SQ(r)} = `, ans: n - SQ(r), hints: ['Resta el número menos el cuadrado.'] }], sol: `${r}² = ${SQ(r)} ≤ ${n} < ${SQ(r + 1)} = ${r + 1}². Raíz entera <b>${r}</b>, resto <b>${n - SQ(r)}</b>. (Se escribe así: (${r}, ${n - SQ(r)}).)` };
}
function exRpot(l) {
  const b = l === 3 ? pick([rnd(2, 9), pick(LET)]) : rnd(2, 9), k = rnd(1, l === 1 ? 3 : 5);
  if (k === 1) return { skill: 'rpot', label: 'Raíz cuadrada de una potencia', title: `Calcula ${R(pw(b, 2))}`, steps: [{ type: 'choice', q: 'Elige:', opts: [`${b}`, `${pw(b, 2)}`, typeof b === 'number' ? `${b * 2}` : `2${b}`], ans: 0, why: () => 'La raíz cuadrada «deshace» el cuadrado.' }], sol: `${R(pw(b, 2))} = ${b}` };
  return { skill: 'rpot', label: 'Raíz cuadrada de una potencia', title: `Calcula ${R(pw(b, 2 * k))} y déjalo como potencia`, steps: [{ type: 'pow', q: 'La raíz cuadrada divide el exponente entre 2:', fixB: b, b, e: k, hints: [`Busca una potencia que al cuadrado dé ${pw(b, 2 * k)}: (${pw(b, '?')})² = ${pw(b, 2 * k)}.`, `${2 * k} : 2 = ${k}`], why: (vb, ve) => ve === 2 * k - 2 ? 'No se resta 2: se <b>divide</b> el exponente entre 2.' : `${2 * k} : 2 = ?` }], sol: `${R(pw(b, 2 * k))} = ${pw(b, k)}, porque (${pw(b, k)})² = ${pw(b, 2 * k)}` };
}
function exRaizOp(l) { const e = pick(['√144-√121', '√49+√36', '√100-√64', '√81:√9', '√25·√16', '√169-√144', '√400:√4']); return { skill: 'raizop', label: 'Operar con raíces', title: 'Calcula paso a paso:', steps: [{ type: 'expr', expr: e }], sol: (() => { const s = M.solveAll(e); return s.steps.map(x => `${x.sub.op === 'r' ? R(x.sub.a) : x.sub.a + ' ' + x.sub.op + ' ' + x.sub.b} = ${x.v}`).join('<br>') + `<br>Resultado: <b>${s.result}</b>` })() } }
function gen4(l) { return (l === 1 ? pick([exRaiz, exRaiz, exEntera, exRpot]) : l === 2 ? pick([exRaiz, exEntera, exRpot, exRaizOp]) : pick([exRaiz, exEntera, exRpot, exRaizOp]))(l) }

function exFiesta(l, fixed) {
  const idx = fixed ? fixed.idx : l === 1 ? 2 : l === 2 ? pick([2, 3]) : pick([3, 4]);
  let f = fixed ? fixed.f : null;
  if (!f) { const primes = shuffle([2, 3, 5, 7]).slice(0, l === 1 ? 2 : rnd(2, 3)).sort((a, b) => a - b); f = primes.map(p => [p, rnd(1, idx * 3)]); if (!f.some(([p, e]) => e >= idx)) f[0][1] = idx + rnd(0, idx) }
  const rad = R(f.map(([p, e]) => e > 1 ? pw(p, e) : p).join('·'), idx);
  const steps = [{ type: 'info', q: `🎟️ Hacen falta <b>${idx} papeletas</b> para entrar (el índice de la raíz${idx === 2 ? ': si no se ve, es un 2' : ''}).` }];
  f.forEach(([p, e]) => {
    steps.push({ q: `👥 Grupo del <b>${p}</b>: tiene <b>${e}</b> papeleta${e > 1 ? 's' : ''}. ¿Cuántas personas entran?`, pre: `${e} : ${idx} → entran `, ans: Math.floor(e / idx), max: 2, hints: [`Cada persona gasta ${idx} papeletas. ¿Cuántas veces cabe ${idx} en ${e}?`, `${idx} · ${Math.floor(e / idx)} = ${idx * Math.floor(e / idx)}`], why: v => v * idx > e ? `No hay papeletas para tantas: ${v} personas necesitan ${v * idx}.` : `Todavía pueden entrar más.` });
    steps.push({ q: `¿Cuántas papeletas le sobran al grupo del ${p}?`, pre: `sobran `, ans: e % idx, max: 2, hints: [`${e} − ${idx * Math.floor(e / idx)}`] });
  });
  const out = f.filter(([p, e]) => e >= idx).map(([p, e]) => Math.floor(e / idx) > 1 ? pw(p, Math.floor(e / idx)) : p).join('·'), inn = f.filter(([p, e]) => e % idx).map(([p, e]) => e % idx > 1 ? pw(p, e % idx) : p).join('·');
  const result = `${out}${out && inn ? '·' : ''}${inn ? R(inn, idx) : ''}`;
  steps.push({ type: 'info', q: `🎉 Resultado: <span class="m" style="font-size:24px">${rad} = ${result}</span><br><small style="color:var(--muted)">Los que entran salen fuera; las papeletas que sobran se quedan dentro.</small>` });
  return { skill: 'fiesta', label: 'Simplificar radicales (método fiesta)', title: `Simplifica con el método fiesta: <span class="m" style="font-size:24px">${rad}</span>`, steps, sol: f.map(([p, e]) => `Grupo del ${p}: ${e} papeletas → entran ${Math.floor(e / idx)}, sobran ${e % idx}`).join('<br>') + `<br><b>${rad} = ${result}</b>` };
}
function gen5(l) { return exFiesta(l) }

const OPS = ['3·4^2-3^2:3^0+√81:3^2', '5·(7-2)^2:25-4^4:4^3+√36:6', '5^2+5^3-5+5^0', '3^2·(15+√25)^2-2^3·(15-5)^2', '5·(√16-2)^2+(2^3-5)^2', '560-2^2·(34-24)^2', '√4·(3^2-3)^2+2^2·(5^2-5)^2', '(√64-√25)^3+2·(4^2-13)-√16·(6^2-30)', '3^3-2^2+√81·(√49-3)^2', '[(2-1)^5+2]·[(3^2)^2-2^2]', '(1+2·√49-3^2-5)·(1+3·√36-17)', '(√81-√25)^2+2^3-√(7+9)', '√144-√121'];
function genExpr(l) {
  const T = l === 1 ? ['a^2+b', 'a+b^2', 'a·b^2', '√A+b', 'a^2-√A', 'a^3+b'] : l === 2 ? ['a^2+b·c', '√A+b^2', 'a·b^2-c^3', '(a+b)^2-√A', '√A·b+c^2', 'a^2:b+c', '(a-b)^3+c'] : ['(a+b)^2-√A·c', 'a^2·(b+c)-d^3', '√(A)+b^2·(c-d)', '[a^2-(b+c)]·d', 'a·(b^2-c)+√A:d', '(√A+b)^2-c^3'];
  for (let g = 0; g < 400; g++) {
    let s = pick(T).replace(/A/g, () => String(SQ(rnd(2, 9)))).replace(/[a-d]/g, () => String(rnd(1, l === 1 ? 6 : 9)));
    s = s.replace(/(\d+)\^(\d)/g, (m, b, e) => (+e >= 3 && +b > 5) ? `${rnd(2, 4)}^${e}` : m);
    const r = M.solveAll(s); if (r && r.result <= 500 && r.steps.length >= (l === 1 ? 2 : 3)) return { skill: 'oppot', label: 'Operaciones combinadas con potencias y raíces', title: 'Calcula paso a paso:', steps: [{ type: 'expr', expr: s }], sol: solText(s) };
  }
  return exFixedOp(pick(OPS));
}
function solText(s) { const r = M.solveAll(s); return r.steps.map(x => `${x.sub.op === 'r' ? R(x.sub.a) : x.sub.op === '^' ? P(x.sub.a, x.sub.b) : x.sub.a + ' ' + x.sub.op + ' ' + x.sub.b} = ${fmt(x.v)}`).join('<br>') + `<br>Resultado: <b>${fmt(r.result)}</b>` }
function exFixedOp(s) { return { skill: 'oppot', label: 'Operaciones combinadas con potencias y raíces', title: 'Calcula paso a paso (ficha de la profe):', steps: [{ type: 'expr', expr: s }], sol: solText(s) } }
const PROBS = [
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '🥛 Luis ha recibido <b>4 cajas</b> de vasos. Cada caja tiene <b>4 filas</b> y en cada fila hay <b>4 vasos</b>. ¿Cuántos vasos tiene?', steps: [{ type: 'pow', q: 'Escríbelo como potencia:', b: 4, e: 3, hints: ['Se repite el 4: cajas · filas · vasos.', '4 · 4 · 4 = 4³'] }, { pre: '4³ = ', post: ' vasos', ans: 64, hints: ['4 · 4 = 16; 16 · 4 = …'] }], sol: '4 · 4 · 4 = 4³ = <b>64 vasos</b>' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '📚 Una papelería tiene <b>4 estanterías</b> con <b>8 baldas</b> cada una, y en cada balda hay <b>16 libros</b>. Exprésalo como potencia de 2.', steps: [{ type: 'pow', q: '4 = 2², 8 = 2³ y 16 = 2⁴. Entonces 4 · 8 · 16 = 2² · 2³ · 2⁴ =', fixB: 2, b: 2, e: 9, hints: ['Misma base multiplicando → suma los exponentes: 2 + 3 + 4.'] }, { pre: `${P(2, 9)} = `, post: ' libros', ans: 512, hints: ['2⁹ = 2 · 2 · 2 · 2 · 2 · 2 · 2 · 2 · 2'] }], sol: '4 · 8 · 16 = 2² · 2³ · 2⁴ = 2⁹ = <b>512 libros</b>' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '🐇 Un granjero tiene <b>2 establos</b> con <b>8 conejos</b> cada uno. ¿Cuántas patas de conejo hay? Exprésalo como potencia de 2.', steps: [{ type: 'pow', q: '2 · 8 · 4 = 2¹ · 2³ · 2² =', fixB: 2, b: 2, e: 6, hints: ['Cada conejo tiene 4 patas. 8 = 2³ y 4 = 2².', '1 + 3 + 2 = 6'] }, { pre: `${P(2, 6)} = `, post: ' patas', ans: 64 }], sol: '2 · 8 · 4 = 2 · 2³ · 2² = 2⁶ = <b>64 patas</b>' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '🦠 Una ameba se divide en dos cada día. Empezamos con <b>1 ameba</b>. ¿Cuántas habrá a los <b>5 días</b>?', steps: [{ type: 'pow', q: 'Cada día se duplican: 2 · 2 · 2 · 2 · 2 =', b: 2, e: 5, hints: ['Día 1: 2, día 2: 4, día 3: 8…', 'Se multiplica por 2 cinco veces: 2⁵'] }, { pre: `${P(2, 5)} = `, post: ' amebas', ans: 32 }], sol: '2⁵ = <b>32 amebas</b>. ¡Y a los 20 días serían 2²⁰ = 1.048.576!' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '🔢 ¿Por cuánto hay que multiplicar ' + P(3, 5) + ' para que el resultado sea ' + P(3, 8) + '?', steps: [{ type: 'pow', q: '3⁵ · 3<sup>?</sup> = 3⁸ → el exponente que falta:', fixB: 3, b: 3, e: 3, hints: ['Al multiplicar se suman los exponentes: 5 + ? = 8'] }], sol: '5 + 3 = 8 → hay que multiplicar por <b>3³</b>' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '🔢 ¿Entre cuánto hay que dividir ' + P(5, 7) + ' para que el resultado sea ' + P(5, 2) + '?', steps: [{ type: 'pow', q: '5⁷ : 5<sup>?</sup> = 5² →', fixB: 5, b: 5, e: 5, hints: ['Al dividir se restan: 7 − ? = 2'] }], sol: '7 − 5 = 2 → hay que dividir entre <b>5⁵</b>' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '🌾 Dos parcelas miden ' + P(3, 8) + ' y ' + P(3, 4) + ' m². ¿Es la primera el doble que la segunda? ¿Cuántas veces es mayor?', steps: [{ type: 'pow', q: 'Divide: 3⁸ : 3⁴ =', fixB: 3, b: 3, e: 4, hints: ['Misma base dividiendo: resta los exponentes.'] }, { pre: '3⁴ = ', post: ' veces', ans: 81, hints: ['3 · 3 · 3 · 3'] }, { type: 'choice', q: '¿Es el doble?', opts: ['No, es 81 veces mayor', 'Sí, es el doble'], ans: 0 }], sol: '3⁸ : 3⁴ = 3⁴ = <b>81 veces</b> mayor (¡no el doble!)' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '✏️ Escribe el exponente que falta: 3² · 3<sup>?</sup> = 3⁶', steps: [{ type: 'pow', q: '', fixB: 3, b: 3, e: 4, hints: ['2 + ? = 6'] }], sol: '2 + <b>4</b> = 6' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '✏️ Escribe el exponente que falta: (3⁴)<sup>?</sup> = 3⁸', steps: [{ type: 'pow', q: '', fixB: 3, b: 3, e: 2, hints: ['Potencia de potencia: 4 · ? = 8'] }], sol: '4 · <b>2</b> = 8' }),
  () => ({ skill: 'prob', label: 'Problemas de potencias', title: '✏️ Escribe el exponente que falta: 2<sup>?</sup> : 2⁷ = 2', steps: [{ type: 'pow', q: '', fixB: 2, b: 2, e: 8, hints: ['2 es 2¹: ? − 7 = 1'] }], sol: '<b>8</b> − 7 = 1' })
];
function gen6(l) { return l === 1 ? genExpr(1) : Math.random() < .35 ? pick(PROBS)() : Math.random() < .3 ? exFixedOp(pick(OPS)) : genExpr(l) }

/* ---------- tema ---------- */
const TB = (rows) => `<table class="tt">${rows.map(r => `<tr>${r.map(c => `<td style="background:#fff;border:1px solid var(--line)">${c}</td>`).join('')}</tr>`).join('')}</table>`;
window.TEMA = {
  app: 'mat-pot', key: 'laura-mat-pot-v1', title: 'Potencias y raíces',
  htitle: 'Potencias <span>y raíces</span>',
  hello: '¡Hola, Laura! Soy <b>Micro</b> 👋 Las potencias son un <b>atajo</b> para multiplicar. Vamos poquito a poco: primero te lo explico, luego practicas con pistas, y cuando te veas segura, haces el Reto.',
  blocks: [
    { id: 'p1', name: '¿Qué es una potencia?', desc: 'Base, exponente y cómo se calcula', ico: 'aⁿ', c: '--c0', gen: gen1,
      hello: 'Empezamos por lo más importante: entender qué es una potencia. Si esto lo tienes claro, lo demás es mucho más fácil. 😉',
      slides: [
        { t: 'Un atajo para multiplicar', html: `<p>Imagina que tienes que escribir <span class="m">3 · 3 · 3 · 3</span>. ¡Es largo! Las matemáticas tienen un atajo:</p><div class="big-math">3 · 3 · 3 · 3 = ${P('<span class="hi">3</span>', '4')}</div><div class="box"><p style="margin:0">🔵 La <b>base</b> (3) es el número que se repite.<br>🔺 El <b>exponente</b> (4, pequeñito arriba) dice <b>cuántas veces</b> se repite.</p></div>`, check: [`En ${P(5, 3)}, ¿cuántas veces se multiplica el 5?`, ['3 veces', '5 veces', '15 veces'], 'El exponente (3) dice las veces.', 'Mira el número pequeñito de arriba.'] },
        { t: 'Cómo se leen', html: `<div class="box"><p style="margin:0">${P(5, 2)} → «cinco <b>al cuadrado</b>»<br>${P(5, 3)} → «cinco <b>al cubo</b>»<br>${P(5, 4)} → «cinco <b>a la cuarta</b>»<br>${P(5, 5)} → «cinco <b>a la quinta</b>»</p></div><p>¿Por qué «al cuadrado»? Porque ${P(4, 2)} son los cuadraditos de un <b>cuadrado</b> de 4 de lado:</p>`, demo: { type: 'squares', n: 4, cap: '4 · 4 = 4² = 16 cuadraditos' }, check: ['¿Cómo se lee 7³?', ['siete al cubo', 'siete por tres', 'tres al siete'], 'Y un cubo de Rubik de 3×3×3 tiene 3³ = 27 cubitos. 🧊'] },
        { t: 'Calcular una potencia', html: `<p>Para calcular ${P(2, 5)}, multiplica <b>de uno en uno</b> y apunta cada resultado. ¡Así no te pierdes!</p>`, demo: { type: 'pow', b: 2, e: 5 }, try: () => exValor(1) },
        { t: '¡Cuidado con la trampa!', html: `<div class="warn"><span>⚠️</span><div>${P(2, 3)} <b>NO</b> es 2 · 3 = 6.<br>${P(2, 3)} es 2 · 2 · 2 = <b>8</b>.</div></div><p>Es el error más típico en los exámenes. Cuando veas una potencia, piensa: «¿qué número se repite y cuántas veces?».</p>`, check: [`¿Cuánto es ${P(4, 2)}?`, ['16', '8', '6'], '4 · 4 = 16.', 'Recuerda: 4² = 4 · 4.'] },
        { t: 'Exponente 1 y exponente 0', html: `<div class="big-math" style="font-size:24px">${P('a', 1)} = a &nbsp;&nbsp;&nbsp; ${P('a', 0)} = <span class="hi">1</span></div><p>¿Por qué elevado a 0 da 1? Mira el patrón: cada vez que bajamos el exponente, <b>dividimos entre 2</b>:</p><div class="box" style="font-family:Fredoka;font-size:19px;text-align:center">${P(2, 3)} = 8 → ${P(2, 2)} = 4 → ${P(2, 1)} = 2 → ${P(2, 0)} = <b>1</b></div>`, check: [`¿Cuánto es ${P(357, 0)}?`, ['1', '0', '357'], '¡Siempre 1!', 'Cualquier número elevado a 0 vale 1.'] }
      ] },
    { id: 'p2', name: 'Multiplicar y dividir potencias', desc: 'Con la misma base: sumar y restar exponentes', ico: '×÷', c: '--c1', gen: gen2,
      hello: 'Ahora vamos a juntar potencias. Te voy a enseñar <b>por qué</b> funcionan las reglas, así no tienes que memorizarlas a ciegas. 🧠',
      slides: [
        { t: 'Multiplicar: se suman', html: `<p>Mira qué pasa si «desplegamos» las potencias:</p><div class="big-math" style="font-size:22px">${P(2, 3)} · ${P(2, 2)} = <span style="background:#ffe7c2;border-radius:8px;padding:0 4px">2·2·2</span> · <span style="background:#d9e8ff;border-radius:8px;padding:0 4px">2·2</span> = ${P(2, '<span class="hi">5</span>')}</div><p>Hay 3 doses + 2 doses = <b>5 doses</b>. ¡Por eso los exponentes <b>se suman</b>!</p><div class="box" style="text-align:center;font-family:Fredoka;font-size:22px">${P('a', 'm')} · ${P('a', 'n')} = ${P('a', 'm+n')}</div>`, try: () => exProd(1) },
        { t: 'Dividir: se restan', html: `<p>Al dividir, los de arriba y los de abajo se «tachan» por parejas:</p><div class="big-math" style="font-size:20px">${P(5, 7)} : ${P(5, 3)} = <span style="display:inline-flex;flex-direction:column;vertical-align:middle;line-height:1.2"><span><s style="color:#d9467a;opacity:.6">5·5·5</s>·5·5·5·5</span><span style="border-top:2px solid">  <s style="color:#d9467a;opacity:.6">5·5·5</s></span></span> = ${P(5, '<span class="hi">4</span>')}</div><p>Quedan 7 − 3 = <b>4 cincos</b>. ¡Los exponentes <b>se restan</b>!</p><div class="box" style="text-align:center;font-family:Fredoka;font-size:22px">${P('a', 'm')} : ${P('a', 'n')} = ${P('a', 'm−n')}</div>`, try: () => exCoc(1) },
        { t: 'Las dos trampas', html: `<div class="warn"><span>⚠️</span><div>La base <b>no se toca</b>: ${P(2, 3)} · ${P(2, 2)} es ${P(2, 5)}, <b>no</b> ${P(4, 5)}.</div></div><div class="warn"><span>⚠️</span><div>Solo funciona con la <b>misma base</b>: ${P(2, 3)} · ${P(3, 2)} no se puede juntar sumando exponentes.</div></div>`, check: [`${P(7, 4)} · ${P(7, 3)} =`, [`${P(7, 7)}`, `${P(49, 7)}`, `${P(7, 12)}`], 'Misma base y se suman: 4 + 3 = 7.', 'La base no cambia, y los exponentes se suman.'] },
        { t: 'Truco para no liarte', html: `<div class="tip"><span>💡</span><div>Con potencias de la misma base, la operación <b>baja un escalón</b>:<br>✖️ multiplicar → ➕ sumar exponentes<br>➗ dividir → ➖ restar exponentes</div></div><p>Y si un número no tiene exponente, tiene un <b>1 invisible</b>: 5 = ${P(5, 1)}.</p>`, check: [`${P(5, 4)} · 5 =`, [`${P(5, 5)}`, `${P(5, 4)}`, `${P(25, 4)}`], 'El 5 solito es 5¹: 4 + 1 = 5.', 'Recuerda el 1 invisible.'] }
      ] },
    { id: 'p3', name: 'Potencia de potencia y mismo exponente', desc: 'Las otras reglas y la tabla resumen', ico: '( )ⁿ', c: '--c2', gen: gen3,
      hello: 'Dos reglas más y ya las tienes todas. Al final te dejo la tabla resumen de tu profe. 📋',
      slides: [
        { t: 'Potencia de una potencia', html: `<div class="big-math" style="font-size:21px">(${P(5, 3)})<sup>4</sup> = ${P(5, 3)} · ${P(5, 3)} · ${P(5, 3)} · ${P(5, 3)} = ${P(5, '<span class="hi">12</span>')}</div><p>Son 4 veces ${P(5, 3)}: 3 + 3 + 3 + 3 = 3 · 4 = 12. ¡Los exponentes <b>se multiplican</b>!</p><div class="box" style="text-align:center;font-family:Fredoka;font-size:22px">(${P('a', 'm')})<sup>n</sup> = ${P('a', 'm·n')}</div>`, try: () => exPotPot(1) },
        { t: 'Mismo exponente: multiplicar', html: `<p>Ahora las bases son distintas pero el <b>exponente es el mismo</b>:</p><div class="big-math" style="font-size:21px">${P(2, 3)} · ${P(5, 3)} = (2 · 5)<sup>3</sup> = ${P(10, 3)}</div><p>Se <b>multiplican las bases</b> y se deja el exponente. ¡Muy útil para hacer dieces!</p><div class="box" style="text-align:center;font-family:Fredoka;font-size:22px">${P('a', 'm')} · ${P('b', 'm')} = (a · b)<sup>m</sup></div>` },
        { t: 'Mismo exponente: dividir', html: `<div class="big-math" style="font-size:21px">${P(10, 6)} : ${P(5, 6)} = (10 : 5)<sup>6</sup> = ${P(2, 6)}</div><div class="box" style="text-align:center;font-family:Fredoka;font-size:22px">${P('a', 'm')} : ${P('b', 'm')} = (a : b)<sup>m</sup></div><div class="tip"><span>💡</span><div><b>¿Misma base?</b> → opera los <b>exponentes</b>.<br><b>¿Mismo exponente?</b> → opera las <b>bases</b>.</div></div>`, try: () => exMismoExp(1) },
        { t: 'La tabla de tu profe', html: TB([['<b>Regla</b>', '<b>Resultado</b>', '<b>Con palabras</b>'], [P('a', 1), 'a', 'Siempre es a'], [P('a', 0), '1', 'Siempre es 1'], [`${P('a', 'm')}·${P('a', 'n')}`, P('a', 'm+n'), 'Misma base, se suman exponentes'], [`${P('a', 'm')}:${P('a', 'n')}`, P('a', 'm−n'), 'Misma base, se restan exponentes'], [`(${P('a', 'm')})<sup>n</sup>`, P('a', 'm·n'), 'Se multiplican los exponentes'], [`${P('a', 'm')}·${P('b', 'm')}`, '(a·b)<sup>m</sup>', 'Se multiplican las bases'], [`${P('a', 'm')}:${P('b', 'm')}`, '(a:b)<sup>m</sup>', 'Se dividen las bases']]) + `<div class="tip"><span>💡</span><div>Cuando haya varias operaciones, ve <b>por partes</b>: primero los paréntesis, y cada vez una sola regla.</div></div>`, try: () => exCombo(3) }
      ] },
    { id: 'p4', name: 'Raíces cuadradas', desc: 'Exactas, enteras y de potencias', ico: '√', c: '--c3', gen: gen4,
      hello: 'La raíz cuadrada es como ir <b>hacia atrás</b> desde el cuadrado. ¡Verás qué fácil cuando le pillas el truco! 🔍',
      slides: [
        { t: 'Lo contrario del cuadrado', html: `<p>Si ${P(5, 2)} = 25, entonces ${R(25)} = 5.</p><div class="box" style="text-align:center;font-family:Fredoka;font-size:22px">${R('a')} = b &nbsp;⟺&nbsp; ${P('b', 2)} = a</div><p>La pregunta que te tienes que hacer siempre: <b>«¿qué número multiplicado por sí mismo da…?»</b></p>`, demo: { type: 'squares', n: 5, cap: 'Si tengo 25 cuadraditos formando un cuadrado, el lado mide √25 = 5' }, check: [`¿Cuánto es ${R(49)}?`, ['7', '24,5', '49'], '7 · 7 = 49.', '¡Ojo! No es dividir entre 2.'] },
        { t: 'Los cuadrados perfectos', html: `<p>Son los números que tienen raíz exacta. Apréndetelos como las tablas:</p><div class="chuleta" style="grid-template-columns:repeat(4,1fr)">${Array(15).fill(0).map((_, i) => `<div>${i + 1}² = <b>${(i + 1) * (i + 1)}</b></div>`).join('')}<div>20² = <b>400</b></div></div><div class="tip"><span>💡</span><div>Con ceros es fácil: 30² = 900, así que ${R(900)} = 30. Y ${R(2500)} = 50.</div></div>`, try: () => exRaiz(1) },
        { t: 'Raíz entera y resto', html: `<p>¿Y ${R(10)}? No hay ningún número que por sí mismo dé 10 exacto. Buscamos el cuadrado perfecto que se queda <b>justo por debajo</b>:</p><div class="box" style="font-family:Fredoka;font-size:19px;text-align:center">3² = 9 ≤ 10 < 16 = 4²</div><p>La <b>raíz entera</b> es <b>3</b> y sobra 10 − 9 = <b>1</b> (el <b>resto</b>). Tu profe lo escribe así: <b>(3, 1)</b>.</p>`, demo: { type: 'squares', n: 3, extra: 0, cap: '3 · 3 = 9 cuadraditos, y sobra 1 para llegar a 10' }, try: () => exEntera(1) },
        { t: 'Raíz de una potencia', html: `<div class="big-math" style="font-size:22px">${R(P(5, 2))} = 5 &nbsp;&nbsp; ${R(P(2, 6))} = ${P(2, 3)}</div><p>La raíz cuadrada <b>divide el exponente entre 2</b>. ¿Por qué? Porque (${P(2, 3)})² = ${P(2, 6)}.</p>`, check: [`${R(P(7, 8))} =`, [`${P(7, 4)}`, `${P(7, 6)}`, `${P(7, 16)}`], '8 : 2 = 4.', 'Divide el exponente entre 2.'] }
      ] },
    { id: 'p5', name: 'El método fiesta', desc: 'Simplificar raíces con papeletas', ico: '🎉', c: '--c4', gen: gen5, fixed: [() => exFiesta(1, { idx: 2, f: [[2, 4], [3, 8], [5, 1]] }), () => exFiesta(2, { idx: 4, f: [[2, 5], [3, 7]] }), () => exFiesta(2, { idx: 3, f: [[2, 6], [3, 2], [5, 4]] })],
      hello: '¡Nos vamos de fiesta! 🎉 Este es el truco de tu profe para simplificar raíces. Es como un juego: quién entra y quién se queda fuera.',
      slides: [
        { t: '1. La entrada a la fiesta', html: `<p>Hay una fiesta en la que para entrar nos piden <b>papeletas</b>. El <b>índice de la raíz</b> (el numerito pequeño) dice cuántas:</p><div class="big-math">${R('…', 3)} → 🎟️🎟️🎟️ <span style="font-size:18px">3 papeletas por persona</span></div><p>Si la raíz no tiene numerito, es una raíz cuadrada: hacen falta <b>2</b>.</p>` },
        { t: '2. Los grupos de amigos', html: `<p>Debajo de la raíz hay <b>grupos de amigos</b>. El <b>exponente</b> dice cuántas papeletas tiene cada grupo:</p><div class="big-math" style="font-size:24px">${R(`${P(2, 3)}·${P(3, 7)}·${P(5, 8)}`, 3)}</div><div class="box"><p style="margin:0">👥 El grupo del 2 tiene <b>3</b> papeletas.<br>👥 El grupo del 3 tiene <b>7</b> papeletas.<br>👥 El grupo del 5 tiene <b>8</b> papeletas.</p></div>` },
        { t: '3. ¡Vamos a la fiesta!', html: `<p>Cada persona que entra gasta 3 papeletas. Los que entran salen <b>fuera</b> de la raíz; las papeletas que sobran se quedan <b>dentro</b>, en el bolsillo:</p>`, demo: { type: 'fiesta', idx: 3, f: [[2, 3], [3, 7], [5, 8]] } },
        { t: '4. ¡Ahora tú!', html: `<p>Una de las que te puso tu profe. Raíz cuadrada → 2 papeletas por persona.</p>`, try: () => exFiesta(1, { idx: 2, f: [[2, 4], [3, 8], [5, 1]] }) }
      ] },
    { id: 'p6', name: 'Operaciones y problemas', desc: 'Todo junto, con el orden correcto', ico: '🧩', c: '--c5', gen: gen6, fixed: OPS.map(s => () => exFixedOp(s)).concat(PROBS),
      hello: 'Último bloque: operaciones con todo mezclado y problemas de la vida real. Recuerda el orden: <b>PA-PO-MU-SU</b>. 🐼',
      slides: [
        { t: 'El orden: PA-PO-MU-SU', html: `<div class="box"><p style="margin:0;font-size:18px">1️⃣ <b>PA</b>réntesis (de dentro afuera)<br>2️⃣ <b>PO</b>tencias y raíces<br>3️⃣ <b>MU</b>ltiplicaciones y divisiones<br>4️⃣ <b>SU</b>mas y restas</p></div><p>Si hay empate, <b>de izquierda a derecha</b>. PA-PO-MU-SU… ¡suena a nombre de panda! 🐼</p>`, demo: { type: 'expr', expr: '3·4^2-3^2:3^0+√81:3^2' } },
        { t: 'Hazlo tú, paso a paso', html: `<p>En cada paso: <b>toca</b> la operación que va primero y <b>calcúlala</b>. Si te equivocas de operación, te diré por qué.</p>`, try: () => genExpr(1) },
        { t: 'Problemas con potencias', html: `<p>¿Cómo sé que un problema es de potencias? Cuando algo se <b>repite multiplicándose</b> siempre por el mismo número:</p><div class="box"><p style="margin:0">🥛 4 cajas, con 4 filas, con 4 vasos → 4 · 4 · 4 = ${P(4, 3)}<br>🦠 Una ameba que se duplica cada día → 2 · 2 · 2… = ${P(2, 'días')}</p></div>`, try: () => PROBS[0]() }
      ] }
  ]
};
startMates();
})();
