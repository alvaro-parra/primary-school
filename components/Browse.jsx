// Browse — pantallas intermedias entre el curso y los ejercicios.
//   LessonList   — lista de lecciones del curso 1-2年.
//   LessonIntro  — explicación + ejemplos, con botón arriba a los ejercicios.

/* Iconitos reutilizables para las filas de lección. */
function MiniIcon({ kind }) {
  const c = kind === "lock" ? "var(--ink-faint)" : "var(--ink)";
  if (kind === "check") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M 5 13 L 10 18 L 19 6" stroke="var(--ink)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === "lock") return <svg viewBox="0 0 24 24" width={26} height={26}><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke={c} strokeWidth="2.5"/><path d="M 8 11 L 8 8 Q 8 4 12 4 Q 16 4 16 8 L 16 11" fill="none" stroke={c} strokeWidth="2.5"/></svg>;
  if (kind === "plus") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M 12 5 L 12 19 M 5 12 L 19 12" stroke={c} strokeWidth="3.5" strokeLinecap="round"/></svg>;
  if (kind === "minus") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M 5 12 L 19 12" stroke={c} strokeWidth="3.5" strokeLinecap="round"/></svg>;
  if (kind === "times") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M 7 7 L 17 17 M 17 7 L 7 17" stroke={c} strokeWidth="3.5" strokeLinecap="round"/></svg>;
  if (kind === "divide") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M 5 12 L 19 12" stroke={c} strokeWidth="3.5" strokeLinecap="round"/><circle cx="12" cy="7" r="1.9" fill={c}/><circle cx="12" cy="17" r="1.9" fill={c}/></svg>;
  if (kind === "scale") return <svg viewBox="0 0 24 24" width={30} height={30}><path d="M4 7 h16 M12 7 v12 M8 20 h8" stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round"/><path d="M4 7 L2 13 a3 3 0 0 0 6 0 Z M20 7 L18 13 a3 3 0 0 0 6 0 Z" fill="none" stroke={c} strokeWidth="2"/></svg>;
  if (kind === "drop") return <svg viewBox="0 0 24 24" width={28} height={28}><path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z" fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round"/></svg>;
  if (kind === "measures") return <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round"><line x1="5" y1="20" x2="5" y2="13"/><line x1="12" y1="20" x2="12" y2="9"/><line x1="19" y1="20" x2="19" y2="5"/><line x1="3" y1="20" x2="21" y2="20"/></svg>;
  if (kind === "clock") return <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke={c} strokeWidth="2.4"><circle cx="12" cy="12" r="8.5"/><path d="M12 7 v5 l3.5 2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === "compare") return <svg viewBox="0 0 24 24" width={28} height={28}><rect x="4" y="13" width="6" height="7" rx="1.5" fill={c}/><rect x="14" y="6" width="6" height="14" rx="1.5" fill={c}/></svg>;
  return <svg viewBox="0 0 24 24" width={32} height={32}><rect x="3" y="8" width="18" height="9" rx="2" fill="none" stroke={c} strokeWidth="2.5"/>{[6,9,12,15,18].map((x,i)=><line key={i} x1={x} y1="8" x2={x} y2={i%2===0?"14":"11.5"} stroke={c} strokeWidth="2" strokeLinecap="round"/>)}</svg>;
}

function lessonTitle(id) {
  if (id === "units") return t("lesson_units");
  if (id === "add") return t("lesson_add");
  if (id === "subtract") return t("lesson_subtract");
  if (id === "multiply") return t("lesson_multiply");
  if (id === "divide") return t("lesson_divide");
  if (id === "measures") return t("lesson_measures");
  if (id === "length") return t("lesson_length");
  if (id === "mass") return t("lesson_mass");
  if (id === "capacity") return t("lesson_capacity");
  if (id === "time") return t("lesson_time");
  if (id === "addRuler") return t("lesson_addRuler");
  if (id === "compareLen") return t("lesson_compareLen");
  return id;
}
function lessonSub(id) {
  if (id === "units") return t("unit_sub");
  if (id === "add") return t("add_sub");
  if (id === "subtract") return t("sub_sub");
  if (id === "multiply") return t("mul_sub");
  if (id === "divide") return t("div_sub");
  if (id === "measures") return t("measures_sub");
  if (id === "length") return t("length_sub");
  if (id === "mass") return t("mass_sub");
  if (id === "capacity") return t("capacity_sub");
  if (id === "time") return t("time_sub");
  return t("locked");
}

