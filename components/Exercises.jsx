// Exercises — un componente por tipo de paso. Cada uno gestiona su estado,
// expone check() vía apiRef y avisa de si se puede comprobar (onCanCheck).
//
// Contrato común (props):
//   step       definición del paso
//   apiRef     ref donde el ejercicio publica { check, correctLabel }
//   onCanCheck (bool) => void  — habilita el botón Comprobar del footer
//   phase      "input" | "checked"
//   result     null | true | false  (relleno por la lección al comprobar)

const { mmOf, toCmMm, fmtMeasure } = window;

/* Hook de entrada numérica multi-slot. Persiste en `slot` (objeto estable
   por índice) para que la respuesta se conserve al navegar atrás/adelante. */
function useNumEntry(slots, slot) {
  const [vals, setVals] = useState(() => (slot && slot.vals) ? slot.vals : slots.map(() => ""));
  const [active, setActive] = useState(() => (slot && slot.active) || 0);
  const push = (d) => setVals(v => {
    const c = [...v]; const max = slots[active].max || 2;
    if (c[active].length < max) c[active] = c[active] + String(d);
    if (slot) slot.vals = c;
    return c;
  });
  const del = () => setVals(v => { const c = [...v]; c[active] = c[active].slice(0, -1); if (slot) slot.vals = c; return c; });
  const setActiveP = (i) => { if (slot) slot.active = i; setActive(i); };
  const filled = vals.every(x => x !== "");
  return { vals, active, setActive: setActiveP, push, del, filled };
}

/* Barra de pregunta — solo título (sin voz por ahora). */
function QuestionBar({ children, onSpeak }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) var(--space-1)" }}>
      <h2 style={{ flex: 1, margin: 0, fontSize: "calc(23px * var(--scale))", fontWeight: 700, lineHeight: 1.2, textWrap: "pretty" }}>{children}</h2>
    </div>
  );
}

/* Expresión grande de medida tipo "5 cm" o "2 cm 4 mm". */
function MeasureExpr({ m, size = 46 }) {
  const cm = m.cm || 0, mm = m.mm || 0;
  return (
    <span className="math-num" style={{ fontSize: `calc(${size}px * var(--scale))`, fontWeight: 700, whiteSpace: "nowrap" }}>
      {cm > 0 && <>{cm}<span style={{ color: "var(--cm-accent)", fontSize: "0.6em", marginLeft: 1, marginRight: cm && mm ? 6 : 0 }}>cm</span></>}
      {mm > 0 && <>{mm}<span style={{ color: "var(--mm)", fontSize: "0.6em", marginLeft: 1 }}>mm</span></>}
      {cm === 0 && mm === 0 && <>0</>}
    </span>
  );
}

const exprBox = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(14px * var(--scale))",
  flexWrap: "wrap", padding: "var(--space-4)",
};

