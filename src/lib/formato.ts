const formateador = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/El_Salvador",
});

export function fecha(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  const d = typeof valor === "number" ? new Date(valor * 1000) : new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : formateador.format(d);
}
