export const series = [
  { id: "db", name: "Dragon Ball", years: "1986–1989", count: 153, accent: "#ffb31a" },
  { id: "dbz", name: "Dragon Ball Z", years: "1989–1996", count: 291, accent: "#ff6b18" },
  { id: "dbgt", name: "Dragon Ball GT", years: "1996–1997", count: 64, accent: "#d24cff" },
  { id: "dbs", name: "Dragon Ball Super", years: "2015–2018", count: 131, accent: "#2dbdff" },
];

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
      title: `Odcinek ${number}`,
      arc,
      duration: `${22 + (number % 3)} min`,
    };
  });
}
