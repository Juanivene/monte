/**
 * Cinta que se desplaza sin cortes. Duplica los items una vez y anima
 * hasta -50%, así el segundo bloque cae exactamente donde arrancaba el primero.
 */
export function Marquee({
  items,
  separator = "·",
  className = "",
  speed = "38s",
}: {
  items: string[];
  separator?: string;
  className?: string;
  /** duración de una vuelta completa */
  speed?: string;
}) {
  const sequence = [...items, ...items];

  return (
    <div className={`group overflow-hidden ${className}`} role="presentation">
      <div
        className="animate-marquee flex w-max items-center group-hover:[animation-play-state:paused]"
        style={{ animationDuration: speed }}
      >
        {sequence.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center">
            <span className="px-5">{item}</span>
            <span aria-hidden="true" className="opacity-40">
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
