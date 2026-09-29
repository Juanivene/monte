"use client";

import { createContext, useContext } from "react";
import type {
  ImageField,
  ImageOverride,
  SiteContent,
  TextField,
} from "@/lib/site-content/fields";

export type SiteEditorApi = {
  /** Contenido en vivo (borrador + defaults), lo que se ve en la preview. */
  content: SiteContent;
  /** Mostrar los recuadros punteados y botones de edición. */
  showMarks: boolean;
  isTextOverridden: (field: TextField) => boolean;
  isImageOverridden: (field: ImageField) => boolean;
  setText: (field: TextField, value: string) => void;
  resetText: (field: TextField) => void;
  updateImage: (field: ImageField, patch: ImageOverride) => void;
  resetImage: (field: ImageField) => void;
  openImage: (field: ImageField) => void;
};

export const SiteEditorContext = createContext<SiteEditorApi | null>(null);

/**
 * `null` fuera de /admin/preview: ahí los componentes editables renderizan
 * igual que siempre, sin nada de edición.
 */
export function useSiteEditor(): SiteEditorApi | null {
  return useContext(SiteEditorContext);
}
