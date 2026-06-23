(async function() {
  const stationMinZoom = 8;
  const config = window.siteConfig || {};

  const map = L.map("map", {
    preferCanvas: true,
    zoomControl: true
  }).setView([13.4, 77.8], 6);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18
  }).addTo(map);

  const posts = await loadJson(config.postsIndexUrl, []);
  const postIndex = buildPostIndex(posts);
  let stationLayer = null;
  let stationsLoaded = false;

  const lines = await loadJson(config.railwayLinesUrl, null);
  if (lines) {
    L.geoJSON(lines, {
      style(feature) {
        const linkedPosts = postsForFeature(feature, postIndex.lines, "line");
        return {
          color: linkedPosts.length ? "#d86f45" : "#2c7f8f",
          weight: linkedPosts.length ? 3.2 : 1.6,
          opacity: linkedPosts.length ? 0.9 : 0.55
        };
      },
      onEachFeature(feature, layer) {
        layer.bindPopup(() => popupForFeature(feature, postsForFeature(feature, postIndex.lines, "line"), "Railway line"));
      }
    }).addTo(map);
  }

  map.on("zoomend", syncStations);
  syncStations();

  async function syncStations() {
    if (map.getZoom() < stationMinZoom) {
      if (stationLayer) {
        map.removeLayer(stationLayer);
      }
      return;
    }

    if (!stationsLoaded) {
      stationsLoaded = true;
      const stations = await loadJson(config.railwayStationsUrl, null);
      stationLayer = L.geoJSON(stations, {
        pointToLayer(feature, latlng) {
          const linkedPosts = postsForFeature(feature, postIndex.stations, "station");
          return L.circleMarker(latlng, {
            radius: linkedPosts.length ? 5 : 3.2,
            color: linkedPosts.length ? "#6e4b12" : "#47616a",
            weight: linkedPosts.length ? 1.5 : 0.8,
            fillColor: linkedPosts.length ? "#f2b84b" : "#f7f1d5",
            fillOpacity: linkedPosts.length ? 0.9 : 0.58
          });
        },
        onEachFeature(feature, layer) {
          layer.bindPopup(() => popupForFeature(feature, postsForFeature(feature, postIndex.stations, "station"), "Station"));
        }
      });
    }

    if (stationLayer && !map.hasLayer(stationLayer)) {
      stationLayer.addTo(map);
    }
  }

  async function loadJson(url, fallback) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      console.error("Could not load", url, error);
      return fallback;
    }
  }

  function buildPostIndex(items) {
    const lines = new Map();
    const stations = new Map();

    for (const post of items) {
      for (const key of asArray(post.railway_lines)) addToMap(lines, key, post);
      for (const key of asArray(post.railway_stations)) addToMap(stations, key, post);

      for (const tag of asArray(post.tags)) {
        if (typeof tag !== "string") continue;
        if (tag.startsWith("line:")) addToMap(lines, tag.slice(5), post);
        if (tag.startsWith("station:")) addToMap(stations, tag.slice(8), post);
      }
    }

    return { lines, stations };
  }

  function postsForFeature(feature, index, type) {
    const properties = feature.properties || {};
    const keys = [
      properties["@id"],
      properties.name,
      properties.ref,
      type === "station" && properties.name ? slug(properties.name) : null
    ].filter(Boolean);

    const matches = new Map();
    for (const key of keys) {
      for (const post of index.get(String(key)) || []) {
        matches.set(post.url, post);
      }
    }
    return Array.from(matches.values());
  }

  function addToMap(mapObject, key, post) {
    if (!key) return;
    const normalized = String(key);
    if (!mapObject.has(normalized)) mapObject.set(normalized, []);
    mapObject.get(normalized).push(post);
  }

  function popupForFeature(feature, linkedPosts, fallbackTitle) {
    const properties = feature.properties || {};
    const title = properties.name || properties.ref || properties["@id"] || fallbackTitle;
    const meta = linkedPosts.length === 1 ? "1 post" : `${linkedPosts.length} posts`;
    const postsHtml = linkedPosts.length
      ? `<ol class="popup-posts">${linkedPosts.map(post => `<li><a href="${escapeAttribute(post.url)}">${escapeHtml(post.title)}</a></li>`).join("")}</ol>`
      : "";

    return `
      <h2 class="popup-title">${escapeHtml(title)}</h2>
      <p class="popup-meta">${meta}</p>
      ${postsHtml}
    `;
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function slug(value) {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
