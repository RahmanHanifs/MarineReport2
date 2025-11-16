(function () {
  const CATEGORY_LIST = [
    "Tide",
    "Sediment",
    "Ocean Waves",
    "Marine Pollution",
    "Fishery",
    "Ecology And Biota",
    "Chemistry",
    "Climatology And Meteorology Atmosphere",
    "Disaster Mitigation",
    "Ocean Current",
  ];

  const map = L.map("map");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const allLayerGroup = L.layerGroup().addTo(map);
  let featureLayers = [];

  let activeCategories = []; 
  let activeTitleQuery = ""; 

  function colorByCat(cat) {
    const palette = {
      Tide: "#2E86C1",
      Sediment: "#A04000",
      "Ocean Waves": "#1ABC9C",
      "Marine Pollution": "#8E44AD",
      Fishery: "#16A085",
      "Ecology And Biota": "#27AE60",
      Chemistry: "#E67E22",
      "Climatology And Meteorology Atmosphere": "#7D3C98",
      "Disaster Mitigation": "#C0392B",
      "Ocean Current": "#0E6251",
    };
    return palette[cat] || "#2c3e50";
  }

  function buildPopup(p) {
    const cats = (p.categories || []).join(", ");
    return `
      <b>Data description:</b> ${p.description}<br>
      <b>Research Title:</b> ${p.title}<br>
      <b>DOI:</b> <a href="${p.DOI}" target="_blank" rel="noopener">${
      p.DOI
    }</a><br>
      <b>Date taken:</b> ${p["research date"] || ""}<br>
      <b>Data owner:</b> ${p.owner}<br>
      <b>Data availability:</b> ${p["data availability"] || ""}<br>
      <b>Owner email:</b> <a href="mailto:${p.email}">${p.email}</a><br>
      <b>Categories:</b> ${cats}
    `;
  }

  function refreshLayers() {
    allLayerGroup.clearLayers();

    let visibleBounds = null;

    featureLayers.forEach(({ layer, feature }) => {
      const cats = feature.properties.categories || [];
      const title = (feature.properties.title || "").toLowerCase();

      let catOk = true;
      if (activeCategories.length > 0) {
        catOk = activeCategories.every((sel) => cats.includes(sel));
      }

      let titleOk = true;
      if (activeTitleQuery) {
        titleOk = title.includes(activeTitleQuery);
      }

      const visible = catOk && titleOk;

      if (visible) {
        allLayerGroup.addLayer(layer);

        const latlng = layer.getLatLng();
        if (latlng) {
          if (!visibleBounds) {
            visibleBounds = L.latLngBounds(latlng, latlng);
          } else {
            visibleBounds.extend(latlng);
          }
        }
      }
    });

    if (visibleBounds) {
      map.fitBounds(visibleBounds, { padding: [20, 20] });
    }

    updateCountInfo();
  }

  function updateCountInfo() {
    let count = 0;
    allLayerGroup.eachLayer(() => {
      count++;
    });
    const el = document.getElementById("countInfo");
    if (el) el.textContent = `Menampilkan ${count} titik.`;
  }

  function addFeaturesToMap(geojson) {
    allLayerGroup.clearLayers();
    featureLayers = [];

    L.geoJSON(geojson, {
      pointToLayer: function (feature, latlng) {
        const firstCat = (feature.properties.categories || [])[0];
        return L.circleMarker(latlng, {
          radius: 7,
          color: colorByCat(firstCat),
          weight: 2,
          fillColor: "#fff",
          fillOpacity: 1,
        });
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(buildPopup(feature.properties));
        featureLayers.push({ layer, feature });
      },
    });

    activeCategories = [];
    activeTitleQuery = "";
    refreshLayers();
  }

  fetch("data/points.geojson")
    .then((r) => r.json())
    .then((json) => addFeaturesToMap(json))
    .catch((err) => console.error("Gagal load GeoJSON:", err));

  function applyCategoryFilter(selected) {
    activeCategories = selected || [];
    refreshLayers();
  }

  window.addEventListener("categoryFilterChanged", (e) => {
    const selected = (e.detail && e.detail.selected) || [];
    applyCategoryFilter(selected);
  });

  const searchInput = document.getElementById("categorySearch");

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = searchInput.value.trim().toLowerCase();

        activeTitleQuery = q;
        refreshLayers();
      }
    });
  }
})();
