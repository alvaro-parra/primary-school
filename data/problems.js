// Generadores de problemas — cada tipo produce variantes aleatorias por rango
// (en vez de problemas fijos), así hay muchas combinaciones posibles.
// Cada gen() devuelve una config de "step" compatible con <Exercise>.
//
// Los tipos se agrupan por lección en MIDOKU_PROBLEMS_BY_LESSON[lessonId].

(function () {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1)); // entero [a,b]
  const mmOf = (m) => (m.cm || 0) * 10 + (m.mm || 0);

  /* ── Generadores de la lección cm/mm ─────────────────────── */
  const UNITS = {
    measureCm: () => ({ type: "measure", ask: "cm", object: { cm: ri(2, 11), mm: 0 } }),
    // zoom: cm 2..9 para que el 0 quede fuera; mm 1..9 para que siempre haya resto.
    measureCmMm: () => ({ type: "measure", ask: "cmmm", object: { cm: ri(2, 9), mm: ri(1, 9) } }),
    setRuler: () => {
      const cm = ri(2, 11), mm = Math.random() < 0.5 ? 0 : 5;
      return { type: "setRuler", target: { cm, mm }, snap: "5mm" };
    },
    toMm: () => ({ type: "convertToMm", from: { cm: ri(2, 11), mm: 0 }, support: true }),
    toCm: () => ({ type: "convertToCm", from: { cm: ri(1, 11), mm: ri(1, 9) }, support: true }),
    mixedToMm: () => ({ type: "mixedToMm", from: { cm: ri(1, 9), mm: ri(1, 9) }, support: true }),
    add: () => ({ type: "add", a: { cm: ri(1, 5), mm: ri(1, 9) }, b: { cm: ri(1, 5), mm: ri(1, 9) } }),
    subtract: () => {
      const a = { cm: ri(4, 11), mm: ri(0, 9) };
      let b;
      do { b = { cm: ri(1, a.cm - 1), mm: ri(0, 9) }; } while (mmOf(b) >= mmOf(a));
      return { type: "subtract", a, b };
    },
  };

  /* ── Generadores de sumas enteras (1-2º curso) ──────────────
     Operandos ≤ 999, resultado ≤ 1998 (4 dígitos).
     Niveles: sin llevadas (2 díg.) · con llevadas (2-3 díg.) · grandes (3 díg.). */
  // dígitos sin llevada en la columna (a+b ≤ 9). Para "sin llevada" en 2 cifras
  // generamos U y D de cada operando con ese criterio.
  const digitsNoCarry = () => {
    const u1 = ri(1, 8), u2 = ri(1, 9 - u1);
    const d1 = ri(1, 8), d2 = ri(1, 9 - d1);
    return [d1 * 10 + u1, d2 * 10 + u2];
  };
  // Suma con llevada garantizada en algún punto. Aceptamos 2 o 3 dígitos.
  const addWithCarry = () => {
    let a, b, tries = 0;
    do {
      const small = Math.random() < 0.5;
      a = small ? ri(15, 99) : ri(50, 499);
      b = small ? ri(15, 99) : ri(50, 499);
      tries++;
    } while (!hasCarry(a, b) && tries < 10);
    if (!hasCarry(a, b)) { a = 47; b = 38; } // fallback determinista
    return [a, b];
  };
  // ¿produce alguna llevada al sumar columna a columna?
  const hasCarry = (a, b) => {
    while (a > 0 || b > 0) {
      if ((a % 10) + (b % 10) >= 10) return true;
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return false;
  };

  const ADD = {
    addBasic: () => { const [a, b] = digitsNoCarry(); return { type: "intAdd", a, b }; },
    addCarry: () => { const [a, b] = addWithCarry();  return { type: "intAdd", a, b }; },
  };

  /* ── Generadores de restas enteras (1-2º curso) ─────────────
     a ≥ b siempre; resultado positivo. */
  const subDigitsNoBorrow = () => {
    // a ≥ b en cada columna (sin préstamo). Generamos b primero, luego a.
    const u_b = ri(0, 8), u_a = ri(u_b + 1, 9);
    const d_b = ri(1, 8), d_a = ri(d_b + 1, 9);
    return [d_a * 10 + u_a, d_b * 10 + u_b];
  };
  const hasBorrow = (a, b) => {
    while (b > 0) {
      if ((a % 10) < (b % 10)) return true;
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return false;
  };
  const subWithBorrow = () => {
    let a, b, tries = 0;
    do {
      const small = Math.random() < 0.5;
      a = small ? ri(20, 99) : ri(100, 999);
      b = small ? ri(11, a - 1) : ri(20, a - 1);
      tries++;
    } while (!hasBorrow(a, b) && tries < 10);
    if (!hasBorrow(a, b)) { a = 52; b = 17; }
    return [a, b];
  };
  const SUB = {
    subBasic: () => { const [a, b] = subDigitsNoBorrow(); return { type: "intSub", a, b }; },
    subBorrow: () => { const [a, b] = subWithBorrow();    return { type: "intSub", a, b }; },
  };

  /* ── Generadores de multiplicación (1-2º curso) ─────────────
     El niño puede no saber las tablas. Empezamos pequeño y con apoyo
     visual; ×10 prepara el terreno para el sistema métrico. */
  const MUL = {
    // 1 díg × 1 díg pequeños (factores 1..5 → producto ≤ 25). Con rejilla.
    mulSmall: () => ({ type: "intMul", a: ri(1, 5), b: ri(1, 5), support: true }),
    // n × 10: añadir un cero. Base de la escalera métrica.
    mulTen: () => ({ type: "intMul", a: ri(1, 9), b: 10 }),
  };

  /* ── Generadores de división (1-2º curso) ───────────────────
     SIEMPRE exactas (resto 0; el concepto de resto queda lejos). */
  const DIV = {
    // a ÷ b exacta: elegimos divisor y cociente pequeños y multiplicamos.
    divSmall: () => {
      const b = ri(2, 5), q = ri(2, 5);
      return { type: "intDiv", a: b * q, b, support: true };
    },
    // múltiplos de 10 ÷ 10: quitar un cero.
    divTen: () => ({ type: "intDiv", a: ri(1, 9) * 10, b: 10 }),
  };

  /* ── Catálogo por lección ──────────────────────────────────
     Cada problema tiene id (único en la lección), icon y gen. */
  window.MIDOKU_PROBLEMS_BY_LESSON = {
    units: [
      { id: "measureCm",   icon: "ruler",   gen: UNITS.measureCm },
      { id: "measureCmMm", icon: "ruler",   gen: UNITS.measureCmMm },
      { id: "setRuler",    icon: "ruler",   gen: UNITS.setRuler },
      { id: "toMm",        icon: "convert", gen: UNITS.toMm },
      { id: "toCm",        icon: "convert", gen: UNITS.toCm },
      { id: "mixedToMm",   icon: "convert", gen: UNITS.mixedToMm },
      { id: "add",         icon: "plus",    gen: UNITS.add },
      { id: "subtract",    icon: "minus",   gen: UNITS.subtract },
    ],
    add: [
      { id: "addBasic", icon: "plus", gen: ADD.addBasic },
      { id: "addCarry", icon: "plus", gen: ADD.addCarry },
    ],
    subtract: [
      { id: "subBasic",  icon: "minus", gen: SUB.subBasic },
      { id: "subBorrow", icon: "minus", gen: SUB.subBorrow },
    ],
    multiply: [
      { id: "mulSmall", icon: "times", gen: MUL.mulSmall },
      { id: "mulTen",   icon: "times", gen: MUL.mulTen },
    ],
    divide: [
      { id: "divSmall", icon: "divide", gen: DIV.divSmall },
      { id: "divTen",   icon: "divide", gen: DIV.divTen },
    ],
  };

  // Genera una variante evitando que se repita ninguna de las ÚLTIMAS 3
  // mostradas de ese tipo.
  const _recent = {};                          // id -> [firma, …] (máx 3)
  const signature = (s) => JSON.stringify([s.type, s.ask, s.a, s.b, s.object, s.target, s.from]);
  window.genProblem = function (problem) {
    const recent = _recent[problem.id] || (_recent[problem.id] = []);
    let inst, sig, tries = 0;
    do { inst = problem.gen(); sig = signature(inst); tries++; }
    while (recent.includes(sig) && tries < 25);
    recent.push(sig);
    if (recent.length > 3) recent.shift();
    return inst;
  };
})();
