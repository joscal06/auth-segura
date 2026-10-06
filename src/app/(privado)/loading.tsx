export default function Cargando() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-64 rounded-lg bg-borde" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-borde/60" />
        <div className="h-64 rounded-2xl bg-borde/60" />
      </div>
    </div>
  );
}
