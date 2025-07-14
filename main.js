// Initialize the globe
const world = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
  .pointOfView({ lat: 0, lng: 0, altitude: 2 });

// Group to hold marker objects
const markerGroup = new THREE.Group();
world.scene().add(markerGroup);
const markers = [];

function createMarker(color) {
  const mat = new THREE.MeshBasicMaterial({ color });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), mat);
  cone.position.y = -0.25;
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), mat);
  const group = new THREE.Group();
  group.add(cone);
  group.add(sphere);
  return group;
}

function setMarkerPosition(marker, lat, lng, altitude) {
  const radius = world.getGlobeRadius ? world.getGlobeRadius() : 100;
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  const r = radius * altitude;
  marker.position.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
  marker.lookAt(0, 0, 0);
}

function clearMarkers() {
  while (markerGroup.children.length) markerGroup.remove(markerGroup.children[0]);
  markers.length = 0;
}

function animateMarkers() {
  markers.forEach(m => {
    m.userData.t += 0.02;
    const alt = 1.02 + 0.02 * Math.sin(m.userData.t);
    setMarkerPosition(m, m.userData.lat, m.userData.lng, alt);
    m.rotateZ(0.05);
  });
  requestAnimationFrame(animateMarkers);
}
animateMarkers();

const info = document.getElementById('info');
const form = document.getElementById('coord-form');
const latInput = document.getElementById('lat-input');
const lngInput = document.getElementById('lng-input');

function reverseGeocode(lat, lng) {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  )
    .then(res => res.json())
    .then(data => {
      const addr = data.address || {};
      return (
        addr.city ||
        addr.town ||
        addr.village ||
        addr.country ||
        'the ocean'
      );
    })
    .catch(() => 'Unknown location');
}

function showAntipode(lat, lng) {
  const antiLat = -lat;
  const antiLng = ((lng + 180) % 360) - 180;

  Promise.all([reverseGeocode(lat, lng), reverseGeocode(antiLat, antiLng)])
    .then(([clickedLoc, antipodeLoc]) => {
      clearMarkers();

      const clickedMarker = createMarker(0xffff00);
      clickedMarker.userData = { lat, lng, t: 0 };
      markerGroup.add(clickedMarker);
      markers.push(clickedMarker);

      const antipodeMarker = createMarker(0xff0000);
      antipodeMarker.userData = { lat: antiLat, lng: antiLng, t: Math.PI };
      markerGroup.add(antipodeMarker);
      markers.push(antipodeMarker);

      setMarkerPosition(clickedMarker, lat, lng, 1.02);
      setMarkerPosition(antipodeMarker, antiLat, antiLng, 1.02);

      info.innerHTML =
        `Clicked: ${clickedLoc} (${lat.toFixed(2)}, ${lng.toFixed(2)})<br>` +
        `Antipode: ${antipodeLoc} (${antiLat.toFixed(2)}, ${antiLng.toFixed(2)})`;
    })
    .catch(() => {
      info.textContent =
        `Coordinates: (${lat.toFixed(2)}, ${lng.toFixed(2)}) → (${antiLat.toFixed(2)}, ${antiLng.toFixed(2)})`;
    });
}

// Handle click events
world.onGlobeClick(({ lat, lng }) => {
  showAntipode(lat, lng);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const lat = parseFloat(latInput.value);
  const lng = parseFloat(lngInput.value);
  if (isNaN(lat) || isNaN(lng)) return;
  world.pointOfView({ lat, lng, altitude: 2 });
  showAntipode(lat, lng);
});
