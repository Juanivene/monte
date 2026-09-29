import type { StaticImageData } from "next/image";
import { shots, type Shot } from "@/lib/lookbook";
import type { Locale } from "@/i18n/config";

/**
 * Contenido editable del home (textos y fotos) desde /admin/preview.
 *
 * Los valores por defecto viven acá, en el código, en los dos idiomas. En la
 * base (modelo SiteContent) solo se guardan los cambios: si la fila no
 * existe, si la base no responde o si un valor guardado no es válido, ese
 * campo vuelve a su default. Así la home nunca queda vacía ni rota.
 *
 * Los textos se editan por idioma. Las fotos y su encuadre son los mismos en
 * los dos; solo la descripción (alt) va por idioma.
 *
 * Este archivo lo importan también componentes de cliente, así que no puede
 * traer nada de servidor (ni zod: la validación está en validation.ts).
 */

type TextSpec = {
  /** Default en español (el original). */
  default: string;
  /** Default en inglés. */
  en: string;
  max: number;
  /** Permite Enter (salto de línea). Si no, Enter confirma la edición. */
  multiline?: boolean;
  /** Es una URL: se valida como tal y es la misma en los dos idiomas. */
  url?: boolean;
};

type ImageSpec = {
  label: string;
  default: Shot;
  /** Punto de encuadre por defecto, en % (object-position). */
  x?: number;
  y?: number;
};

export const TEXT_FIELDS = {
  // Hero
  "hero.eyebrow": { default: "Colección 01 · 2026", en: "Collection 01 · 2026", max: 60 },
  "hero.title": {
    default: "El monte\nestá en la\n*ciudad*",
    en: "The monte\nlives in the\n*city*",
    max: 80,
    multiline: true,
  },
  "hero.body": {
    default:
      "Prendas y accesorios agénero de diseño independiente. Con base en Miami y visión de expansión global, trabajamos en tiradas cortas y con materiales naturales, reduciendo nuestra huella ambiental.",
    en: "Genderless clothing and accessories of independent design. Based in Miami with a global outlook, we work in small batches with natural materials, reducing our environmental footprint.",
    max: 400,
    multiline: true,
  },
  "hero.ctaPrimary": { default: "Ver colección", en: "Shop the collection", max: 30 },
  "hero.ctaSecondary": { default: "Lookbook", en: "Lookbook", max: 30 },
  "hero.stat1Label": { default: "Prendas activas", en: "Pieces available", max: 30 },
  "hero.stat2Value": { default: "24h", en: "24h", max: 8 },
  "hero.stat2Label": { default: "Despacho", en: "Dispatch", max: 30 },
  "hero.stat3Value": { default: "30d", en: "30d", max: 8 },
  "hero.stat3Label": { default: "Para cambios", en: "For exchanges", max: 30 },
  "hero.side": { default: "Miami · 2026", en: "Miami · 2026", max: 40 },

  // Sobre Monte
  "story.eyebrow": { default: "Sobre Monte", en: "About Monte", max: 60 },
  "story.title": {
    default: "Poca cantidad,\nmucha prenda",
    en: "Small batches,\nserious pieces",
    max: 80,
    multiline: true,
  },
  "story.p1": {
    default:
      "Monte nació entre las montañas de nuestros valles Tucumanos y terminó de tomar forma en la costa. De ahí salen los colores:  el verde del monte, el azul del agua y la arena.",
    en: "Monte was born among the mountains of our valleys in Tucumán and took its final shape on the coast. That's where our colors come from: the green of the hills, the blue of the water and the sand.",
    max: 600,
    multiline: true,
  },
  "story.p2": {
    default:
      "Cortamos y cosemos en talleres locales. Cada diseño se produce en tiradas cortas, con telas pesadas y moldería oversize pensada para durar más de una temporada.",
    en: "We cut and sew in local workshops. Each design is made in a short run, with heavyweight fabrics and oversized patterns built to last more than one season.",
    max: 600,
    multiline: true,
  },
  "story.fact1Title": { default: "Frisa 400g", en: "400g fleece", max: 40 },
  "story.fact1Detail": { default: "Algodón peinado", en: "Combed cotton", max: 60 },
  "story.fact2Title": { default: "Moldería oversize", en: "Oversized fit", max: 40 },
  "story.fact2Detail": { default: "Del XS al XXL", en: "From XS to XXL", max: 60 },
  "story.fact3Title": { default: "Ojales metálicos", en: "Metal eyelets", max: 40 },
  "story.fact3Detail": { default: "Aplicados a mano", en: "Set by hand", max: 60 },

  // Lookbook
  "lookbook.eyebrow": { default: "Lookbook", en: "Lookbook", max: 60 },
  "lookbook.title": {
    default: "De la torre\na la orilla",
    en: "From the tower\nto the shore",
    max: 80,
    multiline: true,
  },
  "lookbook.body": {
    default:
      "Las mismas prendas en hormigón porteño y en arena. Deslizá para ver toda la temporada.",
    en: "The same pieces on Buenos Aires concrete and on the sand. Swipe to see the whole season.",
    max: 300,
    multiline: true,
  },

  // Beneficios
  "values.1Title": { default: "Envíos a todo el país", en: "Nationwide shipping", max: 50 },
  "values.1Detail": {
    default: "Despachamos dentro de las 24 h hábiles por correo o moto en CABA.",
    en: "We ship within 24 business hours by mail, or by motorbike within Buenos Aires City.",
    max: 200,
    multiline: true,
  },
  "values.2Title": { default: "Cambios sin vueltas", en: "Easy exchanges", max: 50 },
  "values.2Detail": {
    default: "Tenés 30 días para cambiar el talle, siempre que la prenda esté sin uso.",
    en: "You have 30 days to exchange your size, as long as the piece is unworn.",
    max: 200,
    multiline: true,
  },
  "values.3Title": { default: "Tiradas cortas", en: "Small batches", max: 50 },
  "values.3Detail": {
    default: "Producimos poco de cada diseño. Lo que se agota rara vez vuelve.",
    en: "We make just a few of each design. What sells out rarely comes back.",
    max: 200,
    multiline: true,
  },
  "values.4Title": { default: "Te asesoramos", en: "We're here to help", max: 50 },
  "values.4Detail": {
    default: "Si dudás con el talle, escribinos y lo vemos juntos antes de comprar.",
    en: "Not sure about your size? Message us and we'll figure it out together before you buy.",
    max: 200,
    multiline: true,
  },
  "values.whatsappText": {
    default: "¿Alguna duda antes de comprar? Estamos del otro lado.",
    en: "Any questions before you buy? We're right here.",
    max: 150,
  },
  "values.whatsappCta": {
    default: "Escribinos por WhatsApp →",
    en: "Message us on WhatsApp →",
    max: 40,
  },

  // Footer
  "footer.eyebrow": { default: "Tucumán · Argentina", en: "Tucumán · Argentina", max: 60 },
  "footer.claim": {
    default: "Tiradas cortas,\nhechas para largo usos",
    en: "Small batches,\nmade to last",
    max: 80,
    multiline: true,
  },
  "footer.brand": {
    default:
      "Indumentaria de diseño independiente. Cada prenda sale en cantidades chicas: cuando se agota, se agota.",
    en: "Independent design clothing. Every piece is made in small numbers: once it's gone, it's gone.",
    max: 300,
    multiline: true,
  },
  "footer.help1": { default: "Envíos a todo el país", en: "Shipping across Argentina", max: 60 },
  "footer.help2": {
    default: "Cambios dentro de los 30 días",
    en: "Exchanges within 30 days",
    max: 60,
  },
  "footer.help3": {
    default: "Pago coordinado por WhatsApp",
    en: "Payment arranged over WhatsApp",
    max: 60,
  },
  "footer.instagram": {
    default: "https://instagram.com/monteclub.arg",
    en: "https://instagram.com/monteclub.arg",
    max: 200,
    url: true,
  },
  "footer.madeIn": { default: "Made In Tucumán", en: "Made in Tucumán", max: 40 },
} as const satisfies Record<string, TextSpec>;

