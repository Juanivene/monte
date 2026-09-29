//todo remover
import { MOCK_MODE } from "@/lib/mock/config";

export type UploadFolder = "products" | "site";

// Pide al server una URL firmada y sube el archivo directo a R2 desde el navegador.
async function uploadToR2(file: File, folder: UploadFolder): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size, folder }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error subiendo la imagen");

  const put = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error("Error subiendo la imagen a R2");

  return data.publicUrl;
}

/** Sube una imagen y devuelve su URL pública. En modo mock no sale nada a la red. */
export async function uploadImage(file: File, folder: UploadFolder = "products"): Promise<string> {
  // Sin R2: preview local del archivo.
  if (MOCK_MODE) return URL.createObjectURL(file);
  return uploadToR2(file, folder);
}
