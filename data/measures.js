// Sistema métrico — datos y motor de conversión SIN decimales.
//
// Tres sistemas (longitud/masa/capacidad). Cada unidad es prefijo + base:
//   longitud → base "m":  mm cm dm m dam hm km
//   masa     → base "g":  mg cg dg g dag hg kg
//   capacidad→ base "L":  mL cL dL L daL hL kL
//
// Como el niño no sabe decimales, todo se calcula en enteros tomando como
// "átomo" la unidad mili (exponente −3). Una medida se DESCOMPONE de forma
// codiciosa sobre las unidades habilitadas (15 mm = 1 cm 5 mm; 1250 mL =
// 1 L 2 dL 50 mL), dejando el resto en la unidad inferior.

(function () {
  // Exponente (potencia de 10) de cada prefijo respecto a la base.
  const PREFIX_EXP = { m: -3, c: -2, d: -1, "": 0, da: 1, h: 2, k: 3 };
  // Orden ascendente de la escalera (de la unidad más pequeña a la mayor).
  const LADDER = ["m", "c", "d", "", "da", "h", "k"];

  // Lectura en katakana del prefijo y de la base.
  const PREFIX_KANA = { m: "ミリ", c: "センチ", d: "デシ", "": "", da: "デカ", h: "ヘクト", k: "キロ" };
  const PREFIX_ES   = { m: "mili", c: "centi", d: "deci", "": "", da: "deca", h: "hecto", k: "kilo" };
  const BASE_KANA   = { m: "メートル", g: "グラム", L: "リットル" };
  const BASE_ES     = { m: "metro", g: "gramo", L: "litro" };

  const MEASURES = {
    length:   { base: "m", icon: "ruler", basic: ["m", "c"] },          // mm, cm
    mass:     { base: "g", icon: "scale", basic: ["", "k"] },           // g, kg
    capacity: { base: "L", icon: "drop",  basic: ["m", "d", ""] },      // mL, dL, L
  };

  // Símbolo visible de una unidad. La capacidad usa "L" mayúscula por defecto,
  // configurable a "l" minúscula vía window.MIDOKU_LITER.
  function unitSym(measure, prefix) {
    const m = MEASURES[measure];
    const base = (measure === "capacity") ? (window.MIDOKU_LITER || "L") : m.base;
    return prefix + base;
  }
  function unitName(measure, prefix, lang) {
    const base = MEASURES[measure].base;
    if (lang === "ja") return PREFIX_KANA[prefix] + BASE_KANA[base];
    const p = PREFIX_ES[prefix];
    const b = BASE_ES[base];
    return p ? (p + b) : b;   // "centímetro", "metro"
  }
  const unitExp = (prefix) => PREFIX_EXP[prefix];
  // Valor de 1 unidad expresado en "milis" (átomos, exp −3): 10^(exp+3).
  const unitMilli = (prefix) => Math.pow(10, PREFIX_EXP[prefix] + 3);

  // ── Unidades habilitadas (persistidas por sistema) ───────────
  const lsKey = (measure) => "midoku_units_" + measure;
  function getEnabled(measure) {
    let arr;
    try { arr = JSON.parse(localStorage.getItem(lsKey(measure)) || "null"); } catch (e) { arr = null; }
    if (!Array.isArray(arr) || arr.length === 0) arr = MEASURES[measure].basic.slice();
    // ordenadas ascendente por exponente y filtradas a prefijos válidos
    return LADDER.filter(p => arr.includes(p));
  }
  function setEnabled(measure, prefixes) {
    const clean = LADDER.filter(p => prefixes.includes(p));
    const val = clean.length ? clean : MEASURES[measure].basic.slice();
    try { localStorage.setItem(lsKey(measure), JSON.stringify(val)); } catch (e) {}
    return val;
  }

  // ── Conversión / descomposición (todo en milis enteros) ──────
  const toMilli = (n, prefix) => n * unitMilli(prefix);
  const sumMilli = (parts) => parts.reduce((s, p) => s + toMilli(p.n, p.prefix), 0);

  // Descompone un total (en milis) sobre la lista de prefijos dada (que debe
  // venir ascendente). El prefijo más pequeño recoge todo el resto.
  function decompose(totalMilli, prefixesAsc) {
    const desc = prefixesAsc.slice().reverse();   // de mayor a menor
    let rem = totalMilli;
    const out = [];
    desc.forEach((prefix, i) => {
      const v = unitMilli(prefix);
      const isLast = i === desc.length - 1;
      const n = isLast ? Math.round(rem / v) : Math.floor(rem / v);
      rem -= n * v;
      out.push({ prefix, n });
    });
    return out;   // de mayor a menor
  }

  // ── Ejemplos de objetos (números redondos, contexto real) ────
  // amount: [valor, prefijo]. emoji para la ficha.
  const EXAMPLES = {
    length: [
      { emoji: "🐜", es: "hormiga", ja: "アリ",     amount: [5, "m"] },     // 5 mm
      { emoji: "✏️", es: "lápiz",   ja: "えんぴつ",  amount: [15, "c"] },    // 15 cm
      { emoji: "✋", es: "mano",    ja: "て",       amount: [1, "d"] },     // 1 dm
      { emoji: "🚪", es: "puerta",  ja: "ドア",     amount: [2, ""] },      // 2 m
      { emoji: "🚌", es: "autobús", ja: "バス",     amount: [1, "da"] },    // 1 dam
      { emoji: "🏞️", es: "río",     ja: "かわ",     amount: [2, "k"] },     // 2 km
    ],
    mass: [
      { emoji: "🪶", es: "pluma",   ja: "はね",     amount: [500, "m"] },   // 500 mg
      { emoji: "🍓", es: "fresa",   ja: "いちご",   amount: [25, ""] },     // 25 g
      { emoji: "🍎", es: "manzana", ja: "りんご",   amount: [200, ""] },    // 200 g
      { emoji: "🧒", es: "niño",    ja: "こども",   amount: [24, "k"] },    // 24 kg
      { emoji: "👨", es: "papá",    ja: "おとうさん", amount: [75, "k"] },   // 75 kg
    ],
    capacity: [
      { emoji: "🥄", es: "cuchara", ja: "スプーン", amount: [5, "m"] },     // 5 mL
      { emoji: "🥤", es: "lata",    ja: "かん",     amount: [350, "m"] },   // 350 mL
      { emoji: "🥛", es: "vaso",    ja: "コップ",   amount: [2, "d"] },     // 2 dL
      { emoji: "🍼", es: "botella", ja: "ボトル",   amount: [1, ""] },      // 1 L
      { emoji: "🪣", es: "cubo",    ja: "バケツ",   amount: [5, ""] },      // 5 L
    ],
  };

  // ── Generadores de problemas de conversión ───────────────────
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  // Devuelve dos unidades habilitadas adyacentes (lo, hi) con lo<hi.
  function pickPair(measure) {
    const E = getEnabled(measure);
    if (E.length < 2) return null;
    const i = ri(0, E.length - 2);
    return { lo: E[i], hi: E[i + 1], E };
  }
  const factor = (lo, hi) => Math.pow(10, PREFIX_EXP[hi] - PREFIX_EXP[lo]);

  // n unidades-altas → ? unidades-bajas  (p.ej. 3 m = ? cm)
  function genDown(measure) {
    const p = pickPair(measure); if (!p) return genCompose(measure);
    const n = ri(1, 9);
    return { type: "mConvert", measure, mode: "down",
      given: [{ n, prefix: p.hi }], ask: [p.lo] };
  }
  // total bajo → ? alto ? bajo  (p.ej. 94 mm = ? cm ? mm)
  function genMixed(measure) {
    const p = pickPair(measure); if (!p) return genDown(measure);
    const f = factor(p.lo, p.hi);
    const hi = ri(1, 9);
    const loRem = ri(1, f - 1);           // resto que no llega a una unidad alta
    const total = hi * f + loRem;
    return { type: "mConvert", measure, mode: "mixed",
      given: [{ n: total, prefix: p.lo }], ask: [p.hi, p.lo] };
  }
  // a alto b bajo → ? bajo  (p.ej. 1 cm 5 mm = ? mm)
  function genCompose(measure) {
    const p = pickPair(measure); if (!p) {
      // un único sistema con 1 unidad: convertir x1 trivial
      const E = getEnabled(measure);
      return { type: "mConvert", measure, mode: "down", given: [{ n: ri(1, 9), prefix: E[0] }], ask: [E[0]] };
    }
    const f = factor(p.lo, p.hi);
    const a = ri(1, 9), b = ri(1, f - 1);
    return { type: "mConvert", measure, mode: "compose",
      given: [{ n: a, prefix: p.hi }, { n: b, prefix: p.lo }], ask: [p.lo] };
  }

  // ¿cuál es mayor?  (p.ej. 1 L vs 8 dL)
  function genCompare(measure) {
    const E = getEnabled(measure);
    const p = pickPair(measure);
    if (!p) {
      const u = E[0]; const a = ri(1, 9); let b = ri(1, 9); if (b === a) b = a < 9 ? a + 1 : a - 1;
      return { type: "mCompare", measure, a: [{ n: a, prefix: u }], b: [{ n: b, prefix: u }] };
    }
    const f = factor(p.lo, p.hi);
    const aHi = ri(1, 3);
    let bLo = aHi * f + (Math.random() < 0.5 ? -1 : 1) * ri(1, Math.max(1, Math.floor(f / 2)));
    if (bLo < 1) bLo = aHi * f + ri(1, Math.max(1, Math.floor(f / 2)));
    if (bLo * unitMilli(p.lo) === aHi * unitMilli(p.hi)) bLo += 1;
    return { type: "mCompare", measure, a: [{ n: aHi, prefix: p.hi }], b: [{ n: bLo, prefix: p.lo }] };
  }
  // suma de dos medidas (p.ej. 1 L 5 dL + 2 dL)
  function genAdd(measure) {
    const p = pickPair(measure);
    if (!p) { const u = getEnabled(measure)[0]; return { type: "mCalc", measure, op: "+", a: [{ n: ri(1, 4), prefix: u }], b: [{ n: ri(1, 4), prefix: u }] }; }
    const f = factor(p.lo, p.hi);
    const a = [{ n: ri(1, 4), prefix: p.hi }, { n: ri(0, f - 1), prefix: p.lo }];
    const b = [{ n: ri(0, 3), prefix: p.hi }, { n: ri(1, f - 1), prefix: p.lo }];
    return { type: "mCalc", measure, op: "+", a, b };
  }
  // resta de dos medidas, a ≥ b (p.ej. 2 L 8 dL − 5 dL, 1 L − 3 dL)
  function genSub(measure) {
    const p = pickPair(measure);
    if (!p) { const u = getEnabled(measure)[0]; const x = ri(3, 9), y = ri(1, x - 1); return { type: "mCalc", measure, op: "-", a: [{ n: x, prefix: u }], b: [{ n: y, prefix: u }] }; }
    const f = factor(p.lo, p.hi);
    let a, b, tries = 0;
    do {
      a = [{ n: ri(2, 5), prefix: p.hi }, { n: ri(0, f - 1), prefix: p.lo }];
      b = [{ n: ri(0, 2), prefix: p.hi }, { n: ri(1, f - 1), prefix: p.lo }];
      tries++;
    } while (sumMilli(a) <= sumMilli(b) && tries < 20);
    if (sumMilli(a) <= sumMilli(b)) { a = [{ n: 1, prefix: p.hi }]; b = [{ n: ri(1, f - 1), prefix: p.lo }]; }
    return { type: "mCalc", measure, op: "-", a, b };
  }

  // ── API global ───────────────────────────────────────────────
  window.MIDOKU_MEASURES = MEASURES;
  window.MIDOKU_MEASURE_IDS = ["length", "capacity", "mass"];
  window.MIDOKU_EXAMPLES = EXAMPLES;
  Object.assign(window, {
    measLadder: () => LADDER.slice(),
    measEnabled: getEnabled,
    measSetEnabled: setEnabled,
    measUnitSym: unitSym,
    measUnitName: unitName,
    measUnitExp: unitExp,
    measUnitMilli: unitMilli,
    measToMilli: toMilli,
    measSumMilli: sumMilli,
    measDecompose: decompose,
    measFactor: factor,
  });

  // Generadores expuestos (los consume data/problems.js al construir el catálogo).
  window.MIDOKU_MEASURE_GENS = {
    down: genDown, mixed: genMixed, compose: genCompose,
  };

  // Catálogo de problemas por sistema: conversiones + comparar + calcular.
  // nameKey da el título de la tarjeta (mismo texto en los tres sistemas).
  const mk = (measure) => [
    { id: "mDown_" + measure,    icon: "convert", nameKey: "mn_down",    gen: () => genDown(measure) },
    { id: "mMixed_" + measure,   icon: "convert", nameKey: "mn_mixed",   gen: () => genMixed(measure) },
    { id: "mCompose_" + measure, icon: "convert", nameKey: "mn_compose", gen: () => genCompose(measure) },
    { id: "mCompare_" + measure, icon: "compare", nameKey: "mn_compare", gen: () => genCompare(measure) },
    { id: "mAdd_" + measure,     icon: "plus",    nameKey: "mn_add",     gen: () => genAdd(measure) },
    { id: "mSub_" + measure,     icon: "minus",   nameKey: "mn_sub",     gen: () => genSub(measure) },
  ];

  // Integramos en el catálogo global (problems.js ya se ha cargado).
  const cat = window.MIDOKU_PROBLEMS_BY_LESSON || (window.MIDOKU_PROBLEMS_BY_LESSON = {});
  const units = cat.units || [];
  // Longitud reaprovecha los juegos de regla (leer cm/mm) y suma la escalera.
  const ruler = units.filter(p => ["measureCm", "measureCmMm", "setRuler"].includes(p.id));
  cat.length = [...ruler, ...mk("length")];
  cat.mass = mk("mass");
  cat.capacity = mk("capacity");
})();