/* ── TEACH ─────────────────────────────────────────────────── */
// Diagrama dedicado: 1 cm dividido en 10 mm, ancho y claro.
function CmZoom({ shown }) {
  const X0 = 12, X1 = 208, W = X1 - X0, BY = 22, BH = 26;
  const cellRects = [], cellNums = [];
  for (let i = 0; i < 10; i++) {
    const x = X0 + (W / 10) * i;
    cellRects.push(<rect key={i} x={x} y={BY} width={W / 10} height={BH} fill={i % 2 ? "var(--mm-soft)" : "var(--surface)"} stroke="var(--ruler-tick)" strokeWidth="0.8"/>);
    cellNums.push(<text key={i} x={x + W / 20} y={BY + BH + 11} textAnchor="middle" className="math-num" style={{ fontSize: 8.5, fill: "var(--mm)", fontWeight: 700 }}>{i + 1}</text>);
  }
  return (
    <svg viewBox="0 0 220 64" width="100%" style={{ height: "auto", display: "block", maxWidth: 460, margin: "0 auto" }}>
      <defs><clipPath id="cmzclip"><rect x={X0} y={BY} width={W} height={BH} rx={4}/></clipPath></defs>
      {/* llave 1 cm */}
      <path d={`M ${X0} 14 L ${X0} 9 L ${X1} 9 L ${X1} 14`} fill="none" stroke="var(--cm-accent)" strokeWidth="2" strokeLinecap="round"/>
      <text x={(X0 + X1) / 2} y={7} textAnchor="middle" className="math-num" style={{ fontSize: 9, fill: "var(--cm-accent)", fontWeight: 700 }}>1 cm</text>
      {/* celdas + relleno, recortadas a la forma redondeada (sin esquinas sueltas) */}
      <g clipPath="url(#cmzclip)">
        <rect x={X0} y={BY} width={shown ? W : 0} height={BH} fill="var(--primary)" opacity="0.18"
          style={{ transition: "width 600ms cubic-bezier(.34,1.56,.64,1)" }}/>
        {cellRects}
      </g>
      {cellNums}
      <rect x={X0} y={BY} width={W} height={BH} rx={4} fill="none" stroke="var(--ink)" strokeWidth="2.4"/>
    </svg>
  );
}
function TeachCard({ step, apiRef, onCanCheck }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { apiRef.current = { check: () => true, correctLabel: "" }; onCanCheck(true);
    const id = setTimeout(() => setShown(true), 350); return () => clearTimeout(id); }, []);
  return (
    <div style={{ display: "grid", gap: "var(--space-6)", placeItems: "center", textAlign: "center", paddingTop: "var(--space-4)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "calc(14px * var(--scale))", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)" }}>{t("fact_title")}</div>
        <div style={{ fontSize: "calc(26px * var(--scale))", fontWeight: 700, lineHeight: 1.15, marginTop: 4 }}>{t("fact_body")}</div>
      </div>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <CmZoom shown={shown}/>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <span className="math-num" style={{ fontSize: "calc(38px * var(--scale))", fontWeight: 700 }}>1<span style={{ color: "var(--cm-accent)", fontSize: "0.5em" }}>cm</span></span>
        <span style={{ fontSize: "calc(32px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
        <span className="math-num" style={{ fontSize: "calc(38px * var(--scale))", fontWeight: 700, color: "var(--mm)" }}>10<span style={{ fontSize: "0.5em" }}>mm</span></span>
      </div>
    </div>
  );
}

/* ── MEASURE (leer un objeto en la regla) ──────────────────── */
function MeasureExercise({ step, apiRef, onCanCheck, phase, result, slot }) {
  const obj = step.object;
  const objMm = mmOf(obj);
  const ask = step.ask; // "cm" | "cmmm"
  const slots = ask === "cmmm" ? [{ unit: "cm", max: 2 }, { unit: "mm", max: 1 }] : [{ unit: "cm", max: 2 }];
  const entry = useNumEntry(slots, slot);
  const correct = { cm: obj.cm || 0, mm: obj.mm || 0 };

  useEffect(() => {
    apiRef.current = {
      correctLabel: fmtMeasure(correct),
      check: () => {
        if (ask === "cmmm") return Number(entry.vals[0]) === correct.cm && Number(entry.vals[1]) === correct.mm;
        return Number(entry.vals[0]) === correct.cm;
      },
    };
  });
  useEffect(() => { onCanCheck(entry.filled); }, [entry.filled]);

  const fieldState = (i, unit) => {
    if (phase !== "checked") return null;
    const exp = unit === "mm" ? correct.mm : correct.cm;
    return Number(entry.vals[i]) === exp ? "ok" : "ng";
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <QuestionBar onSpeak={() => speak(t("howLong"))}>{t("howLong")}</QuestionBar>
      <div style={{ width: "100%" }}>
        {ask === "cmmm" ? (
          <ZoomRuler answerMm={objMm} color="var(--secondary)" revealed={phase === "checked"}/>
        ) : (
          <Ruler cmCount={12} objectMm={objMm} objectColor="var(--secondary)"
            markMm={phase === "checked" ? objMm : null} guide/>
        )}
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
        {slots.map((s, i) => (
          <AnswerField key={i} value={entry.vals[i]} unit={s.unit}
            active={phase === "input" && entry.active === i} state={fieldState(i, s.unit)}
            onFocus={phase === "input" ? () => entry.setActive(i) : null}/>
        ))}
      </div>
      <NumberPad onDigit={entry.push} onDelete={entry.del} disabled={phase === "checked"}/>
    </div>
  );
}

/* ── SET RULER (arrastrar la marca) ────────────────────────── */
function SetRulerExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const targetMm = mmOf(step.target);
  const [val, setValRaw] = useState(() => (slot && slot.val) || 0);
  const setVal = (v) => { if (slot) slot.val = v; setValRaw(v); };
  useEffect(() => {
    apiRef.current = { correctLabel: fmtMeasure(step.target), check: () => val === targetMm };
  });
  useEffect(() => { onCanCheck(val !== 0); }, [val]);
  const cmCount = 12;
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <QuestionBar onSpeak={() => sayMeasure(step.target.cm, step.target.mm)} mood="happy">
        {t("tapRuler")} <b style={{ color: "var(--cm-accent)" }}>{fmtMeasure(step.target)}</b>
      </QuestionBar>
      <div style={{ background: "var(--surface)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-md)", padding: "var(--space-5) var(--space-4)" }}>
        <Ruler cmCount={cmCount} interactive value={val} onChange={setVal} snap={step.snap || "mm"}
          markMm={phase === "checked" && val !== targetMm ? targetMm : null} guide={false} height={170}/>
        {/* Sin lectura en vivo durante el intento (sería regalar la respuesta);
            solo al comprobar se muestra dónde quedó la marca. */}
        {phase === "checked" && (
          <div style={{ textAlign: "center", marginTop: "var(--space-3)" }}>
            <span style={{ fontSize: "calc(15px * var(--scale))", color: "var(--ink-soft)", fontWeight: 600 }}>{t("yourMark")}: </span>
            <MeasureExpr m={toCmMm(val)} size={26}/>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CONVERT (cm→mm, mm→cm con resto, mixto→mm) ─────────────── */
function ConvertExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const total = mmOf(step.from);
  let fromExpr, prompt, slots, answer;
  if (step.type === "convertToCm") {
    // mm → cm y mm (con resto, p.ej. 94 mm = 9 cm 4 mm)
    fromExpr = { cm: 0, mm: total }; prompt = t("convertToCm");
    const r = toCmMm(total); slots = [{ unit: "cm", max: 2 }, { unit: "mm", max: 1 }]; answer = [r.cm, r.mm];
  } else if (step.type === "mixedToMm") {
    fromExpr = { cm: step.from.cm, mm: step.from.mm }; prompt = t("convertToMm");
    slots = [{ unit: "mm", max: 3 }]; answer = [total];
  } else { // convertToMm
    fromExpr = { cm: step.from.cm, mm: 0 }; prompt = t("convertToMm");
    slots = [{ unit: "mm", max: 3 }]; answer = [total];
  }
  const entry = useNumEntry(slots, slot);
  const correctLabel = slots.length === 2 ? fmtMeasure(toCmMm(total)) : `${total} ${slots[0].unit}`;
  useEffect(() => { apiRef.current = { correctLabel, check: () => answer.every((a, i) => Number(entry.vals[i]) === a) }; });
  useEffect(() => { onCanCheck(entry.filled); }, [entry.filled]);
  const fState = (i) => phase !== "checked" ? null : (Number(entry.vals[i]) === answer[i] ? "ok" : "ng");
  const cmCount = 12;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <QuestionBar>{prompt}</QuestionBar>
      {step.support && (
        <div style={{ width: "100%", opacity: 0.95 }}>
          <Ruler cmCount={cmCount} tapeMm={total} guide/>
        </div>
      )}
      <div style={exprBox}>
        <MeasureExpr m={fromExpr}/>
        <span style={{ fontSize: "calc(34px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
        {slots.map((s, i) => (
          <AnswerField key={i} value={entry.vals[i]} unit={s.unit}
            active={phase === "input" && entry.active === i} state={fState(i)}
            onFocus={phase === "input" ? () => entry.setActive(i) : null}/>
        ))}
      </div>
      <NumberPad onDigit={entry.push} onDelete={entry.del} disabled={phase === "checked"}/>
    </div>
  );
}

/* ── COMPARE (¿cuál es más largo?) ─────────────────────────── */
function CompareBar({ m, color }) {
  const total = mmOf(m);
  const maxMm = 60;
  const pct = Math.min(100, (total / maxMm) * 100);
  return (
    <div style={{ width: "100%", height: 22, background: "var(--bg-2)", borderRadius: 999, overflow: "hidden", border: "2px solid var(--ink)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 400ms ease", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4)" }}/>
    </div>
  );
}
function CompareExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const [sel, setSelRaw] = useState(() => (slot && slot.sel) || null);
  const setSel = (s) => { if (slot) slot.sel = s; setSelRaw(s); };
  const aMm = mmOf(step.a), bMm = mmOf(step.b);
  const correctKey = aMm >= bMm ? "a" : "b";
  useEffect(() => { apiRef.current = { correctLabel: fmtMeasure(correctKey === "a" ? step.a : step.b), check: () => sel === correctKey }; });
  useEffect(() => { onCanCheck(sel != null); }, [sel]);

  const Card = ({ k, m, color }) => {
    const selected = sel === k;
    const isCorrect = k === correctKey;
    let border = "var(--ink)", bg = "var(--surface)";
    if (phase === "checked") {
      if (isCorrect) { border = "var(--ok)"; bg = "var(--ok-soft)"; }
      else if (selected) { border = "var(--ng)"; bg = "var(--ng-soft)"; }
    } else if (selected) { border = "var(--secondary-strong)"; bg = "var(--bg-2)"; }
    return (
      <button onClick={() => phase === "input" && setSel(k)} style={{
        display: "grid", gap: "var(--space-3)", padding: "var(--space-4)", background: bg,
        border: `3px solid ${border}`, borderRadius: "var(--r-lg)", boxShadow: selected ? "0 5px 0 var(--ink)" : "0 4px 0 rgba(42,42,51,0.25)",
        textAlign: "center", transition: "all 150ms", flex: 1, minWidth: 0,
      }}>
        <MeasureExpr m={m} size={32}/>
        <CompareBar m={m} color={color}/>
      </button>
    );
  };
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <QuestionBar onSpeak={() => speak(t("whichLonger"))}>{t("whichLonger")}</QuestionBar>
      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "stretch" }}>
        <Card k="a" m={step.a} color="var(--primary)"/>
        <Card k="b" m={step.b} color="var(--mm)"/>
      </div>
    </div>
  );
}

