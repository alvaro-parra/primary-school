// LessonMap — pantalla inicio. Minimalista: un único botón de curso.
// Sin título, sin mascota, sin racha, sin camino de nodos.

function LessonMap({ onStart, completed }) {
  const ids = Object.keys(completed || {});
  const done = ids.length > 0 && ids.every(k => completed[k]);
  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-6)", gap: "var(--space-5)" }}>
      <BgDecor/>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: "var(--space-4)", justifyItems: "center", width: "100%", maxWidth: 360 }}>
        <GradeButton label={t("subject_math")} done={done} onClick={() => onStart("math")}/>
      </div>
    </div>
  );
}

function GradeButton({ label, done, onClick }) {
  const press = (e, d) => {
    e.currentTarget.style.transform = d ? "translateY(5px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = d ? "0 2px 0 var(--ink)" : "0 8px 0 var(--ink)";
  };
  return (
    <button onClick={onClick}
      onPointerDown={e => press(e, true)} onPointerUp={e => press(e, false)} onPointerLeave={e => press(e, false)} onPointerCancel={e => press(e, false)}
      style={{
        width: "100%", background: "var(--primary)", color: "var(--ink)",
        border: "4px solid var(--ink)", borderRadius: "var(--r-xl)", boxShadow: "0 8px 0 var(--ink)",
        padding: "calc(34px * var(--scale)) var(--space-5)", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-4)",
        transition: "transform 110ms, box-shadow 110ms", cursor: "pointer",
      }}>
      <span style={{ fontSize: "calc(38px * var(--scale))", fontWeight: 800, lineHeight: 1.1, textAlign: "center", overflowWrap: "anywhere" }}>{label}</span>
    </button>
  );
}

window.LessonMap = LessonMap;
