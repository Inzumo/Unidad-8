// ==========================================
// WHY BOTHER? — ¿Para qué tomarte el trabajo?
// Dibujas; el trazo guarda tu temblor, respira y se calma.
// Lento = cuidado (grueso, cálido). Rápido = error (fino, frío, suelta chispas).
// Cuatro palabras se descubren haciendo, no leyendo: CREA, IMAGINA, EQUIVÓCATE, APRENDE.
// ==========================================

const SERIF = '"Iowan Old Style", "Palatino Linotype", Georgia, serif';
const WORDS = ['CREA', 'IMAGINA', 'EQUIVÓCATE', 'APRENDE'];
const HINTS = [
  'Haz tu primer trazo. El que sea.',
  'Haz tres trazos. Imagina algo y pruébalo.',
  'Dibuja rápido. Deja que salga torcido.',
  'Ahora repite despacio, con cuidado. Mira qué cambió.'
];
const DEFAULTS = { jitter: 3, breath: 7, calm: 1800, embers: 2, maxW: 10, glow: 0.14 };
const P = {};
for (const k in DEFAULTS) P[k] = { value: DEFAULTS[k] };

let strokes = [], embers = [];
let cur = null, lastPt = null;
let smoothW = 6, smoothH = 40;
let bg, introA = 1, started = false, lab;
let found = loadProgress();

const $ = (id) => document.getElementById(id);

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('whybother_found')) || [false, false, false, false]; }
  catch (e) { return [false, false, false, false]; }
}
function saveProgress() { try { localStorage.setItem('whybother_found', JSON.stringify(found)); } catch (e) {} }

// ---------- p5 ----------
function setup() {
  createCanvas(windowWidth, windowHeight).parent('canvas-holder');
  colorMode(HSB, 360, 100, 100, 100);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  makeBg();

  lab = createLabPanel({
    params: P,
    onDefaults: () => { for (const k in DEFAULTS) P[k].value = DEFAULTS[k]; },
    onClear: clearCanvas
  });

  $('enter').addEventListener('click', () => {
    started = true;
    $('intro').classList.add('fade-out');
    $('game-ui').classList.remove('hidden');
  });
  $('back').addEventListener('click', () => {
    started = false;
    $('intro').classList.remove('fade-out');
    $('game-ui').classList.add('hidden');
  });
  $('clear').addEventListener('click', clearCanvas);
  $('reset').addEventListener('click', () => { clearCanvas(); found = [false, false, false, false]; saveProgress(); updateWordBar(); updateGoal(); });
  $('save').addEventListener('click', () => saveCanvas('why-bother', 'png'));
  $('lab-toggle').addEventListener('click', () => lab.toggle());

  updateWordBar();
  updateGoal();
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); makeBg(); }

function makeBg() {
  bg = createGraphics(width, height);
  bg.pixelDensity(1);
  const g = bg.drawingContext;
  const grad = g.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, max(width, height) * 0.7);
  grad.addColorStop(0, '#1a1d2e');
  grad.addColorStop(1, '#07080c');
  g.fillStyle = grad;
  g.fillRect(0, 0, width, height);
}

function clearCanvas() { strokes = []; embers = []; cur = null; }

// ---------- trazos ----------
function startStroke() {
  cur = { pts: [], born: frameCount, emb: 0, sumW: 0, afterMistake: found[2] };
  strokes.push(cur);
  lastPt = null;
}

function addPoint(x, y) {
  x += (noise(frameCount * 0.3, 1) - 0.5) * P.jitter.value;     // el temblor queda guardado
  y += (noise(frameCount * 0.3, 9) - 0.5) * P.jitter.value;
  const speed = lastPt ? dist(x, y, lastPt.x, lastPt.y) : 0;
  smoothW = lerp(smoothW, constrain(map(speed, 0, 40, P.maxW.value, 1.5), 1.5, P.maxW.value), 0.25);
  smoothH = lerp(smoothH, constrain(map(speed, 0, 40, 38, 210), 38, 210), 0.2);
  const p = { x, y, ox: x, oy: y, w: smoothW, h: smoothH, s: random(1000) };
  cur.pts.push(p);
  cur.sumW += smoothW;
  if (speed > 7 && embers.length < 700) {                         // los errores sueltan chispas
    for (let i = 0; i < P.embers.value; i++) {
      embers.push({ x, y, vx: random(-0.6, 0.6), vy: random(-1.2, -0.2), life: 1, h: smoothH, r: random(1, 2.6) });
      cur.emb++;
    }
  }
  lastPt = p;
}

function finishStroke() {
  if (!cur) return;
  const n = cur.pts.length;
  const avgW = cur.sumW / max(1, n);
  const valid = strokes.filter(s => s.pts.length >= 8).length;
  if (n >= 20) unlock(0);
  if (valid >= 3) unlock(1);
  if (cur.emb >= 10) unlock(2);
  if (cur.afterMistake && n >= 25 && avgW >= 6) unlock(3);       // aprender = repetir con cuidado después del error
  cur = null;
}

function unlock(i) {
  if (found[i]) return;
  found[i] = true;
  saveProgress();
  updateWordBar();
  updateGoal();
  notify(WORDS[i], found.every(Boolean) ? 'Cuatro de cuatro' : 'Palabra descubierta');
}