/* ── ADD (suma con unidades mixtas) ────────────────────────── */
function AddExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const sumMm = mmOf(step.a) + mmOf(step.b);
  const ans = toCmMm(sumMm);
  const entry = useNumEntry([{ unit: "cm", max: 2 }, { unit: "mm", max: 1 }], slot);
  useEffect(() => { apiRef.current = { correctLabel: fmtMeasure(ans), check: () => Number(entry.vals[0]) === ans.cm && Number(entry.vals[1]) === ans.mm }; });
  useEffect(() => { onCanCheck(entry.filled); }, [entry.filled]);
  const fState = (i, unit) => phase !== "checked" ? null : (Number(entry.vals[i]) === (unit === "mm" ? ans.mm : ans.cm) ? "ok" : "ng");

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <QuestionBar>{t("addThem")}</QuestionBar>
      <div style={{ ...exprBox, gap: "calc(10px * var(--scale))" }}>
        <MeasureExpr m={step.a} size={34}/>
        <span style={{ fontSize: "calc(30px * var(--scale))", fontWeight: 700, color: "var(--ok)" }}>+</span>
        <MeasureExpr m={step.b} size={34}/>
        <span style={{ fontSize: "calc(30px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
        {["cm", "mm"].map((u, i) => (
          <AnswerField key={u} value={entry.vals[i]} unit={u}
            active={phase === "input" && entry.active === i} state={fState(i, u)}
            onFocus={phase === "input" ? () => entry.setActive(i) : null}/>
        ))}
      </div>
      <NumberPad onDigit={entry.push} onDelete={entry.del} disabled={phase === "checked"}/>
    </div>
  );
}

