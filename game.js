'use strict';
/* =====================================================================
   KINGDOMS: RISE OF EMPIRES — محرك اللعبة
   ===================================================================== */

/* ---------------- ثوابت ---------------- */
const W = 36, H = 28, TILE = 44, STEP = 0.2;
const SAVE_KEY = 'kingdoms_rise_of_empires_v1';
const PL = 0, BANDIT = -2;
const RES = ['food', 'wood', 'stone', 'iron', 'gold'];
const RNAME = { food: 'طعام', wood: 'خشب', stone: 'حجر', iron: 'حديد', gold: 'ذهب' };
const RICO = { food: '🌾', wood: '🪵', stone: '🪨', iron: '⛓️', gold: '🪙' };
const KCOL = ['#3b82f6', '#ef4444', '#eab308', '#a855f7'];
const KNAME = ['مملكتك', 'مملكة الشمال', 'إمبراطورية الشرق', 'سلطنة الجنوب'];
const RANKS = ['جندي', 'عريف', 'ملازم', 'قائد'];
const RANK_XP = [0, 4, 10, 20];
const RARITY = [{ n: 'عادي', m: 1 }, { n: 'نادر', m: 1.5 }, { n: 'ملحمي', m: 2.2 }, { n: 'أسطوري', m: 3 }];
const LEADER_NAMES = ['الأمير سالم', 'القائد زياد', 'الفارس خالد', 'الحكيم ماهر', 'الجنرال نوح', 'اللورد كريم', 'الملكة ليلى', 'سيف الدين', 'الشيخ يوسف', 'الكونت عمر'];
const SPECS = { mil: 'عسكري', eco: 'اقتصادي', def: 'دفاعي' };
const BR_NAMES = { eco: 'الاقتصاد', mil: 'العسكرية', def: 'الدفاع', sci: 'العلوم والإدارة' };
const STN = { war: 'حرب', nap: 'عدم اعتداء', peace: 'سلام', alliance: 'تحالف', self: '' };
const OFFN = { nap: 'عدم اعتداء', peace: 'سلام', alliance: 'تحالف' };

const TERRAIN = {
  plain:    { name: 'سهل',       c: '#8fbf6a', move: 1,   def: 0, bonus: { farm: 1.4 } },
  forest:   { name: 'غابة',      c: '#3f8a4a', move: 1.6, def: 1, bonus: { lumber: 1.5 } },
  mountain: { name: 'جبل',       c: '#8c8a86', move: 2.6, def: 2, bonus: { gold_mine: 1.4, iron_mine: 1.5, quarry: 1.5 } },
  river:    { name: 'نهر',       c: '#4f9ad8', move: 3.5, def: 0, bonus: {} },
  desert:   { name: 'صحراء',     c: '#e0c27a', move: 1.2, def: 0, bonus: { gold_mine: 1.3 } },
  rich:     { name: 'أرض غنية',  c: '#b7d46a', move: 1,   def: 0, bonus: { farm: 1.5, gold_mine: 1.5, iron_mine: 1.5 } }
};

const ZMOD = { farm: 0, gold: 0, cap: 0, upkeep: 0, train: 0, atk: 0, def: 0, bhp: 0, tower: 0, build: 0, leader: 0, research: 0, siege: 0, atkFlat: 0, defFlat: 0, happy: 0, intel: false };

const BUILDINGS = {
  capital:    { name: 'العاصمة', ico: '👑', cost: {}, time: 0, req: null, hp: 600, trains: ['infantry'], shoot: { r: 3, d: 4 }, cat: 'cap', desc: 'قلب مملكتك' },
  farm:       { name: 'مزرعة', ico: '🌾', cost: { wood: 30, gold: 10 }, time: 18, req: ['plain', 'rich'], prod: { food: 4 }, hp: 100, cat: 'eco', desc: 'ينتج طعامًا' },
  lumber:     { name: 'منشر', ico: '🪵', cost: { wood: 20, gold: 15 }, time: 16, req: ['forest'], prod: { wood: 4 }, hp: 100, cat: 'eco', desc: 'ينتج خشبًا (على غابة)' },
  quarry:     { name: 'محجر', ico: '🪨', cost: { wood: 30, gold: 20 }, time: 20, req: ['mountain'], prod: { stone: 3 }, hp: 110, cat: 'eco', desc: 'ينتج حجرًا (على جبل)' },
  iron_mine:  { name: 'منجم حديد', ico: '⛓️', cost: { wood: 40, gold: 40, stone: 20 }, time: 28, req: ['mountain', 'rich'], prod: { iron: 3 }, hp: 110, cat: 'eco', desc: 'ينتج حديدًا' },
  gold_mine:  { name: 'منجم ذهب', ico: '🪙', cost: { wood: 40, stone: 30 }, time: 30, req: ['mountain', 'desert', 'rich'], prod: { gold: 4 }, hp: 110, cat: 'eco', desc: 'ينتج ذهبًا' },
  market:     { name: 'سوق', ico: '🏪', cost: { wood: 60, stone: 30, gold: 80 }, time: 40, req: ['plain', 'rich', 'desert'], prod: { gold: 3 }, hp: 120, cat: 'eco', desc: 'ذهب و+5 معنويات' },
  warehouse:  { name: 'مستودع', ico: '📦', cost: { wood: 80, stone: 40 }, time: 30, req: null, hp: 120, cat: 'eco', max: 0, desc: '+200 سعة تخزين' },
  house:      { name: 'مسكن', ico: '🏠', cost: { wood: 30, stone: 10 }, time: 15, req: null, hp: 90, cat: 'eco', desc: '+5 سكان' },
  workshop:   { name: 'ورشة', ico: '🔨', cost: { wood: 60, iron: 20 }, time: 40, req: null, hp: 120, cat: 'eco', desc: '+1 دفاع لكل الوحدات' },
  temple:     { name: 'معبد', ico: '⛪', cost: { stone: 80, gold: 60 }, time: 35, req: null, hp: 130, cat: 'eco', desc: '+10 معنويات' },
  barracks:   { name: 'ثكنة المشاة', ico: '🛡️', cost: { wood: 60, stone: 30, iron: 10 }, time: 35, req: null, trains: ['infantry', 'spearman'], hp: 150, cat: 'mil', desc: 'يدرّب المشاة وحاملي الرماح' },
  archery:    { name: 'ميدان الرماة', ico: '🏹', cost: { wood: 60, stone: 20 }, time: 30, req: null, trains: ['archer'], hp: 130, cat: 'mil', desc: 'يدرّب الرماة' },
  stable:     { name: 'إسطبل', ico: '🐎', cost: { wood: 80, stone: 40, iron: 30 }, time: 40, req: null, trains: ['cavalry', 'heavycav', 'scout'], hp: 150, cat: 'mil', desc: 'يدرّب الفرسان والاستطلاع' },
  siegeworks: { name: 'ورشة آلات الحصار', ico: '⚙️', cost: { wood: 100, iron: 60, stone: 40 }, time: 50, req: null, trains: ['siege', 'engineer'], hp: 160, cat: 'mil', max: 2, desc: 'يدرّب آلات الحصار والمهندسين' },
  arms:       { name: 'مصنع أسلحة', ico: '⚔️', cost: { wood: 80, iron: 80, stone: 40 }, time: 45, req: null, hp: 140, cat: 'mil', max: 1, desc: '+1 هجوم لكل الوحدات' },
  academy:    { name: 'أكاديمية عسكرية', ico: '🎓', cost: { wood: 100, stone: 100, gold: 150 }, time: 60, req: null, trains: ['elite', 'guard'], hp: 180, cat: 'mil', max: 1, desc: 'يدرّب النخبة والحرس الملكي' },
  fort:       { name: 'قلعة رئيسية', ico: '🏰', cost: { wood: 100, stone: 200, iron: 80 }, time: 80, req: null, hp: 400, shoot: { r: 4, d: 6 }, cat: 'def', max: 1, desc: 'تطلق السهام وتمنح دفاعًا لجنودك على أرضها' },
  tower:      { name: 'برج دفاعي', ico: '🗼', cost: { wood: 40, stone: 50 }, time: 25, req: null, hp: 200, shoot: { r: 3, d: 5 }, cat: 'def', desc: 'يطلق السهام على الأعداء القريبين' },
  research:   { name: 'مركز أبحاث', ico: '🔬', cost: { wood: 80, stone: 60, gold: 100 }, time: 45, req: null, hp: 120, cat: 'sci', max: 1, desc: 'مطلوب لبدء الأبحاث' },
  science:    { name: 'أكاديمية العلوم', ico: '📚', cost: { stone: 80, gold: 150 }, time: 50, req: null, hp: 130, cat: 'sci', max: 1, desc: 'تسرّع الأبحاث بنسبة 20%' },
  command:    { name: 'قاعة القيادة', ico: '🚩', cost: { wood: 60, stone: 60, gold: 100 }, time: 40, req: null, hp: 150, cat: 'sci', max: 1, desc: 'مطلوبة لتجنيد القادة' },
  embassy:    { name: 'سفارة', ico: '🕊️', cost: { wood: 80, gold: 150 }, time: 40, req: null, hp: 130, cat: 'sci', max: 1, desc: 'تفتح السلام والتحالف والجزية' },
  spy:        { name: 'مركز استخبارات', ico: '👁️', cost: { wood: 40, gold: 120 }, time: 30, req: null, hp: 110, cat: 'sci', max: 1, desc: 'يكشف قوة الممالك الأخرى' }
};

const UNITS = {
  infantry:  { name: 'مشاة', g: 'م', hp: 60, atk: 8, def: 3, range: 1, spd: 1.1, vis: 3, cost: { gold: 20, food: 5 }, time: 6, build: 'barracks' },
  spearman:  { name: 'حاملو الرماح', g: 'ق', hp: 70, atk: 7, def: 6, range: 1, spd: 1.0, vis: 3, cost: { gold: 25, wood: 10, food: 5 }, time: 7, build: 'barracks', anti: 'cav' },
  archer:    { name: 'رماة', g: 'ر', hp: 40, atk: 9, def: 1, range: 4, spd: 1.2, vis: 5, cost: { gold: 25, wood: 20, food: 4 }, time: 7, build: 'archery' },
  cavalry:   { name: 'فرسان', g: 'ف', hp: 70, atk: 11, def: 3, range: 1, spd: 2.2, vis: 4, cost: { gold: 45, iron: 10, food: 8 }, time: 10, build: 'stable' },
  heavycav:  { name: 'فرسان ثقيلة', g: 'ث', hp: 110, atk: 14, def: 8, range: 1, spd: 1.8, vis: 4, cost: { gold: 80, iron: 30, food: 10 }, time: 14, build: 'stable', tech: 'mil3' },
  elite:     { name: 'نخبة', g: 'ن', hp: 90, atk: 14, def: 7, range: 1, spd: 1.4, vis: 4, cost: { gold: 90, iron: 40, food: 10 }, time: 16, build: 'academy' },
  guard:     { name: 'الحرس الملكي', g: 'ك', hp: 130, atk: 16, def: 12, range: 1, spd: 1.3, vis: 4, cost: { gold: 150, iron: 60, food: 15 }, time: 24, build: 'academy' },
  engineer:  { name: 'مهندسون', g: 'ه', hp: 45, atk: 2, def: 2, range: 1, spd: 1.2, vis: 3, cost: { gold: 40, iron: 10, food: 6 }, time: 12, build: 'siegeworks', tech: 'mil4', repair: 1 },
  siege:     { name: 'آلة حصار', g: 'ح', hp: 90, atk: 0, def: 2, range: 5, spd: 0.7, vis: 6, cost: { gold: 80, wood: 80, iron: 30 }, time: 20, build: 'siegeworks', tech: 'mil4', siege: 30 },
  scout:     { name: 'استطلاع', g: 'س', hp: 35, atk: 3, def: 0, range: 1, spd: 3.2, vis: 7, cost: { gold: 20, food: 3 }, time: 6, build: 'stable' }
};

