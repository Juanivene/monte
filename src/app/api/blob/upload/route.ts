import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
        addRandomSuffix: true,
        maximumSizeInBytes: 10 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {
        // no-op: la URL se guarda en el producto recién cuando se hace submit del form
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error subiendo imagen" },
      { status: 400 },
    );
  }
}
