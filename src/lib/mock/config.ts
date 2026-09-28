/**
 * Modo mock: activa una base de datos en memoria (seedeada) y simula PayPal /
 * subida de imágenes, para poder correr `next dev` y tocar el frontend sin
 * DATABASE_URL, BLOB_READ_WRITE_TOKEN, RESEND_API_KEY ni credenciales de PayPal.
 *
 * NEXT_PUBLIC_* porque se lee tanto en server (páginas, server actions) como
 * en componentes "use client" (el botón de PayPal, el uploader de imágenes).
 */
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export const MOCK_ADMIN_EMAIL = "admin@mock.dev";
export const MOCK_ADMIN_PASSWORD = "mock1234";