const RESEARCH = {
  eco1: { br: 'eco', name: 'محاصيل محسّنة', cost: { gold: 60, stone: 20 }, time: 30, req: [], fx: { farm: 0.25 }, d: 'إنتاج الطعام +25%' },
  eco2: { br: 'eco', name: 'تجارة الطرق', cost: { gold: 100 }, time: 40, req: ['eco1'], fx: { gold: 0.2 }, d: 'الذهب +20%' },
  eco3: { br: 'eco', name: 'تخزين متقدم', cost: { wood: 100, stone: 60 }, time: 45, req: ['eco2'], fx: { cap: 200 }, d: '+200 سعة تخزين' },
  eco4: { br: 'eco', name: 'اقتصاد الحرب', cost: { gold: 200, iron: 40 }, time: 60, req: ['eco3'], fx: { upkeep: -0.3 }, d: 'تكلفة الجيش -30%' },
  mil1: { br: 'mil', name: 'تدريب متقدم', cost: { gold: 60, food: 30 }, time: 30, req: [], fx: { train: -0.25 }, d: 'تدريب أسرع 25%' },
  mil2: { br: 'mil', name: 'تحسين السلاح', cost: { gold: 120, iron: 20 }, time: 40, req: ['mil1'], fx: { atk: 0.1 }, d: 'هجوم الوحدات +10%' },
  mil3: { br: 'mil', name: 'فرسان الحرب', cost: { gold: 180, iron: 60, food: 40 }, time: 55, req: ['mil2'], fx: {}, d: 'يفتح الفرسان الثقيلة' },
  mil4: { br: 'mil', name: 'الهندسة الحربية', cost: { gold: 250, iron: 100, wood: 100 }, time: 70, req: ['mil3'], fx: {}, d: 'يفتح آلات الحصار والمهندسين' },
  def1: { br: 'def', name: 'جدران حجرية', cost: { stone: 80, gold: 50 }, time: 30, req: [], fx: { bhp: 0.25 }, d: 'صحة المباني +25%' },
  def2: { br: 'def', name: 'أبراج متطورة', cost: { stone: 120, iron: 20 }, time: 45, req: ['def1'], fx: { tower: 0.3 }, d: 'ضرر الأبراج +30%' },
  def3: { br: 'def', name: 'دروع', cost: { iron: 80, gold: 100 }, time: 50, req: ['def2'], fx: { def: 2 }, d: 'دفاع الوحدات +2' },
  def4: { br: 'def', name: 'مقاومة الحصار', cost: { stone: 200, iron: 60 }, time: 70, req: ['def3'], fx: { siege: 0.3 }, d: 'المباني تتحمل الحصار أكثر بـ30%' },
  sci1: { br: 'sci', name: 'سرعة البناء', cost: { gold: 70, wood: 40 }, time: 30, req: [], fx: { build: -0.25 }, d: 'البناء أسرع 25%' },
  sci2: { br: 'sci', name: 'الاستخبارات', cost: { gold: 100, stone: 30 }, time: 40, req: ['sci1'], fx: { intel: true }, d: 'ترى قوة الممالك الأخرى' },
  sci3: { br: 'sci', name: 'قيادة الأبطال', cost: { gold: 150, stone: 50 }, time: 50, req: ['sci2'], fx: { leader: -0.3 }, d: 'تجنيد القادة أرخص 30%' },
  sci4: { br: 'sci', name: 'بحث سريع', cost: { gold: 200, stone: 100 }, time: 60, req: ['sci3'], fx: { research: 0.3 }, d: 'الأبحاث أسرع 30%' }
};

const MISSIONS = [
  { id: 'farm', t: 'ابنِ أول مزرعة', c: k => (k.cnt.farm || 0) >= 1 },
  { id: 'land', t: 'امتلك 15 أرضًا', c: k => k.nt >= 15 },
  { id: 'train', t: 'درّب 10 جنود', c: k => k.trained >= 10 },
  { id: 'village', t: 'استولِ على قرية', c: k => k.nv >= 1 },
  { id: 'research', t: 'ابنِ مركز أبحاث', c: k => (k.cnt.research || 0) >= 1 },
  { id: 'tech', t: 'أكمل أول بحث', c: k => k.researched.length >= 1 },
  { id: 'camp', t: 'طهّر معسكرًا لقطاع الطرق', c: k => k.campsCleared >= 1 },
  { id: 'leader', t: 'جنّد قائدًا', c: k => k.leaders.length >= 1 },
  { id: 'kill', t: 'أسقط 10 جنود معادين', c: k => k.kills >= 10 },
  { id: 'wealth', t: 'امتلك 500 ذهب', c: k => k.res.gold >= 500 }
];

/* ---------------- حالة وأدوات ---------------- */
let S = null;
const UI = { tab: 'map', sel: null, units: [], multi: false };
const FX = [];
const cam = { x: 0, y: 0, z: 1.1 };
let CW = 360, CH = 500, DPR = 1;
let toastT = 0, lastInteract = 0, modalOk = null;

const $ = s => document.querySelector(s);
const canvas = $('#map');
const ctx = canvas.getContext('2d');

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];
const rnd = () => Math.random();
const fmt = n => Math.round(n).toLocaleString('ar');
const tileOf = (x, y) => clamp(Math.floor(y), 0, H - 1) * W + clamp(Math.floor(x), 0, W - 1);
const bdef = t => BUILDINGS[t];
const kOf = o => (o >= 0 ? S.k[o] : null);
const mod = o => { const k = kOf(o); return k ? k.m : ZMOD; };
const ownerName = o => (o >= 0 ? KNAME[o] : o === BANDIT ? 'قطاع طرق' : 'محايدة');
const ownerCol = o => (o >= 0 ? KCOL[o] : '#9ca3af');
const fmtTime = t => { const s = Math.floor(t); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const costTxt = c => Object.entries(c).map(([r, v]) => RICO[r] + v).join(' ');
const scaled = (c, f) => { const o = {}; for (const r in c) o[r] = Math.ceil(c[r] * f); return o; };
const canPay = (K, c) => Object.entries(c).every(([r, v]) => K.res[r] >= v);
const pay = (K, c) => { for (const r in c) K.res[r] -= c[r]; };
const addRes = (K, r, v) => { K.res[r] = Math.min(storeCap(K, r), K.res[r] + v); };
const dip = (i, j) => S.dip[i][j];
const setDip = (i, j, v) => { S.dip[i][j] = v; S.dip[j][i] = v; };
const trainsOf = t => (BUILDINGS[t] && BUILDINGS[t].trains) || [];
const B = (label, attrs, dis, cls) => `<button ${cls ? `class="${cls}"` : ''} ${attrs} ${dis ? 'disabled' : ''}>${label}</button>`;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function neighbors(ti) {
  const x = ti % W, y = Math.floor(ti / W), r = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < W && ny < H) r.push(ny * W + nx);
  }
  return r;
}
function tilesOf(o) { const r = []; for (let i = 0; i < S.tiles.length; i++) if (S.tiles[i].o === o) r.push(i); return r; }
function unitById(id) { for (const u of S.units) if (u.id === id && !u.dead) return u; return null; }
function selUnits() { return UI.units.map(unitById).filter(Boolean); }

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
function log(msg, c = '') {
  S.log.push({ t: S.time, m: msg, c });
  if (S.log.length > 200) S.log.shift();
  if (c === 'good' || c === 'bad') toast(msg);
}

function storeCap(K, r) { return 300 + 200 * (K.cnt.warehouse || 0) + (K.m.cap || 0); }
function happyF(h) { return h >= 50 ? 1 : h >= 30 ? 0.85 : h >= 15 ? 0.65 : 0.4; }

function hostile(a, b) {
  if (a === b) return false;
  if (a === BANDIT || b === BANDIT) return true;
  if (a < 0 || b < 0) return false;
  if (!S.k[a].alive || !S.k[b].alive) return false;
  return S.dip[a][b] === 'war';
}

function strength(o) {
  let t = 0;
  for (const u of S.units) {
    if (u.dead || u.o !== o) continue;
    const s = ustat(u);
    t += s.mhp * Math.max(1, s.atk + s.def * 0.5);
  }
  return t;
}

function ustat(u) {
  const d = UNITS[u.t], m = mod(u.o), rm = 1 + 0.12 * u.rank;
  return { mhp: d.hp * rm, atk: d.atk * (1 + m.atk) * rm + m.atkFlat, def: d.def * rm + m.def + m.defFlat };
}
function defOf(v) {
  const st = ustat(v), tl = S.tiles[tileOf(v.x, v.y)];
  let d = st.def + TERRAIN[tl.t].def;
  if (tl.b && tl.b.t === 'fort' && tl.o === v.o) d += 3;
  return d;
}

/* ---------------- إنشاء عالم جديد ---------------- */
function newGame(seed) {
  const R = mulberry32(seed);
  const tiles = [];
  for (let i = 0; i < W * H; i++) tiles.push({ t: 'plain', o: -1, b: null, v: false, camp: false, ruin: false, cp: 0 });

  const blob = (t, n, rmin, rmax, ch) => {
    for (let q = 0; q < n; q++) {
      const cx = R() * W | 0, cy = R() * H | 0, r = rmin + R() * (rmax - rmin);
      for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(H - 1, Math.ceil(cy + r)); y++)
        for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(W - 1, Math.ceil(cx + r)); x++)
          if (Math.hypot(x - cx, y - cy) <= r && R() < ch) tiles[y * W + x].t = t;
    }
  };
  blob('forest', 9, 1.5, 3, 0.7);
  blob('mountain', 6, 1.2, 2.4, 0.8);
  blob('desert', 3, 1.5, 2.5, 0.7);
  for (let q = 0; q < 16; q++) tiles[R() * W * H | 0].t = 'rich';
  for (let r = 0; r < 2; r++) {
    let x = R() * W | 0;
    for (let y = 0; y < H; y++) {
      tiles[y * W + x].t = 'river';
      if (R() < 0.45) x = clamp(x + (R() < 0.5 ? -1 : 1), 0, W - 1);
    }
  }

  const caps = [[3, 3], [W - 4, 3], [3, H - 4], [W - 4, H - 4]];
  for (const [cx, cy] of caps)
    for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++)
      if (Math.hypot(x - cx, y - cy) <= 2.2) tiles[y * W + x].t = 'plain';

  const near = (x, y, r) => caps.some(([cx, cy]) => Math.hypot(x - cx, y - cy) < r);
  const free = f => {
    for (let g = 0; g < 3000; g++) {
      const x = R() * W | 0, y = R() * H | 0, t = tiles[y * W + x];
      if (t.t !== 'river' && !t.v && !t.camp && !t.ruin && t.o === -1 && f(x, y)) return t;
    }
    return null;
  };
  for (let q = 0; q < 8; q++) { const t = free((x, y) => !near(x, y, 5)); if (t) t.v = true; }
  for (let q = 0; q < 5; q++) { const t = free((x, y) => !near(x, y, 8)); if (t) t.camp = true; }
  for (let q = 0; q < 5; q++) { const t = free((x, y) => !near(x, y, 4)); if (t) t.ruin = true; }

  const K = [];
  for (let i = 0; i < 4; i++) {
    const [cx, cy] = caps[i];
    K.push({
      id: i, name: KNAME[i], alive: true, ai: i > 0,
      res: { food: 200, wood: 200, stone: 120, iron: 40, gold: 200 },
      pop: 10, popCap: 10, happy: 60, unhappy: 0,
      researched: [], research: null, leaders: [],
      cap: [cx, cy], aiT: 3 + i * 2, kills: 0, lost: 0, trained: 0, campsCleared: 0,
      offer: null, op: 0, ev: { drought: 0, winter: 0, prosper: 0 },
      m: { ...ZMOD }, cnt: {}, all: {}, nt: 0, nv: 0, nu: 0
    });
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) tiles[y * W + x].o = i;
    tiles[cy * W + cx].b = { t: 'capital', lvl: 1, hp: 600, mhp: 600, left: 0, tot: 0, q: [], cd: 0 };
  }
  const dipM = [];
  for (let i = 0; i < 4; i++) { dipM.push([]); for (let j = 0; j < 4; j++) dipM[i].push(i === j ? 'self' : 'war'); }

  S = {
    seed, time: 0, speed: 1, paused: false, nextEvent: 50, nextId: 1,
    tiles, units: [], k: K, dip: dipM, log: [], over: null,
    missions: MISSIONS.map(m => ({ id: m.id, done: false }))
  };

  for (const k of K) {
    const [cx, cy] = k.cap;
    for (let q = 0; q < 4; q++) spawn(k.id, 'infantry', cx + 1.5 + (rnd() - 0.5), cy + 1.5 + (rnd() - 0.5));
    for (let q = 0; q < 2; q++) spawn(k.id, 'archer', cx - 1.5 + (rnd() - 0.5), cy + 1.5 + (rnd() - 0.5));
  }
  for (let i = 0; i < tiles.length; i++) {
    if (!tiles[i].camp) continue;
    const group = spawnGroup(BANDIT, i, 3, ['infantry', 'archer', 'infantry']);
    for (const u of group) u.home = i;
  }
  log('ابدأ ببناء مملكتك. اسحب الخريطة للتحرك، واضغط على أرضك لعرض خياراتها.');
}

