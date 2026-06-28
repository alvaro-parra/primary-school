// Measures — sección "Medidas": Longitud, Masa, Capacidad.
//   MeasuresList        sublista de los tres sistemas.
//   MeasureIntroBody    teoría + conversor de entrada/salida + selector de unidades.
//   Modal               ventana modal (portal a body) sin navegación.
//   UnitPicker          modal con la escalera completa y checkboxes.
//   UnitConverter       el niño teclea valores y los ve en varias unidades.
//   UnitTable           modal con las unidades y su lectura (katakana / nombre).
//   MeasureConvertExercise  ejercicio de conversión (tipo "mConvert").

/* Iconitos de los sistemas. */
function MeasureIcon({ kind, size = 28, color = "var(--ink)" }) {
  if (kind === "scale") return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M4 7 h16 M12 7 v12 M8 20 h8" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M4 7 L2 13 a3 3 0 0 0 6 0 Z" fill="none" stroke={color} strokeWidth="2"/>
      <path d="M20 7 L18 13 a3 3 0 0 0 6 0 Z" fill="none" stroke={color} strokeWidth="2"/>
      <circle cx="12" cy="5" r="1.6" fill={color}/>
    </svg>
  );
  if (kind === "drop") return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z" fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round"/>
    </svg>
  );
  // ruler
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <rect x="3" y="8" width="18" height="9" rx="2" fill="none" stroke={color} strokeWidth="2.2"/>
      {[6,9,12,15,18].map((x,i)=><line key={i} x1={x} y1="8" x2={x} y2={i%2===0?"14":"11.5"} stroke={color} strokeWidth="1.8" strokeLinecap="round"/>)}
    </svg>
  );
}

const MEAS_TITLE = (id) => id === "length" ? t("lesson_length") : id === "mass" ? t("lesson_mass") : t("lesson_capacity");
const MEAS_SUB   = (id) => id === "length" ? t("length_sub") : id === "mass" ? t("mass_sub") : t("capacity_sub");

