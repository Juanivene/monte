export function Footer() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Monte";
  return (
    <footer className="border-t border-neutral-200 py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-neutral-500 sm:px-6">
        © {new Date().getFullYear()} {siteName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
