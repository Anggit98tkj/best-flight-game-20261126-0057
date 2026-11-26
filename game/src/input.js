// Input: keyboard state plus mouse clicks and the throttle slider drag.
export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    clicked: null,
    throttleDrag: null,
    pitch: 0,
    turn: 0,
    throttleUp: false,
    throttleDown: false,
    brake: false,
  };

  function keyName(e) {
    return e.key.length === 1 ? e.key.toLowerCase() : e.key;
  }

  window.addEventListener('keydown', (e) => {
    const k = keyName(e);
    keys.add(k);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (k === ' ') state.brake = true;
  });
  window.addEventListener('keyup', (e) => {
    const k = keyName(e);
    keys.delete(k);
    if (k === ' ') state.brake = false;
  });
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    state.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
    state.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
  });
  canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    state.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
    state.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
    state.mouseDown = true;
    state.clicked = { x: state.mouseX, y: state.mouseY };
  });
  window.addEventListener('mouseup', () => { state.mouseDown = false; state.throttleDrag = null; });

  state.poll = function poll() {
    state.turn = 0;
    if (keys.has('ArrowLeft') || keys.has('a')) state.turn -= 1;
    if (keys.has('ArrowRight') || keys.has('d')) state.turn += 1;
    state.pitch = 0;
    if (keys.has('ArrowUp')) state.pitch += 1;
    if (keys.has('ArrowDown')) state.pitch -= 1;
    state.throttleUp = keys.has('w');
    state.throttleDown = keys.has('s');
    state.brake = keys.has(' ');
    const click = state.clicked;
    state.clicked = null;
    return click;
  };

  state.pressed = function pressed(k) {
    if (!keys.has(k)) return false;
    keys.delete(k);
    return true;
  };

  return state;
}

export function pointInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}
