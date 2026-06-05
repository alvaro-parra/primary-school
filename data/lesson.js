// Lección 1 — Centímetros y milímetros.
// Secuencia autorada con progresión: enseñar → medir → convertir → mixto
// → comparar → sumar. Cada paso declara su tipo y sus valores.
// Medidas en {cm, mm}; el total en mm = cm*10 + mm.

window.MIDOKU_LESSON_1 = {
  id: "units",
  steps: [
    {
      type: "teach",
      // tarjeta de intuición: 1 cm = 10 mm sobre la regla
      cm: 1,
    },
    {
      type: "measure",       // leer la longitud de un objeto en la regla
      object: { cm: 4, mm: 0, color: "var(--secondary)", label: "" },
      ask: "cm",
    },
    {
      type: "setRuler",      // arrastrar la marca a una longitud pedida
      target: { cm: 6, mm: 0 },
      snap: "cm",
    },
    {
      type: "convertToMm",   // 5 cm = ? mm
      from: { cm: 5, mm: 0 },
      support: true,
    },
    {
      type: "measure",
      object: { cm: 3, mm: 5, color: "var(--tertiary)", label: "" },
      ask: "cmmm",
    },
    {
      type: "convertToCm",   // 70 mm = ? cm
      from: { cm: 7, mm: 0 },
      support: true,
    },
    {
      type: "mixedToMm",     // 2 cm 4 mm = ? mm
      from: { cm: 2, mm: 4 },
      support: true,
    },
    {
      type: "compare",       // ¿cuál es más largo?
      a: { cm: 3, mm: 5 },
      b: { cm: 0, mm: 38 },
    },
    {
      type: "add",           // 1 cm 5 mm + 2 cm 2 mm
      a: { cm: 1, mm: 5 },
      b: { cm: 2, mm: 2 },
    },
  ],
};

// helpers de medida
window.mmOf = (m) => (m.cm || 0) * 10 + (m.mm || 0);
window.toCmMm = (totalMm) => ({ cm: Math.floor(totalMm / 10), mm: totalMm % 10 });
window.fmtMeasure = (m) => {
  const cm = m.cm || 0, mm = m.mm || 0;
  if (cm && mm) return `${cm} cm ${mm} mm`;
  if (cm) return `${cm} cm`;
  return `${mm} mm`;
};

// Catálogo de lecciones del curso 1-2年. Por ahora una: cm/mm.
window.MIDOKU_LESSONS = [
  { id: "units", lesson: "MIDOKU_LESSON_1", icon: "ruler", state: "active" },
];
