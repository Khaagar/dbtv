import { cp, mkdir, readFile, rm } from "node:fs/promises";

const requiredFiles = ["index.html", "styles.css", "app.js", "episodes.js"];

await Promise.all(requiredFiles.map((file) => readFile(`src/${file}`, "utf8")));
await rm("dist", { force: true, recursive: true });
await mkdir("dist", { recursive: true });
await cp("src", "dist", { recursive: true });

console.log("Built DBTV web template in dist/");
