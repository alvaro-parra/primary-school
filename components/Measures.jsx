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
  if (kind === "clock") return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth="2.2"/>
      <path d="M12 7 v5 l3.5 2" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
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

const MEAS_TITLE = (id) => t({ length: "lesson_length", mass: "lesson_mass", capacity: "lesson_capacity", time: "lesson_time" }[id] || "lesson_capacity");
const MEAS_SUB   = (id) => t({ length: "length_sub", mass: "mass_sub", capacity: "capacity_sub", time: "time_sub" }[id] || "capacity_sub");

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
    es: { intro: "Medimos longitudes (lo largo que es algo). La unidad base es el metro (m). Para cosas pequeñas usamos el centímetro (cm) y el milímetro (mm).", rule: "Cada escalón es 10 veces:" },
    ja: { intro: "ながさ（どれくらい ながいか）を はかります。きほんの たんいは メートル（m）。ちいさい ものは センチメートル（cm）や ミリメートル（mm）。", rule: "1だん ごとに 10ばい：" },
  },
  mass: {
    es: { intro: "La masa es lo que pesa algo. La unidad base es el gramo (g). Las cosas pesadas se miden en kilogramos (kg).", rule: "Cada escalón es 10 veces:" },
    ja: { intro: "おもさ（しつりょう）を はかります。きほんの たんいは グラム（g）。おもい ものは キログラム（kg）。", rule: "1だん ごとに 10ばい：" },
  },
  capacity: {
    es: { intro: "La capacidad es cuánto líquido cabe. La unidad base es el litro (L). Para poca cantidad usamos el decilitro (dL) y el mililitro (mL).", rule: "Cada escalón es 10 veces:" },
    ja: { intro: "かさ（どれだけ えきたいが はいるか）を はかります。きほんの たんいは リットル（L）。すこしの ときは デシリットル（dL）や ミリリットル（mL）。", rule: "1だん ごとに 10ばい：" },
  },
  time: {
    es: { intro: "El tiempo mide cuánto dura algo. Se cuenta en días (d), horas (h), minutos (min) y segundos (s). Aquí cada escalón NO es 10.", rule: "Cada escalón es distinto:" },
    ja: { intro: "じかんは どれくらい つづくかを はかります。ひ（d）・じかん（h）・ふん（min）・びょう（s）で かぞえます。ここは 10ずつ ではありません。", rule: "だんは バラバラ：" },
  },
};

/* Equivalencias básicas del sistema.
   · Métrico (×10): una cadena única (1 L = 10 dL = 1000 mL).
   · Tiempo (escalera irregular): una fila por escalón adyacente
     (1 d = 24 h, 1 h = 60 min, 1 min = 60 s), porque "1 d = 86400 s" no
     le dice nada a un niño pequeño. */
function LadderRule({ measure }) {
  const atom = (p) => window.measUnitAtom(measure, p);
  const desc = window.MIDOKU_MEASURES[measure].basic.slice().sort((a, b) => atom(b) - atom(a));   // mayor → menor
  const irregular = window.MIDOKU_MEASURES[measure].kind === "time";
  const Eq = () => <span className="math-num" style={{ fontSize: "calc(24px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>;
  const Term = ({ n, prefix }) => (
    <span className="math-num" style={{ fontSize: "calc(32px * var(--scale))", fontWeight: 800 }}>{n}<span style={{ color: "var(--cm-accent)", fontSize: "0.5em", marginLeft: 1 }}>{window.measUnitSym(measure, prefix)}</span></span>
  );

  if (irregular) {
    // Escalón a escalón: 1 [alta] = factor [baja siguiente].
    const rows = desc.slice(0, -1).map((hi, i) => ({ hi, lo: desc[i + 1], f: atom(hi) / atom(desc[i + 1]) }));
    return (
      <div style={{ display: "grid", gap: "calc(6px * var(--scale))", justifyItems: "center", padding: "var(--space-2) 0 var(--space-1)" }}>
        {rows.map((r) => (
          <div key={r.hi} style={{ display: "flex", alignItems: "baseline", gap: "calc(8px * var(--scale))" }}>
            <Term n={1} prefix={r.hi}/><Eq/><Term n={r.f} prefix={r.lo}/>
          </div>
        ))}
      </div>
    );
  }

  const chain = desc.map(p => ({ n: atom(desc[0]) / atom(p), prefix: p }));
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "calc(8px * var(--scale))", flexWrap: "wrap", padding: "var(--space-2) 0 var(--space-1)" }}>
      {chain.map((c, i) => (
        <React.Fragment key={c.prefix}>
          {i > 0 && <Eq/>}
          <Term n={c.n} prefix={c.prefix}/>
        </React.Fragment>
      ))}
    </div>
  );
}

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
const CONV_DIGITS = 4;            // el número siempre se muestra con 4 cifras
// Aceleración al mantener pulsado: ×1 al principio, ×10 pasados ~2 s.
const CONV_RAMP = [[2000, 10], [0, 1]];
function convStep(elapsed) { return (CONV_RAMP.find(([t]) => elapsed >= t) || [0, 1])[1]; }

