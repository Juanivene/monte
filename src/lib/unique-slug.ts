import "server-only";
import { slugify } from "./slug";

type SlugChecker = (slug: string) => Promise<boolean>;

/** Genera un slug único agregando -2, -3, etc. si hace falta. */
export async function generateUniqueSlug(name: string, exists: SlugChecker) {
  const base = slugify(name) || "producto";
  let candidate = base;
  let attempt = 1;
  while (await exists(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}