function spawn(o, t, x, y) {
  const d = UNITS[t];
  const u = { id: S.nextId++, o, t, x, y, hp: d.hp, rank: 0, xp: 0, g: 0, tx: null, ty: null, tgt: null, bt: null, chase: false, cd: 0, home: null, dead: false };
  S.units.push(u);
  return u;
}
function spawnGroup(o, ti, n, types) {
  const cx = ti % W + 0.5, cy = Math.floor(ti / W) + 0.5, out = [];
  for (let q = 0; q < n; q++) {
    out.push(spawn(o, types[q % types.length], clamp(cx + (rnd() - 0.5) * 1.5, 0.3, W - 0.3), clamp(cy + (rnd() - 0.5) * 1.5, 0.3, H - 0.3)));
  }
  return out;
}

/* ---------------- حساب المعدلات ---------------- */
function scan() {
  for (const k of S.k) { k.m = { ...ZMOD }; k.cnt = {}; k.all = {}; k.nt = 0; k.nv = 0; k.nu = 0; k.popCap = 10; }
  for (const u of S.units) if (!u.dead && u.o >= 0) S.k[u.o].nu++;
  for (let i = 0; i < S.tiles.length; i++) {
    const tl = S.tiles[i];
    if (tl.o < 0) continue;
    const k = S.k[tl.o];
    k.nt++;
    if (tl.v) k.nv++;
    if (tl.b) {
      const t = tl.b.t;
      k.all[t] = (k.all[t] || 0) + 1;
      if (tl.b.left <= 0) {
        k.cnt[t] = (k.cnt[t] || 0) + 1;
        if (t === 'house') k.popCap += 5 * tl.b.lvl;
      }
    }
  }
  for (const k of S.k) {
    if (!k.alive) continue;
    const m = k.m;
    for (const id of k.researched) {
      const fx = RESEARCH[id].fx;
      for (const key in fx) { if (key === 'intel') m.intel = true; else m[key] += fx[key]; }
    }
    for (const L of k.leaders) {
      const b = L.lvl * RARITY[L.rar].m;
      if (L.spec === 'mil') m.atk += 0.04 * b;
      else if (L.spec === 'eco') { m.gold += 0.04 * b; m.farm += 0.03 * b; }
      else m.def += 0.4 * b;
    }
    m.atkFlat = k.cnt.arms || 0;
    m.defFlat = k.cnt.workshop || 0;
    m.happy = (k.cnt.temple || 0) * 10 + (k.cnt.market || 0) * 5;
    if (k.cnt.spy) m.intel = true;
  }
}

function buildReason(K, ti, type) {
  const d = BUILDINGS[type], tl = S.tiles[ti];
  if (!d || d.cat === 'cap') return 'غير متاح';
  if (tl.o !== K.id) return 'الأرض ليست لك';
  if (tl.b) return 'الأرض مشغولة';
  if (tl.t === 'river') return 'لا يمكن البناء على النهر';
  if (d.req && !d.req.includes(tl.t)) return 'لا يناسب هذه الأرض';
  if (d.max !== undefined && d.max > 0 && (K.all[type] || 0) >= d.max) return 'وصلت للحد الأقصى';
  if (!canPay(K, d.cost)) return 'موارد غير كافية';
  return null;
}
function placeBuilding(K, ti, type) {
  const d = BUILDINGS[type];
  pay(K, d.cost);
  const hp = d.hp * (1 + K.m.bhp);
  const tot = d.time * (1 + K.m.build);
  S.tiles[ti].b = { t: type, lvl: 1, hp, mhp: hp, left: tot, tot, q: [], cd: 0 };
}
function doBuild(ti, type) {
  const K = S.k[PL];
  const why = buildReason(K, ti, type);
  if (why) { toast(why); return; }
  placeBuilding(K, ti, type);
  log(`بدأ بناء ${BUILDINGS[type].name}`, 'good');
}
function doUpgrade(ti) {
  const K = S.k[PL], tl = S.tiles[ti], b = tl.b;
  if (!b || tl.o !== PL) return;
  const d = BUILDINGS[b.t];
  if (b.lvl >= 3 || b.left > 0 || !Object.keys(d.cost).length) { toast('لا يمكن الترقية الآن'); return; }
  const c = scaled(d.cost, 1.2 * b.lvl);
  if (!canPay(K, c)) { toast('موارد غير كافية للترقية'); return; }
  pay(K, c);
  b.lvl++;
  b.tot = d.time * 0.8 * (1 + K.m.build);
  b.left = b.tot;
  b.mhp = d.hp * (1 + K.m.bhp) * (1 + 0.3 * (b.lvl - 1));
  b.hp = b.mhp;
  log(`ترقّى ${d.name} إلى مستوى ${b.lvl}`, 'good');
}
function doDemolish(ti) {
  const K = S.k[PL], tl = S.tiles[ti], b = tl.b;
  if (!b || tl.o !== PL || b.t === 'capital') return;
  addRes(K, 'wood', 0);
  for (const r in BUILDINGS[b.t].cost) addRes(K, r, Math.ceil(BUILDINGS[b.t].cost[r] * 0.3));
  tl.b = null;
  log(`هُدم ${BUILDINGS[b.t].name} واسترجعت 30% من تكلفته`);
}
function doClaim(ti) {
  const K = S.k[PL], tl = S.tiles[ti];
  if (tl.o !== -1 || tl.b) { toast('لا يمكن احتلال هذه الأرض'); return; }
  if (!neighbors(ti).some(n => S.tiles[n].o === PL)) { toast('يجب أن تكون بجوار أرضك'); return; }
  if (!canPay(K, { gold: 30 })) { toast('الذهب غير كافٍ'); return; }
  pay(K, { gold: 30 });
  changeOwner(ti, PL);
  toast('تم احتلال الأرض');
}
function changeOwner(ti, o) {
  const tl = S.tiles[ti], prev = tl.o;
  tl.o = o; tl.cp = 0;
  if (prev === PL && o !== PL) log('خسرت أرضًا لصالح ' + ownerName(o), 'bad');
  if (o === PL && tl.v) log('استوليت على قرية منتجة', 'good');
}

/* ---------------- التدريب والأبحاث والقادة ---------------- */
function trainSite(K, key) {
  for (let i = 0; i < S.tiles.length; i++) {
    const tl = S.tiles[i];
    if (tl.o !== K.id || !tl.b || tl.b.left > 0) continue;
    if (trainsOf(tl.b.t).includes(key) && tl.b.q.length < 5) return i;
  }
  return -1;
}
function hasBuildingFor(K, key) {
  for (const tl of S.tiles) if (tl.o === K.id && tl.b && tl.b.left <= 0 && trainsOf(tl.b.t).includes(key)) return true;
  return false;
}
function trainReason(K, key) {
  const U = UNITS[key];
  if (U.tech && !K.researched.includes(U.tech)) return 'يتطلب بحث: ' + RESEARCH[U.tech].name;
  if (!hasBuildingFor(K, key)) return 'يتطلب: ' + bdef(U.build).name;
  if (!canPay(K, U.cost)) return 'موارد غير كافية';
  if (trainSite(K, key) < 0) return 'طابور التدريب ممتلئ';
  return null;
}
function doTrain(key) {
  const K = S.k[PL];
  const why = trainReason(K, key);
  if (why) { toast(why); return; }
  const si = trainSite(K, key);
  pay(K, UNITS[key].cost);
  S.tiles[si].b.q.push({ u: key, left: UNITS[key].time * (1 + K.m.train) });
}
function researchReason(K, id) {
  const R = RESEARCH[id];
  if (K.researched.includes(id)) return 'مكتمل';
  if (K.research) return 'بحث آخر جارٍ';
  for (const q of R.req) if (!K.researched.includes(q)) return 'يتطلب: ' + RESEARCH[q].name;
  if (!(K.cnt.research > 0)) return 'تحتاج مركز أبحاث';
  if (!canPay(K, R.cost)) return 'موارد غير كافية';
  return null;
}
function doResearch(id) {
  const K = S.k[PL];
  const why = researchReason(K, id);
  if (why) { toast(why); return; }
  pay(K, RESEARCH[id].cost);
  K.research = { id, left: RESEARCH[id].time };
  log('بدأ البحث: ' + RESEARCH[id].name, 'good');
}
function pickWeighted(w) {
  const sum = w.reduce((a, b) => a + b, 0);
  let r = rnd() * sum;
  for (let i = 0; i < w.length; i++) { if (r < w[i]) return i; r -= w[i]; }
  return 0;
}
function doHire() {
  const K = S.k[PL];
  if (!(K.cnt.command > 0)) { toast('تحتاج قاعة قيادة'); return; }
  if (K.leaders.length >= 3) { toast('الحد الأقصى ثلاثة قادة'); return; }
  const rar = pickWeighted([55, 28, 12, 5]);
  const cost = { gold: Math.round(250 * RARITY[rar].m * (1 + K.m.leader)) };
  if (!canPay(K, cost)) { toast('الذهب غير كافٍ لتجنيد قائد'); return; }
  pay(K, cost);
  K.leaders.push({ id: S.nextId++, name: pick(LEADER_NAMES), rar, spec: pick(['mil', 'eco', 'def']), lvl: 1, xp: 0 });
  log(`جُنّد قائد جديد (${RARITY[rar].n})`, 'good');
}