/* ── Modal genérico (portal a body, sin navegación) ──────────── */
function Modal({ onClose, children, maxWidth = 380 }) {
  return ReactDOM.createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(42,42,51,0.5)", zIndex: 200, display: "grid", placeItems: "center", padding: "var(--space-5)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "0 6px 0 var(--ink)", padding: "var(--space-5)", width: "100%", maxWidth, maxHeight: "82vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ── Sublista de Medidas (Longitud / Masa / Capacidad) ───────── */
function MeasuresList({ onBack, onPick, completed }) {
  const ids = window.MIDOKU_MEASURE_IDS;
  const icon = (id) => window.MIDOKU_MEASURES[id].icon;
  return (
    <div style={{ position: "relative", minHeight: "100dvh", paddingBottom: "var(--space-7)" }}>
      <BgDecor/>
      <ScreenHeader onBack={onBack} center={
        <h1 style={{ margin: 0, fontSize: "calc(24px * var(--scale))", fontWeight: 700 }}>{t("lesson_measures")}</h1>
      }/>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", maxWidth: 520, margin: "0 auto" }}>
        {ids.map(id => {
          const done = completed && completed[id];
          return (
            <LessonRow key={id} title={MEAS_TITLE(id)} sub={MEAS_SUB(id)}
              icon={icon(id)} locked={false} done={done}
              onClick={() => onPick(id)}/>
          );
        })}
      </div>
    </div>
  );
}

/* ── Contenido de teoría por sistema ─────────────────────────── */
const MEAS_CONTENT = {
  length: {
    es: { intro: "Medimos longitudes (lo largo que es algo). La unidad base es el metro (m). Para cosas pequeñas usamos el centímetro (cm) y el milímetro (mm).", rule: "Cada escalón es 10 veces: 1 cm = 10 mm." },
    ja: { intro: "ながさ（どれくらい ながいか）を はかります。きほんの たんいは メートル（m）。ちいさい ものは センチメートル（cm）や ミリメートル（mm）。", rule: "1だん ごとに 10ばい：1cm = 10mm。" },
  },
  mass: {
    es: { intro: "La masa es lo que pesa algo. La unidad base es el gramo (g). Las cosas pesadas se miden en kilogramos (kg).", rule: "Cada escalón es 10 veces. 1 kg = 1000 g." },
    ja: { intro: "おもさ（しつりょう）を はかります。きほんの たんいは グラム（g）。おもい ものは キログラム（kg）。", rule: "1だん ごとに 10ばい。1kg = 1000g。" },
  },
  capacity: {
    es: { intro: "La capacidad es cuánto líquido cabe. La unidad base es el litro (L). Para poca cantidad usamos el decilitro (dL) y el mililitro (mL).", rule: "Cada escalón es 10 veces. 1 L = 10 dL = 1000 mL." },
    ja: { intro: "かさ（どれだけ えきたいが はいるか）を はかります。きほんの たんいは リットル（L）。すこしの ときは デシリットル（dL）や ミリリットル（mL）。", rule: "1だん ごとに 10ばい。1L = 10dL = 1000mL。" },
  },
};

/* Pastilla con el símbolo de una unidad. */
function UnitChip({ measure, prefix, big, dim }) {
  return (
    <span className="math-num" style={{
      display: "inline-grid", placeItems: "center", minWidth: big ? "calc(46px * var(--scale))" : "calc(38px * var(--scale))",
      padding: "calc(5px * var(--scale)) calc(7px * var(--scale))", borderRadius: "var(--r-md)",
      border: "2.5px solid var(--ink)", background: dim ? "var(--bg-2)" : "var(--tertiary-soft)",
      fontWeight: 800, fontSize: big ? "calc(17px * var(--scale))" : "calc(14px * var(--scale))", opacity: dim ? 0.55 : 1,
    }}>{window.measUnitSym(measure, prefix)}</span>
  );
}

/* Expresión de medida: "1 L 2 dL 50 mL". all=true muestra también los ceros. */
function MeasureValue({ measure, parts, size = 26, all = false }) {
  const nz = parts.filter(p => p.n > 0);
  const show = all ? parts : (nz.length ? nz : [parts[parts.length - 1]]);
  return (
    <span className="math-num" style={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: `calc(${size}px * var(--scale))` }}>
      {show.map((p, i) => (
        <span key={i} style={{ marginLeft: i ? "calc(8px * var(--scale))" : 0 }}>
          {p.n}<span style={{ color: "var(--cm-accent)", fontSize: "0.6em", marginLeft: 1 }}>{window.measUnitSym(measure, p.prefix)}</span>
        </span>
      ))}
    </span>
  );
}

/* ── Conversor: el niño ajusta valores y los ve en varias unidades ─
   Entrada: una fila por unidad (mayor → menor), valor 0-100, con
   botones ⏮ (mín) − [valor] + ⏭ (máx).
   Salida: la misma cantidad en cada agrupación, quitando la unidad
   mayor en cada paso, hasta la unidad más pequeña. */
