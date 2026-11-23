// API de «Estudia con Laura»: cuentas con usuario + PIN, progreso, actividad y panel del tutor.
// Datos en Upstash Redis (variables KV_REST_API_URL y KV_REST_API_TOKEN que crea la integración).
const crypto = require('crypto');

const URL_ = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const APPS = ['europa', 'bio-t2', 'mat-nat', 'mat-pot', 'mat-div'];
const DAY = 86400;

async function redis(...cmds) {
  const r = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  const out = await r.json();
  return out.map(x => { if (x.error) throw new Error(x.error); return x.result; });
}
const one = async (...c) => (await redis(c))[0];

const hash = (secret, salt) => crypto.scryptSync(String(secret), salt, 32).toString('hex');
const newSalt = () => crypto.randomBytes(16).toString('hex');
const newToken = () => crypto.randomBytes(24).toString('hex');
const safeEq = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const cleanUser = u => String(u || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_-]/g, '').slice(0, 24);
const ip = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';

function send(res, code, data) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}
async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { return {}; }
}
const bearer = req => (String(req.headers.authorization || '').match(/^Bearer\s+([a-f0-9]{48})$/) || [])[1];

async function limited(req, kind, max) {
  const k = `rl:${kind}:${ip(req)}`;
  const n = await one('INCR', k);
  if (n === 1) await one('EXPIRE', k, 900);
  return n > max;
}
async function studentFrom(req) {
  const t = bearer(req); if (!t) return null;
  return await one('GET', 'sess:' + t);
}
async function isAdmin(req) {
  const t = bearer(req); if (!t) return false;
  return !!(await one('GET', 'asess:' + t));
}

/* ---------- alumnos ---------- */
const A = {};

A.login = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  if (await limited(req, 'login', 30)) return send(res, 429, { error: 'Demasiados intentos. Espera unos minutos.' });
  const b = await body(req), u = cleanUser(b.user), pin = String(b.pin || '');
  const user = u && await one('HGETALL', 'user:' + u);
  if (!user || !user.length) return send(res, 401, { error: 'Usuario o PIN incorrecto' });
  const o = {}; for (let i = 0; i < user.length; i += 2) o[user[i]] = user[i + 1];
  if (!safeEq(hash(pin, o.salt), o.pin)) return send(res, 401, { error: 'Usuario o PIN incorrecto' });
  const t = newToken();
  await redis(['SET', 'sess:' + t, u, 'EX', 180 * DAY], ['HSET', 'user:' + u, 'lastLogin', Date.now()]);
  send(res, 200, { token: t, user: u, name: o.name });
};

A.me = async (req, res) => {
  const u = await studentFrom(req); if (!u) return send(res, 401, { error: 'auth' });
  const name = await one('HGET', 'user:' + u, 'name');
  send(res, 200, { user: u, name, tutor: u === 'tutor' });
};

A.logout = async (req, res) => {
  const t = bearer(req); if (t) await one('DEL', 'sess:' + t);
  send(res, 200, { ok: true });
};

A.state = async (req, res) => {
  const u = await studentFrom(req); if (!u) return send(res, 401, { error: 'auth' });
  const app = String((req.query && req.query.app) || '');
  if (!APPS.includes(app)) return send(res, 400, { error: 'app' });
  if (req.method === 'GET') {
    const [p, c] = await redis(['GET', `prog:${u}:${app}`], ['GET', `ctl:${u}:${app}`]);
    return send(res, 200, { progress: p ? JSON.parse(p) : null, ctl: c ? JSON.parse(c) : {} });
  }
  if (req.method === 'POST') {
    const b = await body(req); const s = JSON.stringify(b.progress || {});
    if (s.length > 60000) return send(res, 413, { error: 'big' });
    await redis(['SET', `prog:${u}:${app}`, s], ['HSET', 'user:' + u, 'lastSeen', Date.now()]);
    return send(res, 200, { ok: true });
  }
  send(res, 405, { error: 'method' });
};

A.events = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  const u = await studentFrom(req); if (!u) return send(res, 401, { error: 'auth' });
  const b = await body(req);
  const evs = (Array.isArray(b.events) ? b.events : []).slice(0, 200)
    .map(e => JSON.stringify({ ...e, t: Number(e.t) || Date.now() })).filter(s => s.length < 1500);
  if (!evs.length) return send(res, 200, { ok: true });
  await redis(['RPUSH', 'ev:' + u, ...evs], ['LTRIM', 'ev:' + u, -20000, -1], ['HSET', 'user:' + u, 'lastSeen', Date.now()]);
  send(res, 200, { ok: true });
};

/* ---------- tutor ---------- */
A['admin-status'] = async (req, res) => send(res, 200, { configured: !!(await one('EXISTS', 'admin:pass')), db: !!URL_ });

