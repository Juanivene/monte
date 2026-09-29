import type { StaticImageData } from "next/image";
import { shots, type Shot } from "@/lib/lookbook";

/**
 * Contenido editable del home (textos y fotos) desde /admin/preview.
 *
 * Los valores por defecto viven acá, en el código, y son exactamente lo que
 * la tienda mostraba antes de que existiera el editor. En la base
 * (modelo SiteContent) solo se guardan los cambios: si la fila no existe, si
 * la base no responde o si un valor guardado no es válido, ese campo vuelve
 * a su default. Así la home nunca queda vacía ni rota.
 *
 * Este archivo lo importan también componentes de cliente, así que no puede
 * traer nada de servidor (ni zod: la validación está en validation.ts).
 */

type TextSpec = {
  default: string;
  max: number;
  /** Permite Enter (salto de línea). Si no, Enter confirma la edición. */
  multiline?: boolean;
  /** Es una URL (se valida como tal). */
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
  "hero.eyebrow": { default: "Colección 01 · 2026", max: 60 },
  "hero.title": { default: "El monte\nestá en la\n*ciudad*", max: 80, multiline: true },
  "hero.body": {
    default:
      "Prendas y accesorios agénero de diseño independiente. Con base en Miami y visión de expansión global, trabajamos en tiradas cortas y con materiales naturales, reduciendo nuestra huella ambiental.",
    max: 400,
    multiline: true,
  },
  "hero.ctaPrimary": { default: "Ver colección", max: 30 },
  "hero.ctaSecondary": { default: "Lookbook", max: 30 },
  "hero.stat1Label": { default: "Prendas activas", max: 30 },
  "hero.stat2Value": { default: "24h", max: 8 },
  "hero.stat2Label": { default: "Despacho", max: 30 },
  "hero.stat3Value": { default: "30d", max: 8 },
  "hero.stat3Label": { default: "Para cambios", max: 30 },
  "hero.side": { default: "Miami · 2026", max: 40 },

  // Sobre Monte
  "story.eyebrow": { default: "Sobre Monte", max: 60 },
  "story.title": { default: "Poca cantidad,\nmucha prenda", max: 80, multiline: true },
  "story.p1": {
    default:
      "Monte nació entre las montañas de nuestros valles Tucumanos y terminó de tomar forma en la costa. De ahí salen los colores:  el verde del monte, el azul del agua y la arena.",
    max: 600,
    multiline: true,
  },
  "story.p2": {
    default:
      "Cortamos y cosemos en talleres locales. Cada diseño se produce en tiradas cortas, con telas pesadas y moldería oversize pensada para durar más de una temporada.",
    max: 600,
    multiline: true,
  },
  "story.fact1Title": { default: "Frisa 400g", max: 40 },
  "story.fact1Detail": { default: "Algodón peinado", max: 60 },
  "story.fact2Title": { default: "Moldería oversize", max: 40 },
  "story.fact2Detail": { default: "Del XS al XXL", max: 60 },
  "story.fact3Title": { default: "Ojales metálicos", max: 40 },
  "story.fact3Detail": { default: "Aplicados a mano", max: 60 },

  // Lookbook
  "lookbook.eyebrow": { default: "Lookbook", max: 60 },
  "lookbook.title": { default: "De la torre\na la orilla", max: 80, multiline: true },
  "lookbook.body": {
    default:
      "Las mismas prendas en hormigón porteño y en arena. Deslizá para ver toda la temporada.",
    max: 300,
    multiline: true,
  },

  // Beneficios
  "values.1Title": { default: "Envíos a todo el país", max: 50 },
  "values.1Detail": {
    default: "Despachamos dentro de las 24 h hábiles por correo o moto en CABA.",
    max: 200,
    multiline: true,
  },
  "values.2Title": { default: "Cambios sin vueltas", max: 50 },
  "values.2Detail": {
    default: "Tenés 30 días para cambiar el talle, siempre que la prenda esté sin uso.",
    max: 200,
    multiline: true,
  },
  "values.3Title": { default: "Tiradas cortas", max: 50 },
  "values.3Detail": {
    default: "Producimos poco de cada diseño. Lo que se agota rara vez vuelve.",
    max: 200,
    multiline: true,
  },
  "values.4Title": { default: "Te asesoramos", max: 50 },
  "values.4Detail": {
    default: "Si dudás con el talle, escribinos y lo vemos juntos antes de comprar.",
    max: 200,
    multiline: true,
  },
  "values.whatsappText": {
    default: "¿Alguna duda antes de comprar? Estamos del otro lado.",
    max: 150,
  },
  "values.whatsappCta": { default: "Escribinos por WhatsApp →", max: 40 },

  // Footer
  "footer.eyebrow": { default: "Tucumán · Argentina", max: 60 },
  "footer.claim": { default: "Tiradas cortas,\nhechas para largo usos", max: 80, multiline: true },
  "footer.brand": {
    default:
      "Indumentaria de diseño independiente. Cada prenda sale en cantidades chicas: cuando se agota, se agota.",
    max: 300,
    multiline: true,
  },
  "footer.help1": { default: "Envíos a todo el país", max: 60 },
  "footer.help2": { default: "Cambios dentro de los 30 días", max: 60 },
  "footer.help3": { default: "Pago coordinado por WhatsApp", max: 60 },
  "footer.instagram": { default: "https://instagram.com/monteclub.arg", max: 200, url: true },
  "footer.madeIn": { default: "Made In Tucumán", max: 40 },
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

/**
 * Lo que se guarda de una foto: una foto nueva (url + medidas), otro texto
 * alternativo y/o otro punto de encuadre. Lo que falte sale del default.
 */
export type ImageOverride = {
  url?: string;
  width?: number;
  height?: number;
  alt?: string;
  x?: number;
  y?: number;
};

/** Solo los campos que difieren del default. Es lo que va en la base. */
export type ContentOverrides = {
  text?: Partial<Record<TextField, string>>;
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

/** Combina los cambios (ya validados) con los defaults. */
export function resolveContent(overrides: ContentOverrides): SiteContent {
  const text = {} as Record<TextField, string>;
  for (const field of TEXT_FIELD_KEYS) {
    text[field] = overrides.text?.[field] ?? TEXT_FIELDS[field].default;
  }

  const image = {} as Record<ImageField, ResolvedImage>;
  for (const field of IMAGE_FIELD_KEYS) {
    image[field] = resolveImage(field, overrides.image?.[field]);
  }

  return { text, image };
}

export function resolveImage(field: ImageField, override?: ImageOverride): ResolvedImage {
  const spec: ImageSpec = IMAGE_FIELDS[field];
  const hasUpload = Boolean(override?.url && override.width && override.height);
  return {
    src: hasUpload ? override!.url! : spec.default.src,
    width: hasUpload ? override!.width! : spec.default.src.width,
    height: hasUpload ? override!.height! : spec.default.src.height,
    alt: override?.alt ?? spec.default.alt,
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
