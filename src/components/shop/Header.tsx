"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useI18n } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { LanguageSwitcher } from "@/components/shop/LanguageSwitcher";
import type { CategoryNode } from "@/lib/categories";

export type HeaderCategory = CategoryNode;

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Monte";

export function Header({ categories }: { categories: HeaderCategory[] }) {
  const { itemCount, isHydrated } = useCart();
  const { lang, t } = useI18n();
  const home = localePath(lang, "/");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeCategory = pathname === home ? searchParams.get("categoria") : null;
  const isActive = (category: HeaderCategory) =>
    activeCategory === category.slug || category.children.some((c) => c.slug === activeCategory);

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
              href={home}
              aria-label={t.header.home(siteName)}
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
                href={localePath(lang, "/#catalogo")}
                data-active={pathname === home && !activeCategory}
                className="link-underline text-ink-soft hover:text-ink text-[0.8rem] font-medium tracking-wide transition-colors"
              >
                {t.header.all}
              </Link>
              {categories.map((category) => (
                <div key={category.slug} className="group relative">
                  <Link
                    href={localePath(lang, `/?categoria=${category.slug}#catalogo`)}
                    data-active={isActive(category)}
                    className="link-underline text-ink-soft hover:text-ink text-[0.8rem] font-medium tracking-wide transition-colors"
                  >
                    {category.name}
                  </Link>
                  {/*
                    Subcategorías: se abren con hover o con foco de teclado. El
                    pt-4 hace de puente para que el menú no se cierre al bajar el mouse.
                  */}
                  {category.children.length > 0 && (
                    <div className="pointer-events-none invisible absolute left-1/2 top-full z-10 -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-200 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                      <ul className="border-ink/10 bg-bone/95 min-w-44 border py-2 shadow-sm backdrop-blur-md">
                        {category.children.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={localePath(lang, `/?categoria=${sub.slug}#catalogo`)}
                              className={`hover:bg-bone-dark hover:text-ink block whitespace-nowrap px-5 py-2.5 text-[0.8rem] tracking-wide transition-colors ${
                                activeCategory === sub.slug ? "text-ink font-medium" : "text-ink-soft"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              <Link
                href={localePath(lang, "/#lookbook")}
                className="link-underline text-ink-soft hover:text-ink text-[0.8rem] font-medium tracking-wide transition-colors"
              >
                {t.header.lookbook}
              </Link>
            </nav>
  
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <CartLink
                href={localePath(lang, "/carrito")}
                label={t.header.cart}
                itemCount={isHydrated ? itemCount : 0}
              />
  
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
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
            { href: localePath(lang, "/#catalogo"), label: t.header.all, sub: false },
            ...categories.flatMap((category) => [
              {
                href: localePath(lang, `/?categoria=${category.slug}#catalogo`),
                label: category.name,
                sub: false,
              },
              ...category.children.map((sub) => ({
                href: localePath(lang, `/?categoria=${sub.slug}#catalogo`),
                label: sub.name,
                sub: true,
              })),
            ]),
            { href: localePath(lang, "/#lookbook"), label: t.header.lookbook, sub: false },
            { href: localePath(lang, "/carrito"), label: t.header.cart, sub: false },
          ].map((item, i) => (
            <MobileLink
              key={item.href}
              href={item.href}
              label={item.label}
              sub={item.sub}
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
  sub,
  index,
  open,
  onNavigate,
}: {
  href: string;
  label: string;
  sub: boolean;
  index: number;
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      tabIndex={open ? undefined : -1}
      className={`border-ink/10 headline active:text-accent-deep border-b transition-[opacity,transform] duration-600 ease-out ${
        sub ? "text-ink-soft py-3.5 pl-6 text-2xl" : "text-ink py-5 text-4xl"
      } ${
        open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ transitionDelay: open ? `${80 + index * 55}ms` : "0ms" }}
    >
      {label}
    </Link>
  );
}

function CartLink({ href, label, itemCount }: { href: string; label: string; itemCount: number }) {
  return (
    <Link
      href={href}
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
      <span className="eyebrow hidden sm:inline">{label}</span>
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
