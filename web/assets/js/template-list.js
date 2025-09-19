// ----filter tourList card------
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".tourL-tour-card");
  const airlineFilterContainer = document.querySelector(".airline-filter");
  const daysFilterContainer = document.querySelector(".days-filter");

  const minInput = document.getElementById("minRange");
  const maxInput = document.getElementById("maxRange");
  const rangeTrack = document.getElementById("rangeTrack");
  const minValText = document.getElementById("minValue");
  const maxValText = document.getElementById("maxValue");

  const removeFiltersBtn = document.getElementById("clearFiltersBtn");

  const filterPanel = document.querySelector(".filters-panel");

  const normalizeText = (text) => String(text).replace(/\s/g, "").toLowerCase();

  const uniqueAirlines = new Set();
  const uniqueDays = new Set();

  cards.forEach((card) => {
    const airlineName = card.dataset.airlineName?.trim();
    const days = card.dataset.days?.trim();
    if (airlineName) uniqueAirlines.add(airlineName);
    if (days) uniqueDays.add(days);
  });

  if (airlineFilterContainer) {
    uniqueAirlines.forEach((rawName) => {
      const norm = normalizeText(rawName);
      const display = rawName;

      const item = document.createElement("label");
      item.className =
        "flex group items-center gap-3 text-sm cursor-pointer select-none transition-all duration-300";
      item.innerHTML = `
        <input type="checkbox" value="${norm}" class="hidden airline-input peer" />
        <span class="flex items-center justify-center w-6 h-6 border-2 border-zinc-400 rounded-lg transition-colors
                     peer-checked:bg-primary-600 peer-checked:border-primary-600">
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.48 9.33L5.38 10.75C5.81 11.08 6.41 11.00 6.75 10.59L12.15 4"
                  stroke="white" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </span>
  
        <span class="transition-all duration-300 group-hover:text-primary-600">
          ${display}
        </span>
      `;
      airlineFilterContainer.appendChild(item);
    });
  }

  if (daysFilterContainer) {
    uniqueDays.forEach((days) => {
      const norm = normalizeText(days);

      const item = document.createElement("label");
      item.className =
        "days-item group flex items-center gap-3 text-sm cursor-pointer select-none transition-all duration-300";
      item.innerHTML = `
          <input type="checkbox" value="${norm}" class="hidden days-input peer" />
    
          <span class="flex items-center justify-center w-6 h-6 border-2 border-zinc-400 rounded-lg transition-colors
                       peer-checked:bg-primary-600 peer-checked:border-primary-600">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.48 9.33L5.38 10.75C5.81 11.08 6.41 11.00 6.75 10.59L12.15 4"
                    stroke="white" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </span>
    
          <span class="transition-all duration-300 group-hover:text-primary-600">
            ${days}
          </span>
        `;
      daysFilterContainer.appendChild(item);
    });
  }

  const toEnglishDigits = (str) => {
    if (!str) return "";
    const fa = "۰۱۲۳۴۵۶۷۸۹",
      ar = "٠١٢٣٤٥٦٧٨٩";
    return String(str).replace(/[۰-۹٠-٩]/g, (d) => {
      const i1 = fa.indexOf(d);
      if (i1 > -1) return String(i1);
      const i2 = ar.indexOf(d);
      if (i2 > -1) return String(i2);
      return d;
    });
  };
  const digitsOnly = (s) => toEnglishDigits(s).replace(/\D+/g, "");

  const RIAL_TO_TOMAN = 0.1;

  const parsePrice = (priceStr, priceTomanAttr) => {
    if (
      priceTomanAttr != null &&
      priceTomanAttr !== "" &&
      !Number.isNaN(Number(priceTomanAttr))
    ) {
      return Math.floor(Number(priceTomanAttr));
    }
    if (!priceStr) return 0;

    const text = String(priceStr).toLowerCase();

    const re =
      /(?:([\d\s.,\/\\\u066B\u066C\u200c\u060C\u00A0]+)\s*(تومان|تومن|tmn|ریال|rial)|(تومان|تومن|tmn|ریال|rial)\s*([\d\s.,\/\\\u066B\u066C\u200c\u060C\u00A0]+))/gi;

    let m,
      total = 0,
      found = false;
    while ((m = re.exec(text)) !== null) {
      const numStr = m[1] || m[4];
      const curStr = (m[2] || m[3] || "").trim();

      const n = parseInt(digitsOnly(numStr), 10);
      if (!n || Number.isNaN(n)) continue;

      if (curStr === "ریال" || curStr === "rial") {
        total += n * RIAL_TO_TOMAN;
        found = true;
      } else if (curStr === "تومان" || curStr === "تومن" || curStr === "tmn") {
        total += n;
        found = true;
      }
    }
    return found ? Math.floor(total) : 0;
  };
  const formatPrice = (val) => Number(val).toLocaleString("en-US");

  let REAL_MIN = 0;
  let REAL_MAX = 0;
  let realMin = 0;
  let realMax = 0;

  const prices = Array.from(cards)
    .map((card) =>
      parsePrice(card.dataset.price || "0", card.dataset.priceToman)
    )
    .filter((p) => p > 0);

  if (prices.length) {
    REAL_MIN = Math.min(...prices);
    REAL_MAX = Math.max(...prices);
    realMin = REAL_MIN;
    realMax = REAL_MAX;
  }

  const selectedAirlines = new Set();
  const selectedDays = new Set();

  function getSliderPercents() {
    const min = Number(minInput?.value ?? 0);
    const max = Number(maxInput?.value ?? 100);
    return { min, max };
  }

  function isPriceFilterActive() {
    const { min, max } = getSliderPercents();
    return !(min <= 0 && max >= 100);
  }

  function filterCards() {
    const priceActive = isPriceFilterActive();

    cards.forEach((card) => {
      const price = parsePrice(
        card.dataset.price || "0",
        card.dataset.priceToman
      );
      const priceKnown = Number.isFinite(price) && price > 0;

      const matchPrice = priceActive
        ? priceKnown && price >= realMin && price <= realMax
        : true;

      const airline = normalizeText(card.dataset.airlineName || "");
      const days = normalizeText(card.dataset.days || "");

      const matchAirline =
        selectedAirlines.size === 0 || selectedAirlines.has(airline);
      const matchDays = selectedDays.size === 0 || selectedDays.has(days);

      card.style.display =
        matchPrice && matchAirline && matchDays ? "" : "none";
    });
  }

  function updatePriceRange() {
    if (!minInput || !maxInput || !rangeTrack || !minValText || !maxValText)
      return;

    let min = parseInt(minInput.value, 10);
    let max = parseInt(maxInput.value, 10);
    if (Number.isNaN(min)) min = 0;
    if (Number.isNaN(max)) max = 100;

    if (min > max) [min, max] = [max, min];

    const right = min;
    const width = max - min;
    rangeTrack.style.right = `${right}%`;
    rangeTrack.style.width = `${width}%`;

    realMin = Math.floor(REAL_MIN + ((REAL_MAX - REAL_MIN) * min) / 100);
    realMax = Math.floor(REAL_MIN + ((REAL_MAX - REAL_MIN) * max) / 100);

    minValText.textContent = formatPrice(realMin);
    maxValText.textContent = formatPrice(realMax);

    filterCards();
  }

  if (minInput && maxInput) {
    minInput.addEventListener("input", updatePriceRange);
    maxInput.addEventListener("input", updatePriceRange);
    updatePriceRange();
  }

  if (airlineFilterContainer) {
    airlineFilterContainer.addEventListener("change", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.classList.contains("airline-input")) return;

      const val = target.value;
      if (target.checked) selectedAirlines.add(val);
      else selectedAirlines.delete(val);

      filterCards();
    });
  }

  if (daysFilterContainer) {
    daysFilterContainer.addEventListener("change", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.classList.contains("days-input")) return;

      const val = target.value;
      if (target.checked) selectedDays.add(val);
      else selectedDays.delete(val);

      filterCards();
    });
  }

  if (removeFiltersBtn) {
    removeFiltersBtn.addEventListener("click", () => {
      selectedAirlines.clear();
      selectedDays.clear();

      if (airlineFilterContainer) {
        airlineFilterContainer
          .querySelectorAll("input.airline-input")
          .forEach((input) => (input.checked = false));
      }
      if (daysFilterContainer) {
        daysFilterContainer
          .querySelectorAll("input.days-input")
          .forEach((input) => (input.checked = false));
      }

      if (minInput && maxInput) {
        minInput.value = 0;
        maxInput.value = 100;
        updatePriceRange();
      } else {
        filterCards();
      }
    });
  }
});

