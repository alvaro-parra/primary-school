// Midoku — componentes y helpers compartidos.
// Hereda la "DNA" de Supeingo (estilo ficha de cartón) y añade lo propio
// de una app de longitudes: i18n ES/JA, frases habladas de medidas, etc.

const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;

/* ────────────────────────────────────────────────────────────
   i18n — Español por defecto, Japonés opcional (cole japonés).
   El idioma vive en window.MIDOKU_LANG y lo fija App desde los tweaks.
   ──────────────────────────────────────────────────────────── */
const STRINGS = {
  es: {
    appName: "Midoku",
    tagline: "Mide y aprende",
    hello: "¡Hola!",
    lesson_units: "Centímetros y milímetros",
    unit_sub: "Mide con la regla",
    start: "Empezar",
    continue: "Continuar",
    check: "Comprobar",
    cantContinue: "Escribe tu respuesta",
    correct: "¡Correcto!",
    almost: "Casi…",
    answerWas: "La respuesta es",
    backToMap: "Volver",
    yourMark: "Tu marca",
    again: "Otra vez",
    lessonDone: "¡Lección completada!",
    perfect: "¡Perfecto! Sin fallos",
    goodJob: "¡Muy bien!",
    xpEarned: "puntos",
    out_of_hearts: "Te quedaste sin corazones",
    keep_practicing: "Sigue practicando, ¡casi lo tienes!",
    cm: "cm", mm: "mm",
    howLong: "¿Cuánto mide?",
    convertToMm: "Pásalo a milímetros",
    convertToCm: "Pásalo a centímetros",
    whichLonger: "¿Cuál es más largo?",
    addThem: "Suma las dos longitudes",
    tapRuler: "Pon la marca en esta medida:",
    fact_title: "Recuerda",
    fact_body: "1 centímetro son 10 milímetros",
    unlocked: "¡Lección desbloqueada!",
    locked: "Pronto",
    unit2_short: "Sumas con la regla",
    lvl: "Nivel",
    grade12: "1-2 年",
    lessons_title: "Lecciones",
    go_exercises: "Ir a los ejercicios",
    examples: "Ejemplos",
    lesson_addRuler: "Sumas con la regla",
    lesson_compareLen: "Comparar longitudes",
    subThem: "Resta las dos longitudes",
    problems_title: "Problemas",
    reset: "Empezar de nuevo",
    reset_q: "¿Borrar las marcas y empezar de nuevo?",
    yes: "Sí",
    no: "No",
    another: "Otro",
    toList: "A la lista",
    allSolved: "¡Todos resueltos!",
    solvedCount: "resueltos",
    pn_measureCm: "Medir (cm)",
    pn_measureCmMm: "Medir (cm y mm)",
    pn_setRuler: "Marca la regla",
    pn_toMm: "cm → mm",
    pn_toCm: "mm → cm y mm",
    pn_mixedToMm: "cm y mm → mm",
    pn_compare: "¿Cuál es más largo?",
    pn_add: "Sumar",
    pn_subtract: "Restar",
  },
  ja: {
    appName: "ミドク",
    tagline: "はかって まなぼう",
    hello: "こんにちは！",
    lesson_units: "センチメートルとミリメートル",
    unit_sub: "ものさしで はかろう",
    start: "はじめる",
    continue: "つぎへ",
    check: "こたえあわせ",
    cantContinue: "こたえを いれてね",
    correct: "せいかい！",
    almost: "おしい！",
    answerWas: "こたえは",
    backToMap: "もどる",
    yourMark: "いまの ながさ",
    again: "もういちど",
    lessonDone: "レッスン クリア！",
    perfect: "パーフェクト！ ぜんもん せいかい",
    goodJob: "よく できました！",
    xpEarned: "ポイント",
    out_of_hearts: "ハートが なくなったよ",
    keep_practicing: "もう すこし！ がんばろう",
    cm: "cm", mm: "mm",
    howLong: "ながさは どれだけ？",
    convertToMm: "ミリメートルに なおそう",
    convertToCm: "センチメートルに なおそう",
    whichLonger: "どちらが ながい？",
    addThem: "ふたつの ながさを たそう",
    tapRuler: "この ながさに あわせよう：",
    fact_title: "おぼえよう",
    fact_body: "1センチメートル は 10ミリメートル",
    unlocked: "レッスン かいほう！",
    locked: "もうすぐ",
    unit2_short: "ものさしで たしざん",
    lvl: "レベル",
    grade12: "1-2 年",
    lessons_title: "レッスン",
    go_exercises: "れんしゅうする",
    examples: "れい",
    lesson_addRuler: "ものさしで たしざん",
    lesson_compareLen: "ながさくらべ",
    subThem: "ふたつの ながさを ひこう",
    problems_title: "もんだい",
    reset: "さいしょから",
    reset_q: "チェックを けして さいしょから？",
    yes: "はい",
    no: "いいえ",
    another: "もう1かい",
    toList: "リストへ",
    allSolved: "ぜんぶ クリア！",
    solvedCount: "もんせい",
    pn_measureCm: "はかる（cm）",
    pn_measureCmMm: "はかる（cmとmm）",
    pn_setRuler: "ものさしに あわせる",
    pn_toMm: "cm → mm",
    pn_toCm: "mm → cmとmm",
    pn_mixedToMm: "cmとmm → mm",
    pn_compare: "どちらが ながい？",
    pn_add: "たし算",
    pn_subtract: "ひき算",
  },
};
function getLang() {
  return (typeof window !== "undefined" && window.MIDOKU_LANG) || "es";
}
function t(key) {
  const L = getLang();
  return (STRINGS[L] && STRINGS[L][key]) || STRINGS.es[key] || key;
}