function ConvRow({ measure, prefix, value, onChange }) {
  const clamp = (v) => Math.max(0, Math.min(CONV_MAX, v));
  const valueRef = useRef(value); valueRef.current = value;
  const timer = useRef(null);
  const stop = () => { if (timer.current) { clearTimeout(timer.current); clearInterval(timer.current); timer.current = null; } };
  useEffect(() => stop, []);   // limpiar al desmontar
  // Mantener pulsado: avanza de 1 en 1 y, pasados unos segundos, acelera.
  const startRepeat = (dir) => {
    stop();
    const t0 = performance.now();
    const applyOnce = () => {
      const step = convStep(performance.now() - t0);
      const v = valueRef.current;
      // Al acelerar (paso 10) saltamos al múltiplo de 10 → las unidades quedan a 0.
      const next = clamp(dir > 0 ? (Math.floor(v / step) + 1) * step : (Math.ceil(v / step) - 1) * step);
      if (next === v) return false;
      onChange(next);
      return true;
    };
    // Cadencia por tramo: ×1 suave (90 ms), ×10 más rápido (50 ms).
    const loop = () => {
      if (!applyOnce()) return stop();
      timer.current = setTimeout(loop, convStep(performance.now() - t0) >= 10 ? 50 : 90);
    };
    applyOnce();                               // primer toque inmediato
    timer.current = setTimeout(loop, 350);     // pausa inicial, luego repite
  };
  const atMin = value <= 0, atMax = value >= CONV_MAX;
  const btn = (label, dir, disabled) => (
    <button disabled={disabled} aria-label={dir < 0 ? "menos" : "más"}
      style={{ width: "calc(44px * var(--scale))", height: "calc(44px * var(--scale))", flexShrink: 0,
        borderRadius: "var(--r-md)", border: "3px solid var(--ink)", background: "var(--surface)",
        boxShadow: disabled ? "none" : "0 3px 0 var(--ink)", fontWeight: 800, fontSize: "calc(26px * var(--scale))",
        lineHeight: 1, opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer", touchAction: "none", userSelect: "none" }}
      onPointerDown={(e) => { e.preventDefault(); if (!disabled) startRepeat(dir); }}
      onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}>{label}</button>
  );

  // 4 cifras; los ceros a la izquierda en pálido (nunca la última cifra).
  const digits = String(value).padStart(CONV_DIGITS, "0").split("");
  const firstNZ = digits.findIndex(d => d !== "0");
  const paleUntil = firstNZ === -1 ? CONV_DIGITS - 1 : firstNZ;   // 0000 → última sólida

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(10px * var(--scale))" }}>
      <span style={{ minWidth: "calc(46px * var(--scale))", textAlign: "right" }}><UnitChip measure={measure} prefix={prefix}/></span>
      {btn("−", -1, atMin)}
      <span className="math-num" style={{ textAlign: "center", fontSize: "calc(30px * var(--scale))", fontWeight: 800 }}>
        {digits.map((d, i) => <span key={i} style={{ opacity: i < paleUntil ? 0.25 : 1 }}>{d}</span>)}
      </span>
      {btn("+", 1, atMax)}
    </div>
  );
}

