export const mapBox = (locations) => {
  const token =
    "pk.eyJ1IjoibXVuZWViZGV2IiwiYSI6ImNrOHdwd3F0czBnaDYzc213bTc0NXJtaGQifQ.DzSxqQyrssEKYGLGXXRa4w";
  mapboxgl.accessToken = token;
  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/muneebdev/ck8wq8fws3jb91jsy419oyukb",
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc, index) => {
    const el = document.createElement("div");
    el.className = "marker";
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100,
    },
  });
};
