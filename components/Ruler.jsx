// Ruler — la regla interactiva. Manipulable protagonista.
// SVG puro → nítido a cualquier tamaño. 1 mm = 1 unidad de viewBox.
//
// Props:
//   cmCount     nº de cm que muestra la regla (def. 15)
//   objectMm    si se pasa, dibuja un objeto medido encima (barra) de 0..objectMm
//   objectColor / objectLabel  color y etiqueta del objeto
//   tapeMm      cinta translúcida estática de 0..tapeMm (mostrar una medida)
//   markMm      línea fija marcando una posición (revelar respuesta)
//   interactive si true, el niño arrastra/toca para fijar el final
//   value       mm actual (controlado) en modo interactivo
//   onChange    (mm) => void
//   guide       dibuja la línea-guía punteada en el final del objeto/cinta
//   snap        "mm" | "cm" — a qué resolución engancha el arrastre (def "mm")

function Ruler({
  cmCount = 12, objectMm = null, objectColor = "var(--measure)", objectLabel = null,
  tapeMm = null, markMm = null, interactive = false, value = 0, onChange = null,
  guide = true, snap = "mm", height = 150, fine = false,
}) {
  const VB_M = 16;                       // margen lateral (unidades = mm)
  const N = cmCount;
  const W = N * 10 + VB_M * 2;
  const OBJ_TOP = 2, OBJ_H = 16, OBJ_BOT = OBJ_TOP + OBJ_H;  // banda del objeto
  const RY = 22, RH = 52;                // cara de la regla (más alta: hueco bajo los números)
  const TICK_TOP = RY;
  // Cuando es interactiva, el mango (triángulo) sobresale por debajo de la
  // cara; reservamos ese alto en el viewBox para que no se solape con el
  // texto que va debajo de la regla.
  const VB_H = RY + RH + (interactive ? 16 : 2);
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const clampMm = (mm) => Math.max(0, Math.min(N * 10, mm));
  const snapMm = (mm) => {
    if (snap === "cm") return Math.round(mm / 10) * 10;
    if (snap === "5mm") return Math.round(mm / 5) * 5;
    return Math.round(mm);
  };

  const pointToMm = useCallback((clientX) => {
    const el = svgRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const frac = (clientX - r.left) / r.width;
    const vbX = frac * W;
    return clampMm(snapMm(vbX - VB_M));
  }, [W, N, snap]);

  const handleDown = (e) => {
    if (!interactive) return;
    e.preventDefault();
    setDragging(true);
    const mm = pointToMm(e.clientX);
    onChange && onChange(mm);
    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const handleMove = (e) => {
    if (!interactive || !dragging) return;
    onChange && onChange(pointToMm(e.clientX));
  };
  const handleUp = () => setDragging(false);

  // Marcas (mm/cm)
  // Marcas. Normal: una raya cada 5 mm (legible en una regla larga).
  // Fina (fine): rayas de 1 mm, solo en reglas cortas/zoom (objeto pequeño),
  // donde cada mm tiene sitio. Los cm van numerados.
  const ticks = [];
  const landmarks = [];
  if (fine) {
    for (let i = 0; i <= N * 10; i++) {
      const x = VB_M + i;
      const isCm = i % 10 === 0;
      const isHalf = i % 5 === 0;
      const len = isCm ? 26 : isHalf ? 15 : 8;
      ticks.push(
        <line key={i} x1={x} y1={TICK_TOP} x2={x} y2={TICK_TOP + len}
          stroke="var(--ruler-tick)" strokeWidth={isCm ? 2 : isHalf ? 1.4 : 0.9}
          strokeLinecap="butt" opacity={isCm ? 1 : isHalf ? 0.85 : 0.55}/>
      );
    }
    for (let c = 0; c <= N; c++) {
      landmarks.push(
        <text key={c} x={VB_M + c * 10} y={TICK_TOP + 40} textAnchor="middle"
          className="math-num" style={{ fontSize: 12, fill: "var(--ruler-num)", fontWeight: 700 }}>{c}</text>
      );
    }
  } else {
    for (let i = 0; i <= N * 10; i += 5) {
      const x = VB_M + i;
      const cm = i / 10;
      const isCm = i % 10 === 0;
      const isLandmark = isCm && cm % 5 === 0;            // 0, 5, 10…
      const len = isLandmark ? 26 : isCm ? 16 : 10;
      ticks.push(
        <line key={i} x1={x} y1={TICK_TOP} x2={x} y2={TICK_TOP + len}
          stroke="var(--ruler-tick)" strokeWidth={isLandmark ? 2.4 : isCm ? 1.8 : 1.2}
          strokeLinecap="butt" opacity={isLandmark ? 1 : isCm ? 0.95 : 0.7}/>
      );
    }
    for (let c = 0; c <= N; c += 5) {
      landmarks.push(
        <text key={c} x={VB_M + c * 10} y={TICK_TOP + 40} textAnchor="middle"
          className="math-num" style={{ fontSize: 13, fill: "var(--ruler-num)", fontWeight: 700 }}>{c}</text>
      );
    }
  }

  const endMm = interactive ? value : (tapeMm != null ? tapeMm : objectMm);
  const endX = endMm != null ? VB_M + endMm : null;

  return (
    <div style={{ width: "100%", userSelect: "none", touchAction: interactive ? "none" : "auto" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${VB_H}`} width="100%"
        style={{ height: "auto", display: "block", overflow: "visible",
                 cursor: interactive ? (dragging ? "grabbing" : "grab") : "default" }}
        onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp}>

        {/* Objeto medido encima de la regla */}
        {objectMm != null && (
          <g>
            <rect x={VB_M} y={OBJ_TOP} width={objectMm} height={OBJ_H} rx={7}
              fill={objectColor} stroke="var(--ink)" strokeWidth="2"
              style={{ transformOrigin: `${VB_M}px ${OBJ_TOP}px` }}/>
            {/* brillo */}
            <rect x={VB_M + 2} y={OBJ_TOP + 3} width={Math.max(0, objectMm - 4)} height={5} rx={2.5}
              fill="rgba(255,255,255,0.45)"/>
            {objectLabel && (
              <text x={VB_M + objectMm / 2} y={OBJ_TOP + OBJ_H / 2 + 4} textAnchor="middle"
                style={{ fontSize: 11, fontWeight: 700, fill: "var(--ink)", fontFamily: "Fredoka, sans-serif" }}>{objectLabel}</text>
            )}
          </g>
        )}

        {/* Cara de la regla */}
        <rect x={0} y={RY} width={W} height={RH} rx={9}
          fill="url(#wood)" stroke="var(--ink)" strokeWidth="3"/>
        <defs>
          <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ruler-face)"/>
            <stop offset="100%" stopColor="var(--ruler-face-2)"/>
          </linearGradient>
        </defs>

        {ticks}
        {landmarks}

        {/* Cinta medida estática */}
        {tapeMm != null && (
          <rect x={VB_M} y={RY} width={tapeMm} height={RH * 0.62} fill="var(--measure-soft)"
            style={{ transformOrigin: `${VB_M}px ${RY}px`, animation: "tape-grow 500ms cubic-bezier(.34,1.56,.64,1)" }}/>
        )}

        {/* Línea-guía vertical en el final */}
        {guide && endX != null && (
          <line x1={endX} y1={OBJ_TOP} x2={endX} y2={RY + RH}
            stroke="var(--measure)" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.75"/>
        )}

        {/* Marca fija (revelar respuesta) */}
        {markMm != null && (
          <line x1={VB_M + markMm} y1={RY - 6} x2={VB_M + markMm} y2={RY + RH}
            stroke="var(--ok)" strokeWidth="2.5"/>
        )}

        {/* Manija interactiva (posición por coordenadas absolutas: el atributo
            transform de un <g> con CSS transition lo ignoran algunos motores). */}
        {interactive && (
          <g>
            <line x1={VB_M + value} y1={OBJ_TOP} x2={VB_M + value} y2={RY + RH} stroke="var(--measure)" strokeWidth="2.5"/>
            <path d={`M ${VB_M + value} ${RY + RH} L ${VB_M + value - 9} ${RY + RH + 12} L ${VB_M + value + 9} ${RY + RH + 12} Z`}
              fill="var(--measure)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx={VB_M + value} cy={OBJ_TOP} r={6} fill="var(--surface)" stroke="var(--measure)" strokeWidth="3"/>
          </g>
        )}
      </svg>
    </div>
  );
}

window.Ruler = Ruler;

// ZoomRuler — regla de zoom para leer mm. Muestra solo ~2 cm alrededor de la
// respuesta (los cm visibles cambian con el problema), de modo que cada mm
// ocupa lo que un cm en una regla normal. La barra de medida entra CORTADA por
// la izquierda (el 0 nunca se ve). answerMm = cm*10+mm (mm 1..9).
function ZoomRuler({ answerMm, color = "var(--secondary)", revealed = false }) {
  const S = 8;                                 // unidades de viewBox por mm (zoom)
  const VB_M = 10, P = 4;                       // margen lateral y relleno (mm)
  const cm = Math.floor(answerMm / 10);
  const lo = cm * 10 - P, hi = cm * 10 + 10 + P;
  const span = hi - lo;                         // 18 mm
  const W = span * S + VB_M * 2;
  const OBJ_TOP = 4, OBJ_H = 26, RY = 40, RH = 86, VB_H = RY + RH + 4;
  const X = (m) => VB_M + (m - lo) * S;          // mm → x

  const ticks = [], nums = [];
  for (let m = lo; m <= hi; m++) {
    const isCm = m % 10 === 0, isHalf = m % 5 === 0;
    const len = isCm ? 46 : isHalf ? 28 : 15;
    ticks.push(
      <line key={m} x1={X(m)} y1={RY} x2={X(m)} y2={RY + len} stroke="var(--ruler-tick)"
        strokeWidth={isCm ? 3 : isHalf ? 2 : 1.3} opacity={isCm ? 1 : isHalf ? 0.85 : 0.5}/>
    );
    if (isCm) nums.push(
      <text key={"n" + m} x={X(m)} y={RY + 70} textAnchor="middle" className="math-num"
        style={{ fontSize: 22, fill: "var(--ruler-num)", fontWeight: 700 }}>{m / 10}</text>
    );
  }
  // Barra cortada: borde izquierdo en zigzag (continúa hasta el 0, fuera de pantalla).
  const xEnd = X(answerMm), z = 10, segs = 4, segH = OBJ_H / segs;
  let d = `M ${xEnd} ${OBJ_TOP} L ${z} ${OBJ_TOP} `;
  for (let k = 0; k < segs; k++) d += `L 0 ${OBJ_TOP + k * segH + segH / 2} L ${z} ${OBJ_TOP + (k + 1) * segH} `;
  d += `L ${xEnd} ${OBJ_TOP + OBJ_H} Z`;

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${VB_H}`} width="100%" style={{ height: "auto", maxHeight: 230, display: "block", overflow: "hidden" }}>
        <defs>
          <linearGradient id="zwood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ruler-face)"/>
            <stop offset="100%" stopColor="var(--ruler-face-2)"/>
          </linearGradient>
        </defs>
        <rect x={0} y={RY} width={W} height={RH} rx={12} fill="url(#zwood)" stroke="var(--ink)" strokeWidth="3.5"/>
        <path d={d} fill={color} stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x={z + 3} y={OBJ_TOP + 3} width={Math.max(0, xEnd - z - 7)} height={6} rx={3} fill="rgba(255,255,255,0.4)"/>
        {ticks}{nums}
        <line x1={xEnd} y1={OBJ_TOP} x2={xEnd} y2={RY + RH} stroke="var(--ink-soft)" strokeWidth="2" strokeDasharray="5 4" opacity="0.85"/>
        {revealed && <line x1={xEnd} y1={RY - 6} x2={xEnd} y2={RY + RH} stroke="var(--ok)" strokeWidth="3.5"/>}
      </svg>
    </div>
  );
}

window.ZoomRuler = ZoomRuler;
