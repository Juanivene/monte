import { z } from "zod";
import { MOCK_MODE } from "@/lib/mock/config";
import {
  IMAGE_FIELDS,
  TEXT_FIELDS,
  isAllowedImageUrl,
  type ContentOverrides,
  type ImageField,
  type ImageOverride,
  type TextField,
} from "./fields";

function textSchema(field: TextField) {
  const spec: { max: number; url?: boolean } = TEXT_FIELDS[field];
  const base = z
    .string()
    .trim()
    .min(1, "El texto no puede quedar vacío")
    .max(spec.max, `El texto supera los ${spec.max} caracteres`);
  return spec.url
    ? base.refine((value) => /^https:\/\/\S+$/.test(value), "El link tiene que empezar con https://")
    : base;
}

const percent = z.number().min(0).max(100);

const imageOverrideSchema = z
  .object({
    url: z
      .string()
      .max(1000)
      .refine((url) => isAllowedImageUrl(url, MOCK_MODE), "La foto no es de un origen permitido")
      .optional(),
    width: z.number().int().positive().max(20000).optional(),
    height: z.number().int().positive().max(20000).optional(),
    alt: z.string().trim().max(200, "La descripción supera los 200 caracteres").optional(),
    altEn: z.string().trim().max(200, "La descripción supera los 200 caracteres").optional(),
    x: percent.optional(),
    y: percent.optional(),
  })
  .refine((value) => !value.url || (value.width && value.height), "Faltan las medidas de la foto");

const textKeys = Object.keys(TEXT_FIELDS) as TextField[];
const imageKeys = Object.keys(IMAGE_FIELDS) as ImageField[];

const textGroupSchema = z
  .strictObject(Object.fromEntries(textKeys.map((k) => [k, textSchema(k).optional()])))
  .optional();

const overridesSchema = z.object({
  text: textGroupSchema,
  textEn: textGroupSchema,
  image: z
    .strictObject(Object.fromEntries(imageKeys.map((k) => [k, imageOverrideSchema.optional()])))
    .optional(),
});

/** Validación estricta, para guardar: si algo no cierra, se rechaza con un mensaje. */
export function validateOverrides(
  input: unknown,
): { ok: true; data: ContentOverrides } | { ok: false; error: string } {
  const parsed = overridesSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[1];
    const label =
      typeof field === "string" && field in IMAGE_FIELDS
        ? `${IMAGE_FIELDS[field as ImageField].label}: `
        : issue?.path[0] === "textEn"
          ? "Inglés: "
          : "";
    return { ok: false, error: `${label}${issue?.message ?? "Contenido inválido"}` };
  }
  return { ok: true, data: parsed.data as ContentOverrides };
}

function parseTextGroup(raw: unknown): Partial<Record<TextField, string>> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  let result: Partial<Record<TextField, string>> | undefined;
  for (const [key, value] of Object.entries(raw)) {
    if (!(key in TEXT_FIELDS)) continue;
    const parsed = textSchema(key as TextField).safeParse(value);
    if (parsed.success) (result ??= {})[key as TextField] = parsed.data;
  }
  return result;
}

/**
 * Lectura tolerante, para mostrar: se queda con cada campo válido y descarta
 * el resto (que así vuelve a su default). Nunca tira error.
 */
export function parseOverrides(raw: unknown): ContentOverrides {
  if (!raw || typeof raw !== "object") return {};
  const { text, textEn, image } = raw as { text?: unknown; textEn?: unknown; image?: unknown };
  const result: ContentOverrides = {};

  const es = parseTextGroup(text);
  if (es) result.text = es;
  const en = parseTextGroup(textEn);
  if (en) result.textEn = en;

  if (image && typeof image === "object") {
    for (const [key, value] of Object.entries(image)) {
      if (!(key in IMAGE_FIELDS)) continue;
      const parsed = imageOverrideSchema.safeParse(value);
      if (parsed.success) (result.image ??= {})[key as ImageField] = parsed.data as ImageOverride;
    }
  }

  return result;
}
