/* Cuenta de alumno: inicio de sesión con usuario + PIN, progreso en el servidor y registro de actividad.
   Uso:  await Cuenta.gate();  S = await Cuenta.load('bio-t2', S);  Cuenta.save('bio-t2', S);  Cuenta.ev('round', {...}) */
(function () {
  const API = '/api/';
  const TK = 'estudia:token', UK = 'estudia:user', OWN = 'estudia:owner';
  const APP_KEYS = { 'europa': 'laura-europa-v1', 'bio-t2': 'laura-bio-t2-v1', 'mat-nat': 'laura-mat-nat-v1', 'mat-pot': 'laura-mat-pot-v1' };
  const ls = { get: k => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) { } }, del: k => { try { localStorage.removeItem(k) } catch (e) { } } };
  let me = null, offline = false, curApp = null;
  const q = [], saveT = {};

  async function api(path, opt = {}) {
    const h = { 'Content-Type': 'application/json' }; const t = ls.get(TK); if (t) h.Authorization = 'Bearer ' + t;
    const r = await fetch(API + path, { ...opt, headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined, keepalive: !!opt.keepalive });
    let d = {}; try { d = await r.json() } catch (e) { }
    if (!r.ok) { const e = new Error(d.error || ('HTTP ' + r.status)); e.status = r.status; throw e }
    return d;
  }

  /* ---------- pantalla de acceso ---------- */
  const CSS = `#cta{position:fixed;inset:0;z-index:50;background:radial-gradient(circle at 20% 10%,#e5f6f2,transparent 40%),radial-gradient(circle at 90% 80%,#efe8fb,transparent 40%),#fbf7ef;display:flex;align-items:center;justify-content:center;padding:18px;font-family:Nunito,system-ui,sans-serif;color:#1f2a37}
  #cta .box{width:100%;max-width:360px;text-align:center}
  #cta h1{font-family:Fredoka,Nunito,sans-serif;font-size:30px;margin:6px 0 4px}
  #cta p{margin:0 0 14px;color:#6b7280;font-weight:700}
  #cta .wave{font-size:54px;display:inline-block;animation:ctaw 1.6s ease-in-out infinite;transform-origin:70% 70%}
  @keyframes ctaw{20%{transform:rotate(18deg)}40%{transform:rotate(-8deg)}60%{transform:rotate(14deg)}80%{transform:rotate(0)}}
  #cta input{width:100%;font:inherit;font-size:20px;font-weight:800;text-align:center;padding:12px;border-radius:16px;border:2px solid #e7e0d2;background:#fff;outline:none;text-transform:lowercase}
  #cta input:focus{border-color:#119c8f}
  #cta .dots{display:flex;gap:12px;justify-content:center;margin:16px 0 12px}
  #cta .dots i{width:18px;height:18px;border-radius:50%;border:2px solid #119c8f;background:#fff;transition:.15s}
  #cta .dots i.on{background:#119c8f;transform:scale(1.1)}
  #cta .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  #cta .pad button{font:inherit;font-family:Fredoka,Nunito,sans-serif;font-size:24px;font-weight:600;padding:12px 0;border-radius:16px;border:1px solid #e7e0d2;background:#fff;box-shadow:0 3px 0 #e7e0d2;cursor:pointer;color:#1f2a37}
  #cta .pad button:active{transform:translateY(2px);box-shadow:0 1px 0 #e7e0d2}
  #cta .err{min-height:22px;color:#c0262d;font-weight:800;font-size:14px;margin-top:10px}
  #cta.shake .dots{animation:ctas .4s}
  @keyframes ctas{25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}
  #cta .lbl{font-size:13px;font-weight:800;color:#6b7280;text-align:left;margin:0 0 4px 4px}`;

  function loginScreen() {
    return new Promise(resolve => {
      if (!document.getElementById('ctacss')) { const s = document.createElement('style'); s.id = 'ctacss'; s.textContent = CSS; document.head.appendChild(s) }
      const d = document.createElement('div'); d.id = 'cta';
      d.innerHTML = `<div class="box"><div class="wave">👋</div><h1>¡Hola!</h1><p>Escribe tu usuario y tu PIN secreto</p>
        <div class="lbl">Usuario</div><input id="ctau" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="tu usuario" value="${ls.get('estudia:lastuser') || ''}">
        <div class="dots">${'<i></i>'.repeat(4)}</div>
        <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k => `<button data-k="${k}" aria-label="${k}">${k}</button>`).join('')}</div>
        <div class="err" id="ctae"></div></div>`;
      document.body.appendChild(d);
      let pin = '';
      const dots = () => d.querySelectorAll('.dots i').forEach((x, i) => x.classList.toggle('on', i < pin.length));
      async function go() {
        const user = d.querySelector('#ctau').value.trim();
        if (!user) { d.querySelector('#ctae').textContent = 'Escribe tu usuario'; return }
        if (pin.length < 4) return;
        d.querySelector('#ctae').textContent = 'Comprobando…';
        try {
          const r = await api('login', { method: 'POST', body: { user, pin } });
          ls.set(TK, r.token); ls.set(UK, JSON.stringify({ user: r.user, name: r.name })); ls.set('estudia:lastuser', r.user);
          d.remove(); resolve({ user: r.user, name: r.name });
        } catch (e) {
          pin = ''; dots(); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');
          d.querySelector('#ctae').textContent = e.status === 401 || e.status === 429 ? e.message : 'No hay conexión. Inténtalo de nuevo.';
        }
      }
      d.querySelectorAll('.pad button').forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        if (k === '⌫') pin = pin.slice(0, -1); else if (k === '✓') return go(); else if (pin.length < 4) pin += k;
        dots(); if (pin.length === 4) go();
      });
      d.querySelector('#ctau').addEventListener('keydown', e => { if (e.key === 'Enter') d.querySelector('.pad button').focus() });
    });
  }

  /* ---------- sesión ---------- */
  async function gate() {
    if (me) return me;
    if (ls.get(TK)) {
      try { const r = await api('me'); me = r; }
      catch (e) { if (e.status === 401) { ls.del(TK); ls.del(UK) } else { offline = true; const c = ls.get(UK); me = c ? JSON.parse(c) : null; if (me) return me; } }
    }
    if (!me) {
      try { await api('me') } catch (e) { if (e.status !== 401) { offline = true; return null } }
      me = await loginScreen();
      try { me = await api('me') } catch (e) { }
    }
    const owner = ls.get(OWN);
    if (owner && owner !== me.user) Object.values(APP_KEYS).forEach(k => ls.del(k));
    ls.set(OWN, me.user);
    startTracking();
    return me;
  }
  function logout() { const t = ls.get(TK); flush(); if (t) api('logout', { method: 'POST' }).catch(() => { }); ls.del(TK); ls.del(UK); me = null; location.reload() }

  /* ---------- progreso ---------- */
  function merge(a, b) {
    if (a === undefined || a === null) return b; if (b === undefined || b === null) return a;
    if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
    if (typeof a === 'boolean' || typeof b === 'boolean') return !!(a || b);
    if (Array.isArray(a) && Array.isArray(b)) return [...new Set([...a, ...b])];
    if (typeof a === 'object' && typeof b === 'object') { const o = { ...a }; for (const k in b) o[k] = merge(a[k], b[k]); return o }
    return b;
  }
  async function load(app, local) {
    curApp = app;
    if (!me || offline) return local;
    try {
      const r = await api('state?app=' + app);
      const ctl = r.ctl || {}, rk = 'estudia:reset:' + me.user + ':' + app;
      let base = local;
      if (ctl.resetAt && Number(ls.get(rk) || 0) < ctl.resetAt) { base = null; ls.set(rk, ctl.resetAt) }
      const fresh = JSON.parse(JSON.stringify(local)); for (const k in fresh) { if (typeof fresh[k] === 'object' && fresh[k] && !Array.isArray(fresh[k])) fresh[k] = {}; else if (typeof fresh[k] === 'number') fresh[k] = 0; else if (typeof fresh[k] === 'boolean') fresh[k] = false }
      let m = merge(base ? JSON.parse(JSON.stringify(base)) : fresh, r.progress || {});
      m.unlockAll = !!ctl.unlockAll;
      save(app, m, true);
      return m;
    } catch (e) { return local }
  }
  function save(app, S, now) {
    if (!me || offline) return;
    clearTimeout(saveT[app]);
    const send = () => { const p = { ...S }; delete p.unlockAll; api('state?app=' + app, { method: 'POST', body: { progress: p }, keepalive: true }).catch(() => { }) };
    if (now) send(); else saveT[app] = setTimeout(send, 1200);
  }

  /* ---------- actividad ---------- */
  function ev(k, data) { if (!me || offline) return; q.push({ t: Date.now(), a: curApp || 'hub', k, ...(data || {}) }); if (q.length >= 30) flush() }
  let active = 0, lastInput = Date.now(), tracking = false;
  function flush() {
    if (active >= 1) { q.push({ t: Date.now(), a: curApp || 'hub', k: 'time', s: active }); active = 0 }
    if (!q.length || !me || offline) return;
    const batch = q.splice(0, q.length);
    api('events', { method: 'POST', body: { events: batch }, keepalive: true }).catch(() => { q.unshift(...batch.slice(-100)) });
  }
  function startTracking() {
    if (tracking) return; tracking = true;
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(t => addEventListener(t, () => lastInput = Date.now(), { passive: true, capture: true }));
    setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastInput < 90000) active += 5 }, 5000);
    setInterval(flush, 20000);
    addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush() });
    addEventListener('pagehide', flush);
    ev('open', { page: location.pathname });
  }

  async function remote(app) { if (!me || offline) return null; try { return (await api('state?app=' + app)).progress } catch (e) { return null } }
  window.Cuenta = { gate, load, save, ev, flush, logout, remote, get me() { return me }, get offline() { return offline } };
})();
