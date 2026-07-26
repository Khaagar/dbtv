import { mkdir, writeFile } from "node:fs/promises";

const OUTPUT_DIR = "src/data";
const SOURCE_URL =
  "https://raw.githubusercontent.com/Pewpenguin/DragonBallTUI/refs/heads/main/data/episodes.json";

const SERIES = [
  {
    sourceName: "Dragon Ball",
    slug: "dragon-ball",
    title: "Dragon Ball",
    abbreviation: "DB",
    expectedEpisodes: 153,
    originalRun: { from: "1986-02-26", to: "1989-04-19" },
  },
  {
    sourceName: "Dragon Ball Z",
    slug: "dragon-ball-z",
    title: "Dragon Ball Z",
    abbreviation: "DBZ",
    expectedEpisodes: 291,
    originalRun: { from: "1989-04-26", to: "1996-01-31" },
  },
  {
    sourceName: "Dragon Ball GT",
    slug: "dragon-ball-gt",
    title: "Dragon Ball GT",
    abbreviation: "DBGT",
    expectedEpisodes: 64,
    originalRun: { from: "1996-02-07", to: "1997-11-19" },
  },
];

const DAIMA_EPISODES = [
  [1, "Conspiracy", "2024-10-11"],
  [2, "Glorio", "2024-10-18"],
  [3, "Daima", "2024-10-25"],
  [4, "Chatty", "2024-11-01"],
  [5, "Panzy", "2024-11-08"],
  [6, "Lightning", "2024-11-15"],
  [7, "Collar", "2024-11-22"],
  [8, "Tamagami", "2024-11-29"],
  [9, "Thieves", "2024-12-06"],
  [10, "Ocean", "2024-12-13"],
  [11, "Legend", "2024-12-20"],
  [12, "True Strength", "2024-12-27"],
  [13, "Surprise", "2025-01-10"],
  [14, "Taboo", "2025-01-17"],
  [15, "Third Eye", "2025-01-24"],
  [16, "Degesu", "2025-01-31"],
  [17, "Gomah", "2025-02-07"],
  [18, "Awakening", "2025-02-14"],
  [19, "Betrayal", "2025-02-21"],
  [20, "Maximum", "2025-02-28"],
].map(([number, title, airedAt]) => ({
  id: `dragon-ball-daima-${number}`,
  number,
  title,
  description: null,
  airedAt,
  durationMinutes: 24,
  saga: "Dragon Ball Daima",
}));

function toIsoDate(value) {
  if (!value) return null;
  const timestamp = Date.parse(value.replace(/\s+/g, " "));
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString().slice(0, 10);
}

function parseDurationMinutes(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function normalizeEpisode(seriesSlug, episode) {
  return {
    id: `${seriesSlug}-${episode.episode_number}`,
    number: episode.episode_number,
    title: episode.title,
    description: episode.description || null,
    airedAt: toIsoDate(episode.release_date),
    durationMinutes: parseDurationMinutes(episode.duration),
    saga: episode.saga || null,
  };
}

function buildDatabase(metadata, episodes, source) {
  return {
    schemaVersion: 1,
    series: {
      id: metadata.slug,
      title: metadata.title,
      abbreviation: metadata.abbreviation,
      type: "TV",
      studio: "Toei Animation",
      status: "ended",
      episodeCount: episodes.length,
      originalRun: metadata.originalRun,
    },
    source,
    importedAt: new Date().toISOString(),
    episodes,
  };
}

async function fetchSourceData() {
  const response = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "DBTV episode metadata importer" },
  });

  if (!response.ok) {
    throw new Error(`Źródło odcinków odpowiedziało HTTP ${response.status}`);
  }

  return response.json();
}

async function saveDatabase(slug, database) {
  const path = `${OUTPUT_DIR}/${slug}.json`;
  await writeFile(path, `${JSON.stringify(database, null, 2)}\n`);
  console.log(`Zapisano ${database.episodes.length} odcinków w ${path}`);
}

await mkdir(OUTPUT_DIR, { recursive: true });
const sourceData = await fetchSourceData();

for (const metadata of SERIES) {
  const sourceSeries = sourceData.find((item) => item.series === metadata.sourceName);
  if (!sourceSeries) throw new Error(`Brak serii ${metadata.sourceName} w źródle`);

  const episodes = sourceSeries.episodes.map((episode) =>
    normalizeEpisode(metadata.slug, episode),
  );

  if (episodes.length !== metadata.expectedEpisodes) {
    throw new Error(
      `${metadata.title}: oczekiwano ${metadata.expectedEpisodes} odcinków, otrzymano ${episodes.length}`,
    );
  }

  await saveDatabase(
    metadata.slug,
    buildDatabase(metadata, episodes, {
      name: "DragonBallTUI episode dataset",
      url: SOURCE_URL,
      language: "en",
    }),
  );
}

const daimaMetadata = {
  slug: "dragon-ball-daima",
  title: "Dragon Ball Daima",
  abbreviation: "DBDaima",
  originalRun: { from: "2024-10-11", to: "2025-02-28" },
};

await saveDatabase(
  daimaMetadata.slug,
  buildDatabase(daimaMetadata, DAIMA_EPISODES, {
    name: "Curated Dragon Ball Daima episode list",
    language: "en",
  }),
);
