import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // URL pública del bucket de Cloudflare R2 (pub-xxxx.r2.dev)
        hostname: "*.r2.dev",
      },
      {
        // imágenes viejas subidas a Vercel Blob antes de migrar a R2
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