function UnitConverter({ measure, enabled }) {
  const desc = enabled.slice().reverse();           // mayor → menor
  const [vals, setVals] = useState(() => desc.map((_, i) => (i === 0 ? 1 : 0)));
  const set = (i, v) => setVals(prev => { const c = [...prev]; c[i] = v; return c; });

  const totalAtoms = desc.reduce((s, p, i) => s + vals[i] * window.measUnitAtom(measure, p), 0);
  // Filas de salida: desde todas las unidades hasta solo la más pequeña.
  const rows = desc.map((_, k) => {
    const groupAsc = desc.slice(k).slice().reverse();        // ascendente
    return window.measDecompose(measure, totalAtoms, groupAsc);   // mayor → menor
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
  const ladder = window.measLadder(measure);
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

/* ── Modal tabla de unidades (solo las seleccionadas, mayor → menor) ─ */
function UnitTable({ measure, enabled, onClose }) {
  const units = (enabled || window.measEnabled(measure)).slice().reverse();   // mayor → menor
  const lang = getLang();
  const cell = { padding: "calc(8px * var(--scale)) calc(10px * var(--scale))", borderBottom: "2px solid var(--bg-2)", textAlign: "left" };
  return (
    <Modal onClose={onClose} maxWidth={420}>
      <h2 style={{ margin: "0 0 var(--space-4)", fontSize: "calc(19px * var(--scale))", fontWeight: 700, textAlign: "center" }}>{t("unit_table")}</h2>
      <table style={{ borderCollapse: "collapse", width: "100%", background: "var(--surface)", border: "2.5px solid var(--ink)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
        <tbody>
          {units.map(prefix => (
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
// `enabled` (unidades activas) lo gestiona LessonIntro junto al engranaje de
// configuración de la cabecera.
function MeasureIntroBody({ lessonId, enabled }) {
  const lang = getLang();
  const c = (MEAS_CONTENT[lessonId] && (MEAS_CONTENT[lessonId][lang] || MEAS_CONTENT[lessonId].es)) || MEAS_CONTENT.length.es;
  const units = enabled || window.measEnabled(lessonId);
  const [showTable, setShowTable] = useState(false);

  return (
    <>
      <p style={{ margin: 0, fontSize: "calc(17px * var(--scale))", fontWeight: 600, lineHeight: 1.45, color: "var(--ink-soft)", textWrap: "pretty" }}>{c.intro}</p>

      <BigButton color="neutral" onClick={() => setShowTable(true)} style={{ width: "100%" }}>{t("unit_table")}</BigButton>

      <IntroSection title={t("ladder_rule")}>
        <p style={{ margin: 0, fontSize: "calc(14px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)", textAlign: "center" }}>{c.rule}</p>
        <LadderRule measure={lessonId}/>
      </IntroSection>

      <IntroSection title={t("other_units")}>
        <UnitConverter key={units.join(",")} measure={lessonId} enabled={units}/>
      </IntroSection>

      {showTable && <UnitTable measure={lessonId} enabled={units} onClose={() => setShowTable(false)}/>}
    </>
  );
}

/* ── Ejercicio de conversión (tipo "mConvert") ───────────────── */
function MeasureConvertExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const { measure, given, ask } = step;
  const totalAtoms = window.measSumAtoms(measure, given);
  const askAsc = ask.slice().sort((a, b) => window.measUnitAtom(measure, a) - window.measUnitAtom(measure, b));
  const parts = window.measDecompose(measure, totalAtoms, askAsc);   // mayor → menor (orden de lectura)
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

/* ── Ejercicio: ¿cuál es mayor? (tipo "mCompare") ──────────────
   Lista de cantidades (en unidades mezcladas). Hay que compararlas LEYENDO
   los números; las barras solo se revelan al comprobar. */
function MeasureCompareExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const { measure, items } = step;
  const [sel, setSelRaw] = useState(() => (slot && slot.sel != null ? slot.sel : null));
  const setSel = (s) => { if (slot) slot.sel = s; setSelRaw(s); };
  const millis = items.map(it => window.measSumAtoms(measure, it));
  const max = Math.max(...millis);
  const correctIdx = millis.indexOf(max);
  const labelOf = (parts) => parts.map(p => `${p.n} ${window.measUnitSym(measure, p.prefix)}`).join(" ");
  useEffect(() => { apiRef.current = { correctLabel: labelOf(items[correctIdx]), check: () => sel === correctIdx }; });
  useEffect(() => { onCanCheck(sel != null); }, [sel]);
  const checked = phase === "checked";

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <QuestionBar>{t("mCompareQ")}</QuestionBar>
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {items.map((it, i) => {
          const selected = sel === i, isCorrect = i === correctIdx;
          let border = "var(--ink)", bg = "var(--surface)";
          if (checked) { if (isCorrect) { border = "var(--ok)"; bg = "var(--ok-soft)"; } else if (selected) { border = "var(--ng)"; bg = "var(--ng-soft)"; } }
          else if (selected) { border = "var(--secondary-strong)"; bg = "var(--bg-2)"; }
          return (
            <button key={i} onClick={() => phase === "input" && setSel(i)} style={{
              display: "grid", gap: "var(--space-2)", padding: "var(--space-4) var(--space-5)", background: bg,
              border: `3px solid ${border}`, borderRadius: "var(--r-lg)", boxShadow: selected ? "0 5px 0 var(--ink)" : "0 4px 0 rgba(42,42,51,0.25)",
              textAlign: "center", transition: "all 150ms", width: "100%",
            }}>
              <MeasureValue measure={measure} parts={it} size={40}/>
              {/* La barra ocupa sitio siempre (no redimensiona la caja): rayas
                  grises mientras se decide, barra de color al comprobar. */}
              <div style={{ width: "100%", height: 16, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden", border: "2px solid var(--ink)" }}>
                {checked ? (
                  <div style={{ width: `${Math.max(6, (millis[i] / max) * 100)}%`, height: "100%", background: isCorrect ? "var(--ok)" : "var(--secondary)", borderRadius: 999, transition: "width 450ms ease" }}/>
                ) : (
                  <div style={{ width: "100%", height: "100%", opacity: 0.5, backgroundImage: "repeating-linear-gradient(45deg, var(--ink-faint) 0, var(--ink-faint) 5px, transparent 5px, transparent 10px)" }}/>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Ejercicio: sumar/restar medidas (tipo "mCalc") ──────────── */
function MeasureCalcExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const { measure, op, a, b } = step;
  const aM = window.measSumAtoms(measure, a), bM = window.measSumAtoms(measure, b);
  const total = op === "+" ? aM + bM : aM - bM;
  // Respuesta en las unidades que aparecen en los operandos (ascendente).
  const prefixes = [...new Set([...a, ...b].map(x => x.prefix))].sort((x, y) => window.measUnitAtom(measure, x) - window.measUnitAtom(measure, y));
  const parts = window.measDecompose(measure, total, prefixes);   // mayor → menor
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
      {/* Vertical estilo libreta: operandos apilados, operador a la izquierda,
          línea y, debajo, los campos de respuesta (evita el ancho de una línea). */}
      <div style={{ display: "grid", justifyContent: "center", padding: "var(--space-3) 0" }}>
        <div style={{ display: "inline-grid", gridTemplateColumns: "auto auto", columnGap: "calc(12px * var(--scale))", rowGap: "calc(6px * var(--scale))", justifyItems: "end", alignItems: "center" }}>
          <span aria-hidden/>
          <MeasureValue measure={measure} parts={a} size={38}/>
          <span className="math-num" style={{ fontSize: "calc(34px * var(--scale))", fontWeight: 700, color: opColor }}>{op === "+" ? "+" : "−"}</span>
          <MeasureValue measure={measure} parts={b} size={38}/>
          <div style={{ gridColumn: "1 / -1", justifySelf: "stretch", height: 3, background: "var(--ink)", marginTop: "calc(6px * var(--scale))", marginBottom: "calc(8px * var(--scale))", borderRadius: 2 }}/>
          <span aria-hidden/>
          <div style={{ display: "flex", gap: "calc(8px * var(--scale))", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {parts.map((p, i) => (
              <AnswerField key={i} value={entry.vals[i]} unit={window.measUnitSym(measure, p.prefix)}
                active={phase === "input" && entry.active === i} state={fState(i)}
                onFocus={phase === "input" ? () => entry.setActive(i) : null}/>
            ))}
          </div>
        </div>
      </div>
      <NumberPad onDigit={entry.push} onDelete={entry.del} onClear={entry.clear} disabled={phase === "checked"}/>
    </div>
  );
}

Object.assign(window, { MeasuresList, MeasureIntroBody, MeasureConvertExercise, MeasureCompareExercise, MeasureCalcExercise, MeasureIcon });