/* ---------------- معادلات الوحدات والقتال ---------------- */
function applyHit(v, raw, srcO, srcU) {
  const dmg = Math.max(1, raw - defOf(v) * 0.5) * (0.85 + rnd() * 0.3);
  v.hp -= dmg;
  if (v.hp <= 0) killUnit(v, srcO, srcU);
  else if (srcO === PL && v.o > 0) S.k[v.o].op = Math.max(-100, S.k[v.o].op - 0.3);
}
function killUnit(v, srcO, srcU) {
  if (v.dead) return;
  v.dead = true; v.hp = 0;
  if (srcO !== undefined && srcO !== null && srcO >= 0) {
    S.k[srcO].kills++;
    for (const L of S.k[srcO].leaders) {
      L.xp++;
      if (L.xp >= L.lvl * 6 && L.lvl < 5) { L.xp = 0; L.lvl++; if (srcO === PL) log(`ارتقى القائد ${L.name} إلى مستوى ${L.lvl}`, 'good'); }
    }
  }
  if (srcU && !srcU.dead && srcU.o >= 0) { srcU.xp++; rankUp(srcU); }
  if (v.o >= 0) S.k[v.o].lost++;
  FX.push({ k: 'boom', x1: v.x, y1: v.y, t: 0.4, c: '#fbbf24' });
}
function rankUp(u) {
  while (u.rank < 3 && u.xp >= RANK_XP[u.rank + 1]) {
    u.rank++;
    if (u.o === PL) log(`ترقّت وحدة ${UNITS[u.t].name} إلى رتبة ${RANKS[u.rank]}`, 'good');
  }
}
function nearestEnemyUnit(u, r) {
  let best = null, bd = r;
  for (const v of S.units) {
    if (v.dead || v === u || !hostile(u.o, v.o)) continue;
    const dd = Math.hypot(v.x - u.x, v.y - u.y);
    if (dd <= bd) { bd = dd; best = v; }
  }
  return best;
}
function nearestEnemyBuilding(u, r) {
  let best = null, bd = r;
  const x0 = Math.max(0, Math.floor(u.x - r)), x1 = Math.min(W - 1, Math.floor(u.x + r));
  const y0 = Math.max(0, Math.floor(u.y - r)), y1 = Math.min(H - 1, Math.floor(u.y + r));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const ti = y * W + x, tl = S.tiles[ti];
    if (!tl.b || !hostile(u.o, tl.o)) continue;
    const dd = Math.hypot(x + 0.5 - u.x, y + 0.5 - u.y);
    if (dd <= bd) { bd = dd; best = ti; }
  }
  return best;
}
function damageBuilding(ti, dmg, srcO) {
  const tl = S.tiles[ti], b = tl.b;
  if (!b) return;
  b.hp -= dmg;
  if (b.hp <= 0) destroyBuilding(ti, srcO);
}
function destroyBuilding(ti, srcO) {
  const tl = S.tiles[ti], b = tl.b;
  if (!b) return;
  const owner = tl.o;
  tl.b = null;
  if (b.t === 'capital') { defeat(owner); return; }
  if (owner === PL) log(`دُمّر ${BUILDINGS[b.t].name} في أرضك`, 'bad');
  else if (srcO === PL) log(`دمّرت ${BUILDINGS[b.t].name} لدى ${KNAME[owner]}`, 'good');
}
function defeat(o) {
  const k = S.k[o];
  if (!k.alive) return;
  k.alive = false;
  for (const tl of S.tiles) if (tl.o === o) { tl.o = -1; tl.b = null; tl.cp = 0; }
  for (const u of S.units) if (u.o === o) u.dead = true;
  if (o === PL) log('سقطت عاصمتك! انتهت مملكتك', 'bad');
  else log(`سقطت عاصمة ${KNAME[o]}!`, 'good');
}

function moveTo(u, mx, my, dt) {
  const dx = mx - u.x, dy = my - u.y, dist = Math.hypot(dx, dy);
  if (dist < 0.02) return;
  const d = UNITS[u.t];
  const tm = TERRAIN[S.tiles[tileOf(u.x, u.y)].t].move;
  let sp = (d.spd / tm) * dt;
  if (sp > dist) sp = dist;
  u.x += dx / dist * sp;
  u.y += dy / dist * sp;
}

function fire(u, tu, tb) {
  const d = UNITS[u.t], st = ustat(u);
  if (tu) {
    if (st.atk <= 0) return;
    let raw = st.atk;
    if (d.anti === 'cav' && (tu.t === 'cavalry' || tu.t === 'heavycav')) raw *= 1.5;
    FX.push({ k: 'shot', x1: u.x, y1: u.y, x2: tu.x, y2: tu.y, t: 0.25, c: ownerCol(u.o) });
    applyHit(tu, raw, u.o, u);
  } else if (tb !== null) {
    const tl = S.tiles[tb];
    if (!tl.b) return;
    let raw = d.siege ? d.siege : Math.max(1, st.atk * 0.5);
    const resist = tl.o >= 0 ? S.k[tl.o].m.siege : 0;
    raw *= (1 - resist) * (0.85 + rnd() * 0.3);
    FX.push({ k: 'hitb', x1: u.x, y1: u.y, x2: tb % W + 0.5, y2: Math.floor(tb / W) + 0.5, t: 0.25, c: ownerCol(u.o) });
    damageBuilding(tb, raw, u.o);
  }
}

function repairNear(u, dt) {
  let best = -1, bd = 3;
  const cx = Math.floor(u.x), cy = Math.floor(u.y);
  for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const tl = S.tiles[y * W + x];
    if (tl.b && tl.o === u.o && tl.b.hp < tl.b.mhp) {
      const dd = Math.hypot(x + 0.5 - u.x, y + 0.5 - u.y);
      if (dd < bd) { bd = dd; best = y * W + x; }
    }
  }
  if (best >= 0) { const b = S.tiles[best].b; b.hp = Math.min(b.mhp, b.hp + 10 * dt); }
}

function unitsStep(dt) {
  const U = S.units;
  for (const u of U) if (u.cd > 0) u.cd -= dt;

  for (const u of U) {
    if (u.dead) continue;
    if (u.tgt !== null) {
      const t = unitById(u.tgt);
      if (!t || !hostile(u.o, t.o)) { u.tgt = null; u.chase = false; }
    }
    if (u.bt !== null) {
      const tl = S.tiles[u.bt];
      if (!tl.b || !hostile(u.o, tl.o)) u.bt = null;
    }
  }

  for (const u of U) {
    if (u.dead) continue;
    const d = UNITS[u.t];
    const idle = u.tx === null;
    const acq = idle ? d.vis : d.range + 0.5;

    if (u.tgt === null && u.bt === null) {
      const e = d.atk > 0 ? nearestEnemyUnit(u, acq) : null;
      if (e) { u.tgt = e.id; u.chase = idle; }
      else if (d.atk > 0 || d.siege) {
        const bi = nearestEnemyBuilding(u, acq);
        if (bi !== null) { u.bt = bi; u.chase = idle; }
      }
    }

    let ex = null, ey = null, tu = null, tb = null;
    if (u.tgt !== null) { tu = unitById(u.tgt); if (tu) { ex = tu.x; ey = tu.y; } }
    else if (u.bt !== null) { tb = u.bt; ex = tb % W + 0.5; ey = Math.floor(tb / W) + 0.5; }
    const inRange = ex !== null && Math.hypot(ex - u.x, ey - u.y) <= d.range + 0.4;

    if (inRange && u.cd <= 0) { fire(u, tu, tb); u.cd = d.range > 1 ? 1.2 : 1.0; }

    let mx = null, my = null;
    if (u.tx !== null) { mx = u.tx; my = u.ty; }
    else if (u.chase && ex !== null) { mx = ex; my = ey; }
    else if (u.o === BANDIT && u.home !== null && u.tgt === null && u.bt === null) {
      mx = u.home % W + 0.5; my = Math.floor(u.home / W) + 0.5;
    }
    if (mx !== null && !(u.tx === null && inRange)) moveTo(u, mx, my, dt);
    if (u.tx !== null && Math.hypot(u.tx - u.x, u.ty - u.y) < 0.12) { u.tx = null; u.ty = null; }
    if (d.repair && u.o >= 0) repairNear(u, dt);
  }
  S.units = S.units.filter(u => !u.dead);
}

function buildingsStep(dt) {
  for (let ti = 0; ti < S.tiles.length; ti++) {
    const tl = S.tiles[ti], b = tl.b;
    if (!b || b.left > 0 || tl.o < 0) continue;
    const sh = BUILDINGS[b.t].shoot;
    if (!sh) continue;
    b.cd = (b.cd || 0) - dt;
    if (b.cd > 0) continue;
    const cx = ti % W + 0.5, cy = Math.floor(ti / W) + 0.5;
    let best = null, bd = sh.r;
    for (const v of S.units) {
      if (v.dead || !hostile(tl.o, v.o)) continue;
      const dd = Math.hypot(v.x - cx, v.y - cy);
      if (dd <= bd) { bd = dd; best = v; }
    }
    if (best) {
      b.cd = 1.2;
      const raw = sh.d * (b.t === 'tower' ? 1 + S.k[tl.o].m.tower : 1);
      FX.push({ k: 'shot', x1: cx, y1: cy, x2: best.x, y2: best.y, t: 0.3, c: KCOL[tl.o] });
      applyHit(best, raw, tl.o, null);
    }
  }
}

function claimStep(dt) {
  for (const u of S.units) {
    if (u.dead || u.o < 0 || u.tx !== null) continue;
    const ti = tileOf(u.x, u.y), tl = S.tiles[ti];
    if (tl.o === u.o || tl.b) continue;
    if (tl.o >= 0 && !hostile(u.o, tl.o)) continue;
    if (S.units.some(v => !v.dead && v !== u && hostile(u.o, v.o) && Math.hypot(v.x - u.x, v.y - u.y) < 1.2)) continue;
    tl.cp += dt;
    if (tl.cp >= 3) changeOwner(ti, u.o);
  }
}

function reward(o) {
  const K = S.k[o], r = rnd();
  if (r < 0.4) addRes(K, 'gold', 120);
  else if (r < 0.7) { addRes(K, 'iron', 40); addRes(K, 'stone', 40); }
  else {
    for (const v of S.units) if (!v.dead && v.o === o) { v.xp += 4; rankUp(v); }
  }
  if (o === PL) log('عثرت على أطلال وحصلت على مكافأة', 'good');
}
function ruinCampStep() {
  for (let i = 0; i < S.tiles.length; i++) {
    const tl = S.tiles[i];
    if (!tl.ruin && !tl.camp) continue;
    const cx = i % W + 0.5, cy = Math.floor(i / W) + 0.5;
    if (tl.ruin) {
      const u = S.units.find(v => !v.dead && v.o >= 0 && Math.hypot(v.x - cx, v.y - cy) < 0.6);
      if (u) { tl.ruin = false; reward(u.o); }
    }
    if (tl.camp) {
      const bandits = S.units.filter(v => !v.dead && v.o === BANDIT && Math.hypot(v.x - cx, v.y - cy) < 3.5).length;
      if (bandits === 0) {
        tl.camp = false;
        const near = S.units.find(v => !v.dead && v.o === PL && Math.hypot(v.x - cx, v.y - cy) < 4);
        if (near) {
          addRes(S.k[PL], 'gold', 100);
          S.k[PL].campsCleared++;
          log('طهّرت معسكرًا لقطاع الطرق وغنمت 100 ذهب', 'good');
        }
      }
    }
  }
}

