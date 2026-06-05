// Problems — lista de problemas (con estado resuelto) y reproductor de un
// problema suelto que genera una variante aleatoria al abrirse.

function ProblemIcon({ kind, color = "var(--ink)" }) {
  if (kind === "check") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M 5 13 L 10 18 L 19 6" stroke="var(--ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === "convert") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M 4 9 L 17 9 M 14 6 L 17 9 L 14 12" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M 20 15 L 7 15 M 10 12 L 7 15 L 10 18" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === "compare") return <svg viewBox="0 0 24 24" width={28} height={28}><rect x="4" y="13" width="6" height="7" rx="1.5" fill={color}/><rect x="14" y="6" width="6" height="14" rx="1.5" fill={color}/></svg>;
  if (kind === "plus") return <svg viewBox="0 0 24 24" width={28} height={28}><path d="M 12 5 L 12 19 M 5 12 L 19 12" stroke={color} strokeWidth="3.4" strokeLinecap="round"/></svg>;
  if (kind === "minus") return <svg viewBox="0 0 24 24" width={28} height={28}><path d="M 5 12 L 19 12" stroke={color} strokeWidth="3.4" strokeLinecap="round"/></svg>;
  return <svg viewBox="0 0 24 24" width={32} height={32}><rect x="3" y="8" width="18" height="9" rx="2" fill="none" stroke={color} strokeWidth="2.4"/>{[6,9,12,15,18].map((x,i)=><line key={i} x1={x} y1="8" x2={x} y2={i%2===0?"14":"11.5"} stroke={color} strokeWidth="1.8" strokeLinecap="round"/>)}</svg>;
}