A['admin-setup'] = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  const b = await body(req), pw = String(b.password || '');
  if (pw.length < 8) return send(res, 400, { error: 'La contraseña debe tener al menos 8 caracteres' });
  const salt = newSalt();
  const ok = await one('SET', 'admin:pass', JSON.stringify({ salt, h: hash(pw, salt) }), 'NX');
  if (!ok) return send(res, 409, { error: 'El panel ya tiene contraseña' });
  const t = newToken(); await one('SET', 'asess:' + t, 1, 'EX', 30 * DAY);
  send(res, 200, { token: t });
};

A['admin-login'] = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  if (await limited(req, 'admin', 15)) return send(res, 429, { error: 'Demasiados intentos. Espera unos minutos.' });
  const b = await body(req), raw = await one('GET', 'admin:pass');
  if (!raw) return send(res, 409, { error: 'setup' });
  const p = JSON.parse(raw);
  if (!safeEq(hash(String(b.password || ''), p.salt), p.h)) return send(res, 401, { error: 'Contraseña incorrecta' });
  const t = newToken(); await one('SET', 'asess:' + t, 1, 'EX', 30 * DAY);
  send(res, 200, { token: t });
};

A['admin-users'] = async (req, res) => {
  if (!(await isAdmin(req))) return send(res, 401, { error: 'auth' });
  if (req.method === 'POST') {
    const b = await body(req), u = cleanUser(b.user), pin = String(b.pin || '');
    if (!u) return send(res, 400, { error: 'Usuario no válido (solo letras y números)' });
    const exists = await one('EXISTS', 'user:' + u);
    if (!exists && !/^\d{4}$/.test(pin)) return send(res, 400, { error: 'El PIN debe tener 4 cifras' });
    if (pin && !/^\d{4}$/.test(pin)) return send(res, 400, { error: 'El PIN debe tener 4 cifras' });
    const fields = ['name', String(b.name || u).slice(0, 40)];
    if (pin) { const salt = newSalt(); fields.push('salt', salt, 'pin', hash(pin, salt)); }
    if (!exists) fields.push('created', Date.now());
    await redis(['HSET', 'user:' + u, ...fields], ['SADD', 'users', u]);
    return send(res, 200, { ok: true, user: u });
  }
  if (req.method === 'DELETE') {
    const u = cleanUser(req.query && req.query.user); if (!u) return send(res, 400, { error: 'user' });
    await redis(['DEL', 'user:' + u, 'ev:' + u, ...APPS.flatMap(a => [`prog:${u}:${a}`, `ctl:${u}:${a}`])], ['SREM', 'users', u]);
    return send(res, 200, { ok: true });
  }
  const users = (await one('SMEMBERS', 'users')) || [];
  const rows = users.length ? await redis(...users.map(u => ['HGETALL', 'user:' + u])) : [];
  send(res, 200, { users: users.map((u, i) => { const o = { user: u }; const r = rows[i] || []; for (let j = 0; j < r.length; j += 2) if (!['pin', 'salt'].includes(r[j])) o[r[j]] = r[j + 1]; return o; }) });
};

A['admin-data'] = async (req, res) => {
  if (!(await isAdmin(req))) return send(res, 401, { error: 'auth' });
  const u = cleanUser(req.query && req.query.user); if (!u) return send(res, 400, { error: 'user' });
  const cmds = [['LRANGE', 'ev:' + u, 0, -1]]; APPS.forEach(a => cmds.push(['GET', `prog:${u}:${a}`], ['GET', `ctl:${u}:${a}`]));
  const out = await redis(...cmds);
  const data = { events: (out[0] || []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean), apps: {} };
  APPS.forEach((a, i) => data.apps[a] = { progress: out[1 + 2 * i] ? JSON.parse(out[1 + 2 * i]) : null, ctl: out[2 + 2 * i] ? JSON.parse(out[2 + 2 * i]) : {} });
  send(res, 200, data);
};

A['admin-ctl'] = async (req, res) => {
  if (!(await isAdmin(req))) return send(res, 401, { error: 'auth' });
  if (req.method !== 'POST') return send(res, 405, { error: 'method' });
  const b = await body(req), u = cleanUser(b.user), app = String(b.app || '');
  if (!u || !APPS.includes(app)) return send(res, 400, { error: 'datos' });
  const k = `ctl:${u}:${app}`, cur = JSON.parse((await one('GET', k)) || '{}');
  if ('unlockAll' in b) cur.unlockAll = !!b.unlockAll;
  const cmds = [];
  if (b.reset) { cur.resetAt = Date.now(); cmds.push(['DEL', `prog:${u}:${app}`]); }
  cmds.push(['SET', k, JSON.stringify(cur)]);
  await redis(...cmds);
  send(res, 200, { ok: true, ctl: cur });
};

module.exports = async (req, res) => {
  const action = (req.query && req.query.action) || String(req.url || '').split('?')[0].split('/').pop();
  const fn = A[action];
  if (!fn) return send(res, 404, { error: 'not found' });
  if (!URL_ || !TOKEN) return send(res, 503, { error: 'Base de datos no configurada' });
  try { await fn(req, res); } catch (e) { console.error(action, e); send(res, 500, { error: 'Error del servidor' }); }
};
