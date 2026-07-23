const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-navigation");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const typeFilter = document.querySelector("#type-filter");
const assetCards = [...document.querySelectorAll(".asset-card")];
const quickSearchButtons = document.querySelectorAll("[data-search]");
const resultsCount = document.querySelector("#results-count");
const noResults = document.querySelector("#no-results");

function normalizeText(value) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Otwórz menu");
}

menuButton.addEventListener("click", () => {
  const willOpen = !navigation.classList.contains("is-open");

  navigation.classList.toggle("is-open", willOpen);
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "Zamknij menu" : "Otwórz menu");
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 850) {
    closeMenu();
  }
});

function filterAssets() {
  const query = normalizeText(searchInput.value);
  const selectedType = typeFilter.value;
  let visibleAssets = 0;

  assetCards.forEach((card) => {
    const searchableText = normalizeText(
      `${card.dataset.title} ${card.dataset.tags}`
    );
    const matchesQuery = !query || searchableText.includes(query);
    const matchesType = selectedType === "all" || card.dataset.type === selectedType;
    const shouldShow = matchesQuery && matchesType;

    card.hidden = !shouldShow;
    if (shouldShow) visibleAssets += 1;
  });

  const noun = visibleAssets === 1 ? "materiał" : "materiałów";
  resultsCount.textContent = `Wyświetlono ${visibleAssets} ${noun}`;
  noResults.hidden = visibleAssets !== 0;

  document.querySelector("#zasoby").scrollIntoView({ behavior: "smooth" });
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  filterAssets();
});

typeFilter.addEventListener("change", filterAssets);

quickSearchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.search;
    typeFilter.value = "all";
    filterAssets();
  });
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
