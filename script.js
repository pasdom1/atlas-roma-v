const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const viewer = document.getElementById('viewer');
const img = document.getElementById('mapImage');

const state = {
  scale: 1,
  minScale: 1,
  maxScale: 4,
  translate: { x: 0, y: 0 },
  isPanning: false,
  start: { x: 0, y: 0 }
};

function applyTransform() {
  img.style.transform = `translate(${state.translate.x}px, ${state.translate.y}px) scale(${state.scale})`;
}

function fitImage() {
  const { clientWidth, clientHeight } = viewer;
  const { naturalWidth, naturalHeight } = img;
  if (!naturalWidth || !naturalHeight) return;

  const scaleToCover = Math.max(
    clientWidth / naturalWidth,
    clientHeight / naturalHeight
  );

  state.scale = scaleToCover;
  state.minScale = scaleToCover;
  state.translate.x = (clientWidth - naturalWidth * scaleToCover) / 2;
  state.translate.y = (clientHeight - naturalHeight * scaleToCover) / 2;
  applyTransform();
}

function constrainPosition() {
  const { clientWidth, clientHeight } = viewer;
  const scaledWidth = img.naturalWidth * state.scale;
  const scaledHeight = img.naturalHeight * state.scale;

  const minX = Math.min(0, clientWidth - scaledWidth);
  const minY = Math.min(0, clientHeight - scaledHeight);
  const maxX = Math.max(0, clientWidth - scaledWidth);
  const maxY = Math.max(0, clientHeight - scaledHeight);

  state.translate.x = clamp(state.translate.x, minX, maxX);
  state.translate.y = clamp(state.translate.y, minY, maxY);
}

function zoomAt(point, factor) {
  const newScale = clamp(state.scale * factor, state.minScale, state.maxScale);
  const scaleRatio = newScale / state.scale;

  const offsetX = (point.x - state.translate.x) * (scaleRatio - 1);
  const offsetY = (point.y - state.translate.y) * (scaleRatio - 1);

  state.scale = newScale;
  state.translate.x -= offsetX;
  state.translate.y -= offsetY;
  constrainPosition();
  applyTransform();
}

viewer.addEventListener('wheel', (event) => {
  event.preventDefault();
  const rect = viewer.getBoundingClientRect();
  const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  const factor = event.deltaY > 0 ? 0.95 : 1.05;
  zoomAt(point, factor);
}, { passive: false });

viewer.addEventListener('pointerdown', (event) => {
  state.isPanning = true;
  state.start.x = event.clientX - state.translate.x;
  state.start.y = event.clientY - state.translate.y;
  viewer.setPointerCapture(event.pointerId);
});

viewer.addEventListener('pointermove', (event) => {
  if (!state.isPanning) return;
  state.translate.x = event.clientX - state.start.x;
  state.translate.y = event.clientY - state.start.y;
  constrainPosition();
  applyTransform();
});

['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
  viewer.addEventListener(type, (event) => {
    if (!state.isPanning) return;
    state.isPanning = false;
    viewer.releasePointerCapture(event.pointerId);
  });
});

viewer.addEventListener('dblclick', (event) => {
  event.preventDefault();
  const rect = viewer.getBoundingClientRect();
  zoomAt({ x: event.clientX - rect.left, y: event.clientY - rect.top }, 1.25);
});

document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space') return;
  fitImage();
});

window.addEventListener('resize', fitImage);

img.addEventListener('load', fitImage);

if (img.complete) {
  fitImage();
}