function LessonList({ onBack, onPick, completed }) {
  const lessons = window.MIDOKU_LESSONS || [];
  return (
    <div style={{ position: "relative", minHeight: "100dvh", paddingBottom: "var(--space-7)" }}>
      <BgDecor/>
      <ScreenHeader onBack={onBack} center={
        <h1 style={{ margin: 0, fontSize: "calc(24px * var(--scale))", fontWeight: 700 }}>{t("subject_math")}</h1>
      }/>
      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: "var(--space-3)", padding: "var(--space-3) var(--space-5)", maxWidth: 520, margin: "0 auto" }}>
        {lessons.map(l => {
          const done = completed && completed[l.id];
          const state = done ? "done" : l.state;
          const locked = state === "locked";
          return (
            <LessonRow key={l.id} title={lessonTitle(l.id)} sub={lessonSub(l.id)}
              icon={locked ? "lock" : l.icon} locked={locked} done={done}
              onClick={() => !locked && onPick(l.id)}/>
          );
        })}
      </div>
    </div>
  );
}

function LessonRow({ title, sub, icon, locked, done, onClick }) {
  const press = (e, d) => {
    if (locked) return;
    e.currentTarget.style.transform = d ? "translateY(4px)" : "translateY(0)";
    e.currentTarget.style.boxShadow = d ? "0 1px 0 var(--ink)" : "0 5px 0 var(--ink)";
  };
  return (
    <button onClick={onClick} disabled={locked}
      onPointerDown={e => press(e, true)} onPointerUp={e => press(e, false)} onPointerLeave={e => press(e, false)} onPointerCancel={e => press(e, false)}
      style={{
        display: "flex", alignItems: "center", gap: "var(--space-4)", width: "100%", textAlign: "left",
        background: "var(--surface)", border: "3px solid " + (locked ? "var(--ink-faint)" : "var(--ink)"),
        borderRadius: "var(--r-lg)", boxShadow: locked ? "none" : "0 5px 0 var(--ink)",
        padding: "var(--space-4)", opacity: locked ? 0.6 : 1, cursor: locked ? "default" : "pointer",
        transition: "transform 100ms, box-shadow 100ms",
      }}>
      <span style={{ width: 56, height: 56, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: "var(--r-md)", border: "3px solid " + (locked ? "var(--ink-faint)" : "var(--ink)"), background: done ? "var(--ok)" : locked ? "var(--bg-2)" : "var(--tertiary-soft)" }}>
        <MiniIcon kind={icon}/>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 700, fontSize: "calc(18px * var(--scale))", color: locked ? "var(--ink-faint)" : "var(--ink)" }}>{title}</span>
        <span style={{ display: "block", fontWeight: 600, fontSize: "calc(14px * var(--scale))", color: done ? "var(--ok)" : "var(--ink-faint)", marginTop: 2 }}>{sub}</span>
      </span>
      {!locked && (
        <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden style={{ flexShrink: 0 }}><path d="M 9 6 L 15 12 L 9 18" stroke="var(--ink-soft)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </button>
  );
}

