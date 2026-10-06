/**
 * Honeypot anti-bots: invisible para personas (y para lectores de pantalla), pero los bots que
 * rellenan todos los campos lo completan. Las Server Actions descartan esos envíos en silencio.
 */
export function CampoTrampa() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        No completar este campo
        <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