const CONV_MAX = 1000;
function ConvRow({ measure, prefix, value, onChange }) {
  const clamp = (v) => Math.max(0, Math.min(CONV_MAX, v));
  const valueRef = useRef(value); valueRef.current = value;   // último valor para el auto-repeat
  const timer = useRef(null);
  const stop = () => { if (timer.current) { clearTimeout(timer.current); clearInterval(timer.current); timer.current = null; } };
  useEffect(() => stop, []);   // limpiar al desmontar
  // Mantener pulsado un botón ±: aplica una vez y, tras una pausa, repite.
  const startRepeat = (delta) => {
    stop();
    onChange(clamp(valueRef.current + delta));
    timer.current = setTimeout(() => {
      timer.current = setInterval(() => {
        const next = clamp(valueRef.current + delta);
        if (next === valueRef.current) return stop();
        onChange(next);
      }, 80);
    }, 350);
  };
  const baseStyle = (disabled) => ({ minWidth: "calc(31px * var(--scale))", height: "calc(32px * var(--scale))",
    borderRadius: "var(--r-md)", border: "3px solid var(--ink)", background: "var(--surface)",
    boxShadow: disabled ? "none" : "0 3px 0 var(--ink)", fontWeight: 800, fontSize: "calc(13px * var(--scale))",
    lineHeight: 1, opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer", touchAction: "none", userSelect: "none" });
  // Salto directo a mín/máx (un solo toque).
  const jump = (label, to, disabled) => (
    <button onClick={() => onChange(clamp(to))} disabled={disabled} aria-label={String(label)} style={baseStyle(disabled)}>{label}</button>
  );
  // Botón ± con auto-repetición al mantener pulsado.
  const rep = (label, delta, disabled) => (
    <button disabled={disabled} aria-label={String(label)} style={baseStyle(disabled)}
      onPointerDown={(e) => { e.preventDefault(); if (!disabled) startRepeat(delta); }}
      onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}>{label}</button>
  );
  const atMin = value <= 0, atMax = value >= CONV_MAX;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: "calc(8px * var(--scale))" }}>
      <span style={{ minWidth: "calc(46px * var(--scale))", textAlign: "right" }}><UnitChip measure={measure} prefix={prefix}/></span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(4px * var(--scale))", flexWrap: "wrap" }}>
        {jump("⏮", 0, atMin)}
        {rep("−10", -10, atMin)}
        {rep("−", -1, atMin)}
        <span className="math-num" style={{ minWidth: "calc(58px * var(--scale))", textAlign: "center", fontSize: "calc(24px * var(--scale))", fontWeight: 800 }}>{value}</span>
        {rep("+", 1, atMax)}
        {rep("+10", 10, atMax)}
        {jump("⏭", CONV_MAX, atMax)}
      </div>
    </div>
  );
}