/* ── Contenido de las explicaciones por lección ───────────── */
const INTRO_CONTENT = {
  units: {
    es: {
      intro: "Medimos longitudes con la regla. Las dos unidades pequeñas son el centímetro (cm) y el milímetro (mm), más pequeño.",
      s_rule: "La regla de oro",
      s_read: "Leer la regla",
      read: "Cuenta primero los centímetros y después los milímetros que sobran.",
      s_convert: "Cambiar de unidad",
      conv_mm: "De cm a mm: multiplica por 10.",
      conv_cm: "De mm a cm: divide entre 10.",
      s_add: "Sumar longitudes",
      add: "Suma los cm con los cm y los mm con los mm.",
      carry: "Si los mm pasan de 10, te llevas 1 cm.",
      s_sub: "Restar longitudes",
      sub: "Resta los cm de los cm y los mm de los mm.",
      borrow: "Si no llegan los mm, tomas 1 cm = 10 mm.",
    },
    ja: {
      intro: "ものさしで ながさを はかります。ちいさい たんいは センチメートル（cm）と、もっと ちいさい ミリメートル（mm）です。",
      s_rule: "だいじな ルール",
      s_read: "ものさしの よみかた",
      read: "まず センチを かぞえて、つぎに のこりの ミリを かぞえます。",
      s_convert: "たんいを かえる",
      conv_mm: "cm から mm：10を かける。",
      conv_cm: "mm から cm：10で わる。",
      s_add: "ながさを たす",
      add: "cm は cm と、mm は mm と たします。",
      carry: "ミリが 10を こえたら、1cm くりあがり。",
      s_sub: "ながさを ひく",
      sub: "cm は cm から、mm は mm から ひきます。",
      borrow: "ミリが たりないときは、1cm（=10mm）を かりる。",
    },
  },
  add: {
    es: {
      intro: "Sumar es juntar dos cantidades. Colocamos cifra debajo de cifra: unidades con unidades, decenas con decenas…",
      s_basic: "Suma sin llevadas",
      basic: "Suma columna a columna, de derecha a izquierda.",
      s_carry: "Suma con llevadas",
      carry_text: "Si una columna pasa de 9, escribes la unidad y te llevas 1 a la columna siguiente.",
      carry_hint: "Aquí 7 + 8 = 15: escribimos 5 y nos llevamos 1.",
    },
    ja: {
      intro: "たしざんは ふたつの かずを あつめる ことです。くらいを そろえて、いちのくらい から たします。",
      s_basic: "くりあがり なし",
      basic: "みぎ から じゅんに、くらいごとに たします。",
      s_carry: "くりあがり あり",
      carry_text: "ある くらいで 9を こえたら、いち を かいて、つぎの くらいに 1を くりあげます。",
      carry_hint: "ここでは 7 + 8 = 15。 5 を かいて、1 を くりあげます。",
    },
  },
  subtract: {
    es: {
      intro: "Restar es quitar. Colocamos cifra debajo de cifra y vamos columna a columna, de derecha a izquierda.",
      s_basic: "Resta sin préstamo",
      basic: "Si arriba hay más, restas directo.",
      s_borrow: "Resta con préstamo",
      borrow_text: "Si arriba no llega, le pides 10 a la columna siguiente.",
      borrow_hint: "Aquí 2 − 7 no puede; tomamos 1 decena: 12 − 7 = 5, y la columna de al lado pierde 1.",
    },
    ja: {
      intro: "ひきざんは へらす ことです。くらいを そろえて、いちのくらい から ひきます。",
      s_basic: "くりさがり なし",
      basic: "うえの ほうが おおきい ときは、その まま ひきます。",
      s_borrow: "くりさがり あり",
      borrow_text: "うえが たりない ときは、となりの くらい から 10 を かります。",
      borrow_hint: "ここでは 2 − 7 が できないので、となり から 1 を かりて 12 − 7 = 5。",
    },
  },
  multiply: {
    es: {
      intro: "Multiplicar es sumar el mismo número varias veces. 3 × 4 son 3 grupos de 4.",
      s_basic: "Grupos iguales",
      basic: "3 × 4 = 4 + 4 + 4 = 12. Cuenta los puntos para comprobarlo.",
      s_ten: "Multiplicar por 10",
      ten_text: "Para multiplicar por 10, añade un cero al número.",
      ten_hint: "3 × 10 = 30. ¡Muy útil para las medidas!",
    },
    ja: {
      intro: "かけざんは おなじ かずを なんかいも たす ことです。3 × 4 は 4が 3つ。",
      s_basic: "おなじ かずの まとまり",
      basic: "3 × 4 = 4 + 4 + 4 = 12。てんを かぞえて たしかめよう。",
      s_ten: "10を かける",
      ten_text: "10を かける ときは、かずの うしろに 0を つけます。",
      ten_hint: "3 × 10 = 30。たんいの べんきょうに とても やくだつよ！",
    },
  },
  divide: {
    es: {
      intro: "Dividir es repartir en partes iguales. 12 ÷ 3 reparte 12 en 3 grupos.",
      s_basic: "Repartir por igual",
      basic: "12 ÷ 3 = 4: a cada grupo le tocan 4. Todas nuestras divisiones son exactas, sin sobras.",
      s_ten: "Dividir entre 10",
      ten_text: "Para dividir entre 10 un número acabado en 0, le quitas un cero.",
      ten_hint: "30 ÷ 10 = 3. Es lo contrario de multiplicar por 10.",
    },
    ja: {
      intro: "わりざんは おなじ かずに わける ことです。12 ÷ 3 は 12を 3つに わけます。",
      s_basic: "おなじ かずに わける",
      basic: "12 ÷ 3 = 4：1つの まとまりは 4こ。わりざんは いつも ちょうど わりきれる（あまり なし）。",
      s_ten: "10で わる",
      ten_text: "0で おわる かずを 10で わる ときは、0を ひとつ とります。",
      ten_hint: "30 ÷ 10 = 3。10を かける はんたいだよ。",
    },
  },
};