/* ────────────────────────────────────────────────────────────
   Web Speech — habla la medida en el idioma activo.
   Construimos la frase a partir de {cm, mm} para que el motor la lea
   natural ("tres centímetros y cinco milímetros" / 「3センチ5ミリ」).
   ──────────────────────────────────────────────────────────── */
let _voiceCache = {};
function _pickVoice(lang) {
  if (!("speechSynthesis" in window)) return null;
  if (_voiceCache[lang]) return _voiceCache[lang];
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const pref = lang === "ja"
    ? [/Kyoko/i, /O-?ren/i, /Google.*日本|Google.*Japanese/i, /Microsoft.*Nanami|Microsoft.*Ayumi|Microsoft.*Haruka/i]
    : [/Mónica/i, /Monica/i, /Paulina/i, /Google.*espa/i, /Microsoft.*Helena|Microsoft.*Sabina/i];
  const tag = lang === "ja" ? /^ja(-|_|$)/i : /^es(-|_|$)/i;
  const pool = voices.filter(v => tag.test(v.lang));
  for (const re of pref) { const m = pool.find(v => re.test(v.name)); if (m) { _voiceCache[lang] = m; return m; } }
  if (pool[0]) { _voiceCache[lang] = pool[0]; return pool[0]; }
  return null;
}
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => { _voiceCache = {}; };
}

let _speaking = false, _queue = [];
function _flush() {
  if (_speaking) return;
  const next = _queue.shift();
  if (!next) return;
  _speaking = true;
  try {
    const u = new SpeechSynthesisUtterance(next.text);
    const lang = next.lang || getLang();
    u.lang = lang === "ja" ? "ja-JP" : "es-ES";
    const v = _pickVoice(lang); if (v) u.voice = v;
    u.rate = lang === "ja" ? 0.9 : 0.85;
    u.pitch = 1.0; u.volume = 1.0;
    u.onend = u.onerror = () => { _speaking = false; setTimeout(_flush, 30); };
    window.speechSynthesis.speak(u);
    setTimeout(() => { try { if (window.speechSynthesis.paused) window.speechSynthesis.resume(); } catch (e) {} }, 80);
  } catch (e) { _speaking = false; setTimeout(_flush, 30); }
}
function speak(text, opts = {}) {
  if (!text || !("speechSynthesis" in window)) return;
  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel(); _speaking = false; _queue = [{ text, lang: opts.lang }];
      setTimeout(_flush, 120);
    } else { _queue.push({ text, lang: opts.lang }); _flush(); }
  } catch (e) {}
}
// Frase hablada para una medida {cm, mm}. Idioma activo.
function sayMeasure(cm, mm) {
  const L = getLang();
  if (L === "ja") {
    let s = "";
    if (cm) s += `${cm}センチ`;
    if (mm) s += `${mm}ミリ`;
    if (!s) s = "ゼロ";
    speak(s, { lang: "ja" });
  } else {
    const parts = [];
    if (cm) parts.push(cm === 1 ? "un centímetro" : `${cm} centímetros`);
    if (mm) parts.push(mm === 1 ? "un milímetro" : `${mm} milímetros`);
    speak(parts.join(" y ") || "cero", { lang: "es" });
  }
}

/* ────────────────────────────────────────────────────────────
   Mascota — niña con gorra y una regla. Heredada de Supeingo.
   ──────────────────────────────────────────────────────────── */
