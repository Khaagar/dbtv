import { readFile } from "node:fs/promises";

const files = ["README.md", "docs/architecture.md", "src/index.html", "src/styles.css"];
const errors = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    if (line.endsWith(" ")) {
      errors.push(`${file}:${index + 1}: trailing whitespace`);
    }
  });

  if (!source.endsWith("\n")) {
    errors.push(`${file}: file must end with a newline`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Linted ${files.length} text files`);
}