function IntroSection({ title, children }) {
  return (
    <section style={{ background: "var(--surface)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", padding: "var(--space-4) var(--space-4) var(--space-5)" }}>
      <h2 style={{ margin: "0 0 var(--space-3)", fontSize: "calc(17px * var(--scale))", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-soft)" }}>{title}</h2>
      {children}
    </section>
  );
}

function ExampleRow({ from, op, to, eq = "=" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(8px * var(--scale))", flexWrap: "wrap", padding: "var(--space-2) 0" }}>
      <MeasureExpr m={from} size={28}/>
      {op && <span className="math-num" style={{ fontSize: "calc(22px * var(--scale))", fontWeight: 700, color: "var(--ink-faint)" }}>{op}</span>}
      <span className="math-num" style={{ fontSize: "calc(24px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>{eq}</span>
      <MeasureExpr m={to} size={28}/>
    </div>
  );
}

// Fila A op B = C (suma/resta), con color de operador.
function OpRow({ a, op, b, c, opColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(7px * var(--scale))", flexWrap: "wrap", padding: "var(--space-1) 0" }}>
      <MeasureExpr m={a} size={24}/>
      <span className="math-num" style={{ fontSize: "calc(20px * var(--scale))", fontWeight: 700, color: opColor }}>{op}</span>
      <MeasureExpr m={b} size={24}/>
      <span className="math-num" style={{ fontSize: "calc(20px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
      <MeasureExpr m={c} size={24}/>
    </div>
  );
}

// Nota de pista (llevada / préstamo).
function NoteHint({ children }) {
  return (
    <div style={{ marginTop: "var(--space-2)", display: "flex", gap: 8, alignItems: "center", background: "var(--tertiary-soft)", border: "2px solid var(--ink)", borderRadius: "var(--r-md)", padding: "calc(8px * var(--scale)) calc(12px * var(--scale))" }}>
      <span aria-hidden style={{ width: 20, height: 20, flexShrink: 0, borderRadius: "50%", background: "var(--tertiary)", border: "2px solid var(--ink)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800 }}>!</span>
      <span style={{ fontSize: "calc(14px * var(--scale))", fontWeight: 600, lineHeight: 1.35, color: "var(--ink)" }}>{children}</span>
    </div>
  );
}

/* Fila de operación entera estilo "345 + 128 = 473", con operador a color. */
function IntOpRow({ a, op, b, c, opColor }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "calc(8px * var(--scale))", flexWrap: "wrap", padding: "var(--space-1) 0" }}>
      <span className="math-num" style={{ fontSize: "calc(26px * var(--scale))", fontWeight: 700 }}>{a}</span>
      <span className="math-num" style={{ fontSize: "calc(22px * var(--scale))", fontWeight: 700, color: opColor }}>{op}</span>
      <span className="math-num" style={{ fontSize: "calc(26px * var(--scale))", fontWeight: 700 }}>{b}</span>
      <span className="math-num" style={{ fontSize: "calc(22px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
      <span className="math-num" style={{ fontSize: "calc(26px * var(--scale))", fontWeight: 700, color: "var(--ink)" }}>{c}</span>
    </div>
  );
}

/* Cuerpo de la lección cm/mm. */
function UnitsIntroBody({ c }) {
  return (
    <>
      <IntroSection title={c.s_rule}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-3)" }}>
          <span className="math-num" style={{ fontSize: "calc(32px * var(--scale))", fontWeight: 700 }}>1<span style={{ color: "var(--cm-accent)", fontSize: "0.5em" }}>cm</span></span>
          <span style={{ fontSize: "calc(28px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)", margin: "0 10px" }}>=</span>
          <span className="math-num" style={{ fontSize: "calc(32px * var(--scale))", fontWeight: 700, color: "var(--mm)" }}>10<span style={{ fontSize: "0.5em" }}>mm</span></span>
        </div>
        <CmZoom shown/>
      </IntroSection>

      <IntroSection title={c.s_read}>
        <p style={{ margin: "0 0 var(--space-3)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)", lineHeight: 1.4 }}>{c.read}</p>
        <Ruler cmCount={12} objectMm={35} objectColor="var(--tertiary)" guide/>
        <div style={{ textAlign: "center", marginTop: "var(--space-2)" }}><MeasureExpr m={{ cm: 3, mm: 5 }} size={26}/></div>
      </IntroSection>

      <IntroSection title={c.s_convert}>
        <p style={{ margin: "0 0 var(--space-1)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.conv_mm}</p>
        <ExampleRow from={{ cm: 5, mm: 0 }} to={{ cm: 0, mm: 50 }}/>
        <div style={{ height: 1, background: "var(--bg-2)", margin: "var(--space-2) 0" }}/>
        <p style={{ margin: "0 0 var(--space-1)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.conv_cm}</p>
        <ExampleRow from={{ cm: 0, mm: 70 }} to={{ cm: 7, mm: 0 }}/>
      </IntroSection>

      <IntroSection title={c.s_add}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.add}</p>
        <OpRow a={{ cm: 1, mm: 5 }} op="+" b={{ cm: 2, mm: 2 }} c={{ cm: 3, mm: 7 }} opColor="var(--ok)"/>
        <div style={{ height: 1, background: "var(--bg-2)", margin: "var(--space-2) 0" }}/>
        <OpRow a={{ cm: 4, mm: 8 }} op="+" b={{ cm: 2, mm: 6 }} c={{ cm: 7, mm: 4 }} opColor="var(--ok)"/>
        <NoteHint>{c.carry}</NoteHint>
      </IntroSection>

      <IntroSection title={c.s_sub}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.sub}</p>
        <OpRow a={{ cm: 5, mm: 7 }} op="−" b={{ cm: 2, mm: 3 }} c={{ cm: 3, mm: 4 }} opColor="var(--ng)"/>
        <div style={{ height: 1, background: "var(--bg-2)", margin: "var(--space-2) 0" }}/>
        <OpRow a={{ cm: 5, mm: 2 }} op="−" b={{ cm: 1, mm: 7 }} c={{ cm: 3, mm: 5 }} opColor="var(--ng)"/>
        <NoteHint>{c.borrow}</NoteHint>
      </IntroSection>
    </>
  );
}

/* Cuerpo de la lección de sumas enteras. */
function AddIntroBody({ c }) {
  return (
    <>
      <IntroSection title={c.s_basic}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.basic}</p>
        <IntOpRow a={23} op="+" b={45} c={68} opColor="var(--ok)"/>
        <div style={{ height: 1, background: "var(--bg-2)", margin: "var(--space-2) 0" }}/>
        <IntOpRow a={341} op="+" b={206} c={547} opColor="var(--ok)"/>
      </IntroSection>

      <IntroSection title={c.s_carry}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.carry_text}</p>
        <IntOpRow a={47} op="+" b={38} c={85} opColor="var(--ok)"/>
        <NoteHint>{c.carry_hint}</NoteHint>
      </IntroSection>

      <TryItWidget op="+"/>
    </>
  );
}

/* Cuerpo de la lección de restas enteras. */
function SubtractIntroBody({ c }) {
  return (
    <>
      <IntroSection title={c.s_basic}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.basic}</p>
        <IntOpRow a={87} op="−" b={25} c={62} opColor="var(--ng)"/>
        <div style={{ height: 1, background: "var(--bg-2)", margin: "var(--space-2) 0" }}/>
        <IntOpRow a={569} op="−" b={234} c={335} opColor="var(--ng)"/>
      </IntroSection>

      <IntroSection title={c.s_borrow}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.borrow_text}</p>
        <IntOpRow a={52} op="−" b={17} c={35} opColor="var(--ng)"/>
        <NoteHint>{c.borrow_hint}</NoteHint>
      </IntroSection>

      <TryItWidget op="−"/>
    </>
  );
}

/* Cuerpo de la lección de multiplicación. */
function MultiplyIntroBody({ c }) {
  return (
    <>
      <IntroSection title={c.s_basic}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.basic}</p>
        <DotsArray rows={3} cols={4}/>
        <IntOpRow a={3} op="×" b={4} c={12} opColor="var(--secondary-strong)"/>
      </IntroSection>

      <IntroSection title={c.s_ten}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.ten_text}</p>
        <NoteHint>{c.ten_hint}</NoteHint>
        {/* Tabla del 10 como caso especial: el 10 va a la derecha (k × 10). */}
        <div style={{ maxWidth: 240, margin: "var(--space-3) auto 0" }}>
          <EqTable op="×" title={tableLabel("×", 10)} rows={mulTableRows(10, 1, 10, false)}/>
        </div>
      </IntroSection>

      <TryItWidget op="×"/>
    </>
  );
}

/* Cuerpo de la lección de división (siempre exacta). */
function DivideIntroBody({ c }) {
  return (
    <>
      <IntroSection title={c.s_basic}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.basic}</p>
        <ShareGroups total={12} groups={3}/>
        <IntOpRow a={12} op="÷" b={3} c={4} opColor="var(--primary-strong)"/>
      </IntroSection>

      <IntroSection title={c.s_ten}>
        <p style={{ margin: "0 0 var(--space-2)", fontSize: "calc(15px * var(--scale))", fontWeight: 600, color: "var(--ink-soft)" }}>{c.ten_text}</p>
        <IntOpRow a={30} op="÷" b={10} c={3} opColor="var(--primary-strong)"/>
        <NoteHint>{c.ten_hint}</NoteHint>
      </IntroSection>

      <TryItWidget op="÷"/>
    </>
  );
}