function Helper({ size = 96, mood = "happy", holdRuler = false, style = {} }) {
  const eye = mood === "sad" ? (
    <>
      <path d="M 35 50 Q 40 46 45 50" stroke="#2A2A33" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 55 50 Q 60 46 65 50" stroke="#2A2A33" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </>
  ) : (
    <>
      <circle cx="40" cy="48" r="3" fill="#2A2A33"/>
      <circle cx="60" cy="48" r="3" fill="#2A2A33"/>
    </>
  );
  const mouth = mood === "sad" ? (
    <path d="M 44 64 Q 50 60 56 64" stroke="#2A2A33" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  ) : mood === "cheer" ? (
    <path d="M 42 60 Q 50 70 58 60" stroke="#2A2A33" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  ) : (
    <path d="M 44 62 Q 50 66 56 62" stroke="#2A2A33" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  );
  return (
    <div style={{ width: size, height: size, animation: "drift 3.5s ease-in-out infinite", ...style }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M 28 86 Q 28 70 38 68 L 62 68 Q 72 70 72 86 L 72 96 L 28 96 Z" fill="var(--secondary)"/>
        <rect x="44" y="62" width="12" height="8" fill="#F4D2B6"/>
        <ellipse cx="50" cy="46" rx="22" ry="22" fill="#F4D2B6"/>
        <ellipse cx="28" cy="46" rx="3" ry="5" fill="#F4D2B6"/>
        <ellipse cx="72" cy="46" rx="3" ry="5" fill="#F4D2B6"/>
        <path d="M 30 38 Q 30 22 50 22 Q 70 22 70 38 Q 66 32 60 34 Q 54 28 50 32 Q 44 28 40 34 Q 34 32 30 38 Z" fill="#3D2A1F"/>
        <circle cx="33" cy="54" r="3.5" fill="var(--primary)" opacity="0.55"/>
        <circle cx="67" cy="54" r="3.5" fill="var(--primary)" opacity="0.55"/>
        {eye}{mouth}
        {/* gorra */}
        <path d="M 50 30 Q 78 28 82 36 Q 80 38 70 36 Q 58 33 50 33 Z" fill="var(--primary-strong)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M 28 32 Q 28 16 50 16 Q 72 16 72 32 Q 72 35 70 35 L 30 35 Q 28 35 28 32 Z" fill="var(--primary)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx="50" cy="16" r="2.2" fill="var(--primary-strong)" stroke="var(--ink)" strokeWidth="1.2"/>
        {holdRuler && (
          <g transform="rotate(18 80 78)">
            <rect x="60" y="72" width="40" height="11" rx="2" fill="var(--tertiary)" stroke="var(--ink)" strokeWidth="2"/>
            {[64,70,76,82,88,94].map((x,i) => (
              <line key={i} x1={x} y1="72" x2={x} y2={i%2===0?"79":"76"} stroke="var(--ink)" strokeWidth="1.4"/>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

function SpeechBubble({ children, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "var(--surface)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)",
      padding: "var(--space-3) var(--space-5)", boxShadow: "0 3px 0 var(--ink)",
      fontWeight: 600, fontSize: "calc(17px * var(--scale))", position: "relative",
      cursor: onClick ? "pointer" : "default", lineHeight: 1.35, textWrap: "pretty",
    }}>
      {children}
      <span style={{ position: "absolute", left: -13, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "13px solid var(--ink)" }}/>
      <span style={{ position: "absolute", left: -7, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "10px solid var(--surface)" }}/>
    </div>
  );
}

/* Botón grande — ficha de cartón con press físico. */
function BigButton({ children, onClick, color = "ok", icon = null, disabled = false, style = {} }) {
  const map = {
    ok: ["var(--ok)", "#5AA176"],
    accent: ["var(--primary)", "var(--primary-strong)"],
    secondary: ["var(--secondary)", "var(--secondary-strong)"],
    mm: ["var(--mm)", "#1F7E72"],
    neutral: ["var(--surface)", "var(--ink)"],
  };
  const [bg] = map[color] || map.ok;
  const press = (e, down) => {
    if (disabled) return;
    e.currentTarget.style.transform = down ? "translateY(5px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = down ? "0 1px 0 var(--ink)" : "0 6px 0 var(--ink)";
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, color: "var(--ink)", padding: "var(--space-4) var(--space-6)",
      borderRadius: "var(--r-lg)", border: "3px solid var(--ink)", boxShadow: "0 6px 0 var(--ink)",
      fontSize: "calc(20px * var(--scale))", fontWeight: 700, display: "inline-flex",
      alignItems: "center", justifyContent: "center", gap: "var(--space-3)", minHeight: "var(--tap)",
      transition: "transform 100ms ease, box-shadow 100ms ease, opacity 150ms",
      opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer", ...style,
    }}
      onPointerDown={e => press(e, true)} onPointerUp={e => press(e, false)}
      onPointerLeave={e => press(e, false)} onPointerCancel={e => press(e, false)}>
      {icon && <span aria-hidden style={{ display: "inline-flex", fontSize: "1.1em" }}>{icon}</span>}
      {children}
    </button>
  );
}

/* Botón altavoz con ondas. */
function SpeakButton({ onPlay, size = 56, variant = "surface" }) {
  const [playing, setPlaying] = useState(false);
  const handle = (e) => {
    e && e.stopPropagation();
    setPlaying(true); onPlay && onPlay();
    setTimeout(() => setPlaying(false), 1100);
  };
  return (
    <button onClick={handle} aria-label="Escuchar" style={{
      width: size, height: size, background: variant === "ghost" ? "transparent" : "var(--surface)",
      border: variant === "ghost" ? "none" : "3px solid var(--ink)", borderRadius: "50%",
      boxShadow: variant === "ghost" ? "none" : "var(--shadow-md)", position: "relative",
      display: "grid", placeItems: "center", flexShrink: 0,
    }}>
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5}>
        <path d="M 4 9 L 4 15 L 9 15 L 14 19 L 14 5 L 9 9 Z" fill="var(--ink)"/>
        <path d="M 17 9 Q 19 12 17 15" stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" opacity={playing ? 1 : 0.4}/>
        <path d="M 19.5 7 Q 22.5 12 19.5 17" stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" opacity={playing ? 1 : 0.25}/>
      </svg>
      {playing && <span style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "3px solid var(--primary)", animation: "ping 800ms ease-out forwards", pointerEvents: "none" }}/>}
    </button>
  );
}

/* Encabezado: flecha atrás + slot derecho (corazones / progreso). */
function ScreenHeader({ onBack, center = null, right = null }) {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", position: "relative", zIndex: 3 }}>
      {onBack && (
        <button onClick={onBack} aria-label="Volver" style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface)", border: "3px solid var(--ink)", boxShadow: "0 3px 0 var(--ink)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width={22} height={22}><path d="M 15 6 L 9 12 L 15 18" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>{center}</div>
      {right}
    </header>
  );
}

/* Barra de progreso de la lección — estilo cápsula con relleno. */
function ProgressBar({ value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ flex: 1, height: 18, background: "var(--bg-2)", border: "3px solid var(--ink)", borderRadius: 999, overflow: "hidden", position: "relative" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "var(--ok)", borderRadius: 999, transition: "width 350ms cubic-bezier(.34,1.56,.64,1)", boxShadow: "inset 0 3px 0 rgba(255,255,255,0.4)" }}/>
    </div>
  );
}

