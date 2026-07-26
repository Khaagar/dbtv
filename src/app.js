import { episodesFor, series } from "./episodes.js";

const tabs = document.querySelector("#series-tabs");
const grid = document.querySelector("#episode-grid");
const count = document.querySelector("#episode-count");
const search = document.querySelector("#search");
const loadMore = document.querySelector("#load-more");
const dialog = document.querySelector("#preview-dialog");
const toast = document.querySelector(".toast");
let activeSeries = series[0];
let visible = 12;

function renderTabs() {
  tabs.innerHTML = series.map((show) => `<button class="series-tab ${show.id === activeSeries.id ? "active" : ""}" style="--accent:${show.accent}" role="tab" aria-selected="${show.id === activeSeries.id}" data-series="${show.id}">${show.name} <small>${show.count}</small></button>`).join("");
}

function renderEpisodes() {
  const query = search.value.trim().toLocaleLowerCase("pl");
  const episodes = episodesFor(activeSeries).filter((episode) => `${episode.title} ${episode.arc}`.toLocaleLowerCase("pl").includes(query));
  count.textContent = `${activeSeries.name} · ${episodes.length} ${episodes.length === 1 ? "odcinek" : "odcinków"}`;
  grid.innerHTML = episodes.slice(0, visible).map((episode) => `
    <button class="episode-card" style="--accent:${activeSeries.accent}" data-episode="${episode.number}">
      <span class="thumbnail"><span class="episode-number">${String(episode.number).padStart(2, "0")}</span><span class="play">▶</span></span>
      <span class="card-copy"><small>${episode.arc}</small><h3>${episode.title}</h3><p>${activeSeries.name} · ${episode.duration}</p></span>
    </button>`).join("");
  loadMore.hidden = visible >= episodes.length;
}

function selectSeries(id) {
  activeSeries = series.find((show) => show.id === id);
  visible = 12;
  renderTabs();
  renderEpisodes();
}

tabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-series]");
  if (tab) selectSeries(tab.dataset.series);
});
search.addEventListener("input", () => { visible = 12; renderEpisodes(); });
loadMore.addEventListener("click", () => { visible += 12; renderEpisodes(); });
document.querySelector("#layout-toggle").addEventListener("click", () => grid.classList.toggle("list"));
grid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-episode]");
  if (!card) return;
  const episode = episodesFor(activeSeries)[Number(card.dataset.episode) - 1];
  document.querySelector("#modal-series").textContent = activeSeries.name;
  document.querySelector("#modal-title").textContent = episode.title;
  document.querySelector("#modal-meta").textContent = `${episode.arc} · ${episode.duration} · Placeholder materiału wideo`;
  dialog.showModal();
});
dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
document.querySelector("[data-open-feature]").addEventListener("click", () => {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
});

renderTabs();
renderEpisodes();