/* ---------------- الاقتصاد ---------------- */
function rebel(K) {
  const cands = [];
  for (let i = 0; i < S.tiles.length; i++) if (S.tiles[i].o === K.id && !S.tiles[i].b) cands.push(i);
  if (!cands.length) return;
  S.tiles[pick(cands)].o = -1;
  if (K.id === PL) log('تمرّد السكان في منطقة فخسرت السيطرة عليها', 'bad');
}
function produce(K, dt) {
  const m = K.m, ev = K.ev, hF = happyF(K.happy);
  const add = { food: 0, wood: 0, stone: 0, iron: 0, gold: 0 };
  for (let i = 0; i < S.tiles.length; i++) {
    const tl = S.tiles[i];
    if (tl.o !== K.id) continue;
    if (tl.v) { add.food += 0.3 * dt; add.gold += 0.2 * dt; }
    const b = tl.b;
    if (!b || b.left > 0) continue;
    const d = BUILDINGS[b.t];
    if (!d.prod) continue;
    const bon = TERRAIN[tl.t].bonus[b.t] || 1;
    for (const r in d.prod) {
      let v = d.prod[r] * b.lvl * bon * hF * dt;
      if (r === 'food') v *= (1 + m.farm) * (ev.drought > 0 ? 0.5 : 1);
      if (r === 'gold') v *= (1 + m.gold) * (ev.prosper > 0 ? 1.3 : 1);
      add[r] += v;
    }
  }
  const wint = ev.winter > 0 ? 2 : 1;
  add.gold += K.pop * 0.04 * hF * dt - K.nu * 0.02 * (1 + m.upkeep) * dt;
  add.food -= (K.pop + K.nu * 0.6) * 0.05 * wint * dt;
  for (const r of RES) K.res[r] = clamp(K.res[r] + add[r], 0, storeCap(K, r));

  if (K.res.food > 0) { if (K.pop < K.popCap) K.pop = Math.min(K.popCap, K.pop + 0.3 * dt); }
  else K.pop = Math.max(1, K.pop - 0.5 * dt);

  let tgt = 55 + m.happy + (ev.prosper > 0 ? 5 : 0) - (ev.drought > 0 ? 10 : 0) - (K.res.food <= 0 ? 25 : 0) - Math.min(30, K.nu / (K.pop + 5) * 40);
  tgt = clamp(tgt, 0, 100);
  K.happy += clamp(tgt - K.happy, -2 * dt, 2 * dt);
  if (K.happy < 15) { K.unhappy += dt; if (K.unhappy >= 25) { K.unhappy = 0; rebel(K); } }
  else K.unhappy = Math.max(0, K.unhappy - dt);
  for (const e of ['drought', 'winter', 'prosper']) if (ev[e] > 0) ev[e] = Math.max(0, ev[e] - dt);
}
function constructionStep(dt) {
  for (let i = 0; i < S.tiles.length; i++) {
    const tl = S.tiles[i], b = tl.b;
    if (!b || b.left <= 0) continue;
    b.left -= dt;
    if (b.left <= 0) {
      b.left = 0;
      if (tl.o === PL) log(`اكتمل بناء ${bdef(b.t).name}`, 'good');
    }
  }
}
function trainStep(dt) {
  for (let i = 0; i < S.tiles.length; i++) {
    const tl = S.tiles[i], b = tl.b;
    if (!b || b.left > 0 || !b.q.length || tl.o < 0) continue;
    const head = b.q[0];
    head.left -= dt;
    if (head.left <= 0) {
      b.q.shift();
      spawn(tl.o, head.u, i % W + 0.5 + (rnd() - 0.5) * 0.6, Math.floor(i / W) + 0.5 + (rnd() - 0.5) * 0.6);
      S.k[tl.o].trained++;
    }
  }
}
function researchStep(dt) {
  for (const K of S.k) {
    if (!K.alive || !K.research || !(K.cnt.research > 0)) continue;
    K.research.left -= dt * (1 + K.m.research + (K.cnt.science ? 0.2 : 0));
    if (K.research.left <= 0) {
      const id = K.research.id;
      K.researched.push(id);
      K.research = null;
      if (K.id === PL) log('اكتمل البحث: ' + RESEARCH[id].name, 'good');
    }
  }
}

/* ---------------- الأحداث والمهام ---------------- */
function runEvent() {
  const K = S.k[PL];
  if (!K.alive) return;
  const mine = tilesOf(PL);
  const r = rnd();
  if (r < 0.14) {
    if (!mine.length) return;
    spawnGroup(BANDIT, pick(mine), 3, ['infantry', 'archer']);
    K.res.gold = Math.max(0, K.res.gold - 25);
    log('غارة قطاع طرق قرب أرضك! خسرت بعض الذهب', 'bad');
  } else if (r < 0.28) {
    addRes(K, 'gold', 150); addRes(K, 'wood', 50);
    log('وصلت قافلة تجارية نادرة: ذهب وخشب إضافيان', 'good');
  } else if (r < 0.40) {
    const cand = mine.filter(i => S.tiles[i].t === 'mountain' && !S.tiles[i].b);
    if (cand.length) { addRes(K, 'iron', 40); log('اكتشفت منجمًا جديدًا: حديد إضافي', 'good'); }
    else { addRes(K, 'stone', 60); log('عثر عمالك على حجر إضافي', 'good'); }
  } else if (r < 0.50) {
    K.ev.drought = 40;
    K.res.food = Math.max(0, K.res.food - 60);
    log('جفاف يضرب المحاصيل! إنتاج الطعام منخفض لفترة', 'bad');
  } else if (r < 0.60) {
    K.ev.winter = 40;
    log('شتاء قاسٍ! الطعام يُستهلك بسرعة أكبر', 'bad');
  } else if (r < 0.68) {
    K.happy = Math.max(0, K.happy - 15);
    log('اضطرابات شعبية وانخفضت المعنويات', 'bad');
  } else if (r < 0.76) {
    const near = [];
    const cx = K.cap[0], cy = K.cap[1];
    for (let i = 0; i < S.tiles.length; i++) {
      const tl = S.tiles[i];
      if (tl.o === -1 && !tl.b && tl.t !== 'river' && Math.hypot(i % W - cx, Math.floor(i / W) - cy) < 8) near.push(i);
    }
    if (near.length) { spawnGroup(BANDIT, pick(near), 4, ['infantry', 'archer', 'infantry', 'cavalry']); log('ظهر جيش غازٍ قرب حدودك!', 'bad'); }
  } else if (r < 0.86) {
    const cands = [];
    const cx = K.cap[0], cy = K.cap[1];
    for (let i = 0; i < S.tiles.length; i++) {
      const tl = S.tiles[i];
      if (tl.o === -1 && !tl.b && !tl.ruin && tl.t !== 'river' && Math.hypot(i % W - cx, Math.floor(i / W) - cy) < 7) cands.push(i);
    }
    if (cands.length) { S.tiles[pick(cands)].ruin = true; log('اكتُشفت أطلال قديمة قرب مملكتك', 'good'); }
  } else {
    addRes(K, 'food', 80);
    K.ev.prosper = 30;
    log('موسم حصاد وفير: طعام إضافي وازدهار تجاري', 'good');
  }
}
function eventStep() {
  if (S.time >= S.nextEvent) {
    S.nextEvent = S.time + 50 + rnd() * 50;
    runEvent();
  }
}
function missionStep() {
  const K = S.k[PL];
  if (!K.alive) return;
  for (const m of S.missions) {
    if (m.done) continue;
    const def = MISSIONS.find(x => x.id === m.id);
    if (def.c(K)) {
      m.done = true;
      addRes(K, 'gold', 100); addRes(K, 'stone', 50); addRes(K, 'iron', 20);
      log('أكملت المهمة: ' + def.t, 'good');
    }
  }
}
function checkOver() {
  if (S.over) return;
  if (!S.k[PL].alive) { S.over = { win: false }; showOver(); }
  else if (S.k.slice(1).every(k => !k.alive)) { S.over = { win: true }; showOver(); }
}

/* ---------------- الذكاء الاصطناعي ---------------- */
function aiThink(k) {
  aiBuild(k);
  aiTrain(k);
  aiDiplo(k);
  aiArmy(k);
}
function aiBuild(K) {
  if (rnd() < 0.35) return;
  const order = ['farm', 'house', 'barracks', 'lumber', 'quarry', 'market', 'archery', 'stable', 'warehouse', 'tower', 'workshop', 'research', 'temple', 'command', 'academy', 'embassy', 'fort', 'siegeworks', 'arms', 'science', 'spy', 'iron_mine', 'gold_mine'];
  const list = order.slice();
  if (K.res.food < 120) list.unshift('farm');
  if (K.pop >= K.popCap - 3) list.unshift('house');
  for (const type of list) {
    if (!canPay(K, BUILDINGS[type].cost)) continue;
    const sites = [];
    for (let i = 0; i < S.tiles.length; i++) if (!buildReason(K, i, type)) sites.push(i);
    if (sites.length) { placeBuilding(K, pick(sites), type); return; }
  }
}
function aiTrain(K) {
  const pool = ['infantry', 'infantry', 'archer', 'spearman', 'cavalry', 'archer', 'infantry', 'scout', 'heavycav', 'elite', 'engineer', 'siege', 'guard'];
  for (let q = 0; q < 2; q++) {
    const key = pick(pool);
    if (trainReason(K, key)) continue;
    const si = trainSite(K, key);
    pay(K, UNITS[key].cost);
    S.tiles[si].b.q.push({ u: key, left: UNITS[key].time * (1 + K.m.train) });
  }
}
function aiDiplo(K) {
  const pl = S.k[PL];
  const st = dip(K.id, PL);
  const myS = strength(K.id), plS = strength(PL);
  if (st === 'war' && pl.alive && myS < plS * 0.6 && !K.offer && rnd() < 0.12) K.offer = { type: 'nap', exp: S.time + 90 };
  if (st === 'nap' && !K.offer && rnd() < 0.06) K.offer = { type: 'peace', exp: S.time + 90 };
  if (st === 'peace' && !K.offer && rnd() < 0.04) K.offer = { type: 'alliance', exp: S.time + 90 };
  if (K.offer && S.time > K.offer.exp) K.offer = null;
  if (st !== 'war' && pl.alive && myS > plS * 1.8 && rnd() < 0.02) {
    setDip(K.id, PL, 'war');
    log(`نقضت ${K.name} اتفاقيتها معك وأعلنت الحرب!`, 'bad');
  }
  for (const j of [1, 2, 3]) {
    if (j === K.id || !S.k[j].alive || rnd() > 0.004) continue;
    const s = dip(K.id, j);
    if (s === 'war' && myS < strength(j) * 1.2 && rnd() < 0.5) setDip(K.id, j, 'nap');
    else if (s !== 'war' && rnd() < 0.5) setDip(K.id, j, 'war');
  }
}
function aiArmy(K) {
  const idle = S.units.filter(u => !u.dead && u.o === K.id && u.tx === null && u.tgt === null && u.bt === null);
  if (idle.length < 3) return;
  const [cx, cy] = K.cap;
  let threat = null, bd = 6;
  for (const v of S.units) {
    if (v.dead || !hostile(K.id, v.o)) continue;
    const dd = Math.hypot(v.x - cx, v.y - cy);
    if (dd < bd) { bd = dd; threat = v; }
  }
  if (threat) { for (const u of idle) { u.tgt = threat.id; u.chase = true; } return; }

  const myS = strength(K.id);
  const ownSet = new Set(tilesOf(K.id));
  const adj = ti => neighbors(ti).some(n => ownSet.has(n));
  const neutral = [];
  for (let i = 0; i < S.tiles.length; i++) {
    const tl = S.tiles[i];
    if (tl.o === -1 && !tl.b && tl.t !== 'river' && (adj(i) || tl.camp)) neutral.push(i);
  }
  const enemyC = [];
  for (let e = 0; e < 4; e++) {
    if (e === K.id || !S.k[e].alive || !hostile(K.id, e)) continue;
    if (myS < strength(e) * 1.2) continue;
    for (const ti of tilesOf(e)) if (adj(ti)) enemyC.push(ti);
  }
  let target = null, attack = false;
  if (enemyC.length && rnd() < 0.5) { target = pick(enemyC); attack = true; }
  else if (neutral.length) target = pick(neutral);
  else if (enemyC.length) { target = pick(enemyC); attack = true; }
  if (target === null) return;

  const tx = target % W + 0.5, ty = Math.floor(target / W) + 0.5;
  const tl = S.tiles[target];
  for (const u of idle) {
    if (attack && tl.b && hostile(K.id, tl.o)) { u.bt = target; u.chase = true; }
    else { u.tx = clamp(tx + (rnd() - 0.5) * 0.8, 0.3, W - 0.3); u.ty = clamp(ty + (rnd() - 0.5) * 0.8, 0.3, H - 0.3); u.tgt = null; u.bt = null; u.chase = false; }
  }
}
function aiStep(dt) {
  for (const K of S.k) {
    if (!K.ai || !K.alive) continue;
    K.aiT -= dt;
    if (K.aiT <= 0) { K.aiT = 6 + rnd() * 4; aiThink(K); }
  }
}