/* ── SUBTRACT (resta con unidades mixtas) ──────────────────── */
function SubtractExercise({ step, apiRef, onCanCheck, phase, slot }) {
  const diffMm = mmOf(step.a) - mmOf(step.b);
  const ans = toCmMm(diffMm);
  const entry = useNumEntry([{ unit: "cm", max: 2 }, { unit: "mm", max: 1 }], slot);
  useEffect(() => { apiRef.current = { correctLabel: fmtMeasure(ans), check: () => Number(entry.vals[0]) === ans.cm && Number(entry.vals[1]) === ans.mm }; });
  useEffect(() => { onCanCheck(entry.filled); }, [entry.filled]);
  const fState = (i, unit) => phase !== "checked" ? null : (Number(entry.vals[i]) === (unit === "mm" ? ans.mm : ans.cm) ? "ok" : "ng");

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <QuestionBar>{t("subThem")}</QuestionBar>
      <div style={{ ...exprBox, gap: "calc(10px * var(--scale))" }}>
        <MeasureExpr m={step.a} size={34}/>
        <span style={{ fontSize: "calc(30px * var(--scale))", fontWeight: 700, color: "var(--ng)" }}>−</span>
        <MeasureExpr m={step.b} size={34}/>
        <span style={{ fontSize: "calc(30px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
        {["cm", "mm"].map((u, i) => (
          <AnswerField key={u} value={entry.vals[i]} unit={u}
            active={phase === "input" && entry.active === i} state={fState(i, u)}
            onFocus={phase === "input" ? () => entry.setActive(i) : null}/>
        ))}
      </div>
      <NumberPad onDigit={entry.push} onDelete={entry.del} disabled={phase === "checked"}/>
    </div>
  );
}

/* ── Dispatcher ────────────────────────────────────────────── */
function Exercise(props) {
  const { step } = props;
  switch (step.type) {
    case "teach": return <TeachCard {...props}/>;
    case "measure": return <MeasureExercise {...props}/>;
    case "setRuler": return <SetRulerExercise {...props}/>;
    case "convertToMm":
    case "convertToCm":
    case "mixedToMm": return <ConvertExercise {...props}/>;
    case "compare": return <CompareExercise {...props}/>;
    case "add": return <AddExercise {...props}/>;
    case "subtract": return <SubtractExercise {...props}/>;
    default: return <div>?</div>;
  }
}

Object.assign(window, { Exercise, CmZoom, MeasureExpr });
