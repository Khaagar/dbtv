import { cp, mkdir, readFile, rm } from "node:fs/promises";

const requiredFiles = ["index.html", "styles.css", "app.js", "episodes.js", "data/dragon-ball.json"];

const sources = await Promise.all(requiredFiles.map((file) => readFile(`src/${file}`, "utf8")));
const database = JSON.parse(sources.at(-1));
if (database.episodes?.length !== 153) throw new Error("Baza Dragon Ball musi zawierać 153 odcinki");
await rm("dist", { force: true, recursive: true });
await mkdir("dist", { recursive: true });
await cp("src", "dist", { recursive: true });

console.log("Built DBTV web template in dist/");
