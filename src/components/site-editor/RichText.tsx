import { Fragment } from "react";

/**
 * Formato mínimo de los textos editables: cada Enter es un salto de línea y
 * lo que va entre asteriscos (*así*) sale en el color de acento.
 */
export function RichText({
  value,
  accentClassName = "text-accent-deep",
}: {
  value: string;
  accentClassName?: string;
}) {
  return value.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/\*([^*\n]+)\*/).map((part, j) =>
        j % 2 === 1 ? (
          <span key={j} className={accentClassName}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </Fragment>
  ));
}
