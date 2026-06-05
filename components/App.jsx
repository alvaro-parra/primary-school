// App — shell, routing (mapa ⇄ lección) y panel de Tweaks.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "ja",
  "theme": "crema",
  "scale": 1,
  "ruler": "madera"
}/*EDITMODE-END*/;

const THEME_TO_PALETTE = { crema: "", mar: "mar", cuaderno: "cuaderno", cobre: "cobre" };

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // El idioma debe quedar fijado ANTES de renderizar los hijos (t() lo lee).
  window.MIDOKU_LANG = tw.lang;

  const [route, setRoute] = useState("map");   // "map" | "list" | "intro" | "problems" | "play"
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);
  const [solved, setSolved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("midoku_solved") || "{}"); } catch (e) { return {}; }
  });
  const problemTypes = window.MIDOKU_PROBLEM_TYPES || [];
  // La lección se marca completada cuando se resuelven todos los problemas.
  const completed = { units: problemTypes.length > 0 && problemTypes.every(p => solved[p.id]) };

  // Aplica tema y escala al documento.
  useEffect(() => {
    const root = document.documentElement;
    const pal = THEME_TO_PALETTE[tw.theme] || "";
    if (pal) root.dataset.palette = pal; else delete root.dataset.palette;
  }, [tw.theme]);
  useEffect(() => {
    document.documentElement.style.setProperty("--scale", String(tw.scale));
  }, [tw.scale]);
  // Aplica veta de la regla (madera vs papel)
  useEffect(() => {
    const root = document.documentElement;
    if (tw.ruler === "papel") {
      root.style.setProperty("--ruler-face", "#FFFFFF");
      root.style.setProperty("--ruler-face-2", "#F1F1EC");
    } else {
      root.style.removeProperty("--ruler-face");
      root.style.removeProperty("--ruler-face-2");
    }
  }, [tw.ruler]);

  const openGrade = () => setRoute("list");
  const pickLesson = (id) => { setActiveLesson(id); setRoute("intro"); };
  const openProblems = () => setRoute("problems");
  const pickProblem = (id) => { setActiveProblem(id); setRoute("play"); };
  const [justCompleted, setJustCompleted] = useState(false);
  const markSolved = (id) => {
    const wasAll = problemTypes.length > 0 && problemTypes.every(p => solved[p.id]);
    const next = { ...solved, [id]: true };
    const nowAll = problemTypes.length > 0 && problemTypes.every(p => next[p.id]);
    setSolved(next);
    try { localStorage.setItem("midoku_solved", JSON.stringify(next)); } catch (e) {}
    if (nowAll && !wasAll) setJustCompleted(true);   // celebrar SOLO al completar
  };
  const problemById = (id) => problemTypes.find(p => p.id === id) || problemTypes[0];
  const resetSolved = () => {
    setSolved({});
    setJustCompleted(false);
    try { localStorage.removeItem("midoku_solved"); } catch (e) {}
  };

  let screen;
  if (route === "play") {
    screen = <ProblemPlay problem={problemById(activeProblem)} onBack={() => setRoute("problems")} onSolved={markSolved}/>;
  } else if (route === "problems") {
    screen = <ProblemList problems={problemTypes} solved={solved} onBack={() => setRoute("intro")} onPick={pickProblem} onReset={resetSolved}
      justCompleted={justCompleted} onCelebrated={() => setJustCompleted(false)}/>;
  } else if (route === "intro") {
    screen = <LessonIntro lessonId={activeLesson} onBack={() => setRoute("list")} onStart={openProblems}/>;
  } else if (route === "list") {
    screen = <LessonList onBack={() => setRoute("map")} onPick={pickLesson} completed={completed}/>;
  } else {
    screen = <LessonMap onStart={openGrade} completed={completed}/>;
  }

  return (
    <>
      <div className="app-shell">{screen}</div>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Idioma"/>
        <TweakRadio label="Idioma" value={tw.lang}
          options={[{ value: "es", label: "Español" }, { value: "ja", label: "日本語" }]}
          onChange={v => setTweak("lang", v)}/>
        <TweakSection label="Aspecto"/>
        <TweakSelect label="Tema" value={tw.theme}
          options={[{ value: "crema", label: "Crema" }, { value: "mar", label: "Mar" }, { value: "cuaderno", label: "Cuaderno" }, { value: "cobre", label: "Cobre" }]}
          onChange={v => setTweak("theme", v)}/>
        <TweakRadio label="Regla" value={tw.ruler}
          options={[{ value: "madera", label: "Madera" }, { value: "papel", label: "Papel" }]}
          onChange={v => setTweak("ruler", v)}/>
        <TweakSlider label="Tamaño" value={tw.scale} min={0.85} max={1.3} step={0.05}
          onChange={v => setTweak("scale", v)}/>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App/>);