/* ---------------- دبلوماسية اللاعب ---------------- */
function diploAct(j, kind) {
  const K = S.k[PL], A = S.k[j];
  if (!A.alive) return;
  const st = dip(PL, j), emb = (K.cnt.embassy || 0) > 0;
  const pw = strength(PL), aw = strength(j);
  if ((kind === 'peace' || kind === 'alliance' || kind === 'tribute') && !emb) { toast('تحتاج سفارة'); return; }
  if (kind === 'nap') {
    if (st !== 'war') { toast('العلاقة أعلى من ذلك'); return; }
    if (rnd() < 0.3 + A.op / 150) { setDip(PL, j, 'nap'); A.op += 5; log(`وافقت ${A.name} على عدم الاعتداء`, 'good'); }
    else { A.op -= 3; log(`رفضت ${A.name} عرض عدم الاعتداء`); }
  } else if (kind === 'peace') {
    if (st !== 'nap') { toast('تحتاج أولًا اتفاق عدم اعتداء'); return; }
    if (rnd() < 0.25 + A.op / 150) { setDip(PL, j, 'peace'); A.op += 8; log(`تم توقيع السلام مع ${A.name}`, 'good'); }
    else { A.op -= 3; log(`رفضت ${A.name} طلب السلام`); }
  } else if (kind === 'alliance') {
    if (st !== 'peace') { toast('تحتاج أولًا سلامًا'); return; }
    if (A.op >= 20 && rnd() < 0.6) { setDip(PL, j, 'alliance'); A.op += 10; log(`تحالفت معك ${A.name}`, 'good'); }
    else { A.op -= 2; log(`ترفض ${A.name} التحالف الآن`); }
  } else if (kind === 'tribute') {
    if (!canPay(K, { gold: 100 })) { toast('الذهب غير كافٍ'); return; }
    pay(K, { gold: 100 });
    A.op += 15;
    log(`دفعت جزية إلى ${A.name}`);
    if (st === 'war' && rnd() < 0.3) { setDip(PL, j, 'nap'); log(`قبلت ${A.name} الجزية وأوقفت الحرب مؤقتًا`, 'good'); }
  } else if (kind === 'ultimatum') {
    if (pw > aw * 1.2) {
      if (st === 'war') setDip(PL, j, 'nap');
      A.op -= 10;
      log(`رضخت ${A.name} لإنذارك`, 'good');
    } else { A.op -= 15; log(`تجاهلت ${A.name} إنذارك`, 'bad'); }
  } else if (kind === 'war') {
    setDip(PL, j, 'war');
    A.op = Math.max(-100, A.op - 25);
    log(`أعلنت الحرب على ${A.name}`, 'bad');
  }
}
function answerOffer(j, yes) {
  const A = S.k[j];
  if (!A.offer) return;
  const t = A.offer.type;
  A.offer = null;
  if (yes) { setDip(PL, j, t); A.op += 10; log(`${A.name} قبلت اقتراحك`, 'good'); }
  else A.op -= 5;
}

/* ---------------- أوامر اللاعب ---------------- */
function cmdMove(list, gx, gy) {
  list.forEach((u, k) => {
    const ox = ((k % 4) - 1.5) * 0.35, oy = (Math.floor(k / 4) - 0.5) * 0.35;
    u.tx = clamp(gx + ox, 0.3, W - 0.3);
    u.ty = clamp(gy + oy, 0.3, H - 0.3);
    u.tgt = null; u.bt = null; u.chase = false;
  });
}
function cmdAttackB(list, ti) {
  for (const u of list) { u.bt = ti; u.chase = true; u.tgt = null; u.tx = null; u.ty = null; }
  toast('أمر هجوم على المبنى');
}
function cmdAttackUnit(list, target) {
  for (const u of list) { u.tgt = target.id; u.chase = true; u.bt = null; u.tx = null; u.ty = null; }
  toast('أمر هجوم');
}
function setGroup(n) {
  const list = selUnits().filter(u => u.o === PL);
  for (const u of S.units) if (!u.dead && u.o === PL && u.g === n) u.g = 0;
  for (const u of list) u.g = n;
}

/* ---------------- الرسم ---------------- */
function resize() {
  const r = canvas.parentElement.getBoundingClientRect();
  DPR = Math.min(2, window.devicePixelRatio || 1);
  CW = Math.max(100, r.width);
  CH = Math.max(100, r.height);
  canvas.width = Math.round(CW * DPR);
  canvas.height = Math.round(CH * DPR);
  clampCam();
}
function clampCam() {
  cam.z = clamp(cam.z, 0.5, 2.6);
  const mw = W * TILE, mh = H * TILE, vw = CW / cam.z, vh = CH / cam.z;
  cam.x = vw >= mw ? (mw - vw) / 2 : clamp(cam.x, 0, mw - vw);
  cam.y = vh >= mh ? (mh - vh) / 2 : clamp(cam.y, 0, mh - vh);
}
function centerOn(gx, gy) {
  cam.x = gx * TILE - CW / (2 * cam.z);
  cam.y = gy * TILE - CH / (2 * cam.z);
  clampCam();
}
function zoomAt(sx, sy, f) {
  const wx = sx / cam.z + cam.x, wy = sy / cam.z + cam.y;
  cam.z *= f;
  clampCam();
  cam.x = wx - sx / cam.z;
  cam.y = wy - sy / cam.z;
  clampCam();
}

function drawTile(x, y) {
  const ti = y * W + x, tl = S.tiles[ti], T = TERRAIN[tl.t];
  const px = x * TILE, py = y * TILE;
  ctx.fillStyle = T.c;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  if (tl.t === 'forest') {
    ctx.beginPath();
    ctx.arc(px + TILE * 0.3, py + TILE * 0.4, TILE * 0.2, 0, 6.3);
    ctx.arc(px + TILE * 0.7, py + TILE * 0.62, TILE * 0.18, 0, 6.3);
    ctx.fill();
  } else if (tl.t === 'mountain') {
    ctx.fillStyle = '#5f5c58';
    ctx.beginPath();
    ctx.moveTo(px + TILE * 0.1, py + TILE * 0.88);
    ctx.lineTo(px + TILE * 0.5, py + TILE * 0.15);
    ctx.lineTo(px + TILE * 0.9, py + TILE * 0.88);
    ctx.fill();
  } else if (tl.t === 'river') {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2 / cam.z;
    ctx.beginPath();
    ctx.moveTo(px + 4, py + TILE * 0.35);
    ctx.quadraticCurveTo(px + TILE * 0.5, py + TILE * 0.2, px + TILE - 4, py + TILE * 0.35);
    ctx.moveTo(px + 4, py + TILE * 0.7);
    ctx.quadraticCurveTo(px + TILE * 0.5, py + TILE * 0.55, px + TILE - 4, py + TILE * 0.7);
    ctx.stroke();
  } else if (tl.t === 'desert') {
    ctx.fillStyle = 'rgba(120,90,30,0.3)';
    for (let q = 0; q < 4; q++) ctx.fillRect(px + 6 + ((x * 7 + q * 13) % 30), py + 6 + ((y * 5 + q * 11) % 30), 3, 3);
  } else if (tl.t === 'rich') {
    ctx.fillStyle = '#eaffb0';
    ctx.beginPath();
    ctx.moveTo(px + TILE / 2, py + TILE * 0.2);
    ctx.lineTo(px + TILE * 0.7, py + TILE / 2);
    ctx.lineTo(px + TILE / 2, py + TILE * 0.8);
    ctx.lineTo(px + TILE * 0.3, py + TILE / 2);
    ctx.fill();
  }
  if (tl.o >= 0) { ctx.fillStyle = KCOL[tl.o] + '40'; ctx.fillRect(px, py, TILE, TILE); }
  ctx.strokeStyle = tl.o >= 0 ? KCOL[tl.o] : 'rgba(0,0,0,0.25)';
  ctx.lineWidth = (tl.o >= 0 ? 2 : 1) / cam.z;
  ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
  if (tl.v || tl.camp || tl.ruin) {
    ctx.font = `${TILE * 0.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tl.camp ? '⛺' : tl.ruin ? '🏛️' : '🏘️', px + TILE / 2, py + TILE / 2);
  }
  if (UI.sel === ti) {
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3 / cam.z;
    ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
  }
}
function drawBuilding(x, y) {
  const ti = y * W + x, tl = S.tiles[ti], b = tl.b;
  if (!b) return;
  const d = bdef(b.t);
  const px = x * TILE, py = y * TILE, s = TILE * 0.72, o = px + (TILE - s) / 2, p = py + (TILE - s) / 2;
  ctx.fillStyle = b.left > 0 ? '#44403c' : '#1f2937';
  ctx.fillRect(o, p, s, s);
  ctx.strokeStyle = ownerCol(tl.o);
  ctx.lineWidth = 2 / cam.z;
  ctx.strokeRect(o, p, s, s);
  ctx.font = `${TILE * 0.45}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(d.ico, px + TILE / 2, py + TILE / 2);
  if (b.left > 0) {
    const frac = 1 - b.left / (b.tot || 1);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(o, p + s + 2 / cam.z, s * frac, 4 / cam.z);
  }
  if (b.lvl > 1) {
    ctx.fillStyle = '#fde047';
    ctx.font = `${TILE * 0.2}px sans-serif`;
    ctx.fillText('★'.repeat(b.lvl - 1), px + TILE / 2, py + TILE * 0.92);
  }
  if (b.hp < b.mhp) {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(o, p - 5 / cam.z, s, 3 / cam.z);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(o, p - 5 / cam.z, s * clamp(b.hp / b.mhp, 0, 1), 3 / cam.z);
  }
}
function drawUnits() {
  for (const u of S.units) {
    if (u.dead) continue;
    const sel = UI.units.includes(u.id);
    const px = u.x * TILE, py = u.y * TILE, r = TILE * 0.27;
    if (sel && u.tx !== null) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.setLineDash([4 / cam.z, 4 / cam.z]);
      ctx.lineWidth = 1.5 / cam.z;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(u.tx * TILE, u.ty * TILE);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = u.o < 0 ? '#6b7280' : KCOL[u.o];
    ctx.fill();
    ctx.lineWidth = (sel ? 3 : 1.5) / cam.z;
    ctx.strokeStyle = sel ? '#fff' : '#0f172a';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${TILE * 0.28}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(UNITS[u.t].g, px, py);
    const f = clamp(u.hp / ustat(u).mhp, 0, 1);
    ctx.fillStyle = '#111';
    ctx.fillRect(px - r, py - r - 5 / cam.z, r * 2, 3 / cam.z);
    ctx.fillStyle = f > 0.5 ? '#22c55e' : '#ef4444';
    ctx.fillRect(px - r, py - r - 5 / cam.z, r * 2 * f, 3 / cam.z);
    if (u.rank > 0) {
      ctx.fillStyle = '#fde047';
      ctx.font = `${TILE * 0.2}px sans-serif`;
      ctx.fillText('★'.repeat(u.rank), px, py + r + TILE * 0.17);
    }
  }
}
function drawFx(dtReal) {
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i];
    f.t -= dtReal;
    if (f.t <= 0) { FX.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, f.t * 4);
    if (f.k === 'boom') {
      ctx.fillStyle = f.c;
      ctx.beginPath();
      ctx.arc(f.x1 * TILE, f.y1 * TILE, TILE * (0.2 + 0.5 * (0.4 - f.t)), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = f.c;
      ctx.lineWidth = (f.k === 'hitb' ? 3 : 2) / cam.z;
      ctx.beginPath();
      ctx.moveTo(f.x1 * TILE, f.y1 * TILE);
      ctx.lineTo(f.x2 * TILE, f.y2 * TILE);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
function draw(dtReal) {
  const z = cam.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#070d18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(DPR * z, 0, 0, DPR * z, -cam.x * z * DPR, -cam.y * z * DPR);
  const x0 = Math.max(0, Math.floor(cam.x / TILE) - 1), y0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const x1 = Math.min(W - 1, Math.floor((cam.x + CW / z) / TILE) + 1), y1 = Math.min(H - 1, Math.floor((cam.y + CH / z) / TILE) + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) drawTile(x, y);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) drawBuilding(x, y);
  drawUnits();
  drawFx(dtReal);
}

/* ---------------- المدخلات على الخريطة ---------------- */
const ptrs = new Map();
let downAt = null, moved = false, pinch0 = 0;
const rect = () => canvas.getBoundingClientRect();
function pinchDist() { const a = [...ptrs.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }

function onTap(sx, sy) {
  const wx = sx / cam.z + cam.x, wy = sy / cam.z + cam.y;
  const gx = wx / TILE, gy = wy / TILE;
  if (gx < 0 || gy < 0 || gx >= W || gy >= H) return;
  const ti = tileOf(gx, gy);
  let hit = null, bd = 0.55;
  for (const u of S.units) {
    if (u.dead) continue;
    const dd = Math.hypot(u.x - gx, u.y - gy);
    if (dd < bd) { bd = dd; hit = u; }
  }
  if (hit) {
    if (hit.o === PL) {
      if (UI.multi) {
        const i = UI.units.indexOf(hit.id);
        if (i >= 0) UI.units.splice(i, 1); else UI.units.push(hit.id);
      } else UI.units = [hit.id];
      UI.sel = ti; UI.tab = 'map';
    } else if (UI.units.length) {
      cmdAttackUnit(selUnits().filter(u => u.o === PL), hit);
    } else { UI.sel = ti; UI.tab = 'map'; }
    return;
  }
  if (UI.units.length) {
    const tl = S.tiles[ti];
    const list = selUnits().filter(u => u.o === PL);
    if (tl.b && hostile(PL, tl.o)) cmdAttackB(list, ti);
    else cmdMove(list, gx, gy);
    UI.sel = ti;
    return;
  }
  UI.sel = ti;
  if (UI.tab !== 'build') UI.tab = 'map';
}

function endPtr(e) {
  if (!ptrs.has(e.pointerId)) return;
  const wasSingle = ptrs.size === 1;
  ptrs.delete(e.pointerId);
  if (wasSingle && e.type === 'pointerup' && !moved && downAt) {
    const r = rect();
    onTap(e.clientX - r.left, e.clientY - r.top);
  }
  if (ptrs.size === 0) downAt = null;
  else if (ptrs.size === 1) {
    const p = [...ptrs.values()][0];
    downAt = { x: p.x, y: p.y, cx: cam.x, cy: cam.y };
  }
}

canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) { downAt = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; moved = false; }
  else if (ptrs.size === 2) { pinch0 = pinchDist(); moved = true; }
});
canvas.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return;
  const p = ptrs.get(e.pointerId);
  p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 1 && downAt) {
    const dx = e.clientX - downAt.x, dy = e.clientY - downAt.y;
    if (Math.hypot(dx, dy) > 8) moved = true;
    if (moved) { cam.x = downAt.cx - dx / cam.z; cam.y = downAt.cy - dy / cam.z; clampCam(); }
  } else if (ptrs.size === 2) {
    const d = pinchDist();
    if (pinch0 > 0) {
      const r = rect(), a = [...ptrs.values()];
      zoomAt((a[0].x + a[1].x) / 2 - r.left, (a[0].y + a[1].y) / 2 - r.top, d / pinch0);
    }
    pinch0 = d;
  }
});
canvas.addEventListener('pointerup', endPtr);
canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const r = rect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 0.89);
}, { passive: false });

