// Medidas — datos y motor de conversión SIN decimales.
//
// Dos familias de sistemas:
//   · Métricos (base 10): longitud/masa/capacidad. Cada unidad es prefijo + base.
//       longitud → base "m":  mm cm dm m dam hm km
//       masa     → base "g":  mg cg dg g dag hg kg
//       capacidad→ base "L":  mL cL dL L daL hL kL
//   · Tiempo (NO base 10): día(24 h) hora(60 min) minuto(60 s) segundo.
//
// Como el niño no sabe decimales, todo se calcula en enteros tomando como
// "átomo" la unidad más pequeña posible del sistema (mili en los métricos,
// segundo en el tiempo). Una medida se DESCOMPONE de forma codiciosa sobre las
// unidades habilitadas (15 mm = 1 cm 5 mm; 90 min = 1 h 30 min), dejando el
// resto en la unidad inferior.
//
// Nota: en las estructuras de "partes" el campo `prefix` guarda la CLAVE de la
// unidad (el prefijo en los métricos, "s"/"min"/"h"/"d" en el tiempo).

(function () {
  // ── Sistemas métricos (escalera de base 10) ──────────────────
  // Exponente (potencia de 10) de cada prefijo respecto a la base.
  const PREFIX_EXP = { m: -3, c: -2, d: -1, "": 0, da: 1, h: 2, k: 3 };
  // Orden ascendente de la escalera (de la unidad más pequeña a la mayor).
  const METRIC_LADDER = ["m", "c", "d", "", "da", "h", "k"];

  // Lectura en katakana del prefijo y de la base.
  const PREFIX_KANA = { m: "ミリ", c: "センチ", d: "デシ", "": "", da: "デカ", h: "ヘクト", k: "キロ" };
  const PREFIX_ES   = { m: "mili", c: "centi", d: "deci", "": "", da: "deca", h: "hecto", k: "kilo" };
  const BASE_KANA   = { m: "メートル", g: "グラム", L: "リットル" };
  const BASE_ES     = { m: "metro", g: "gramo", L: "litro" };

  // ── Tiempo (escalera irregular) ──────────────────────────────
  // atom = valor de 1 unidad en segundos (el "átomo" del sistema).
  const TIME_UNITS = [
    { key: "s",   atom: 1,     sym: "s",   es: "segundo", ja: "びょう" },
    { key: "min", atom: 60,    sym: "min", es: "minuto",  ja: "ふん" },
    { key: "h",   atom: 3600,  sym: "h",   es: "hora",    ja: "じかん" },
    { key: "d",   atom: 86400, sym: "d",   es: "día",     ja: "にち" },
  ];
  const TIME_LADDER = TIME_UNITS.map(u => u.key);
  const TIME_BY_KEY = {}; TIME_UNITS.forEach(u => { TIME_BY_KEY[u.key] = u; });

  const MEASURES = {
    length:   { base: "m", icon: "ruler", kind: "metric", basic: ["m", "c"] },          // mm, cm
    mass:     { base: "g", icon: "scale", kind: "metric", basic: ["", "k"] },           // g, kg
    capacity: { base: "L", icon: "drop",  kind: "metric", basic: ["m", "d", ""] },      // mL, dL, L
    time:     {            icon: "clock", kind: "time",   basic: ["s", "min", "h", "d"] }, // s, min, h, d
  };

  const isTime   = (measure) => MEASURES[measure].kind === "time";
  const ladderOf = (measure) => (isTime(measure) ? TIME_LADDER : METRIC_LADDER).slice();

  // Valor de 1 unidad expresado en átomos (enteros): milis en los métricos,
  // segundos en el tiempo.
  function unitAtom(measure, key) {
    return isTime(measure) ? TIME_BY_KEY[key].atom : Math.pow(10, PREFIX_EXP[key] + 3);
  }

  // Símbolo visible de una unidad. La capacidad usa "L" mayúscula por defecto,
  // configurable a "l" minúscula vía window.MIDOKU_LITER.
  function unitSym(measure, key) {
    if (isTime(measure)) return TIME_BY_KEY[key].sym;
    const base = (measure === "capacity") ? (window.MIDOKU_LITER || "L") : MEASURES[measure].base;
    return key + base;
  }
  function unitName(measure, key, lang) {
    if (isTime(measure)) { const u = TIME_BY_KEY[key]; return lang === "ja" ? u.ja : u.es; }
    const base = MEASURES[measure].base;
    if (lang === "ja") return PREFIX_KANA[key] + BASE_KANA[base];
    const p = PREFIX_ES[key];
    const b = BASE_ES[base];
    return p ? (p + b) : b;   // "centímetro", "metro"
  }

  // ── Unidades habilitadas (persistidas por sistema) ───────────
  const lsKey = (measure) => "midoku_units_" + measure;
  function getEnabled(measure) {
    const ladder = ladderOf(measure);
    let arr;
    try { arr = JSON.parse(localStorage.getItem(lsKey(measure)) || "null"); } catch (e) { arr = null; }
    if (!Array.isArray(arr) || arr.length === 0) arr = MEASURES[measure].basic.slice();
    // ordenadas ascendente (menor→mayor) y filtradas a claves válidas
    return ladder.filter(k => arr.includes(k));
  }
  function setEnabled(measure, keys) {
    const ladder = ladderOf(measure);
    const clean = ladder.filter(k => keys.includes(k));
    const val = clean.length ? clean : MEASURES[measure].basic.slice();
    try { localStorage.setItem(lsKey(measure), JSON.stringify(val)); } catch (e) {}
    return val;
  }

  // ── Conversión / descomposición (todo en átomos enteros) ─────
  const toAtoms = (measure, n, key) => n * unitAtom(measure, key);
  const sumAtoms = (measure, parts) => parts.reduce((s, p) => s + toAtoms(measure, p.n, p.prefix), 0);

  // Descompone un total (en átomos) sobre la lista de claves dada (que debe
  // venir ascendente). La unidad más pequeña recoge todo el resto.
  function decompose(measure, totalAtoms, keysAsc) {
    const desc = keysAsc.slice().reverse();   // de mayor a menor
    let rem = totalAtoms;
    const out = [];
    desc.forEach((key, i) => {
      const v = unitAtom(measure, key);
      const isLast = i === desc.length - 1;
      const n = isLast ? Math.round(rem / v) : Math.floor(rem / v);
      rem -= n * v;
      out.push({ prefix: key, n });
    });
    return out;   // de mayor a menor
  }

  // Cuántas unidades-bajas hay en una unidad-alta (p.ej. 1 h = 60 min → 60).
  const factor = (measure, lo, hi) => unitAtom(measure, hi) / unitAtom(measure, lo);

  // ── Ejemplos de objetos (números redondos, contexto real) ────
  // amount: [valor, clave]. emoji para la ficha.
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
    time: [
      { emoji: "👏", es: "palmada",  ja: "はくしゅ",  amount: [1, "s"] },     // 1 s
      { emoji: "🦷", es: "cepillado", ja: "はみがき", amount: [2, "min"] },   // 2 min
      { emoji: "🍚", es: "comida",   ja: "ごはん",    amount: [1, "h"] },     // 1 h
      { emoji: "😴", es: "sueño",    ja: "すいみん",  amount: [10, "h"] },    // 10 h
      { emoji: "📅", es: "finde",    ja: "しゅうまつ", amount: [2, "d"] },    // 2 d
    ],
  };

  // ── Generadores de problemas de conversión ───────────────────
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[ri(0, arr.length - 1)];

  // Cantidades "amigables" para un niño. En base 10 (métrico) los números ya
  // salen redondos; en tiempo (base 60/24) hay que forzar cantidades pequeñas
  // y redondas para que no aparezcan cosas como "543 min" o "9 h = 540 min".
  const hiCount = (measure) => isTime(measure) ? ri(1, 3) : ri(1, 9);
  // Un resto < f, redondo: múltiplos de 5 para min/s; pocos enteros para las
  // horas de un día (f = 24).
  function niceRem(measure, f) {
    if (!isTime(measure)) return ri(1, f - 1);
    const pool = (f >= 30 ? [5, 10, 15, 20, 30, 40, 45] : [2, 3, 4, 6, 8]).filter(x => x < f);
    return pick(pool);
  }
  // Cantidades bajas redondas para "¿cuál es mayor?" (solo tiempo): que no sean
  // múltiplos exactos de f (si no, se convertirían a la unidad alta).
  function niceLoPool(measure, f) {
    const step = f >= 30 ? 5 : 2;
    const out = [];
    for (let v = step; v <= Math.round(2.5 * f); v += step) if (v % f !== 0) out.push(v);
    return out;
  }

  // Devuelve dos unidades habilitadas adyacentes (lo, hi) con lo<hi.
  function pickPair(measure) {
    const E = getEnabled(measure);
    if (E.length < 2) return null;
    const i = ri(0, E.length - 2);
    return { lo: E[i], hi: E[i + 1], E };
  }

  // n unidades-altas → ? unidades-bajas  (p.ej. 3 m = ? cm)
  // `pair` fija el par de unidades (si no, se elige uno adyacente al azar).
  function genDown(measure, pair) {
    const p = pair || pickPair(measure); if (!p) return genCompose(measure);
    const n = hiCount(measure);
    return { type: "mConvert", measure, mode: "down",
      given: [{ n, prefix: p.hi }], ask: [p.lo] };
  }
  // total bajo → ? alto ? bajo  (p.ej. 94 mm = ? cm ? mm)
  function genMixed(measure, pair) {
    const p = pair || pickPair(measure); if (!p) return genDown(measure);
    const f = factor(measure, p.lo, p.hi);
    const hi = hiCount(measure);
    const loRem = niceRem(measure, f);    // resto que no llega a una unidad alta
    const total = hi * f + loRem;
    return { type: "mConvert", measure, mode: "mixed",
      given: [{ n: total, prefix: p.lo }], ask: [p.hi, p.lo] };
  }
  // a alto b bajo → ? bajo  (p.ej. 1 cm 5 mm = ? mm)
  function genCompose(measure, pair) {
    const p = pair || pickPair(measure); if (!p) {
      // un único sistema con 1 unidad: convertir x1 trivial
      const E = getEnabled(measure);
      return { type: "mConvert", measure, mode: "down", given: [{ n: ri(1, 9), prefix: E[0] }], ask: [E[0]] };
    }
    const f = factor(measure, p.lo, p.hi);
    const a = hiCount(measure), b = niceRem(measure, f);
    return { type: "mConvert", measure, mode: "compose",
      given: [{ n: a, prefix: p.hi }, { n: b, prefix: p.lo }], ask: [p.lo] };
  }

  // ¿cuál es mayor?  (p.ej. 1 L vs 8 dL)
  // 3 cantidades distintas (en unidades mezcladas) de magnitud parecida.
  function genCompare(measure) {
    const E = getEnabled(measure);
    if (E.length < 2) {
      const u = E[0], ns = [];
      while (ns.length < 3) { const n = ri(1, 9); if (!ns.includes(n)) ns.push(n); }
      return { type: "mCompare", measure, items: ns.map(n => [{ n, prefix: u }]) };
    }
    const i = ri(0, E.length - 2);
    const lo = E[i], hi = E[i + 1];
    const f = factor(measure, lo, hi);
    // 1 cantidad en la unidad alta + 2 en la baja → mezcla (hay que convertir).
    const hiN = ri(1, 2);
    const seen = new Set([hiN * f]);
    const items = [[{ n: hiN, prefix: hi }]];
    // En tiempo las cantidades bajas salen de un conjunto redondo; en métrico,
    // cualquier valor hasta 3 unidades altas.
    const pool = isTime(measure) ? niceLoPool(measure, f) : null;
    let guard = 0;
    while (items.length < 3 && guard++ < 80) {
      const tlo = pool ? pick(pool) : ri(1, 3 * f);
      if (seen.has(tlo) || tlo % f === 0) continue;   // distinto y no múltiplo exacto (queda en 'lo')
      seen.add(tlo);
      items.push([{ n: tlo, prefix: lo }]);
    }
    // baraja para que la respuesta no caiga siempre en la misma posición
    for (let k = items.length - 1; k > 0; k--) { const j = ri(0, k); const t = items[k]; items[k] = items[j]; items[j] = t; }
    return { type: "mCompare", measure, items };
  }
  // suma de dos medidas (p.ej. 1 L 5 dL + 2 dL)
  function genAdd(measure) {
    const p = pickPair(measure);
    if (!p) { const u = getEnabled(measure)[0]; return { type: "mCalc", measure, op: "+", a: [{ n: ri(1, 4), prefix: u }], b: [{ n: ri(1, 4), prefix: u }] }; }
    const f = factor(measure, p.lo, p.hi);
    const a = [{ n: ri(1, 4), prefix: p.hi }, { n: ri(0, f - 1), prefix: p.lo }];
    const b = [{ n: ri(0, 3), prefix: p.hi }, { n: ri(1, f - 1), prefix: p.lo }];
    return { type: "mCalc", measure, op: "+", a, b };
  }
  // resta de dos medidas, a ≥ b (p.ej. 2 L 8 dL − 5 dL, 1 L − 3 dL)
  function genSub(measure) {
    const p = pickPair(measure);
    if (!p) { const u = getEnabled(measure)[0]; const x = ri(3, 9), y = ri(1, x - 1); return { type: "mCalc", measure, op: "-", a: [{ n: x, prefix: u }], b: [{ n: y, prefix: u }] }; }
    const f = factor(measure, p.lo, p.hi);
    let a, b, tries = 0;
    do {
      a = [{ n: ri(2, 5), prefix: p.hi }, { n: ri(0, f - 1), prefix: p.lo }];
      b = [{ n: ri(0, 2), prefix: p.hi }, { n: ri(1, f - 1), prefix: p.lo }];
      tries++;
    } while (sumAtoms(measure, a) <= sumAtoms(measure, b) && tries < 20);
    if (sumAtoms(measure, a) <= sumAtoms(measure, b)) { a = [{ n: 1, prefix: p.hi }]; b = [{ n: ri(1, f - 1), prefix: p.lo }]; }
    return { type: "mCalc", measure, op: "-", a, b };
  }

  // ── API global ───────────────────────────────────────────────
  window.MIDOKU_MEASURES = MEASURES;
  window.MIDOKU_MEASURE_IDS = ["length", "capacity", "mass", "time"];
  window.MIDOKU_EXAMPLES = EXAMPLES;
  Object.assign(window, {
    measLadder: ladderOf,
    measEnabled: getEnabled,
    measSetEnabled: setEnabled,
    measUnitSym: unitSym,
    measUnitName: unitName,
    measUnitAtom: unitAtom,
    measToAtoms: toAtoms,
    measSumAtoms: sumAtoms,
    measDecompose: decompose,
    measFactor: factor,
  });

  // Generadores expuestos (los consume data/problems.js al construir el catálogo).
  window.MIDOKU_MEASURE_GENS = {
    down: genDown, mixed: genMixed, compose: genCompose,
  };

  // Catálogo de problemas por sistema métrico: conversiones + comparar + calcular.
  // nameKey da el título de la tarjeta (mismo texto en todos los sistemas).
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

  // Tiempo: en vez de barajar unidades al azar, un ejercicio por CADA relación
  // (día–hora, hora–minuto, minuto–segundo) y por cada tipo de conversión →
  // 9 tarjetas, agrupadas por par. Cada una lleva `tag` con el par de unidades.
  const TIME_PAIRS = [
    { lo: "h",   hi: "d" },     // día – hora
    { lo: "min", hi: "h" },     // hora – minuto
    { lo: "s",   hi: "min" },   // minuto – segundo
  ];
  const TIME_CONV = [
    { key: "Down",    nameKey: "mn_down",    gen: genDown },
    { key: "Mixed",   nameKey: "mn_mixed",   gen: genMixed },
    { key: "Compose", nameKey: "mn_compose", gen: genCompose },
  ];
  const timeCards = [];
  TIME_PAIRS.forEach(pr => {
    const tag = unitSym("time", pr.hi) + " – " + unitSym("time", pr.lo);
    TIME_CONV.forEach(tc => timeCards.push({
      id: "m" + tc.key + "_time_" + pr.hi + pr.lo,
      icon: "convert", nameKey: tc.nameKey, tag,
      gen: () => tc.gen("time", { lo: pr.lo, hi: pr.hi }),
    }));
  });
  // Comparar sigue mezclando las unidades habilitadas.
  timeCards.push({ id: "mCompare_time", icon: "compare", nameKey: "mn_compare", gen: () => genCompare("time") });
  cat.time = timeCards;
})();
