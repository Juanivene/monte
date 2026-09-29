"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LogoutButton } from "./LogoutButton";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      {children}
    </svg>
  );
}

const icons = {
  home: (
    <Icon>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </Icon>
  ),
  orders: (
    <Icon>
      <path d="M6 2h12a1 1 0 0 1 1 1v18l-3-2-2 2-2-2-2 2-2-2-3 2V3a1 1 0 0 1 1-1Z" />
      <path d="M9 7h6M9 11h6M9 15h4" />
    </Icon>
  ),
  products: (
    <Icon>
      <path d="M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3a4 4 0 0 1-8 0Z" />
    </Icon>
  ),
  categories: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  ),
  legends: (
    <Icon>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </Icon>
  ),
  settings: (
    <Icon>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Icon>
  ),
  more: (
    <Icon>
      <circle cx="5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="19" cy="12" r="1.3" />
    </Icon>
  ),
};

const mainItems: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: icons.home },
  { href: "/admin/pedidos", label: "Pedidos", icon: icons.orders },
  { href: "/admin/productos", label: "Productos", icon: icons.products },
  { href: "/admin/categorias", label: "Categorías", icon: icons.categories },
];

const moreItems: NavItem[] = [
  { href: "/admin/leyendas", label: "Leyendas", icon: icons.legends },
  { href: "/admin/ajustes", label: "Ajustes", icon: icons.settings },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * Navegación del admin con dos formas: barra superior con links desde `sm`,
 * y en teléfono una barra de pestañas fija abajo (al alcance del pulgar) más
 * una hoja "Más" con las secciones que se usan poco y la sesión.
 */
export function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreItems.some((item) => isActive(pathname, item.href));

  // Al navegar desde la hoja, se cierra sola.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMoreOpen(false);
  }

  useEffect(() => {
    if (!moreOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <Link href="/admin" className="text-sm font-semibold tracking-wide text-neutral-900 sm:hidden">
            MONTE <span className="font-normal text-neutral-400">admin</span>
          </Link>
          <nav className="hidden min-w-0 gap-1 overflow-x-auto sm:flex">
            {[...mainItems, ...moreItems].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  isActive(pathname, item.href)
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {item.href === "/admin" ? "Dashboard" : item.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <span className="hidden text-sm text-neutral-500 lg:inline">{email}</span>
            <LogoutButton className="hidden px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 sm:inline-flex" />
          </div>
        </div>
      </header>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <div className="grid grid-cols-5">
          {mainItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  active ? "text-neutral-900" : "text-neutral-400 active:text-neutral-700"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              moreActive ? "text-neutral-900" : "text-neutral-400 active:text-neutral-700"
            }`}
          >
            {icons.more}
            Más
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog" aria-modal="true" aria-label="Más opciones">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300" />
            {email && <p className="mb-2 truncate px-3 text-xs text-neutral-500">{email}</p>}
            <ul className="space-y-1">
              {moreItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium ${
                        active ? "bg-neutral-100 text-neutral-900" : "text-neutral-700 active:bg-neutral-100"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 border-t border-neutral-200 pt-3">
              <LogoutButton className="flex min-h-12 w-full items-center px-3 text-base text-red-600 active:bg-red-50" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
