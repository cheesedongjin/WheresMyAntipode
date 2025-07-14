// Initialize the globe
const world = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
  .pointOfView({ lat: 0, lng: 0, altitude: 2 });

const info = document.getElementById('info');

// Handle click events
world.onGlobeClick(({ lat, lng }) => {
  const antiLat = -lat;
  const antiLng = ((lng + 180) % 360) - 180;

  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${antiLat}&lon=${antiLng}&format=json`)
    .then(res => res.json())
    .then(data => {
      const location =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.country ||
        'the ocean';

      world
        .pointsData([{ lat: antiLat, lng: antiLng, size: 0.5, color: 'red' }])
        .pointLabel(() => `${location}\n(${antiLat.toFixed(2)}, ${antiLng.toFixed(2)})`);

      info.textContent = `${location} (${antiLat.toFixed(2)}, ${antiLng.toFixed(2)})`;
    })
    .catch(() => {
      info.textContent = `Coordinates: ${antiLat.toFixed(2)}, ${antiLng.toFixed(2)}`;
    });
});
