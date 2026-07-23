const map = L.map("map", {
  center: [52.2297, 21.0122],
  zoom: 6,
  zoomControl: true
});

const layers = {
  standard: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }),

  topographic: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: '&copy; OpenTopoMap contributors'
  }),

  satellite: L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri"
    }
  )
};

let activeLayer = layers.standard;
activeLayer.addTo(map);

const optionButtons = document.querySelectorAll(".map-option");

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedLayer = button.dataset.layer;

    if (!layers[selectedLayer]) {
      return;
    }

    map.removeLayer(activeLayer);

    activeLayer = layers[selectedLayer];
    activeLayer.addTo(map);

    optionButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  });
});

const categoryLabels = {
  viewpoint: "Punkt widokowy",
  monument: "Zabytek",
  parking: "Parking"
};

const categoryIcons = {
  viewpoint: "👁️",
  monument: "🏛️",
  parking: "🅿️"
};

const examplePlaces = [
  {
    id: "viewpoint-1",
    title: "Punkt widokowy nad Wisłą",
    category: "viewpoint",
    description: "Przykładowe miejsce z widokiem na rzekę i panoramę miasta.",
    lat: 52.2476,
    lng: 21.0122,
    image: ""
  },
  {
    id: "viewpoint-2",
    title: "Wzgórze obserwacyjne",
    category: "viewpoint",
    description: "Dobre miejsce na zdjęcia krajobrazowe i zachód słońca.",
    lat: 50.0619,
    lng: 19.9368,
    image: ""
  },
  {
    id: "monument-1",
    title: "Stary zamek",
    category: "monument",
    description: "Przykładowy zabytek historyczny oznaczony na mapie.",
    lat: 54.352,
    lng: 18.6466,
    image: ""
  },
  {
    id: "monument-2",
    title: "Rynek starego miasta",
    category: "monument",
    description: "Historyczne centrum miasta z zabytkową architekturą.",
    lat: 51.1079,
    lng: 17.0385,
    image: ""
  },
  {
    id: "parking-1",
    title: "Parking centrum",
    category: "parking",
    description: "Przykładowy parking blisko centrum.",
    lat: 52.4064,
    lng: 16.9252,
    image: ""
  },
  {
    id: "parking-2",
    title: "Parking przy trasie",
    category: "parking",
    description: "Parking przy głównej drodze dojazdowej.",
    lat: 50.2649,
    lng: 19.0238,
    image: ""
  }
];

const categoryButtons = document.querySelectorAll(".category-button");
const visibleCategories = new Set();
const categoryMarkers = {};
const savedMarkers = [];

let draggableMarker = null;
let selectedPosition = null;

const enableMarkerBtn = document.getElementById("enable-marker-btn");
const openFormBtn = document.getElementById("open-form-btn");
const placeForm = document.getElementById("place-form");

const titleInput = document.getElementById("place-title");
const categoryInput = document.getElementById("place-category");
const imageInput = document.getElementById("place-image");
const descriptionInput = document.getElementById("place-description");

function createPopupContent(place) {
  const categoryName = categoryLabels[place.category] || "Miejsce";
  const icon = categoryIcons[place.category] || "📍";

  const imageHtml = place.image
    ? `<img src="${place.image}" alt="${place.title}">`
    : "";

  return `
    <div class="popup-content">
      <span class="popup-category">${icon} ${categoryName}</span>
      <h3>${place.title}</h3>
      ${imageHtml}
      <p>${place.description}</p>
    </div>
  `;
}

function createPlaceMarker(place) {
  const marker = L.marker([place.lat, place.lng]);

  marker.bindPopup(createPopupContent(place));

  return marker;
}

function showCategory(category) {
  const places = examplePlaces.filter((place) => place.category === category);

  categoryMarkers[category] = places.map((place) => {
    const marker = createPlaceMarker(place);
    marker.addTo(map);
    return marker;
  });
}

function hideCategory(category) {
  if (!categoryMarkers[category]) {
    return;
  }

  categoryMarkers[category].forEach((marker) => {
    map.removeLayer(marker);
  });

  categoryMarkers[category] = [];
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    if (visibleCategories.has(category)) {
      visibleCategories.delete(category);
      button.classList.remove("active");
      hideCategory(category);
      return;
    }

    visibleCategories.add(category);
    button.classList.add("active");
    showCategory(category);
  });
});

function enableDraggableMarker() {
  const center = map.getCenter();

  if (!draggableMarker) {
    draggableMarker = L.marker(center, {
      draggable: true
    }).addTo(map);

    draggableMarker.bindPopup("Przesuń mnie na wybrane miejsce").openPopup();

    draggableMarker.on("dragend", () => {
      selectedPosition = draggableMarker.getLatLng();
    });
  } else {
    draggableMarker.setLatLng(center);
    draggableMarker.addTo(map);
  }

  selectedPosition = draggableMarker.getLatLng();
  openFormBtn.disabled = false;
}

enableMarkerBtn.addEventListener("click", () => {
  enableDraggableMarker();
});

openFormBtn.addEventListener("click", () => {
  if (!selectedPosition) {
    return;
  }

  placeForm.classList.toggle("hidden");
});

function getSavedPlaces() {
  const savedPlaces = localStorage.getItem("savedMapPlaces");

  if (!savedPlaces) {
    return [];
  }

  try {
    return JSON.parse(savedPlaces);
  } catch (error) {
    console.error("Nie udało się odczytać zapisanych miejsc:", error);
    return [];
  }
}

function savePlaces(places) {
  localStorage.setItem("savedMapPlaces", JSON.stringify(places));
}

function addSavedPlaceToMap(place) {
  const marker = createPlaceMarker(place);

  marker.addTo(map);
  savedMarkers.push(marker);
}

function loadSavedPlaces() {
  const places = getSavedPlaces();

  places.forEach((place) => {
    addSavedPlaceToMap(place);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Nie udało się wczytać zdjęcia."));
    };

    reader.readAsDataURL(file);
  });
}

placeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedPosition) {
    alert("Najpierw ustaw znacznik na mapie.");
    return;
  }

  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const description = descriptionInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!title || !description) {
    alert("Uzupełnij tytuł i opis.");
    return;
  }

  let image = "";

  try {
    image = await fileToBase64(imageFile);
  } catch (error) {
    alert("Nie udało się dodać zdjęcia.");
    return;
  }

  const newPlace = {
    id: crypto.randomUUID(),
    title,
    category,
    description,
    image,
    lat: selectedPosition.lat,
    lng: selectedPosition.lng,
    createdAt: new Date().toISOString()
  };

  const savedPlaces = getSavedPlaces();
  savedPlaces.push(newPlace);
  savePlaces(savedPlaces);

  addSavedPlaceToMap(newPlace);

  if (draggableMarker) {
    map.removeLayer(draggableMarker);
  }

  draggableMarker = null;
  selectedPosition = null;
  openFormBtn.disabled = true;

  placeForm.reset();
  placeForm.classList.add("hidden");

  alert("Lokalizacja została zapisana na mapie.");
});

loadSavedPlaces();