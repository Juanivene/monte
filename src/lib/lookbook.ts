import type { StaticImageData } from "next/image";

// Importadas estáticamente (y no por URL) para que Next resuelva medidas y
// genere el blur placeholder de cada foto en build.
import buzoNegroPorton from "../../public/lookbook/buzo-negro-porton.png";
import buzoNegroViaducto01 from "../../public/lookbook/buzo-negro-viaducto-01.png";
import buzoNegroViaducto02 from "../../public/lookbook/buzo-negro-viaducto-02.png";
import buzoTealCochera from "../../public/lookbook/buzo-teal-cochera.png";
import buzoTealPasaje from "../../public/lookbook/buzo-teal-pasaje.png";
import buzoTealTorre01 from "../../public/lookbook/buzo-teal-torre-01.png";
import buzoTealTorre02 from "../../public/lookbook/buzo-teal-torre-02.png";
import buzoTealTorre03 from "../../public/lookbook/buzo-teal-torre-03.png";
import duoCafe from "../../public/lookbook/duo-cafe.png";
import duoCafeCuadrada from "../../public/lookbook/duo-cafe-cuadrada.png";
import duoEscalinata from "../../public/lookbook/duo-escalinata.png";
import remeraNegraRoca from "../../public/lookbook/remera-negra-roca.png";
import remeraNegraRocas from "../../public/lookbook/remera-negra-rocas.png";
import remeraVerdeMar from "../../public/lookbook/remera-verde-mar.png";
import remerasArena from "../../public/lookbook/remeras-arena.png";
import totePlaya from "../../public/lookbook/tote-playa.png";
import trioCalle from "../../public/lookbook/trio-calle.png";
import trioCaminata from "../../public/lookbook/trio-caminata.png";
import trioMuro from "../../public/lookbook/trio-muro.png";
import trioSenda from "../../public/lookbook/trio-senda.png";

export type Shot = {
  src: StaticImageData;
  alt: string;
};

export const shots = {
  buzoNegroPorton: {
    src: buzoNegroPorton,
    alt: "Buzo Monte negro con ojales, apoyada en un portón de Recoleta",
  },
  buzoNegroViaducto01: {
    src: buzoNegroViaducto01,
    alt: "Buzo Monte negro con ojales, sentada bajo un viaducto de hormigón",
  },
  buzoNegroViaducto02: {
    src: buzoNegroViaducto02,
    alt: "Buzo Monte negro con ojales y gorra, bajo un viaducto de hormigón",
  },
  buzoTealCochera: {
    src: buzoTealCochera,
    alt: "Buzo Monte teal frente a la entrada de una cochera",
  },
  buzoTealPasaje: {
    src: buzoTealPasaje,
    alt: "Buzo Monte teal en un pasaje entre torres de hormigón",
  },
  buzoTealTorre01: {
    src: buzoTealTorre01,
    alt: "Buzo Monte teal con capucha, contrapicado frente a una torre",
  },
  buzoTealTorre02: {
    src: buzoTealTorre02,
    alt: "Buzo Monte teal con capucha frente a una torre brutalista",
  },
  buzoTealTorre03: {
    src: buzoTealTorre03,
    alt: "Buzo Monte teal y pantalón ancho frente a una torre brutalista",
  },
  duoCafe: {
    src: duoCafe,
    alt: "Dos personas con buzos Monte sentadas en la vereda de un café",
  },
  duoCafeCuadrada: {
    src: duoCafeCuadrada,
    alt: "Buzos Monte negro y teal en una mesa de la vereda",
  },
  duoEscalinata: {
    src: duoEscalinata,
    alt: "Buzos Monte negro y teal en una escalinata de piedra",
  },
  remeraNegraRoca: {
    src: remeraNegraRoca,
    alt: "Remera Monte negra oversize contra una pared de granito",
  },
  remeraNegraRocas: {
    src: remeraNegraRocas,
    alt: "Remera Monte negra oversize entre rocas de playa",
  },
  remeraVerdeMar: {
    src: remeraVerdeMar,
    alt: "Remera Monte verde oversize frente al mar",
  },
  remerasArena: {
    src: remerasArena,
    alt: "Remeras Monte negra y verde apoyadas sobre la arena",
  },
  totePlaya: {
    src: totePlaya,
    alt: "Tote bag Monte de lona cruda caminando por la playa",
  },
  trioCalle: {
    src: trioCalle,
    alt: "Tres personas con buzos Monte en una calle de Buenos Aires",
  },
  trioCaminata: {
    src: trioCaminata,
    alt: "Tres personas con buzos Monte caminando por la ciudad",
  },
  trioMuro: {
    src: trioMuro,
    alt: "Tres personas con buzos Monte negro, verde y teal contra un muro con hiedra",
  },
  trioSenda: {
    src: trioSenda,
    alt: "Tres personas con buzos Monte cruzando la senda peatonal",
  },
} as const satisfies Record<string, Shot>;

/** Tira horizontal del home: mezcla de ciudad y verano, en ese orden. */
export const lookbookStrip: Shot[] = [
  shots.trioMuro,
  shots.buzoTealPasaje,
  shots.duoEscalinata,
  shots.remerasArena,
  shots.buzoNegroViaducto01,
  shots.totePlaya,
  shots.buzoTealTorre01,
  shots.remeraVerdeMar,
  shots.trioCalle,
  shots.remeraNegraRocas,
  shots.buzoNegroPorton,
  shots.buzoTealCochera,
];

/** Fotos que rellenan la grilla del catálogo cuando todavía no hay productos. */
export const fallbackGrid: Shot[] = [
  shots.buzoTealTorre02,
  shots.buzoNegroViaducto02,
  shots.remeraNegraRoca,
  shots.trioCaminata,
];
