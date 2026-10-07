"use strict";

const energyByGroup = {
  P: { "19-29": 2250, "30-49": 2150 },
  L: { "19-29": 2650, "30-49": 2550 }
};

const idNumber = (value, digits = 0) => new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
}).format(value);

function updateCalculator() {
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value;
  const energy = energyByGroup[gender][age];
  const snackLow = energy * 0.10;
  const snackHigh = energy * 0.12;
  const fat = energy * 0.30 / 9;
  const saturatedFat = energy * 0.10 / 9;

  document.getElementById("energy-value").textContent = idNumber(energy);
  document.getElementById("snack-value").textContent = `${idNumber(snackLow)}–${idNumber(snackHigh)} kkal`;
  document.getElementById("fat-value").textContent = `≤${idNumber(fat, 1)} g/hari`;
  document.getElementById("satfat-value").textContent = `≤${idNumber(saturatedFat, 1)} g/hari`;
}

function updateSimulation() {
  const servings = Number(document.getElementById("servings").value);
  const simulator = document.querySelector(".simulator-card");
  const results = document.getElementById("sim-results");
  document.getElementById("serving-count").textContent = `${servings} sajian`;
  document.getElementById("food-weight").textContent = `${servings * 25} g camilan`;
  document.getElementById("total-fat").textContent = `${idNumber(servings * 9)} g`;
  document.getElementById("total-percent").textContent = `${servings * 13}% AKG`;
  document.getElementById("total-satfat").textContent = `${idNumber(servings * 2.5, servings % 2 ? 1 : 0)} g`;
  document.getElementById("satfat-percent").textContent = `${servings * 13}% AKG`;
  document.getElementById("total-calories").textContent = `${idNumber(servings * 140)} kkal`;
  document.getElementById("simulation-note").textContent = servings === 4
    ? "36 g lemak — lebih dari separuh acuan 67 g sehari, setara ±2½ sdm minyak."
    : servings === 1
      ? "Angka label berlaku per sajian. Kalikan jika makan lebih dari satu sajian."
      : `${servings} sajian berarti semua angka gizi per sajian dikalikan ${servings}.`;
  simulator.classList.toggle("is-high", servings * 13 >= 50);
  results.classList.remove("pulse");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void results.offsetWidth;
  results.classList.add("pulse");
}

function initTabs(tabListSelector) {
  const tabList = document.querySelector(tabListSelector);
  if (!tabList) return;
  const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));

  function selectTab(target, focus = false) {
    tabs.forEach(tab => {
      const selected = tab === target;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
    });
    if (focus) target.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(tabs[next], true);
      }
    });
  });
}

document.getElementById("gender").addEventListener("change", updateCalculator);
document.getElementById("age").addEventListener("change", updateCalculator);
document.getElementById("servings").addEventListener("input", updateSimulation);
document.getElementById("label-toggle").addEventListener("click", () => {
  const label = document.getElementById("nutrition-label");
  const expanded = label.classList.toggle("expanded");
  const button = document.getElementById("label-toggle");
  button.setAttribute("aria-expanded", String(expanded));
  button.textContent = expanded ? "Tutup ▴" : "Lihat label lengkap ▾";
});
updateCalculator();
updateSimulation();
initTabs(".choice-control");
initTabs(".scenario-tabs");

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
});
nav.addEventListener("click", event => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  }
});

document.getElementById("alarm-form").addEventListener("submit", event => {
  event.preventDefault();
  const person = document.getElementById("person-name").value.trim();
  const limit = document.getElementById("snack-limit").value.trim();
  if (!person || !limit) return;
  const message = `Hai ${person}, boleh bantu jadi alarm snack-ku? Aku ingin membatasi camilan: ${limit}. Tolong ingatkan aku dengan baik kalau porsiku sudah cukup, ya. Terima kasih!`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
