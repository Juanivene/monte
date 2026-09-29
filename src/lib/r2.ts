import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MOCK_MODE } from "@/lib/mock/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      // Sin esto el SDK mete `x-amz-checksum-crc32` en la URL firmada, calculado
      // sobre un body vacío (el archivo todavía no existe al firmar), y R2
      // rechaza el PUT del navegador porque no coincide con la imagen real.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

// URL firmada para que el navegador suba el archivo directo a R2 con un PUT.
// Content-Type y Content-Length quedan firmados: si el navegador manda otros, R2 rechaza la subida.
export async function createUploadUrl(key: string, contentType: string, size: number) {
  const command = new PutObjectCommand({
    Bucket: requireEnv("R2_BUCKET_NAME"),
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });
  const uploadUrl = await getSignedUrl(getClient(), command, {
    expiresIn: 300,
    signableHeaders: new Set(["content-type", "content-length"]),
  });
  const publicUrl = `${requireEnv("R2_PUBLIC_URL").replace(/\/+$/, "")}/${key}`;
  return { uploadUrl, publicUrl };
}

/**
 * Key dentro del bucket de una URL pública de R2, o null si la URL no es de
 * este bucket (fotos por defecto del código, imágenes viejas de Vercel Blob…).
 */
function keyFromPublicUrl(url: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!base || !url.startsWith(`${base}/`)) return null;
  return decodeURIComponent(url.slice(base.length + 1)) || null;
}

/**
 * Borra del bucket las imágenes de esas URLs; las que no son de R2 se ignoran.
 * Nunca tira error: si R2 falla queda un archivo huérfano, que es preferible a
 * romper una acción que ya se guardó en la base.
 */
export async function deleteR2Images(urls: Iterable<string>): Promise<void> {
  if (MOCK_MODE) return;
  const keys = [...new Set(urls)].map(keyFromPublicUrl).filter((k): k is string => k !== null);
  if (keys.length === 0) return;

  try {
    // DeleteObjects acepta hasta 1000 keys por pedido.
    for (let i = 0; i < keys.length; i += 1000) {
      const result = await getClient().send(
        new DeleteObjectsCommand({
          Bucket: requireEnv("R2_BUCKET_NAME"),
          Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
        }),
      );
      if (result.Errors?.length) console.error("[r2] no se pudieron borrar", result.Errors);
    }
  } catch (error) {
    console.error("[r2] error borrando imágenes", keys, error);
  }
}