// ---------- eventos ----------
function onCanvas(e) { return started && e && e.target && e.target.tagName === 'CANVAS'; }

function mousePressed(e) {
  if (!onCanvas(e)) return;
  startStroke();
  addPoint(mouseX, mouseY);
  return false;
}
function mouseDragged(e) {
  if (!cur) return;
  if (!lastPt || dist(mouseX, mouseY, lastPt.x, lastPt.y) > 3) addPoint(mouseX, mouseY);
  return false;
}
function mouseReleased() { finishStroke(); }

function keyPressed() {
  if (!started) return;
  if (key === 'z' || key === 'Z') strokes.pop();
  if (key === 'c' || key === 'C') clearCanvas();
  if (key === 's' || key === 'S') saveCanvas('why-bother', 'png');
  if (key === 'p' || key === 'P') lab.toggle();
}

// ---------- UI ----------
function updateWordBar() {
  document.querySelectorAll('.word-slot').forEach((el, i) => {
    el.classList.toggle('found', found[i]);
    el.textContent = found[i] ? WORDS[i] : '?';
  });
}

function updateGoal() {
  const i = found.findIndex(f => !f);
  if (i === -1) {
    $('goal-title').textContent = 'Listo';
    $('goal-desc').textContent = 'Esto lo hiciste tú, con torpezas y todo. Sigue dibujando si quieres.';
  } else {
    $('goal-title').textContent = WORDS[i];
    $('goal-desc').textContent = HINTS[i];
  }
}

let notifTimer;
function notify(title, sub) {
  $('notif-title').textContent = title;
  $('notif-sub').textContent = sub;
  $('notification').classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => $('notification').classList.remove('show'), 2400);
}

let lastHud = '';
function updateHud() {
  const count = strokes.filter(s => s.pts.length >= 2).length;
  const care = constrain(round(map(smoothW, 1.5, P.maxW.value, 0, 100)), 0, 100);
  const s = count + '|' + care;
  if (s === lastHud) return;
  lastHud = s;
  $('badge-num').textContent = 'TRAZOS ' + String(count).padStart(2, '0');
  $('badge-sub').textContent = 'CUIDADO ' + care + '%';
}

// ---------- dibujo ----------
function draw() {
  drawingContext.drawImage(bg.elt, 0, 0, width, height);

  for (const st of strokes) {
    const age = frameCount - st.born;
    const calm = min(1, age / P.calm.value);
    const amp = lerp(P.breath.value, P.breath.value * 0.2, calm);   // con el tiempo se calma
    const alpha = max(55, 100 - age * 0.008);
    const n = st.pts.length;

    for (const p of st.pts) {
      p.x = p.ox + (noise(p.s, frameCount * 0.01) - 0.5) * amp;
      p.y = p.oy + (noise(p.s + 500, frameCount * 0.01) - 0.5) * amp;
    }
    if (n === 1) {
      const p = st.pts[0];
      noStroke();
      fill(p.h, 50, 100, 20);    circle(p.x, p.y, p.w * 4);
      fill(p.h, 45, 100, alpha); circle(p.x, p.y, p.w * 1.2);
      continue;
    }
    for (let i = 1; i < n; i++) {                                   // resplandor
      const p = st.pts[i], q = st.pts[i - 1];
      stroke(p.h, 55, 100, alpha * P.glow.value);
      strokeWeight((p.w + q.w) * 1.6);
      line(q.x, q.y, p.x, p.y);
    }
    for (let i = 1; i < n; i++) {                                   // trazo
      const p = st.pts[i], q = st.pts[i - 1];
      stroke(p.h, lerp(60, 30, constrain((p.w - 1.5) / 8.5, 0, 1)), 100, alpha);
      strokeWeight((p.w + q.w) / 2);
      line(q.x, q.y, p.x, p.y);
    }
  }

  noStroke();
  for (let i = embers.length - 1; i >= 0; i--) {                    // chispas
    const e = embers[i];
    e.x += e.vx + (noise(e.x * 0.01, e.y * 0.01, frameCount * 0.01) - 0.5) * 0.8;
    e.y += e.vy;
    e.life -= 0.012;
    if (e.life <= 0) { embers.splice(i, 1); continue; }
    fill(e.h, 40, 100, e.life * 18); circle(e.x, e.y, e.r * 5);
    fill(e.h, 30, 100, e.life * 90); circle(e.x, e.y, e.r * 1.6);
  }

  // pregunta de inicio: se va con el primer trazo
  if (started && strokes.length === 0) introA = min(1, introA + 0.02); else introA = max(0, introA - 0.04);
  if (started && introA > 0.01) {
    const ctx = drawingContext;
    ctx.save();
    ctx.shadowColor = 'rgba(190,205,255,0.55)';
    ctx.shadowBlur = 24;
    textFont(SERIF);
    textAlign(CENTER, CENTER);
    fill(220, 8, 97, 100 * introA);
    textSize(min(54, width * 0.08));
    text('¿Para qué tomarte el trabajo?', width / 2, height / 2 - 14);
    ctx.restore();
    textSize(16);
    fill(220, 8, 97, 55 * introA);
    text('Dibuja.', width / 2, height / 2 + 34);
  }

  if (started && frameCount % 6 === 0) updateHud();
}