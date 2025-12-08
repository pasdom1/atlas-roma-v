// Imposta la mappa come immagine
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -4
});

const imgWidth = 3000; // aggiorneremo con dimensione reale
const imgHeight = 2000;

const bounds = [[0,0], [imgHeight,imgWidth]];
const image = L.imageOverlay('assets/mappa.png', bounds).addTo(map);
map.fitBounds(bounds);

// Marker rossi
const markerIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

// Dati punti
const points = [
  { title: "Punto A", text: "Testo informativo per Punto A", coords: [1000, 1500] },
  { title: "Punto B", text: "Testo informativo per Punto B", coords: [1200, 2000] },
  { title: "Punto C", text: "Testo informativo per Punto C", coords: [1800, 1100] }
];

// Aggiunta marker
points.forEach(p => {
  const m = L.marker(p.coords, { icon: markerIcon }).addTo(map);
  m.on("click", () => openPanel(p.title, p.text));
});

// Pannello laterale
const panel = document.getElementById("side-panel");
document.getElementById("close-btn").onclick = () => panel.classList.remove('show');

function openPanel(title, text) {
  document.getElementById("panel-title").innerText = title;
  document.getElementById("panel-text").innerText = text;
  panel.classList.add("show");
}