/* ── Mini-widget interactivo de la teoría ──────────────────────
   El niño ajusta dos números con + / − y ve el resultado en vivo.
   Para ÷ los selectores son "grupos" y "en cada uno" → siempre exacto. */
function Stepper({ value, min, max, onChange }) {
  const btn = (label, onClick, disabled) => (
    <button onClick={onClick} disabled={disabled} aria-label={label}
      style={{ width: "calc(36px * var(--scale))", height: "calc(36px * var(--scale))", borderRadius: "var(--r-md)", border: "3px solid var(--ink)", background: "var(--surface)", boxShadow: disabled ? "none" : "0 3px 0 var(--ink)", fontSize: "calc(20px * var(--scale))", fontWeight: 800, lineHeight: 1, opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer" }}>
      {label}
    </button>
  );
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: "calc(6px * var(--scale))" }}>
      {btn("+", () => onChange(Math.min(max, value + 1)), value >= max)}
      <span className="math-num" style={{ fontSize: "calc(34px * var(--scale))", fontWeight: 700, minWidth: "calc(30px * var(--scale))", textAlign: "center" }}>{value}</span>
      {btn("−", () => onChange(Math.max(min, value - 1)), value <= min)}
    </div>
  );
}

function TryItWidget({ op }) {
  const isDiv = op === "÷";
  const [v1, setV1] = useState(isDiv ? 3 : 2);   // ÷: nº de grupos
  const [v2, setV2] = useState(isDiv ? 4 : 3);   // ÷: en cada grupo
  const min = isDiv ? 1 : 0;

  // Para la resta mostramos siempre mayor − menor (sin negativos).
  const a = op === "−" ? Math.max(v1, v2) : (isDiv ? v1 * v2 : v1);
  const b = op === "−" ? Math.min(v1, v2) : (isDiv ? v1 : v2);
  const result = op === "+" ? a + b : op === "−" ? a - b : op === "×" ? a * b : a / b;
  const opColor = op === "+" ? "var(--ok)" : op === "−" ? "var(--ng)" : op === "×" ? "var(--secondary-strong)" : "var(--primary-strong)";

  return (
    <IntroSection title={t("try_it")}>
      <div style={{ display: "flex", justifyContent: "center", gap: "calc(20px * var(--scale))", padding: "var(--space-2) 0 var(--space-3)" }}>
        <Stepper value={v1} min={min} max={9} onChange={setV1}/>
        <Stepper value={v2} min={min} max={9} onChange={setV2}/>
      </div>
      {op === "×" && <DotsArray rows={a} cols={b}/>}
      {op === "÷" && <ShareGroups total={a} groups={b}/>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "calc(8px * var(--scale))", flexWrap: "wrap", paddingTop: "var(--space-2)" }}>
        <span className="math-num" style={{ fontSize: "calc(30px * var(--scale))", fontWeight: 700 }}>{a}</span>
        <span className="math-num" style={{ fontSize: "calc(26px * var(--scale))", fontWeight: 700, color: opColor }}>{op}</span>
        <span className="math-num" style={{ fontSize: "calc(30px * var(--scale))", fontWeight: 700 }}>{b}</span>
        <span className="math-num" style={{ fontSize: "calc(26px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
        <span className="math-num" style={{ fontSize: "calc(34px * var(--scale))", fontWeight: 800, color: "var(--ink)" }}>{result}</span>
      </div>
    </IntroSection>
  );
}

/* ── Tablas de consulta en formato clásico "tabla del n" ─────────
   Cada tabla es una lista de ecuaciones, grande y legible, en lugar de
   una rejilla apretada. */
const seq = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// Filas de la tabla de multiplicar de n. baseLeft=false pone n a la derecha
// (caso especial del 10: 1×10, 2×10, …).
function mulTableRows(n, kFrom, kTo, baseLeft) {
  return seq(kFrom, kTo).map(k => baseLeft
    ? { a: n, op: "×", b: k, c: n * k }
    : { a: k, op: "×", b: n, c: k * n });
}
// Filas de la tabla de sumar de n: n+0, n+1, …
function addTableRows(n, kFrom, kTo) {
  return seq(kFrom, kTo).map(k => ({ a: n, op: "+", b: k, c: n + k }));
}
// Título de cada tabla según idioma (japonés: "Nの だん").
function tableLabel(op, n) {
  if (getLang() === "ja") return op === "×" ? `${n}の だん` : `${n}の たしざん`;
  return `Tabla del ${n}`;
}

function EqRow({ a, op, b, c, opColor }) {
  const big = { fontSize: "calc(18px * var(--scale))", fontWeight: 700 };
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "calc(5px * var(--scale))", padding: "calc(3px * var(--scale)) 0" }}>
      <span className="math-num" style={{ ...big, minWidth: "1.6em", textAlign: "right" }}>{a}</span>
      <span className="math-num" style={{ fontSize: "calc(15px * var(--scale))", fontWeight: 700, color: opColor }}>{op}</span>
      <span className="math-num" style={{ ...big, minWidth: "1.6em" }}>{b}</span>
      <span className="math-num" style={{ fontSize: "calc(15px * var(--scale))", fontWeight: 700, color: "var(--ink-soft)" }}>=</span>
      <span className="math-num" style={{ fontSize: "calc(20px * var(--scale))", fontWeight: 800, minWidth: "1.6em" }}>{c}</span>
    </div>
  );
}

