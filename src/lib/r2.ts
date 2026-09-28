import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
