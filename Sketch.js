// Why Bother? — dibujas y el trazo conserva tu manera de hacerlo.
// Lento = más cuidado = línea gruesa y cálida. Rápido = línea fina y fría.
// El temblor de tu mano queda guardado, y el trazo respira con ruido Perlin.
// Con el tiempo se calma, pero nunca desaparece. Los errores sueltan chispas.
// Z deshace · C borra · S guarda

const SERIF = '"Iowan Old Style", "Palatino Linotype", Georgia, serif';
let strokes = [], embers = [];
let cur = null, lastPt = null;
let smoothW = 6, smoothH = 40;
let bg, introA = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  makeBg();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  makeBg();
}

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

function startStroke() {
  cur = { pts: [], born: frameCount };
  strokes.push(cur);
  lastPt = null;
}

function addPoint(x, y) {
  // el temblor de la mano queda guardado
  x += (noise(frameCount * 0.3, 1) - 0.5) * 3;
  y += (noise(frameCount * 0.3, 9) - 0.5) * 3;
  const speed = lastPt ? dist(x, y, lastPt.x, lastPt.y) : 0;
  smoothW = lerp(smoothW, constrain(map(speed, 0, 40, 10, 1.5), 1.5, 10), 0.25);
  smoothH = lerp(smoothH, constrain(map(speed, 0, 40, 38, 210), 38, 210), 0.2);
  const p = { x, y, ox: x, oy: y, w: smoothW, h: smoothH, s: random(1000) };
  cur.pts.push(p);
  // los trazos rápidos sueltan chispas: los errores también dejan algo
  if (speed > 7 && embers.length < 700) {
    for (let i = 0; i < 2; i++) {
      embers.push({ x, y, vx: random(-0.6, 0.6), vy: random(-1.2, -0.2), life: 1, h: smoothH, r: random(1, 2.6) });
    }
  }
  lastPt = p;
}

function mousePressed() {
  startStroke();
  addPoint(mouseX, mouseY);
  return false;
}
function mouseDragged() {
  if (!cur) return false;
  if (!lastPt || dist(mouseX, mouseY, lastPt.x, lastPt.y) > 3) addPoint(mouseX, mouseY);
  return false;
}
function mouseReleased() { cur = null; return false; }

function keyPressed() {
  if (key === 'z' || key === 'Z') strokes.pop();
  if (key === 'c' || key === 'C') { strokes = []; embers = []; }
  if (key === 's' || key === 'S') saveCanvas('why-bother', 'png');
}

function draw() {
  drawingContext.drawImage(bg.elt, 0, 0, width, height);

  // --- trazos ---
  for (const st of strokes) {
    const age = frameCount - st.born;
    const calm = min(1, age / 1800);
    const amp = lerp(7, 1.5, calm);                 // con el tiempo se calma
    const alpha = max(55, 100 - age * 0.008);
    const n = st.pts.length;

    for (let i = 0; i < n; i++) {
      const p = st.pts[i];
      p.x = p.ox + (noise(p.s, frameCount * 0.01) - 0.5) * amp;
      p.y = p.oy + (noise(p.s + 500, frameCount * 0.01) - 0.5) * amp;
    }
    if (n === 1) {                                  // un solo toque = un punto
      const p = st.pts[0];
      noStroke();
      fill(p.h, 50, 100, 20);  circle(p.x, p.y, p.w * 4);
      fill(p.h, 45, 100, alpha); circle(p.x, p.y, p.w * 1.2);
      continue;
    }
    // pasada 1: resplandor ancho y suave
    for (let i = 1; i < n; i++) {
      const p = st.pts[i], q = st.pts[i - 1];
      stroke(p.h, 55, 100, alpha * 0.14);
      strokeWeight((p.w + q.w) * 1.6);
      line(q.x, q.y, p.x, p.y);
    }
    // pasada 2: el trazo
    for (let i = 1; i < n; i++) {
      const p = st.pts[i], q = st.pts[i - 1];
      stroke(p.h, lerp(60, 30, (p.w - 1.5) / 8.5), 100, alpha);
      strokeWeight((p.w + q.w) / 2);
      line(q.x, q.y, p.x, p.y);
    }
  }

  // --- chispas ---
  noStroke();
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i];
    e.x += e.vx + (noise(e.x * 0.01, e.y * 0.01, frameCount * 0.01) - 0.5) * 0.8;
    e.y += e.vy;
    e.life -= 0.012;
    if (e.life <= 0) { embers.splice(i, 1); continue; }
    fill(e.h, 40, 100, e.life * 18);  circle(e.x, e.y, e.r * 5);
    fill(e.h, 30, 100, e.life * 90);  circle(e.x, e.y, e.r * 1.6);
  }

  // --- pregunta de inicio: se va al empezar a dibujar ---
  if (strokes.length > 0) introA = max(0, introA - 0.04);
  else introA = min(1, introA + 0.02);
  if (introA > 0.01) {
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

  // --- pista tenue ---
  noStroke();
  textFont(SERIF);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  fill(220, 8, 97, 18);
  text('Z deshace · C borra · S guarda', width / 2, height - 16);
}
