import { notFound } from "next/navigation";

/**
 * Las URLs que no existen dentro de un idioma (/en/lo-que-sea) no llegan solas
 * al not-found de [lang]: esta ruta las atrapa y lo dispara, así se ve el 404
 * de la tienda, con header, footer y en el idioma correcto.
 */
export default function CatchAll() {
  notFound();
}