// ----filter hotelList card------
document.addEventListener("DOMContentLoaded", function () {
  const hotelCards = document.querySelectorAll(".hotel-card");

  let activeCityFilters = new Set();
  let activeRatingFilters = new Set();
  let searchQuery = "";

  function generateCityFilterOptions() {
    const cityMenu = document.getElementById("cityFilterMenu");
    if (!cityMenu) return;
    cityMenu.innerHTML = "";

    const citySet = new Set();
    hotelCards.forEach((card) => {
      const city = (card.dataset.city || "").trim();
      if (city) citySet.add(city);
    });

    citySet.forEach((city) => {
      const option = document.createElement("label");
      option.className =
        "city-item group flex items-center gap-3 text-sm cursor-pointer select-none transition-all duration-300";
      option.innerHTML = `
          <input type="checkbox" value="${city.toLowerCase()}" class="hidden city-input peer" />
          <span class="flex items-center justify-center w-6 h-6 border-2 border-zinc-400 rounded-lg transition-colors peer-checked:bg-primary-600 peer-checked:border-primary-600">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.48 9.33L5.38 10.75C5.81 11.08 6.41 11.00 6.75 10.59L12.15 4"
                stroke="white" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </span>
          <span class="transition-all duration-300 group-hover:text-primary-600">${city}</span>
        `;
      cityMenu.appendChild(option);
    });
  }

  function generateRatingFilterOptions() {
    const ratingMenu = document.getElementById("ratingFilterMenu");
    if (!ratingMenu) return;
    ratingMenu.innerHTML = "";

    for (let i = 1; i <= 5; i++) {
      const option = document.createElement("div");
      option.className =
        "group rating-option cursor-pointer p-1 border-b border-gray-100";
      option.dataset.rating = i;

      let starsHTML = "";
      for (let j = 0; j < i; j++) {
        starsHTML += `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0">
    <path
      d="M17.9189 14.32C17.6599 14.571 17.5409 14.934 17.5999 15.29L18.4889 20.21C18.5639 20.627 18.3879 21.049 18.0389 21.29C17.6969 21.54 17.2419 21.57 16.8689 21.37L12.4399 19.06C12.2859 18.978 12.1149 18.934 11.9399 18.929H11.6689C11.5749 18.943 11.4829 18.973 11.3989 19.019L6.96888 21.34C6.74988 21.45 6.50188 21.489 6.25888 21.45C5.66688 21.338 5.27188 20.774 5.36888 20.179L6.25888 15.259C6.31788 14.9 6.19888 14.535 5.93988 14.28L2.32888 10.78C2.02688 10.487 1.92188 10.047 2.05988 9.65C2.19388 9.254 2.53588 8.965 2.94888 8.9L7.91888 8.179C8.29688 8.14 8.62888 7.91 8.79888 7.57L10.9889 3.08C11.0409 2.98 11.1079 2.888 11.1889 2.81L11.2789 2.74C11.3259 2.688 11.3799 2.645 11.4399 2.61L11.5489 2.57L11.7189 2.5H12.1399C12.5159 2.539 12.8469 2.764 13.0199 3.1L15.2389 7.57C15.3989 7.897 15.7099 8.124 16.0689 8.179L21.0389 8.9C21.4589 8.96 21.8099 9.25 21.9489 9.65C22.0799 10.051 21.9669 10.491 21.6589 10.78L17.9189 14.32Z"
      fill="#FFC700"/>
  </svg>
  `;
      }

      option.innerHTML = `
          <span class="flex items-center justify-between text-sm font-bold transition-all duration-300 group-hover:text-primary-500">
            <label class="rating-item group flex items-center gap-3 text-sm cursor-pointer select-none transition-all duration-300">
              <input type="checkbox" value="${i} ستاره" class="hidden rating-input peer" />
              <span class="flex items-center justify-center w-6 h-6 border-2 border-zinc-400 rounded-lg transition-colors peer-checked:bg-primary-600 peer-checked:border-primary-600">
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.48 9.33L5.38 10.75C5.81 11.08 6.41 11.00 6.75 10.59L12.15 4"
                    stroke="white" stroke-width="2" stroke-linecap="round"></path>
                </svg>
              </span>
              <span class="transition-all duration-300 group-hover:text-primary-600">${i} ستاره</span>
            </label>
            <div class="flex items-center">${starsHTML}</div>
          </span>
        `;
      ratingMenu.appendChild(option);
    }
  }

  const minRangeHotel = document.getElementById("minRange-hotel");
  const maxRangeHotel = document.getElementById("maxRange-hotel");
  const minValTextHotel = document.getElementById("minValue-hotel");
  const maxValTextHotel = document.getElementById("maxValue-hotel");
  const rangeTrackHotel = document.getElementById("rangeTrack-hotel");

  const RIAL_TO_TOMAN = 0.1;

  const toEnglishDigits = (str) => {
    if (!str) return "";
    const fa = "۰۱۲۳۴۵۶۷۸۹",
      ar = "٠١٢٣٤٥٦٧٨٩";
    return String(str).replace(/[۰-۹٠-٩]/g, (d) => {
      const i1 = fa.indexOf(d);
      if (i1 > -1) return String(i1);
      const i2 = ar.indexOf(d);
      if (i2 > -1) return String(i2);
      return d;
    });
  };

  const digitsOnly = (s) => toEnglishDigits(s).replace(/\D+/g, "");

  const parsePriceHotel = (priceStr, priceTomanAttr) => {
    if (
      priceTomanAttr != null &&
      priceTomanAttr !== "" &&
      !isNaN(Number(priceTomanAttr))
    ) {
      return Math.floor(Number(priceTomanAttr));
    }
    if (!priceStr) return 0;
    const text = String(priceStr).toLowerCase();
    const re =
      /(?:([\d\s.,\/\\\u066B\u066C\u200c\u060C\u00A0]+)\s*(تومان|تومن|tmn|ریال|rial)|(تومان|تومن|tmn|ریال|rial)\s*([\d\s.,\/\\\u066B\u066C\u200c\u060C\u00A0]+))/gi;
    let m,
      total = 0,
      found = false;
    while ((m = re.exec(text)) !== null) {
      const numStr = m[1] || m[4];
      const curStr = (m[2] || m[3] || "").trim();
      const n = parseInt(digitsOnly(numStr), 10);
      if (!n || isNaN(n)) continue;
      if (curStr === "ریال" || curStr === "rial") total += n * RIAL_TO_TOMAN;
      else if (curStr === "تومان" || curStr === "تومن" || curStr === "tmn")
        total += n;
      found = true;
    }
    return found ? Math.floor(total) : 0;
  };

  const pricesHotel = Array.from(hotelCards).map((card) =>
    parsePriceHotel(card.dataset.price, card.dataset.priceToman)
  );
  const REAL_MIN = pricesHotel.length ? Math.min(...pricesHotel) : 0;
  const REAL_MAX = pricesHotel.length ? Math.max(...pricesHotel) : 100000000;

  let realMin = REAL_MIN;
  let realMax = REAL_MAX;

  function updatePriceRangeHotel() {
    if (!minRangeHotel || !maxRangeHotel || !rangeTrackHotel) return;

    let min = parseInt(minRangeHotel.value, 10);
    let max = parseInt(maxRangeHotel.value, 10);
    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = 100;
    if (min > max) [min, max] = [max, min];

    realMin = Math.floor(REAL_MIN + ((REAL_MAX - REAL_MIN) * min) / 100);
    realMax = Math.floor(REAL_MIN + ((REAL_MAX - REAL_MIN) * max) / 100);

    if (minValTextHotel) minValTextHotel.textContent = realMin.toLocaleString();
    if (maxValTextHotel) maxValTextHotel.textContent = realMax.toLocaleString();

    rangeTrackHotel.style.right = `${min}%`;
    rangeTrackHotel.style.width = `${max - min}%`;

    applyFilters();
  }

  if (minRangeHotel && maxRangeHotel) {
    minRangeHotel.addEventListener("input", updatePriceRangeHotel);
    maxRangeHotel.addEventListener("input", updatePriceRangeHotel);
    updatePriceRangeHotel();
  }

  function applyFilters() {
    hotelCards.forEach((card) => {
      const name = (card.dataset.name || "").toLowerCase();
      const city = (card.dataset.city || "").toLowerCase();
      const rate = (card.dataset.rate || "").trim();
      const price = parsePriceHotel(
        card.dataset.price,
        card.dataset.priceToman
      );

      let match = true;
      if (searchQuery && !name.includes(searchQuery)) match = false;
      if (activeCityFilters.size > 0 && !activeCityFilters.has(city))
        match = false;
      if (activeRatingFilters.size > 0 && !activeRatingFilters.has(rate))
        match = false;
      if (price < realMin || price > realMax) match = false;

      card.style.display = match ? "flex" : "none";
    });
  }

  const nameInput = document.getElementById("hotelNameFilter");
  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("city-input")) {
      const selectedCity = e.target.value;
      if (e.target.checked) activeCityFilters.add(selectedCity);
      else activeCityFilters.delete(selectedCity);
      applyFilters();
    }
    if (e.target.classList.contains("rating-input")) {
      const selectedRate = e.target.value.replace(" ستاره", "");
      if (e.target.checked) activeRatingFilters.add(selectedRate);
      else activeRatingFilters.delete(selectedRate);
      applyFilters();
    }
  });

  generateCityFilterOptions();
  generateRatingFilterOptions();
});
