// Panel "Instrumento": sliders para ajustar la obra en vivo (mismo patrón que el panel de la unidad 3).
function rangeRow(parent, label, param, min, max, step) {
  const wrap = document.createElement('div');
  wrap.className = 'row';
  const lab = document.createElement('label');
  const name = document.createElement('span');
  const value = document.createElement('span');
  value.className = 'value';
  name.textContent = label;
  lab.append(name, value);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);

  const refresh = () => {
    input.value = String(param.value);
    value.textContent = Number(param.value).toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0);
  };
  input.addEventListener('input', () => { param.value = Number(input.value); refresh(); });

  refresh();
  wrap.append(lab, input);
  parent.append(wrap);
  return { refresh };
}

function panelButton(parent, label, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', onClick);
  parent.append(b);
  return b;
}

function createLabPanel({ params, onDefaults, onClear }) {
  const refreshers = [];
  const panel = document.createElement('aside');
  panel.className = 'panel hidden';
  panel.innerHTML = '<h1>Instrumento</h1><p>Ajusta cómo se comporta tu trazo. <strong>P</strong> abre y cierra este panel.</p>';

  const hand = document.createElement('div');
  hand.className = 'group';
  hand.innerHTML = '<h2>Mano</h2>';
  panel.append(hand);
  refreshers.push(rangeRow(hand, 'temblor', params.jitter, 0, 8, 0.1));
  refreshers.push(rangeRow(hand, 'grosor máx.', params.maxW, 3, 18, 0.5));

  const life = document.createElement('div');
  life.className = 'group';
  life.innerHTML = '<h2>Vida del trazo</h2>';
  panel.append(life);
  refreshers.push(rangeRow(life, 'respiración', params.breath, 0, 24, 0.5));
  refreshers.push(rangeRow(life, 'calma (frames)', params.calm, 300, 6000, 100));
  refreshers.push(rangeRow(life, 'resplandor', params.glow, 0, 0.4, 0.01));
  refreshers.push(rangeRow(life, 'chispas', params.embers, 0, 6, 1));

  const actions = document.createElement('div');
  actions.className = 'group';
  actions.innerHTML = '<h2>Acciones</h2>';
  panel.append(actions);
  panelButton(actions, 'Valores originales', () => { onDefaults(); refreshers.forEach(r => r.refresh()); });
  panelButton(actions, 'Limpiar lienzo', onClear);

  document.body.append(panel);
  return {
    element: panel,
    toggle() { panel.classList.toggle('hidden'); },
    refresh() { refreshers.forEach(r => r.refresh()); }
  };
}