function EqTable({ title, rows, op }) {
  const opColor = op === "+" ? "var(--ok)" : "var(--secondary-strong)";
  return (
    <div style={{ background: "var(--surface)", border: "3px solid var(--ink)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-sm)", padding: "var(--space-3) var(--space-2) var(--space-4)" }}>
      <div style={{ textAlign: "center", fontWeight: 800, fontSize: "calc(15px * var(--scale))", marginBottom: "var(--space-2)", color: "var(--ink-soft)" }}>{title}</div>
      {rows.map((r, i) => <EqRow key={i} {...r} opColor={opColor}/>)}
    </div>
  );
}

// Vista de consulta: tablas del 1 al 9 en una rejilla adaptable.
function RefTable({ op }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "var(--space-3)", maxWidth: 560, margin: "0 auto" }}>
      {seq(1, 9).map(n => (
        <EqTable key={n} op={op} title={tableLabel(op, n)}
          rows={op === "+" ? addTableRows(n, 0, 9) : mulTableRows(n, 1, 9, true)}/>
      ))}
    </div>
  );
}

function TablesOverlay({ op, title, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <ScreenHeader onBack={onClose} center={
        <h1 style={{ margin: 0, fontSize: "calc(20px * var(--scale))", fontWeight: 700 }}>{title}</h1>
      }/>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "var(--space-4) var(--space-4) var(--space-7)" }}>
        <RefTable op={op}/>
      </div>
    </div>
  );
}