export const IMAGE_FIELDS = {
  "hero.main": { label: "Hero · foto grande", default: shots.trioMuro, y: 30 },
  "hero.small": { label: "Hero · foto chica", default: shots.duoCafeCuadrada },
  "story.main": { label: "Sobre Monte · foto grande", default: shots.buzoTealTorre03 },
  "story.top": { label: "Sobre Monte · foto de arriba", default: shots.remerasArena },
  "story.bottom": { label: "Sobre Monte · foto de abajo", default: shots.buzoNegroPorton },
  "lookbook.1": { label: "Lookbook · foto 1", default: shots.trioMuro },
  "lookbook.2": { label: "Lookbook · foto 2", default: shots.buzoTealPasaje },
  "lookbook.3": { label: "Lookbook · foto 3", default: shots.duoEscalinata },
  "lookbook.4": { label: "Lookbook · foto 4", default: shots.remerasArena },
  "lookbook.5": { label: "Lookbook · foto 5", default: shots.buzoNegroViaducto01 },
  "lookbook.6": { label: "Lookbook · foto 6", default: shots.totePlaya },
  "lookbook.7": { label: "Lookbook · foto 7", default: shots.buzoTealTorre01 },
  "lookbook.8": { label: "Lookbook · foto 8", default: shots.remeraVerdeMar },
  "lookbook.9": { label: "Lookbook · foto 9", default: shots.trioCalle },
  "lookbook.10": { label: "Lookbook · foto 10", default: shots.remeraNegraRocas },
  "lookbook.11": { label: "Lookbook · foto 11", default: shots.buzoNegroPorton },
  "lookbook.12": { label: "Lookbook · foto 12", default: shots.buzoTealCochera },
  "footer.bg": { label: "Footer · foto de fondo", default: shots.trioSenda, y: 35 },
} as const satisfies Record<string, ImageSpec>;