function ProblemList({ problems, solved, onBack, onPick, onReset, justCompleted, onCelebrated }) {
  const solvedN = problems.filter(p => solved && solved[p.id]).length;
  const allDone = solvedN === problems.length;
  const [confirm, setConfirm] = useState(false);
  // Confeti SOLO al completar el último (no al entrar/volver a la lista).
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (justCompleted) {
      setCelebrate(true);
      onCelebrated && onCelebrated();
      const id = setTimeout(() => setCelebrate(false), 1600);
      return () => clearTimeout(id);
    }
  }, [justCompleted]);
  return (
    <div style={{ position: "relative", minHeight: "100dvh", paddingBottom: "var(--space-7)" }}>
      <BgDecor/>
      {celebrate && <Confetti active/>}
      <ScreenHeader onBack={onBack} center={
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
          <h1 style={{ margin: 0, fontSize: "calc(22px * var(--scale))", fontWeight: 700 }}>{t("problems_title")}</h1>
          <span className="math-num" style={{ fontSize: "calc(15px * var(--scale))", fontWeight: 700, color: allDone ? "var(--ok)" : "var(--ink-soft)" }}>{solvedN}/{problems.length}</span>
        </div>
      } right={
        <button onClick={() => setConfirm(true)} aria-label={t("reset")} disabled={solvedN === 0}
          style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface)", border: "3px solid var(--ink)", boxShadow: "0 3px 0 var(--ink)", display: "grid", placeItems: "center", flexShrink: 0, opacity: solvedN === 0 ? 0.4 : 1 }}>
          <svg viewBox="0 0 24 24" width={20} height={20}><path d="M 20 8 A 8 8 0 1 0 20.5 13" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round"/><path d="M 20 4 L 20 8 L 16 8" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      }/>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", maxWidth: 560, margin: "0 auto" }}>
        {problems.map(p => (
          <ProblemCard key={p.id} icon={p.icon} title={t("pn_" + p.id)} done={!!(solved && solved[p.id])} onClick={() => onPick(p.id)}/>
        ))}
      </div>
      {confirm && (
        <div onClick={() => setConfirm(false)} style={{ position: "fixed", inset: 0, background: "rgba(42,42,51,0.45)", zIndex: 60, display: "grid", placeItems: "center", padding: "var(--space-5)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "0 6px 0 var(--ink)", padding: "var(--space-5)", maxWidth: 360, width: "100%", textAlign: "center", display: "grid", gap: "var(--space-4)" }}>
            <p style={{ margin: 0, fontSize: "calc(18px * var(--scale))", fontWeight: 700, lineHeight: 1.35, textWrap: "pretty" }}>{t("reset_q")}</p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <BigButton color="neutral" onClick={() => setConfirm(false)} style={{ flex: 1 }}>{t("no")}</BigButton>
              <BigButton color="accent" onClick={() => { setConfirm(false); onReset && onReset(); }} style={{ flex: 1 }}>{t("yes")}</BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProblemCard({ icon, title, done, onClick }) {
  const press = (e, d) => {
    e.currentTarget.style.transform = d ? "translateY(4px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = d ? "0 1px 0 var(--ink)" : "0 5px 0 var(--ink)";
  };
  return (
    <button onClick={onClick}
      onPointerDown={e => press(e, true)} onPointerUp={e => press(e, false)} onPointerLeave={e => press(e, false)} onPointerCancel={e => press(e, false)}
      style={{
        position: "relative", display: "grid", gap: "var(--space-2)", justifyItems: "center", textAlign: "center",
        background: "var(--surface)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "0 5px 0 var(--ink)",
        padding: "var(--space-4) var(--space-3)", minHeight: 120, transition: "transform 100ms, box-shadow 100ms", cursor: "pointer",
      }}>
      <span style={{ width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: "var(--r-md)", border: "3px solid var(--ink)", background: done ? "var(--ok)" : "var(--tertiary-soft)" }}>
        <ProblemIcon kind={done ? "check" : icon}/>
      </span>
      <span style={{ fontWeight: 700, fontSize: "calc(15px * var(--scale))", lineHeight: 1.15, textWrap: "pretty" }}>{title}</span>
      {done && (
        <span aria-hidden style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: "var(--ok)", border: "2px solid var(--ink)", display: "grid", placeItems: "center" }}>
          <svg viewBox="0 0 24 24" width={14} height={14}><path d="M 5 13 L 10 18 L 19 6" stroke="var(--ink)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      )}
    </button>
  );
}

/* ── Reproductor de un problema (variante aleatoria) ───────── */
function ProblemPlay({ problem, onBack, onSolved }) {
  const [nonce, setNonce] = useState(0);
  const inst = useMemo(() => window.genProblem(problem), [problem, nonce]);
  const [status, setStatus] = useState(null);    // null | { result, label }
  const [canCheck, setCanCheck] = useState(false);
  const apiRef = useRef(null);
  const slotRef = useRef({});

  const phase = status ? "checked" : "input";
  const result = status ? status.result : null;

  const onCheck = () => {
    const api = apiRef.current;
    const correct = api && api.check ? !!api.check() : true;
    setStatus({ result: correct, label: api && api.correctLabel });
    if (correct) onSolved && onSolved(problem.id);
  };
  const another = () => { slotRef.current = {}; setStatus(null); setCanCheck(false); setNonce(n => n + 1); };

  return (
    <div style={{ position: "relative", height: "100dvh", minHeight: 540, display: "flex", flexDirection: "column" }}>
      <BgDecor/>
      <ScreenHeader onBack={onBack} center={
        <h1 style={{ margin: 0, fontSize: "calc(20px * var(--scale))", fontWeight: 700 }}>{t("pn_" + problem.id)}</h1>
      }/>
      <div key={nonce} style={{
        flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch",
        padding: "var(--space-4) var(--space-5) calc(190px * var(--scale))",
        position: "relative", zIndex: 2, animation: "step-rise 280ms ease",
        maxWidth: 560, margin: "0 auto", width: "100%",
      }}>
        <Exercise step={inst} apiRef={apiRef} onCanCheck={setCanCheck} phase={phase} result={result} slot={slotRef.current}/>
      </div>

      {result === true && <Confetti active/>}

      <PlayFooter phase={phase} result={result} canCheck={canCheck}
        correctLabel={status ? status.label : null}
        onCheck={onCheck} onAnother={another} onBack={onBack}/>
    </div>
  );
}

function PlayFooter({ phase, result, canCheck, correctLabel, onCheck, onAnother, onBack }) {
  const checked = phase === "checked";
  const fbBg = result ? "var(--ok-soft)" : "var(--ng-soft)";
  const fbBorder = result ? "var(--ok)" : "var(--ng)";
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, pointerEvents: "none" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", pointerEvents: "auto" }}>
        {checked && (
          <div style={{ background: fbBg, borderTop: `3px solid ${fbBorder}`, padding: "var(--space-4) var(--space-5) var(--space-2)", animation: "feedback-in 260ms cubic-bezier(.34,1.4,.64,1)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: result ? "var(--ok)" : "var(--ng)", display: "grid", placeItems: "center", border: "3px solid var(--ink)" }}>
              {result
                ? <svg viewBox="0 0 24 24" width={24} height={24}><path d="M 5 13 L 10 18 L 19 6" stroke="var(--ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg viewBox="0 0 24 24" width={24} height={24}><path d="M 7 7 L 17 17 M 17 7 L 7 17" stroke="var(--ink)" strokeWidth="3.5" fill="none" strokeLinecap="round"/></svg>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "calc(19px * var(--scale))", fontWeight: 700, lineHeight: 1.1 }}>{result ? t("correct") : t("almost")}</div>
              {!result && <div style={{ fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)", marginTop: 2 }}>{t("answerWas")} <b style={{ color: "var(--ink)" }}>{correctLabel}</b></div>}
            </div>
          </div>
        )}
        <div style={{ background: "var(--bg)", borderTop: checked ? "none" : "3px solid rgba(42,42,51,0.08)", padding: "var(--space-3) var(--space-5) var(--space-5)" }}>
          {!checked ? (
            <BigButton color={canCheck ? "secondary" : "neutral"} disabled={!canCheck} onClick={onCheck} style={{ width: "100%" }}>{t("check")}</BigButton>
          ) : (
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <BigButton color="neutral" onClick={onBack} style={{ flex: 1 }}>{t("toList")}</BigButton>
              <BigButton color={result ? "ok" : "accent"} onClick={onAnother} style={{ flex: 1 }}>{t("another")}</BigButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProblemList, ProblemPlay });