/* ---------------- واجهة اللوحة ---------------- */
function vMap() {
  let h = '';
  const sel = UI.sel;
  if (sel !== null) {
    const tl = S.tiles[sel], x = sel % W, y = Math.floor(sel / W);
    h += `<h3>${TERRAIN[tl.t].name} — (${x}، ${y})</h3>`;
    h += `<div class="card">المالك: <span style="color:${ownerCol(tl.o)}">${ownerName(tl.o)}</span>`;
    if (tl.v) h += '<br>🏘️ قرية: تنتج طعامًا وذهبًا';
    if (tl.camp) h += '<br>⛺ معسكر قطاع طرق';
    if (tl.ruin) h += '<br>🏛️ أطلال بها مكافأة';
    h += '</div>';
    if (tl.b) {
      const d = bdef(tl.b.t), b = tl.b;
      h += `<div class="card"><b>${d.ico} ${d.name}</b> — مستوى ${b.lvl}<br>الصحة ${Math.ceil(b.hp)} / ${Math.ceil(b.mhp)}`;
      if (b.left > 0) h += `<br>قيد البناء: ${Math.ceil(b.left)} ث`;
      if (d.prod) h += `<br>الإنتاج: ${Object.entries(d.prod).map(([r, v]) => RICO[r] + Math.round(v * b.lvl * 10) / 10 + '/ث').join(' ')}`;
      if (b.q.length) h += `<br>التدريب: ${b.q.map(q => UNITS[q.u].name + ' (' + Math.ceil(q.left) + ' ث)').join('، ')}`;
      h += '</div><div class="row wrap">';
      if (tl.o === PL && b.t !== 'capital' && b.lvl < 3) {
        const c = scaled(d.cost, 1.2 * b.lvl);
        h += B(`⬆ ترقية (${costTxt(c)})`, `data-act="upgrade" data-ti="${sel}"`, b.left > 0);
      }
      if (tl.o === PL && b.t !== 'capital') h += B('هدم', `data-act="demolish" data-ti="${sel}"`, false, 'ghost');
      if (tl.o !== PL && hostile(PL, tl.o) && UI.units.length) h += B('⚔ هاجم المبنى', `data-act="attackB"`);
      h += '</div>';
    } else if (tl.o === -1 && !tl.camp) {
      h += B('احتلال بالذهب (30🪙)', `data-act="claim" data-ti="${sel}"`, !neighbors(sel).some(n => S.tiles[n].o === PL));
    } else if (tl.o === PL) {
      h += '<p class="muted">أرض فارغة. اختر «البناء» لتبني عليها.</p>';
    }
    h += `<div class="row"><button class="ghost" data-act="deseltile">إخفاء المعلومات</button></div>`;
  }
  if (UI.units.length) {
    const us = selUnits().filter(u => u.o === PL);
    const cnt = {};
    let hp = 0, mhp = 0;
    for (const u of us) { cnt[u.t] = (cnt[u.t] || 0) + 1; hp += u.hp; mhp += ustat(u).mhp; }
    h += `<h3>المحددون: ${us.length} وحدة</h3><div class="card">${Object.entries(cnt).map(([t, c]) => `${UNITS[t].name} × ${c}`).join(' • ') || '—'}<br>الصحة: ${us.length ? Math.round(hp / mhp * 100) : 0}%</div>`;
    h += '<p class="muted">اضغط على أرض لتحريك المحددين، أو على عدو لمهاجمته.</p>';
    h += '<div class="row wrap">';
    for (let n = 1; n <= 3; n++) h += B(`تشكيل ${n}`, `data-act="setgroup" data-n="${n}"`, false, 'ghost');
    for (let n = 1; n <= 3; n++) h += B(`اختيار ${n}`, `data-act="selgroup" data-n="${n}"`, false, 'ghost');
    h += B('تحديد الكل', 'data-act="selall"', false, 'ghost');
    h += B('إلغاء التحديد', 'data-act="clearsel"', false, 'danger');
    h += '</div>';
  }
  if (sel === null && !UI.units.length) h += '<p class="muted">اضغط على أرض لعرض معلوماتها، أو على جندي لتحديده. بعد التحديد اضغط على أرض لتحريكه.</p>';
  return h;
}

function vBuild() {
  const K = S.k[PL];
  if (UI.sel === null) return '<p class="muted">اختر أرضًا من الخريطة أولًا.</p>';
  const ti = UI.sel, tl = S.tiles[ti];
  if (tl.o !== PL) return '<p class="muted">هذه الأرض ليست لك. استولِ عليها بالجيش أو بالذهب من تبويب الميدان.</p>';
  if (tl.b) return '<p class="muted">هذه الأرض فيها مبنى بالفعل. يمكنك ترقيته من تبويب الميدان.</p>';
  let h = `<p class="muted">أرض ${TERRAIN[tl.t].name}. اختر المبنى المناسب:</p>`;
  for (const [c, cn] of [['eco', 'الاقتصاد'], ['mil', 'العسكرية'], ['def', 'الدفاع'], ['sci', 'العلوم والإدارة']]) {
    h += `<h4>${cn}</h4>`;
    for (const [key, d] of Object.entries(BUILDINGS)) {
      if (d.cat !== c) continue;
      const why = buildReason(K, ti, key);
      h += `<div class="item"><div><b>${d.ico} ${d.name}</b><small>${costTxt(d.cost)} • ${Math.round(d.time)} ث • ${d.desc}</small>${why ? `<em>${why}</em>` : ''}</div>${B('ابنِ', `data-act="build" data-ti="${ti}" data-type="${key}"`, !!why)}</div>`;
    }
  }
  return h;
}

function vArmy() {
  const K = S.k[PL];
  let h = '<h4>تدريب الجنود</h4>';
  for (const [key, u] of Object.entries(UNITS)) {
    const why = trainReason(K, key);
    h += `<div class="item"><div><b>${u.name}</b><small>⚔${u.atk} 🛡${u.def} ❤${u.hp} • ${costTxt(u.cost)} • ${Math.round(u.time * (1 + K.m.train))} ث</small>${why ? `<em>${why}</em>` : ''}</div>${B('درّب', `data-act="train" data-key="${key}"`, !!why)}</div>`;
  }
  h += '<h4>طوابير التدريب</h4>';
  let any = false;
  for (const tl of S.tiles) {
    if (tl.o !== PL || !tl.b || !tl.b.q.length) continue;
    any = true;
    h += `<div class="card">${bdef(tl.b.t).name}: ${tl.b.q.map(q => UNITS[q.u].name + ' (' + Math.ceil(q.left) + ' ث)').join('، ')}</div>`;
  }
  if (!any) h += '<p class="muted">لا يوجد تدريب جارٍ.</p>';
  h += '<h4>القادة</h4>';
  if (!K.leaders.length) h += '<p class="muted">لا يوجد قادة بعد. تحتاج قاعة قيادة لتجنيدهم.</p>';
  for (const L of K.leaders) h += `<div class="card">${L.name} — ${SPECS[L.spec]} • ${RARITY[L.rar].n} • مستوى ${L.lvl}</div>`;
  if (K.leaders.length < 3) h += `<div class="row">${B('جنّد قائدًا (حسب الندرة)', 'data-act="hire"', !(K.cnt.command > 0))}</div>`;
  h += '<h4>الجيش</h4>';
  const cnt = {};
  for (const u of S.units) if (!u.dead && u.o === PL) cnt[u.t] = (cnt[u.t] || 0) + 1;
  const parts = Object.entries(cnt).map(([t, c]) => `${UNITS[t].name} × ${c}`);
  h += `<div class="card">${parts.length ? parts.join(' • ') : 'لا يوجد جيش بعد'}</div>`;
  return h;
}

function vResearch() {
  const K = S.k[PL];
  let h = '';
  if (K.research) h += `<div class="card">الجاري: <b>${RESEARCH[K.research.id].name}</b> — متبقٍ ${Math.ceil(K.research.left)} ث</div>`;
  else h += '<p class="muted">لا يوجد بحث جارٍ. تحتاج مركز أبحاث.</p>';
  for (const br of ['eco', 'mil', 'def', 'sci']) {
    h += `<h4>${BR_NAMES[br]}</h4>`;
    for (const [id, R] of Object.entries(RESEARCH)) {
      if (R.br !== br) continue;
      const done = K.researched.includes(id);
      const why = researchReason(K, id);
      h += `<div class="item"><div><b>${done ? '✔ ' : ''}${R.name}</b><small>${costTxt(R.cost)} • ${R.time} ث • ${R.d}</small>${!done && why ? `<em>${why}</em>` : ''}</div>${done ? '<span class="tag ok">مكتمل</span>' : B('ابدأ', `data-act="research" data-id="${id}"`, !!why)}</div>`;
    }
  }
  return h;
}