// ¿Qué tabla corresponde a cada lección? (solo sumas y multiplicación)
function lessonTable(id) {
  if (id === "add") return { op: "+", title: t("table_add") };
  if (id === "multiply") return { op: "×", title: t("table_mul") };
  return null;
}

function LessonIntro({ lessonId, onBack, onStart }) {
  const lang = getLang();
  const isMeasure = (window.MIDOKU_MEASURE_IDS || []).includes(lessonId);
  const pack = (INTRO_CONTENT[lessonId] && (INTRO_CONTENT[lessonId][lang] || INTRO_CONTENT[lessonId].es)) || INTRO_CONTENT.units.es;
  const tbl = lessonTable(lessonId);
  const [showTable, setShowTable] = useState(false);
  const [showUnits, setShowUnits] = useState(false);
  const [enabled, setEnabled] = useState(() => isMeasure ? window.measEnabled(lessonId) : []);
  const roundBtn = { width: 40, height: 40, borderRadius: "50%", background: "var(--surface)", border: "3px solid var(--ink)", boxShadow: "0 3px 0 var(--ink)", display: "grid", placeItems: "center", flexShrink: 0 };
  const headerRight = tbl ? (
    <button onClick={() => setShowTable(true)} aria-label={t("tables")} style={roundBtn}>
      <svg viewBox="0 0 24 24" width={20} height={20}><rect x="4" y="4" width="16" height="16" rx="2.5" fill="none" stroke="var(--ink)" strokeWidth="2.2"/><path d="M 4 10 L 20 10 M 4 15 L 20 15 M 10 4 L 10 20 M 15 4 L 15 20" stroke="var(--ink)" strokeWidth="1.8"/></svg>
    </button>
  ) : isMeasure ? (
    <button onClick={() => setShowUnits(true)} aria-label={t("pick_units")} style={roundBtn}>
      <svg viewBox="0 0 24 24" width={21} height={21} fill="none" stroke="var(--ink)" strokeWidth="2">
        <circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="1.9"/>
        {[0,45,90,135,180,225,270,315].map((deg,i)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return <line key={i} x1={12+5.2*c} y1={12+5.2*s} x2={12+8*c} y2={12+8*s} strokeLinecap="round"/>;})}
      </svg>
    </button>
  ) : null;
  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <BgDecor/>
      <ScreenHeader onBack={onBack} center={
        <h1 style={{ margin: 0, fontSize: "calc(20px * var(--scale))", fontWeight: 700, lineHeight: 1.1 }}>{lessonTitle(lessonId)}</h1>
      } right={headerRight}/>

      {/* Botón arriba que lleva a los ejercicios */}
      <div style={{ padding: "0 var(--space-5) var(--space-3)", position: "relative", zIndex: 3, maxWidth: 560, margin: "0 auto", width: "100%" }}>
        <BigButton color="accent" onClick={onStart} style={{ width: "100%" }}>
          {t("go_exercises")}
        </BigButton>
      </div>

      {/* Explicación (scroll) */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", position: "relative", zIndex: 2,
        padding: "var(--space-2) var(--space-5) var(--space-7)", display: "grid", gap: "var(--space-4)", maxWidth: 560, margin: "0 auto", width: "100%" }}>

        {!isMeasure && <p style={{ margin: 0, fontSize: "calc(17px * var(--scale))", fontWeight: 600, lineHeight: 1.45, color: "var(--ink-soft)", textWrap: "pretty" }}>{pack.intro}</p>}

        {lessonId === "add" && <AddIntroBody c={pack}/>}
        {lessonId === "subtract" && <SubtractIntroBody c={pack}/>}
        {lessonId === "multiply" && <MultiplyIntroBody c={pack}/>}
        {lessonId === "divide" && <DivideIntroBody c={pack}/>}
        {lessonId === "units" && <UnitsIntroBody c={pack}/>}
        {isMeasure && <MeasureIntroBody lessonId={lessonId} enabled={enabled}/>}
      </div>

      {tbl && showTable && <TablesOverlay op={tbl.op} title={tbl.title} onClose={() => setShowTable(false)}/>}
      {isMeasure && showUnits && <UnitPicker measure={lessonId} onChange={setEnabled} onClose={() => setShowUnits(false)}/>}
    </div>
  );
}

Object.assign(window, { LessonList, LessonIntro });
