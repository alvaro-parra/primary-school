# Midoku — Mide y aprende (cm y mm)

App educativa para que un niño de primaria
(Japón, ~6–8 años / 1.º–2.º) practique **longitudes**: centímetros y milímetros.
Mock interactivo HTML + JSX, sin backend. Hermana de *Supeingo*; comparte su
"DNA" visual (estilo ficha de cartón, paleta pastel cálida, Fredoka + Andika).

## Lección 1 — Centímetros y milímetros
Secuencia de 9 pasos con progresión pedagógica:
1. **Enseñar** — 1 cm = 10 mm (diagrama de 1 cm dividido en 10 mm).
2. **Medir** — leer la longitud de un objeto en la regla (cm).
3. **Colocar la regla** — arrastrar la marca hasta una longitud pedida.
4. **Convertir cm → mm** — 5 cm = 50 mm (con regla de apoyo).
5. **Medir mixto** — leer 3 cm 5 mm en la regla.
6. **Convertir mm → cm** — 70 mm = 7 cm.
7. **Mixto → mm** — 2 cm 4 mm = 24 mm.
8. **Comparar** — ¿cuál es más largo? (3 cm 5 mm vs 38 mm).
9. **Sumar** — 1 cm 5 mm + 2 cm 2 mm = 3 cm 7 mm.

La **regla interactiva** (`Ruler.jsx`, SVG) es el manipulable protagonista:
muestra objetos medidos, cinta resaltada, marca de respuesta y un mango
arrastrable para medir.

## Gamificación
Mapa de lecciones con nodos, barra de progreso, corazones/vidas, racha,
barra de feedback acierto/error, y pantalla final con trofeo + estrellas + puntos.

## Tweaks (barra del editor)
- **Idioma**: Español / 日本語 (interfaz + audio TTS).
- **Tema**: Crema · Mar · Cuaderno · Cobre.
- **Regla**: madera / papel.
- **Tamaño** global de la interfaz.
- **Dificultad**: 1 / 3 / 5 corazones.

## Estructura
```
index.html
styles/base.css           tokens (heredados de Supeingo + regla/mates)
data/lesson.js            secuencia de la lección 1 + helpers de medida
components/
  shared.jsx              i18n, speak(), mascota, botones, header, hearts…
  Ruler.jsx               regla interactiva (SVG)
  NumberPad.jsx           teclado numérico + campos de respuesta
  Exercises.jsx           un componente por tipo de ejercicio
  Lesson.jsx              orquestador (progreso, corazones, feedback, fin)
  LessonMap.jsx           mapa de lecciones (home)
  App.jsx                 shell, routing y panel de Tweaks
tweaks-panel.jsx          panel de tweaks
```

Pila: React 18 + Babel en navegador (sin build), componentes globales
(`window.X`), persistencia en `localStorage`. Igual que *Supeingo*, para iterar
rápido; no es producción.
