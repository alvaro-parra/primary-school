// Generadores de problemas — cada tipo produce variantes aleatorias por rango
// (en vez de problemas fijos), así hay muchas combinaciones posibles.
// Cada gen() devuelve una config de "step" compatible con <Exercise>.

(function () {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1)); // entero [a,b]
  const COLORS = ["var(--secondary)", "var(--tertiary)", "var(--primary)", "var(--mm)"];
  const rc = () => COLORS[ri(0, COLORS.length - 1)];
  const mmOf = (m) => (m.cm || 0) * 10 + (m.mm || 0);

  const GEN = {
    // Medir un objeto: cuántos cm (entero)
    measureCm: () => ({ type: "measure", ask: "cm", object: { cm: ri(2, 11), mm: 0 } }),
    // Leer cm y mm en una regla de ZOOM (el 0 no se ve; barra cortada).
    // cm 2..9 para que el 0 quede siempre fuera; mm 1..9 (nunca 0).
    measureCmMm: () => ({ type: "measure", ask: "cmmm", object: { cm: ri(2, 9), mm: ri(1, 9) } }),
    // Colocar la marca en la regla (rejilla de 5 mm: músltiplos de 5)
    setRuler: () => {
      const cm = ri(2, 11), mm = Math.random() < 0.5 ? 0 : 5;
      return { type: "setRuler", target: { cm, mm }, snap: "5mm" };
    },
    // cm → mm
    toMm: () => ({ type: "convertToMm", from: { cm: ri(2, 11), mm: 0 }, support: true }),
    // mm → cm y mm (con resto, p.ej. 94 mm = 9 cm 4 mm)
    toCm: () => ({ type: "convertToCm", from: { cm: ri(1, 11), mm: ri(1, 9) }, support: true }),
    // cm y mm → mm
    mixedToMm: () => ({ type: "mixedToMm", from: { cm: ri(1, 9), mm: ri(1, 9) }, support: true }),
    // ¿cuál es más largo?
    compare: () => {
      let a, b;
      do { a = { cm: ri(1, 9), mm: ri(0, 9) }; b = { cm: ri(1, 9), mm: ri(0, 9) }; }
      while (mmOf(a) === mmOf(b));
      return { type: "compare", a, b };
    },
    // suma (puede llevar: mm que pasan de 10). Resultado ≤ 12 cm para la regla.
    add: () => ({ type: "add", a: { cm: ri(1, 5), mm: ri(1, 9) }, b: { cm: ri(1, 5), mm: ri(1, 9) } }),
    // resta (resultado positivo; a veces con préstamo)
    subtract: () => {
      const a = { cm: ri(4, 11), mm: ri(0, 9) };
      let b;
      do { b = { cm: ri(1, a.cm - 1), mm: ri(0, 9) }; } while (mmOf(b) >= mmOf(a));
      return { type: "subtract", a, b };
    },
  };

  // Lista de TIPOS de problema de la lección cm/mm. Cada uno se abre con una
  // variante aleatoria (gen). El icono se usa en la lista.
  // (Se quitó "comparar (¿cuál es más largo?)": no estaba en el examen real
  //  —allí se compara por DIFERENCIA, que ya cubre la resta— y con barras
  //  proporcionales se resolvía a ojo sin leer las medidas.)
  window.MIDOKU_PROBLEM_TYPES = [
    { id: "measureCm",   icon: "ruler",   gen: GEN.measureCm },
    { id: "measureCmMm", icon: "ruler",   gen: GEN.measureCmMm },
    { id: "setRuler",    icon: "ruler",   gen: GEN.setRuler },
    { id: "toMm",        icon: "convert", gen: GEN.toMm },
    { id: "toCm",        icon: "convert", gen: GEN.toCm },
    { id: "mixedToMm",   icon: "convert", gen: GEN.mixedToMm },
    { id: "add",         icon: "plus",    gen: GEN.add },
    { id: "subtract",    icon: "minus",   gen: GEN.subtract },
  ];

  // Genera una variante evitando que se repita ninguna de las ÚLTIMAS 3
  // mostradas de ese tipo (aunque sea aleatorio, no sale lo mismo seguido).
  const _recent = {};                          // id -> [firma, …] (máx 3)
  const signature = (s) => {
    const p = [s.type, s.ask];
    ["object", "target", "from", "a", "b"].forEach(k => { if (s[k]) p.push(s[k].cm, s[k].mm); });
    return p.join(",");
  };
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
