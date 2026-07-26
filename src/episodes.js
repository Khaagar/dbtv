export const series = [
  { id: "db", name: "Dragon Ball", years: "1986–1989", count: 153, accent: "#ffb31a" },
  { id: "dbz", name: "Dragon Ball Z", years: "1989–1996", count: 291, accent: "#ff6b18" },
  { id: "dbgt", name: "Dragon Ball GT", years: "1996–1997", count: 64, accent: "#d24cff" },
  { id: "dbs", name: "Dragon Ball Super", years: "2015–2018", count: 131, accent: "#2dbdff" },
];

const WIKIPEDIA_API = "https://pl.wikipedia.org/w/api.php";
const WIKIPEDIA_PAGE = "Lista_odcinków_serialu_anime_Dragon_Ball";
let dragonBallTitles = [];

const arcNames = {
  db: ["Początek przygody", "Turniej", "Wielka wyprawa", "Finał sagi"],
  dbz: ["Nowi wojownicy", "Kosmiczna wyprawa", "Androidy", "Ostatnie starcie"],
  dbgt: ["Wyprawa w kosmos", "Nowy przeciwnik", "Mroczne smoki"],
  dbs: ["Bogowie", "Turniej wszechświatów", "Przyszłość", "Turniej Mocy"],
};

export function episodesFor(show) {
  const arcs = arcNames[show.id];
  return Array.from({ length: show.count }, (_, index) => {
    const number = index + 1;
    const arc = arcs[Math.min(Math.floor(index / (show.count / arcs.length)), arcs.length - 1)];
    return {
      id: `${show.id}-${number}`,
      number,
      title: show.id === "db" && dragonBallTitles[index] ? dragonBallTitles[index] : `Odcinek ${number}`,
      arc,
      duration: `${22 + (number % 3)} min`,
    };
  });
}

function cleanTitle(value) {
  return value
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function episodeRows(html) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const episodes = new Map();

  document.querySelectorAll("table.wikitable tr").forEach((row) => {
    const cells = [...row.querySelectorAll(":scope > td")];
    const number = Number.parseInt(cells[0]?.textContent.trim(), 10);
    const title = cleanTitle(cells[1]?.textContent || "");

    if (number >= 1 && number <= 153 && title) episodes.set(number, title);
  });

  return Array.from({ length: 153 }, (_, index) => episodes.get(index + 1) || "");
}

export async function loadWikipediaEpisodes() {
  const parameters = new URLSearchParams({
    action: "parse",
    format: "json",
    origin: "*",
    page: WIKIPEDIA_PAGE,
    prop: "text",
  });
  const response = await fetch(`${WIKIPEDIA_API}?${parameters}`);

  if (!response.ok) throw new Error(`Wikipedia API: ${response.status}`);
  const payload = await response.json();
  const titles = episodeRows(payload.parse?.text?.["*"] || "");
  if (titles.filter(Boolean).length < 100) throw new Error("Nie rozpoznano tabeli odcinków Wikipedii");
  dragonBallTitles = titles;
  return titles.filter(Boolean).length;
}
