import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createUploadUrl } from "@/lib/r2";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { contentType, size, folder } = (await request.json()) as {
    contentType?: string;
    size?: number;
    folder?: string;
  };

  const extension = contentType ? EXTENSIONS[contentType] : undefined;
  if (!extension) {
    return NextResponse.json({ error: "Formato de imagen no permitido" }, { status: 400 });
  }
  if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera los 10 MB" }, { status: 400 });
  }

  try {
    // Las fotos del home (editor de /admin/preview) van aparte de las de productos.
    const prefix = folder === "site" ? "site" : "products";
    const key = `${prefix}/${randomUUID()}.${extension}`;
    return NextResponse.json(await createUploadUrl(key, contentType!, size));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error subiendo imagen" },
      { status: 500 },
    );
  }
}
