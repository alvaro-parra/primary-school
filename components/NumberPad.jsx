// NumberPad + AnswerField — entrada numérica táctil (teclas de cartón).

// Campo de respuesta: muestra el valor escrito junto a su unidad.
// `active` lo resalta (foco). `state`: null | "ok" | "ng" para feedback.
// El campo seleccionado se distingue por borde azul + fondo tintado + sombra
// elevada (sin cursor parpadeante), igual para 1 campo o para cm+mm.
function AnswerField({ value, unit, active = false, state = null, onFocus = null, placeholder = "?" }) {
  const empty = value === "" || value == null;
  let border = "var(--ink)", bg = "var(--surface)", shadow = "0 3px 0 rgba(42,42,51,0.22)";
  if (state === "ok") { border = "var(--ok)"; bg = "var(--ok-soft)"; shadow = "0 3px 0 var(--ok)"; }
  else if (state === "ng") { border = "var(--ng)"; bg = "var(--ng-soft)"; shadow = "0 3px 0 var(--ng)"; }
  else if (active) { border = "var(--secondary-strong)"; bg = "var(--bg-2)"; shadow = "0 4px 0 var(--secondary-strong)"; }
  const unitColor = unit === "mm" ? "var(--mm)" : "var(--cm-accent)";
  return (
    <button onClick={onFocus} style={{
      display: "inline-flex", alignItems: "baseline", gap: 8,
      background: bg, border: `3px solid ${border}`, borderRadius: "var(--r-md)",
      boxShadow: shadow,
      padding: "calc(10px * var(--scale)) calc(20px * var(--scale))",
      minWidth: "calc(96px * var(--scale))", minHeight: "var(--tap)",
      justifyContent: "center", transition: "border-color 150ms, box-shadow 150ms, background 150ms, transform 150ms",
      transform: active ? "translateY(-1px)" : "none",
      cursor: onFocus ? "pointer" : "default",
    }}>
      <span className="math-num" style={{
        fontSize: "calc(40px * var(--scale))", fontWeight: 700, lineHeight: 1,
        color: empty ? (active ? "var(--secondary-strong)" : "var(--ink-faint)") : "var(--ink)",
        minWidth: "0.7em", textAlign: "center",
      }}>{empty ? placeholder : value}</span>
      <span style={{ fontSize: "calc(20px * var(--scale))", fontWeight: 700, color: unitColor }}>{unit}</span>
    </button>
  );
}

// Teclado numérico — teclas de cartón con press físico.
function NumberPad({ onDigit, onDelete, disabled = false, maxCols = 3 }) {
  const Key = ({ label, onClick, kind = "num", ariaLabel }) => {
    const bg = kind === "del" ? "var(--bg-2)" : "var(--surface)";
    const press = (e, down) => {
      if (disabled) return;
      e.currentTarget.style.transform = down ? "translateY(4px)" : "translateY(0)";
      e.currentTarget.style.boxShadow = down ? "0 1px 0 var(--ink)" : "0 5px 0 var(--ink)";
    };
    return (
      <button aria-label={ariaLabel || label} disabled={disabled} onClick={() => !disabled && onClick()}
        onPointerDown={e => press(e, true)} onPointerUp={e => press(e, false)}
        onPointerLeave={e => press(e, false)} onPointerCancel={e => press(e, false)}
        style={{
          background: bg, border: "3px solid var(--ink)", borderRadius: "var(--r-md)",
          boxShadow: "0 5px 0 var(--ink)", height: "calc(60px * var(--scale))",
          display: "grid", placeItems: "center",
          fontSize: "calc(28px * var(--scale))", fontWeight: 700, fontFamily: "Fredoka, sans-serif",
          color: "var(--ink)", opacity: disabled ? 0.5 : 1, transition: "transform 90ms, box-shadow 90ms",
        }}>{label}</button>
    );
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${maxCols}, 1fr)`, gap: "var(--space-2)", maxWidth: 360, margin: "0 auto", width: "100%" }}>
      {[1,2,3,4,5,6,7,8,9].map(n => <Key key={n} label={String(n)} onClick={() => onDigit(n)}/>)}
      <span/>
      <Key label="0" onClick={() => onDigit(0)}/>
      <Key kind="del" ariaLabel="Borrar" onClick={onDelete} label={
        <svg viewBox="0 0 24 24" width={28} height={28}><path d="M 8 5 L 21 5 L 21 19 L 8 19 L 3 12 Z" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"/><path d="M 11 9.5 L 17 14.5 M 17 9.5 L 11 14.5" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"/></svg>
      }/>
    </div>
  );
}

Object.assign(window, { AnswerField, NumberPad });