/* Corazones / vidas. */
function Hearts({ count, max = 3, broken = false }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <svg viewBox="0 0 24 24" width={26} height={26} style={broken ? { animation: "heart-break 500ms ease forwards" } : null}>
        <path d="M 12 21 C 12 21 3 14.5 3 8.5 C 3 5.5 5.3 3.5 8 3.5 C 9.8 3.5 11.3 4.6 12 6 C 12.7 4.6 14.2 3.5 16 3.5 C 18.7 3.5 21 5.5 21 8.5 C 21 14.5 12 21 12 21 Z" fill="var(--heart)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      <span className="math-num" style={{ fontSize: "calc(20px * var(--scale))", fontWeight: 700, color: "var(--heart-strong)" }}>{count}</span>
    </div>
  );
}

/* Confeti. */
function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 18 });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 50 }}>
      {pieces.map((_, i) => {
        const colors = ["var(--primary)", "var(--tertiary)", "var(--ok)", "var(--secondary)", "var(--mm)"];
        const x = (i / pieces.length) * 100 + (Math.random() - 0.5) * 8;
        const delay = Math.random() * 220, dur = 800 + Math.random() * 500, sz = 7 + Math.random() * 7;
        return <span key={i} style={{ position: "absolute", left: `${x}%`, top: "26%", width: sz, height: sz, background: colors[i % colors.length], borderRadius: i % 2 ? "2px" : "50%", animation: `confetti-fall ${dur}ms ease-out ${delay}ms forwards` }}/>;
      })}
    </div>
  );
}

/* Decoración de fondo suave. */
function BgDecor() { return <div className="bg-decor" aria-hidden/>; }

Object.assign(window, {
  t, getLang, STRINGS, speak, sayMeasure,
  Helper, SpeechBubble, BigButton, SpeakButton, ScreenHeader, ProgressBar, Hearts, Confetti, BgDecor,
});
