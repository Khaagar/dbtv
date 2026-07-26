import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 4173);
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript" };

createServer((request, response) => {
  const pathname = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const file = join(process.cwd(), "src", safePath);

  response.setHeader("Content-Type", `${types[extname(file)] || "application/octet-stream"}; charset=utf-8`);
  createReadStream(file)
    .on("error", () => {
      response.statusCode = 404;
      response.end("Not found");
    })
    .pipe(response);
}).listen(port, "0.0.0.0", () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((address) => address?.family === "IPv4" && !address.internal)
    .map((address) => `http://${address.address}:${port}`);

  console.log(`DBTV preview (komputer): http://localhost:${port}`);
  if (addresses.length > 0) {
    console.log("DBTV preview (telefon):");
    addresses.forEach((address) => console.log(`  ${address}`));
  } else {
    console.log("Nie znaleziono adresu LAN. Sprawdź adres poleceniem: hostname -I");
  }
});
