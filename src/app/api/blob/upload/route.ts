import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { contentType, size } = (await request.json()) as {
    contentType?: string;
    size?: number;
  };

  if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }
  if (typeof size === "number" && size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen supera los 10MB" }, { status: 400 });
  }

  const key = `${nanoid()}.${EXTENSION_BY_CONTENT_TYPE[contentType]}`;

  try {
    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 60 },
    );

    return NextResponse.json({ uploadUrl, publicUrl: `${R2_PUBLIC_URL}/${key}` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error subiendo imagen" },
      { status: 400 },
    );
  }
}
