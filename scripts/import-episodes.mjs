import { mkdir, writeFile } from "node:fs/promises";

const source = "https://pl.wikipedia.org/wiki/Lista_odcink%C3%B3w_serialu_anime_Dragon_Ball";
const api = "https://pl.wikipedia.org/w/api.php";
const parameters = new URLSearchParams({
  action: "parse",
  format: "json",
  page: "Lista_odcinków_serialu_anime_Dragon_Ball",
  prop: "text",
});

function decode(value) {
  const entities = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };
  return value
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, " / ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(x?[\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code.replace(/^x/i, ""), /^x/i.test(code) ? 16 : 10)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match)
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cells(row, tag = "td") {
  return [...row.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))].map((match) => decode(match[1]));
}

function parseEpisodes(html) {
  const episodes = new Map();
  for (const tableMatch of html.matchAll(/<table\b[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/gi)) {
    const rows = [...tableMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
    const headers = cells(rows[0] || "", "th");
    for (const row of rows.slice(1)) {
      const values = cells(row);
      const number = Number.parseInt(values[0], 10);
      if (!(number >= 1 && number <= 153) || values.length < 2) continue;
      const details = Object.fromEntries(values.map((value, index) => [headers[index] || `Kolumna ${index + 1}`, value]));
      episodes.set(number, { number, title: values[1], details });
    }
  }
  return Array.from({ length: 153 }, (_, index) => episodes.get(index + 1)).filter(Boolean);
}

const response = await fetch(`${api}?${parameters}`, { headers: { "User-Agent": "DBTV episode metadata importer" } });
if (!response.ok) throw new Error(`Wikipedia API odpowiedziała ${response.status}`);
const payload = await response.json();
const episodes = parseEpisodes(payload.parse?.text?.["*"] || "");
if (episodes.length !== 153) throw new Error(`Oczekiwano 153 odcinków, rozpoznano ${episodes.length}`);

const database = { source, license: "CC BY-SA 4.0", importedAt: new Date().toISOString(), episodes };
await mkdir("src/data", { recursive: true });
await writeFile("src/data/dragon-ball.json", `${JSON.stringify(database, null, 2)}\n`);
console.log(`Zapisano ${episodes.length} odcinków w src/data/dragon-ball.json`);
