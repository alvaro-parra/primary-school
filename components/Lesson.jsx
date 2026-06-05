// Lesson — orquesta la secuencia de pasos: progreso, comprobación,
// barra de feedback y pantalla de fin.

function Lesson({ lesson, onExit, onComplete }) {
  const steps = lesson.steps;
  const [index, setIndex] = useState(0);
  const [canCheck, setCanCheck] = useState(false);
  const [status, setStatus] = useState({});       // index -> { result, label }
  const [mistakes, setMistakes] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [screen, setScreen] = useState("play");    // "play" | "done"
  const storeRef = useRef({});                     // index -> respuesta persistida del niño
  const apiRef = useRef(null);
  const getSlot = (i) => storeRef.current[i] || (storeRef.current[i] = {});

  const step = steps[index];
  const isTeach = step.type === "teach";
  const entry = status[index];                     // {result,label} si ya se comprobó
  const phase = entry ? "checked" : "input";
  const result = entry ? entry.result : null;

  const onCheck = () => {
    const api = apiRef.current;
    const correct = api && api.check ? !!api.check() : true;
    setStatus(s => ({ ...s, [index]: { result: correct, label: api && api.correctLabel } }));
    if (!correct) setMistakes(m => m + 1);
    setCelebrate(correct);
  };

  const goTo = (i) => { setIndex(i); setCanCheck(false); setCelebrate(false); };
  const goNext = () => {
    if (index + 1 >= steps.length) {
      // Solo se completa cuando todos los pasos están comprobados (teach cuenta).
      const allDone = steps.every((s, i) => status[i] || s.type === "teach" || i === index);
      if (allDone) { setScreen("done"); onComplete && onComplete({ mistakes }); return; }
    }
    if (index + 1 < steps.length) goTo(index + 1);
  };
  const goPrev = () => { if (index > 0) goTo(index - 1); };

  if (screen === "done") return <DoneScreen mistakes={mistakes} total={steps.length} onExit={onExit}/>;

  return (
    <div style={{ position: "relative", height: "100dvh", minHeight: 540, display: "flex", flexDirection: "column" }}>
      <BgDecor/>
      {/* Cabecera: salir + progreso + contador */}
      <ScreenHeader
        onBack={onExit}
        center={<ProgressBar value={index + (phase === "checked" ? 1 : 0)} total={steps.length}/>}
        right={<span className="math-num" style={{ fontSize: "calc(16px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{index + 1}/{steps.length}</span>}
      />

      {/* Contenido del ejercicio (scroll interno: nada queda tras el footer) */}
      <div key={index} style={{
        flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch",
        padding: "var(--space-4) var(--space-5) calc(190px * var(--scale))",
        position: "relative", zIndex: 2, animation: "step-rise 280ms ease",
        maxWidth: 560, margin: "0 auto", width: "100%",
      }}>
        <Exercise step={step} apiRef={apiRef} onCanCheck={setCanCheck} phase={phase} result={result} slot={getSlot(index)}/>
      </div>

      {celebrate && phase === "checked" && <Confetti active/>}

      {/* Footer fijo: navegación + comprobar / continuar */}
      <Footer
        isTeach={isTeach}
        phase={phase}
        result={result}
        canCheck={canCheck}
        canPrev={index > 0}
        isLast={index + 1 >= steps.length}
        allDone={steps.every((s, i) => status[i] || s.type === "teach" || i === index)}
        correctLabel={entry ? entry.label : null}
        onPrev={goPrev}
        onCheck={onCheck}
        onContinue={goNext}
      />
    </div>
  );
}

function NavButton({ onClick, ariaLabel, dir }) {
  const press = (e, d) => {
    e.currentTarget.style.transform = d ? "translateY(4px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = d ? "0 1px 0 var(--ink)" : "0 5px 0 var(--ink)";
  };
  return (
    <button onClick={onClick} aria-label={ariaLabel}
      onPointerDown={e => press(e, true)} onPointerUp={e => press(e, false)} onPointerLeave={e => press(e, false)} onPointerCancel={e => press(e, false)}
      style={{ width: "var(--tap)", minWidth: "var(--tap)", height: "var(--tap)", borderRadius: "var(--r-lg)",
        background: "var(--surface)", border: "3px solid var(--ink)", boxShadow: "0 5px 0 var(--ink)",
        display: "grid", placeItems: "center", flexShrink: 0, transition: "transform 100ms, box-shadow 100ms" }}>
      <svg viewBox="0 0 24 24" width={24} height={24}>
        <path d={dir === "prev" ? "M 15 6 L 9 12 L 15 18" : "M 9 6 L 15 12 L 9 18"} stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function Footer({ isTeach, phase, result, canCheck, canPrev, isLast, allDone, correctLabel, onPrev, onCheck, onContinue }) {
  const checked = phase === "checked";
  const fbBg = result ? "var(--ok-soft)" : "var(--ng-soft)";
  const fbBorder = result ? "var(--ok)" : "var(--ng)";
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, pointerEvents: "none" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", pointerEvents: "auto" }}>
        {/* Slab de feedback */}
        {checked && !isTeach && (
          <div style={{
            background: fbBg, borderTop: `3px solid ${fbBorder}`,
            padding: "var(--space-4) var(--space-5) var(--space-2)",
            animation: "feedback-in 260ms cubic-bezier(.34,1.4,.64,1) both",
            display: "flex", alignItems: "center", gap: "var(--space-3)",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
              background: result ? "var(--ok)" : "var(--ng)", display: "grid", placeItems: "center",
              border: "3px solid var(--ink)",
            }}>
              {result ? (
                <svg viewBox="0 0 24 24" width={24} height={24}><path d="M 5 13 L 10 18 L 19 6" stroke="var(--ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width={24} height={24}><path d="M 7 7 L 17 17 M 17 7 L 7 17" stroke="var(--ink)" strokeWidth="3.5" fill="none" strokeLinecap="round"/></svg>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "calc(19px * var(--scale))", fontWeight: 700, lineHeight: 1.1 }}>
                {result ? t("correct") : t("almost")}
              </div>
              {!result && (
                <div style={{ fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)", marginTop: 2 }}>
                  {t("answerWas")} <b style={{ color: "var(--ink)" }}>{correctLabel}</b>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Zona de botones: navegación atrás + comprobar / continuar */}
        <div style={{ background: "var(--bg)", borderTop: checked && !isTeach ? "none" : "3px solid rgba(42,42,51,0.08)", padding: "var(--space-3) var(--space-5) var(--space-5)" }}>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "stretch" }}>
            {canPrev && <NavButton dir="prev" ariaLabel="Anterior" onClick={onPrev}/>}
            {!checked ? (
              <BigButton color={canCheck ? "secondary" : "neutral"} disabled={!isTeach && !canCheck}
                onClick={isTeach ? onContinue : onCheck} style={{ flex: 1 }}>
                {isTeach ? t("continue") : t("check")}
              </BigButton>
            ) : (
              <BigButton color={result ? "ok" : "accent"} onClick={onContinue} style={{ flex: 1 }}>
                {t("continue")}
              </BigButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Pantalla final — trofeo + estrellas + XP. */
function DoneScreen({ mistakes, total, onExit }) {
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const xp = Math.max(10, (total - mistakes) * 10);
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--space-6)", textAlign: "center" }}>
      <BgDecor/>
      <Confetti active/>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: "var(--space-5)", placeItems: "center", maxWidth: 420 }}>
        <Trophy/>
        <div>
          <h1 style={{ margin: 0, fontSize: "calc(30px * var(--scale))", fontWeight: 700 }}>{t("lessonDone")}</h1>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "calc(18px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>
            {mistakes === 0 ? t("perfect") : t("goodJob")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {[0,1,2].map(i => <StarBig key={i} filled={i < stars} delay={i * 160}/>)}
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Badge icon="⚡" label={`+${xp} ${t("xpEarned")}`} color="var(--tertiary)"/>
        </div>
        <BigButton color="ok" onClick={onExit} style={{ width: "100%" }}>{t("backToMap")}</BigButton>
      </div>
    </div>
  );
}

function FailScreen({ onRetry, onExit }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--space-6)", textAlign: "center" }}>
      <BgDecor/>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: "var(--space-5)", placeItems: "center", maxWidth: 420 }}>
        <svg viewBox="0 0 24 24" width={96} height={96} aria-hidden>
          <path d="M 12 21 C 12 21 3 14.5 3 8.5 C 3 5.5 5.3 3.5 8 3.5 C 9.8 3.5 11.3 4.6 12 6 C 12.7 4.6 14.2 3.5 16 3.5 C 18.7 3.5 21 5.5 21 8.5 C 21 14.5 12 21 12 21 Z" fill="var(--ng-soft)" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M 12 6 L 9.5 11 L 12.5 13 L 10 18" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <h1 style={{ margin: 0, fontSize: "calc(26px * var(--scale))", fontWeight: 700 }}>{t("out_of_hearts")}</h1>
          <p style={{ margin: "var(--space-2) 0 0", fontSize: "calc(17px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{t("keep_practicing")}</p>
        </div>
        <BigButton color="accent" onClick={onRetry} style={{ width: "100%" }}>{t("again")}</BigButton>
        <BigButton color="neutral" onClick={onExit} style={{ width: "100%" }}>{t("backToMap")}</BigButton>
      </div>
    </div>
  );
}

function Trophy() {
  return (
    <div style={{ animation: "trophy-in 600ms cubic-bezier(.34,1.56,.64,1) both" }}>
      <svg viewBox="0 0 100 100" width={130} height={130}>
        <path d="M 30 20 L 70 20 L 68 44 Q 64 58 50 58 Q 36 58 32 44 Z" fill="var(--tertiary)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M 30 24 Q 16 24 16 34 Q 16 44 30 44" fill="none" stroke="var(--ink)" strokeWidth="3"/>
        <path d="M 70 24 Q 84 24 84 34 Q 84 44 70 44" fill="none" stroke="var(--ink)" strokeWidth="3"/>
        <rect x="44" y="58" width="12" height="14" fill="var(--tertiary)" stroke="var(--ink)" strokeWidth="3"/>
        <rect x="32" y="72" width="36" height="10" rx="3" fill="var(--primary)" stroke="var(--ink)" strokeWidth="3"/>
        <path d="M 44 30 L 50 30 L 48 40 L 53 40 L 45 50 L 47 42 L 43 42 Z" fill="var(--surface)" opacity="0.8"/>
      </svg>
    </div>
  );
}
function StarBig({ filled, delay = 0 }) {
  return (
    <svg viewBox="0 0 24 24" width={48} height={48} style={{ animation: filled ? `count-pop 400ms ease ${delay}ms both` : "none" }}>
      <path d="M 12 2 L 14.8 8.6 L 22 9.2 L 16.5 14 L 18.2 21 L 12 17.2 L 5.8 21 L 7.5 14 L 2 9.2 L 9.2 8.6 Z"
        fill={filled ? "var(--tertiary)" : "transparent"} stroke={filled ? "var(--ink)" : "var(--ink-faint)"} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}
function Badge({ icon, label, color }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: color, border: "3px solid var(--ink)", borderRadius: 999, padding: "8px 18px", boxShadow: "0 4px 0 var(--ink)", fontWeight: 700, fontSize: "calc(17px * var(--scale))" }}>
      <span aria-hidden>{icon}</span>{label}
    </div>
  );
}

Object.assign(window, { Lesson });
