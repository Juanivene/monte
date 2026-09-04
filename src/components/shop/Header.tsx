"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export type HeaderCategory = { slug: string; name: string };

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Monte";

export function Header({ categories }: { categories: HeaderCategory[] }) {
  const { itemCount, isHydrated } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeCategory = pathname === "/" ? searchParams.get("categoria") : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // El menú móvil tapa toda la pantalla: mientras está abierto no se scrollea el
  // fondo, y Escape lo cierra.
  useEffect(() => {
    if (!menuOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || menuOpen
            ? "border-ink/10 bg-bone/85 border-b backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="container-page relative z-10">
          <div
            className={`flex items-center justify-between transition-[padding] duration-500 ${
              scrolled ? "py-3.5" : "py-5 sm:py-7"
            }`}
          >
            {/* Wordmark */}
            <Link
              href="/"
              aria-label={`${siteName} — inicio`}
              className="headline text-ink text-xl leading-none sm:text-2xl"
            >
              {siteName}
              <span className="text-accent">.</span>
            </Link>
  
            {/* Nav escritorio */}
            <nav className="hidden items-center gap-8 lg:flex">
              {/*
                #catalogo: sin el hash, el Link navega a "/" y Next scrollea
                al top de la página (el Hero) en vez de quedarse en la
                sección de productos, que es donde tiene sentido aterrizar
                al elegir una categoría.
              */}
              <Link
                href="/#catalogo"
                data-active={pathname === "/" && !activeCategory}
                className="link-underline text-ink-soft hover:text-ink text-[0.8rem] font-medium tracking-wide transition-colors"
              >
                Todo
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/?categoria=${category.slug}#catalogo`}
                  data-active={activeCategory === category.slug}
                  className="link-underline text-ink-soft hover:text-ink text-[0.8rem] font-medium tracking-wide transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/#lookbook"
                className="link-underline text-ink-soft hover:text-ink text-[0.8rem] font-medium tracking-wide transition-colors"
              >
                Lookbook
              </Link>
            </nav>
  
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <CartLink itemCount={isHydrated ? itemCount : 0} />
  
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                className="border-ink/15 hover:border-ink flex h-10 w-10 items-center justify-center border transition-colors lg:hidden"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={`bg-ink absolute left-0 block h-px w-full transition-transform duration-300 ${
                      menuOpen ? "top-1.5 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`bg-ink absolute left-0 block h-px w-full transition-transform duration-300 ${
                      menuOpen ? "top-1.5 -rotate-45" : "top-3"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/*
        El panel vive fuera del <header>: cuando el header aplica backdrop-blur
        pasa a ser el bloque contenedor de sus hijos `fixed` y el menú quedaría
        recortado a la altura de la barra.
      */}
      <div
        className={`bg-bone fixed inset-0 z-40 overflow-y-auto transition-[opacity,transform] duration-500 lg:hidden ${
          menuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="container-page flex flex-col gap-1 pb-16 pt-28">
          {[
            { href: "/#catalogo", label: "Todo" },
            ...categories.map((category) => ({
              href: `/?categoria=${category.slug}#catalogo`,
              label: category.name,
            })),
            { href: "/#lookbook", label: "Lookbook" },
            { href: "/carrito", label: "Carrito" },
          ].map((item, i) => (
            <MobileLink
              key={item.href}
              href={item.href}
              label={item.label}
              index={i}
              open={menuOpen}
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      </div>
    </>
  );
}

function MobileLink({
  href,
  label,
  index,
  open,
  onNavigate,
}: {
  href: string;
  label: string;
  index: number;
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      tabIndex={open ? undefined : -1}
      className={`border-ink/10 headline text-ink active:text-accent-deep border-b py-5 text-4xl transition-[opacity,transform] duration-600 ease-out ${
        open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ transitionDelay: open ? `${80 + index * 55}ms` : "0ms" }}
    >
      {label}
    </Link>
  );
}

function CartLink({ itemCount }: { itemCount: number }) {
  return (
    <Link
      href="/carrito"
      className="group border-ink/15 hover:border-ink relative flex items-center gap-2.5 border px-3.5 py-2.5 transition-colors sm:px-4"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M4 7h16l-1.2 12.2a1 1 0 0 1-1 .9H6.2a1 1 0 0 1-1-.9L4 7Z" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
      </svg>
      <span className="eyebrow hidden sm:inline">Carrito</span>
      {/*
        Renderizado condicional, no solo escalado a 0: con scale-0 el span
        seguía ocupando su ancho + el gap del flex aunque fuera invisible,
        lo que corría el ícono del centro del botón y lo hacía más ancho de
        lo necesario en mobile (sin el texto "Carrito" al lado).
      */}
      {itemCount > 0 && (
        <span className="bg-ink text-bone animate-pop flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold tabular-nums">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