const DIPL_TIPS = { war: 'حرب', nap: 'عدم اعتداء', peace: 'سلام', alliance: 'تحالف' };
function vDiplo() {
  const K = S.k[PL], emb = (K.cnt.embassy || 0) > 0, intel = !!K.m.intel;
  let h = `<p class="muted">قوتك العسكرية: ${fmt(strength(PL))}</p>`;
  if (!emb) h += '<p class="muted">🕊️ ابنِ سفارة لفتح التحالفات والسلام والجزية.</p>';
  for (let j = 1; j < 4; j++) {
    const A = S.k[j];
    if (!A.alive) { h += `<div class="card dim"><b>${A.name}</b> — سقطت</div>`; continue; }
    const st = dip(PL, j);
    h += `<div class="card"><b style="color:${KCOL[j]}">${A.name}</b> — <span class="tag">${DIPL_TIPS[st]}</span><br><small>الانطباع: ${Math.round(A.op)}${intel ? ` • القوة: ${fmt(strength(j))}` : ' • ابنِ مركز استخبارات لرؤية قوتها'}</small>`;
    if (A.offer) {
      h += `<div class="row"><span>يعرض: ${OFFN[A.offer.type]}</span>${B('قبول', `data-act="offer" data-j="${j}" data-yes="1"`)}${B('رفض', `data-act="offer" data-j="${j}" data-yes="0"`, false, 'ghost')}</div>`;
    }
    h += '<div class="row wrap">';
    if (st === 'war') h += B('عرض عدم اعتداء', `data-act="diplo" data-j="${j}" data-kind="nap"`);
    if (st === 'nap') h += B('طلب سلام', `data-act="diplo" data-j="${j}" data-kind="peace"`, !emb);
    if (st === 'peace') h += B('تحالف', `data-act="diplo" data-j="${j}" data-kind="alliance"`, !emb);
    h += B('جزية 100🪙', `data-act="diplo" data-j="${j}" data-kind="tribute"`, !emb);
    h += B('إنذار', `data-act="diplo" data-j="${j}" data-kind="ultimatum"`);
    if (st !== 'war') h += B('إعلان الحرب', `data-act="diplo" data-j="${j}" data-kind="war"`, false, 'danger');
    h += '</div></div>';
  }
  return h;
}

function vMissions() {
  let h = '';
  for (const m of S.missions) {
    const def = MISSIONS.find(x => x.id === m.id);
    h += `<div class="item"><div><b>${m.done ? '✔ ' : ''}${def.t}</b></div><span class="tag ${m.done ? 'ok' : ''}">${m.done ? 'مكتملة' : 'جارية'}</span></div>`;
  }
  return h + '<p class="muted">مكافأة كل مهمة: 100🪙 و50🪨 و20⛓️</p>';
}

function vLog() {
  return S.log.slice(-60).reverse().map(e => `<div class="log ${e.c}"><span class="t">[${fmtTime(e.t)}]</span> ${e.m}</div>`).join('') || '<p class="muted">لا توجد أحداث بعد.</p>';
}

function renderTop() {
  const K = S.k[PL];
  $('#res').innerHTML = RES.map(r => `<span class="rs" title="${RNAME[r]}">${RICO[r]} ${fmt(K.res[r])}<small>/${storeCap(K, r)}</small></span>`).join('')
    + `<span class="rs">👥 ${fmt(K.pop)}/${K.popCap}</span><span class="rs">😊 ${fmt(K.happy)}</span>`;
  $('#clock').textContent = `اليوم ${Math.floor(S.time / 60) + 1} • ${fmtTime(S.time)}`;
  $('#btnSpeed').textContent = S.speed + '×';
  $('#btnPause').textContent = S.paused ? '▶' : '⏸';
}

function renderPanel(force) {
  if (!force && Date.now() - lastInteract < 700) return;
  UI.units = UI.units.filter(id => unitById(id));
  const p = $('#panel');
  let html = '';
  switch (UI.tab) {
    case 'map': html = vMap(); break;
    case 'build': html = vBuild(); break;
    case 'army': html = vArmy(); break;
    case 'research': html = vResearch(); break;
    case 'diplo': html = vDiplo(); break;
    case 'missions': html = vMissions(); break;
    case 'log': html = vLog(); break;
  }
  const st = p.scrollTop;
  p.innerHTML = html;
  p.scrollTop = st;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === UI.tab));
}

/* ---------------- أفعال الواجهة ---------------- */
function act(d) {
  switch (d.act) {
    case 'build': doBuild(+d.ti, d.type); break;
    case 'upgrade': doUpgrade(+d.ti); break;
    case 'demolish': doDemolish(+d.ti); break;
    case 'claim': doClaim(+d.ti); break;
    case 'attackB': if (UI.sel !== null) cmdAttackB(selUnits().filter(u => u.o === PL), UI.sel); break;
    case 'train': doTrain(d.key); break;
    case 'hire': doHire(); break;
    case 'research': doResearch(d.id); break;
    case 'diplo': diploAct(+d.j, d.kind); break;
    case 'offer': answerOffer(+d.j, d.yes === '1'); break;
    case 'setgroup': setGroup(+d.n); break;
    case 'selgroup': UI.units = S.units.filter(u => !u.dead && u.o === PL && u.g === +d.n).map(u => u.id); break;
    case 'selall': UI.units = S.units.filter(u => !u.dead && u.o === PL).map(u => u.id); break;
    case 'clearsel': UI.units = []; break;
    case 'deseltile': UI.sel = null; break;
  }
}
function onClick(e) {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.tab) { UI.tab = b.dataset.tab; renderPanel(true); return; }
  if (b.dataset.menu) { menuAct(b.dataset.menu); return; }
  if (b.dataset.act) { act(b.dataset); renderPanel(true); renderTop(); }
}

/* ---------------- حفظ وتحميل ونوافذ ---------------- */
function saveGame(silent) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
    if (!silent) toast('تم الحفظ ✔');
  } catch (e) { if (!silent) toast('تعذّر الحفظ على هذا الجهاز'); }
}
function loadGame() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { raw = null; }
  if (!raw) { toast('لا يوجد حفظ سابق'); return; }
  try {
    const o = JSON.parse(raw);
    if (!o || !o.k) throw new Error('bad');
    S = o; UI.sel = null; UI.units = [];
    toast('تم تحميل اللعبة');
    centerOn(S.k[PL].cap[0], S.k[PL].cap[1]);
  } catch (e) { toast('الحفظ تالف ولا يمكن تحميله'); }
}
function resetGame() {
  newGame(Date.now() % 1000000 + 7);
  UI.sel = null; UI.units = []; UI.tab = 'map';
  localStorage.removeItem(SAVE_KEY);
  saveGame(true);
  centerOn(S.k[PL].cap[0], S.k[PL].cap[1]);
  toast('بدأت مملكة جديدة');
}
function confirmBox(text, onOk, okText = 'نعم', noCancel = false) {
  $('#modalText').innerHTML = text;
  $('#modalOk').textContent = okText;
  $('#modalCancel').style.display = noCancel ? 'none' : '';
  modalOk = onOk;
  $('#modal').classList.remove('hidden');
}
function menuAct(m) {
  if (m === 'save') saveGame(false);
  else if (m === 'load') confirmBox('تحميل آخر حفظ؟ سيُستبدل اللعب الحالي.', loadGame);
  else if (m === 'reset') confirmBox('هل أنت متأكد من إعادة بدء المملكة؟ سيُحذف التقدم المحفوظ نهائيًا.', resetGame);
  else if (m === 'help') confirmBox(
    '<b>كيف تلعب؟</b><br>• اسحب الخريطة لتتحرك، وكبّر بعجلة الفأرة أو قرصة الإصبعين.<br>' +
    '• اضغط على أرضك لاختيار مبنى من تبويب «البناء».<br>' +
    '• اضغط على جندي لتحديده، ثم على أرض لتحريكه أو على عدو لمهاجمته.<br>' +
    '• استولِ على الأراضي المحايدة بجنودك، أو بالذهب بجوار أرضك.<br>' +
    '• ادعم اقتصادك بالطعام والسكن، وإلا ثار شعبك.<br>' +
    '• الممالك المنافسة تتحرك وتتحالف وتحارب باستمرار.<br>' +
    '• الفوز بإسقاط عواصم الممالك الثلاث.', () => { }, 'حسنًا', true);
}
function showOver() {
  if (!S.over) return;
  S.paused = true;
  const w = S.over.win;
  confirmBox(w ? '🏆 انتصرت! خضعت القارة لمملكتك.' : '💀 سقطت عاصمتك. انتهت المملكة.', resetGame, 'لعبة جديدة', true);
}

/* ---------------- الحلقة الرئيسية ---------------- */
function stepSim(dt) {
  S.time += dt;
  scan();
  constructionStep(dt);
  trainStep(dt);
  researchStep(dt);
  for (const K of S.k) if (K.alive) produce(K, dt);
  buildingsStep(dt);
  unitsStep(dt);
  claimStep(dt);
  ruinCampStep();
  aiStep(dt);
  eventStep();
  missionStep();
  checkOver();
}

let lastT = performance.now(), acc = 0, panelT = 0;
function loop(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000);
  lastT = now;
  if (S && !S.paused && !S.over) {
    acc += dt * S.speed;
    let n = 0;
    while (acc >= STEP && n < 10) { stepSim(STEP); acc -= STEP; n++; }
    if (n >= 10) acc = 0;
  }
  if (S) {
    draw(dt);
    panelT += dt;
    if (panelT > 0.5) { panelT = 0; renderTop(); renderPanel(false); }
  }
  requestAnimationFrame(loop);
}

function bindUI() {
  $('#btnZoomIn').onclick = () => zoomAt(CW / 2, CH / 2, 1.2);
  $('#btnZoomOut').onclick = () => zoomAt(CW / 2, CH / 2, 1 / 1.2);
  $('#btnCenter').onclick = () => centerOn(S.k[PL].cap[0], S.k[PL].cap[1]);
  $('#btnSpeed').onclick = () => { S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 4 : 1; renderTop(); };
  $('#btnPause').onclick = () => { if (!S.over) S.paused = !S.paused; renderTop(); };
  $('#btnMulti').onclick = () => {
    UI.multi = !UI.multi;
    $('#btnMulti').textContent = 'تحديد متعدد: ' + (UI.multi ? 'تشغيل' : 'إيقاف');
  };
  $('#panel').addEventListener('pointerdown', () => { lastInteract = Date.now(); });
  $('#modalOk').onclick = () => {
    $('#modal').classList.add('hidden');
    const f = modalOk; modalOk = null;
    if (f) f();
  };
  $('#modalCancel').onclick = () => { $('#modal').classList.add('hidden'); modalOk = null; };
  document.addEventListener('click', onClick);
}

function boot() {
  resize();
  window.addEventListener('resize', resize);
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { raw = null; }
  if (raw) {
    try { const o = JSON.parse(raw); if (o && o.k) S = o; } catch (e) { S = null; }
  }
  if (!S) newGame(Date.now() % 1000000 + 7);
  centerOn(S.k[PL].cap[0], S.k[PL].cap[1]);
  bindUI();
  setInterval(() => { if (S && !S.over) saveGame(true); }, 10000);
  document.addEventListener('visibilitychange', () => { if (document.hidden && S) saveGame(true); });
  renderTop();
  renderPanel(true);
  if (S.over) showOver();
  else toast('اضغط على أرضك للبناء، وعلى جنودك للتحريك');
  requestAnimationFrame(t => { lastT = t; loop(t); });
}

boot();