export type TextField = keyof typeof TEXT_FIELDS;
export type ImageField = keyof typeof IMAGE_FIELDS;

export const TEXT_FIELD_KEYS = Object.keys(TEXT_FIELDS) as TextField[];
export const IMAGE_FIELD_KEYS = Object.keys(IMAGE_FIELDS) as ImageField[];

export const LOOKBOOK_FIELDS = IMAGE_FIELD_KEYS.filter((key) => key.startsWith("lookbook."));

export function textSpec(field: TextField): TextSpec {
  return TEXT_FIELDS[field];
}

export function imageSpec(field: ImageField): ImageSpec {
  return IMAGE_FIELDS[field];
}

/** Texto por defecto de un campo en un idioma. */
export function defaultText(field: TextField, lang: Locale): string {
  const spec: TextSpec = TEXT_FIELDS[field];
  return lang === "en" ? spec.en : spec.default;
}

/**
 * Dónde se guarda un texto editado: `text` (español) o `textEn`. Las URLs
 * son las mismas en los dos idiomas y van siempre en `text`.
 */
export function textKeyFor(field: TextField, lang: Locale): "text" | "textEn" {
  const spec: TextSpec = TEXT_FIELDS[field];
  return lang === "en" && !spec.url ? "textEn" : "text";
}

/**
 * Lo que se guarda de una foto: una foto nueva (url + medidas), otra
 * descripción (por idioma) y/o otro punto de encuadre. Lo que falte sale del
 * default.
 */
export type ImageOverride = {
  url?: string;
  width?: number;
  height?: number;
  alt?: string;
  altEn?: string;
  x?: number;
  y?: number;
};

/** Solo los campos que difieren del default. Es lo que va en la base. */
export type ContentOverrides = {
  text?: Partial<Record<TextField, string>>;
  textEn?: Partial<Record<TextField, string>>;
  image?: Partial<Record<ImageField, ImageOverride>>;
};

export type ResolvedImage = {
  src: string | StaticImageData;
  alt: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

export type SiteContent = {
  text: Record<TextField, string>;
  image: Record<ImageField, ResolvedImage>;
};

/** Combina los cambios (ya validados) con los defaults del idioma. */
export function resolveContent(overrides: ContentOverrides, lang: Locale): SiteContent {
  const text = {} as Record<TextField, string>;
  for (const field of TEXT_FIELD_KEYS) {
    text[field] = overrides[textKeyFor(field, lang)]?.[field] ?? defaultText(field, lang);
  }

  const image = {} as Record<ImageField, ResolvedImage>;
  for (const field of IMAGE_FIELD_KEYS) {
    image[field] = resolveImage(field, overrides.image?.[field], lang);
  }

  return { text, image };
}

export function resolveImage(
  field: ImageField,
  override: ImageOverride | undefined,
  lang: Locale,
): ResolvedImage {
  const spec: ImageSpec = IMAGE_FIELDS[field];
  const hasUpload = Boolean(override?.url && override.width && override.height);
  const alt =
    lang === "en" ? (override?.altEn ?? spec.default.altEn) : (override?.alt ?? spec.default.alt);
  return {
    src: hasUpload ? override!.url! : spec.default.src,
    width: hasUpload ? override!.width! : spec.default.src.width,
    height: hasUpload ? override!.height! : spec.default.src.height,
    alt,
    x: override?.x ?? spec.x ?? 50,
    y: override?.y ?? spec.y ?? 50,
  };
}

/**
 * Hosts que next/image acepta (ver remotePatterns en next.config.ts). Una URL
 * de otro host haría tirar error al renderizar la home, así que ni se guarda
 * ni se muestra.
 */
export function isAllowedImageUrl(url: string, allowBlob: boolean): boolean {
  if (allowBlob && url.startsWith("blob:")) return true;
  try {
    const { protocol, hostname } = new URL(url);
    return (
      protocol === "https:" &&
      (hostname.endsWith(".r2.dev") || hostname.endsWith(".public.blob.vercel-storage.com"))
    );
  } catch {
    return false;
  }
}

/** Comparación estable (sin importar el orden de las claves) para saber si hay cambios sin publicar. */
export function sameOverrides(a: ContentOverrides, b: ContentOverrides): boolean {
  return stableStringify(a) === stableStringify(b);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    // Un grupo vacío ({text: {}}) equivale a no tenerlo.
    const nonEmpty = entries.filter(
      ([, v]) => !(v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0),
    );
    return `{${nonEmpty.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