function UnitConverter({ measure, enabled }) {
  const desc = enabled.slice().reverse();           // mayor → menor
  const [vals, setVals] = useState(() => desc.map((_, i) => (i === 0 ? 1 : 0)));
  const set = (i, v) => setVals(prev => { const c = [...prev]; c[i] = v; return c; });

  const totalMilli = desc.reduce((s, p, i) => s + vals[i] * window.measUnitMilli(p), 0);
  // Filas de salida: desde todas las unidades hasta solo la más pequeña.
  const rows = desc.map((_, k) => {
    const groupAsc = desc.slice(k).slice().reverse();        // ascendente
    return window.measDecompose(totalMilli, groupAsc);        // mayor → menor
  });

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* Entrada: una fila por unidad */}
      <div style={{ display: "grid", gap: "calc(8px * var(--scale))" }}>
        {desc.map((p, i) => (
          <ConvRow key={p} measure={measure} prefix={p} value={vals[i]} onChange={(v) => set(i, v)}/>
        ))}
      </div>

      {/* Salida: la cantidad en cada agrupación de unidades */}
      <div style={{ background: "var(--surface)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", padding: "var(--space-4) var(--space-3)", display: "grid", gap: "var(--space-2)" }}>
        {rows.map((parts, k) => (
          <div key={k} style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "calc(6px * var(--scale))" }}>
            <span className="math-num" style={{ fontSize: "calc(20px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
            <MeasureValue measure={measure} parts={parts} size={24} all/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Modal selector de unidades ──────────────────────────────── */
function UnitPicker({ measure, onClose, onChange }) {
  const ladder = window.measLadder();
  const [sel, setSel] = useState(() => window.measEnabled(measure));
  const lang = getLang();
  const toggle = (prefix) => {
    const has = sel.includes(prefix);
    let next = has ? sel.filter(p => p !== prefix) : [...sel, prefix];
    if (next.length === 0) next = [prefix];   // al menos una
    const saved = window.measSetEnabled(measure, next);
    setSel(saved);
    onChange && onChange(saved);
  };
  return (
    <Modal onClose={onClose} maxWidth={360}>
      <h2 style={{ margin: "0 0 var(--space-4)", fontSize: "calc(19px * var(--scale))", fontWeight: 700, textAlign: "center" }}>{t("pick_units")}</h2>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        {ladder.map(prefix => {
          const on = sel.includes(prefix);
          return (
            <button key={prefix} onClick={() => toggle(prefix)}
              style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "calc(8px * var(--scale)) var(--space-3)",
                borderRadius: "var(--r-md)", border: "3px solid var(--ink)", cursor: "pointer", textAlign: "left",
                background: on ? "var(--ok-soft)" : "var(--surface)" }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, border: "2.5px solid var(--ink)", background: on ? "var(--ok)" : "var(--surface)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                {on && <svg viewBox="0 0 24 24" width={16} height={16}><path d="M5 13 L10 18 L19 6" stroke="var(--ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              <span className="math-num" style={{ fontWeight: 800, fontSize: "calc(17px * var(--scale))", minWidth: "2.6em" }}>{window.measUnitSym(measure, prefix)}</span>
              <span style={{ fontSize: "calc(13px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{window.measUnitName(measure, prefix, lang)}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: "var(--space-4)" }}>
        <BigButton color="accent" onClick={onClose} style={{ width: "100%" }}>{t("done")}</BigButton>
      </div>
    </Modal>
  );
}

/* ── Modal tabla de unidades (con lectura en katakana / nombre) ─ */
function UnitTable({ measure, onClose }) {
  const ladder = window.measLadder();
  const lang = getLang();
  const cell = { padding: "calc(8px * var(--scale)) calc(10px * var(--scale))", borderBottom: "2px solid var(--bg-2)", textAlign: "left" };
  return (
    <Modal onClose={onClose} maxWidth={420}>
      <h2 style={{ margin: "0 0 var(--space-4)", fontSize: "calc(19px * var(--scale))", fontWeight: 700, textAlign: "center" }}>{t("unit_table")}</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", background: "var(--surface)", border: "2.5px solid var(--ink)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
        <tbody>
          {ladder.map(prefix => (
            <tr key={prefix}>
              <td style={{ ...cell, width: "32%" }}><span className="math-num" style={{ fontWeight: 800, fontSize: "calc(20px * var(--scale))" }}>{window.measUnitSym(measure, prefix)}</span></td>
              <td style={{ ...cell, fontSize: "calc(16px * var(--scale))", fontWeight: 600 }}>{window.measUnitName(measure, prefix, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "var(--space-4)" }}>
        <BigButton color="accent" onClick={onClose} style={{ width: "100%" }}>{t("done")}</BigButton>
      </div>
    </Modal>
  );
}

/* ── Cuerpo de teoría de un sistema de medida ────────────────── */
function MeasureIntroBody({ lessonId }) {
  const lang = getLang();
  const c = (MEAS_CONTENT[lessonId] && (MEAS_CONTENT[lessonId][lang] || MEAS_CONTENT[lessonId].es)) || MEAS_CONTENT.length.es;
  const [enabled, setEnabled] = useState(() => window.measEnabled(lessonId));
  const [showPicker, setShowPicker] = useState(false);
  const [showTable, setShowTable] = useState(false);

  return (
    <>
      <p style={{ margin: 0, fontSize: "calc(17px * var(--scale))", fontWeight: 600, lineHeight: 1.45, color: "var(--ink-soft)", textWrap: "pretty" }}>{c.intro}</p>

      {/* Herramientas: unidades + tabla */}
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <BigButton color="secondary" onClick={() => setShowPicker(true)} style={{ flex: 1 }}>{t("units_btn")}</BigButton>
        <BigButton color="neutral" onClick={() => setShowTable(true)} style={{ flex: 1 }}>{t("unit_table")}</BigButton>
      </div>

      <IntroSection title={t("ladder_rule")}>
        <p style={{ margin: 0, fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.rule}</p>
      </IntroSection>

      <IntroSection title={t("other_units")}>
        <UnitConverter key={enabled.join(",")} measure={lessonId} enabled={enabled}/>
      </IntroSection>

      {showPicker && <UnitPicker measure={lessonId} onChange={setEnabled} onClose={() => setShowPicker(false)}/>}
      {showTable && <UnitTable measure={lessonId} onClose={() => setShowTable(false)}/>}
    </>
  );
}

/* ── Ejercicio de conversión (tipo "mConvert") ───────────────── */
function MeasureConvertExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const { measure, given, ask } = step;
  const totalMilli = window.measSumMilli(given);
  const askAsc = ask.slice().sort((a, b) => window.measUnitExp(a) - window.measUnitExp(b));
  const parts = window.measDecompose(totalMilli, askAsc);   // mayor → menor (orden de lectura)
  const slots = parts.map(p => ({ unit: window.measUnitSym(measure, p.prefix), max: Math.max(4, String(p.n).length) }));
  const entry = useNumEntry(slots, slot);
  const correctLabel = parts.map(p => `${p.n} ${window.measUnitSym(measure, p.prefix)}`).join(" ");
  useEffect(() => {
    apiRef.current = { correctLabel, check: () => parts.every((p, i) => Number(entry.vals[i]) === p.n) };
  });
  useEffect(() => { onCanCheck(entry.filled); }, [entry.filled]);
  const fState = (i) => phase !== "checked" ? null : (Number(entry.vals[i]) === parts[i].n ? "ok" : "ng");

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <QuestionBar>{t("mConvertQ")}</QuestionBar>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(10px * var(--scale))", flexWrap: "wrap", padding: "var(--space-3) 0" }}>
        <MeasureValue measure={measure} parts={given.map(g => ({ prefix: g.prefix, n: g.n }))} size={30}/>
        <span className="math-num" style={{ fontSize: "calc(26px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
        {parts.map((p, i) => (
          <AnswerField key={i} value={entry.vals[i]} unit={window.measUnitSym(measure, p.prefix)}
            active={phase === "input" && entry.active === i} state={fState(i)}
            onFocus={phase === "input" ? () => entry.setActive(i) : null}/>
        ))}
      </div>
      <NumberPad onDigit={entry.push} onDelete={entry.del} onClear={entry.clear} disabled={phase === "checked"}/>
    </div>
  );
}

/* ── Ejercicio: ¿cuál es mayor? (tipo "mCompare") ────────────── */
function MeasureCompareExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const { measure, a, b } = step;
  const [sel, setSelRaw] = useState(() => (slot && slot.sel) || null);
  const setSel = (s) => { if (slot) slot.sel = s; setSelRaw(s); };
  const aM = window.measSumMilli(a), bM = window.measSumMilli(b);
  const correctKey = aM >= bM ? "a" : "b";
  const labelOf = (parts) => parts.map(p => `${p.n} ${window.measUnitSym(measure, p.prefix)}`).join(" ");
  useEffect(() => { apiRef.current = { correctLabel: labelOf(correctKey === "a" ? a : b), check: () => sel === correctKey }; });
  useEffect(() => { onCanCheck(sel != null); }, [sel]);
  const max = Math.max(aM, bM);

  const Card = ({ k, parts, milli, color }) => {
    const selected = sel === k, isCorrect = k === correctKey;
    let border = "var(--ink)", bg = "var(--surface)";
    if (phase === "checked") { if (isCorrect) { border = "var(--ok)"; bg = "var(--ok-soft)"; } else if (selected) { border = "var(--ng)"; bg = "var(--ng-soft)"; } }
    else if (selected) { border = "var(--secondary-strong)"; bg = "var(--bg-2)"; }
    return (
      <button onClick={() => phase === "input" && setSel(k)} style={{
        display: "grid", gap: "var(--space-3)", padding: "var(--space-4)", background: bg,
        border: `3px solid ${border}`, borderRadius: "var(--r-lg)", boxShadow: selected ? "0 5px 0 var(--ink)" : "0 4px 0 rgba(42,42,51,0.25)",
        textAlign: "center", transition: "all 150ms", flex: 1, minWidth: 0,
      }}>
        <MeasureValue measure={measure} parts={parts} size={28}/>
        <div style={{ width: "100%", height: 18, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden", border: "2px solid var(--ink)" }}>
          <div style={{ width: `${Math.max(6, (milli / max) * 100)}%`, height: "100%", background: color, borderRadius: 999 }}/>
        </div>
      </button>
    );
  };
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <QuestionBar>{t("mCompareQ")}</QuestionBar>
      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "stretch" }}>
        <Card k="a" parts={a} milli={aM} color="var(--primary)"/>
        <Card k="b" parts={b} milli={bM} color="var(--secondary)"/>
      </div>
    </div>
  );
}

/* ── Ejercicio: sumar/restar medidas (tipo "mCalc") ──────────── */
function MeasureCalcExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const { measure, op, a, b } = step;
  const aM = window.measSumMilli(a), bM = window.measSumMilli(b);
  const total = op === "+" ? aM + bM : aM - bM;
  // Respuesta en las unidades que aparecen en los operandos (ascendente).
  const prefixes = [...new Set([...a, ...b].map(x => x.prefix))].sort((x, y) => window.measUnitExp(x) - window.measUnitExp(y));
  const parts = window.measDecompose(total, prefixes);   // mayor → menor
  const slots = parts.map(p => ({ unit: window.measUnitSym(measure, p.prefix), max: Math.max(4, String(p.n).length) }));
  const entry = useNumEntry(slots, slot);
  const correctLabel = parts.map(p => `${p.n} ${window.measUnitSym(measure, p.prefix)}`).join(" ");
  useEffect(() => { apiRef.current = { correctLabel, check: () => parts.every((p, i) => Number(entry.vals[i]) === p.n) }; });
  useEffect(() => { onCanCheck(entry.filled); }, [entry.filled]);
  const fState = (i) => phase !== "checked" ? null : (Number(entry.vals[i]) === parts[i].n ? "ok" : "ng");
  const opColor = op === "+" ? "var(--ok)" : "var(--ng)";

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <QuestionBar>{op === "+" ? t("mAddQ") : t("mSubQ")}</QuestionBar>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(8px * var(--scale))", flexWrap: "wrap", padding: "var(--space-3) 0" }}>
        <MeasureValue measure={measure} parts={a} size={26}/>
        <span className="math-num" style={{ fontSize: "calc(24px * var(--scale))", fontWeight: 700, color: opColor }}>{op === "+" ? "+" : "−"}</span>
        <MeasureValue measure={measure} parts={b} size={26}/>
        <span className="math-num" style={{ fontSize: "calc(24px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
        {parts.map((p, i) => (
          <AnswerField key={i} value={entry.vals[i]} unit={window.measUnitSym(measure, p.prefix)}
            active={phase === "input" && entry.active === i} state={fState(i)}
            onFocus={phase === "input" ? () => entry.setActive(i) : null}/>
        ))}
      </div>
      <NumberPad onDigit={entry.push} onDelete={entry.del} onClear={entry.clear} disabled={phase === "checked"}/>
    </div>
  );
}

Object.assign(window, { MeasuresList, MeasureIntroBody, MeasureConvertExercise, MeasureCompareExercise, MeasureCalcExercise, MeasureIcon });
