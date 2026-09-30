"use client";

import { useEffect, useRef, useState } from "react";
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

/** Estado del panel de subcategorías de escritorio: se abre con hover o con foco de teclado. */
const dropdownOpen = "group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100";
const dropdownPanelOpen =
  "group-hover:translate-y-0 group-hover:scale-100 group-focus-within:translate-y-0 group-focus-within:scale-100";
const dropdownItemOpen =
  "group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100";

/** Tope del escalonado de la entrada del menú móvil: con muchas categorías no se hace eterno. */
const MAX_STAGGER = 8;

export function Header({ categories }: { categories: HeaderCategory[] }) {
  const { itemCount, isHydrated } = useCart();
  const { lang, t } = useI18n();
  const home = localePath(lang, "/");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // categoría principal con las subcategorías desplegadas en el menú móvil (una a la vez)
  const [expanded, setExpanded] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const activeCategory = pathname === home ? searchParams.get("categoria") : null;
  const isActive = (category: HeaderCategory) =>
    activeCategory === category.slug || category.children.some((c) => c.slug === activeCategory);

  function openMenu() {
    // al abrir, ya se ve desplegada la categoría en la que estás
    setExpanded(categories.find(isActive)?.slug ?? null);
    setMenuOpen(true);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // El menú móvil tapa toda la pantalla: mientras está abierto no se scrollea el
  // fondo, Escape lo cierra (devolviendo el foco al botón) y si la pantalla pasa
  // a ser de escritorio (rotar la tablet) se cierra solo.
  useEffect(() => {
    if (!menuOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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
              onClick={closeMenu}
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
              {categories.map((category) => {
                const hasSubs = category.children.length > 0;
                return (
                  <div key={category.slug} className="group relative">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={localePath(lang, `/?categoria=${category.slug}#catalogo`)}
                        data-active={isActive(category)}
                        className="link-underline text-ink-soft hover:text-ink text-[0.8rem] font-medium tracking-wide transition-colors"
                      >
                        {category.name}
                      </Link>
                      {hasSubs && (
                        <Chevron className="text-ink-muted h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180" />
                      )}
                    </div>

                    {/*
                      Subcategorías. El pt-5 hace de puente entre el link y el
                      panel para que no se cierre al bajar el mouse. El panel
                      entra con fade + leve subida, y los items con un escalonado.
                    */}
                    {hasSubs && (
                      <div
                        className={`pointer-events-none invisible absolute left-1/2 top-full z-10 -translate-x-1/2 pt-5 opacity-0 transition-[opacity,visibility] duration-200 group-hover:pointer-events-auto group-focus-within:pointer-events-auto ${dropdownOpen}`}
                      >
                        <div
                          className={`border-ink/10 bg-bone/95 relative min-w-56 origin-top -translate-y-2 scale-[0.97] border shadow-[0_18px_40px_-18px_rgb(0_0_0/0.35)] backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${dropdownPanelOpen}`}
                        >
                          <span
                            aria-hidden="true"
                            className="bg-accent absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100"
                          />
                          <ul className="py-2">
                            {category.children.map((sub, i) => (
                              <li
                                key={sub.slug}
                                style={{ "--i": i } as React.CSSProperties}
                                className={`-translate-x-2 opacity-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none group-hover:[transition-delay:calc(var(--i)*45ms_+_70ms)] group-focus-within:[transition-delay:calc(var(--i)*45ms_+_70ms)] ${dropdownItemOpen}`}
                              >
                                <Link
                                  href={localePath(lang, `/?categoria=${sub.slug}#catalogo`)}
                                  aria-current={activeCategory === sub.slug ? "page" : undefined}
                                  className="group/item hover:bg-bone-dark text-ink-soft hover:text-ink aria-[current=page]:text-ink flex items-center justify-between gap-6 px-5 py-2.5 text-[0.8rem] tracking-wide whitespace-nowrap transition-colors"
                                >
                                  <span className="transition-transform duration-300 group-hover/item:translate-x-1">
                                    {sub.name}
                                  </span>
                                  <span
                                    aria-hidden="true"
                                    className={`bg-accent h-1 w-1 rounded-full transition-opacity ${
                                      activeCategory === sub.slug ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

              {/* 44px: el área de toque mínima cómoda en el teléfono */}
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => (menuOpen ? closeMenu() : openMenu())}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
                className="border-ink/15 hover:border-ink flex h-11 w-11 touch-manipulation items-center justify-center border transition-colors lg:hidden"
              >
                <span className="relative block h-3 w-[18px]">
                  <span
                    className={`bg-ink absolute left-0 block h-px w-full transition-transform duration-300 ease-out ${
                      menuOpen ? "top-1.5 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`bg-ink absolute left-0 top-1.5 block h-px w-full transition-[opacity,transform] duration-200 ${
                      menuOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                    }`}
                  />
                  <span
                    className={`bg-ink absolute left-0 block h-px w-full transition-transform duration-300 ease-out ${
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
        recortado a la altura de la barra. `inert` cuando está cerrado: nada de
        adentro recibe foco ni lo lee un lector de pantalla.
      */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`bg-bone fixed inset-0 z-40 h-dvh overflow-y-auto overscroll-contain transition-[opacity,transform] duration-500 motion-reduce:transition-none lg:hidden ${
          menuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav className="container-page flex flex-col pb-[max(4rem,env(safe-area-inset-bottom))] pt-28">
          <MobileRow index={0} open={menuOpen}>
            <MobileLink
              href={localePath(lang, "/#catalogo")}
              label={t.header.all}
              onNavigate={closeMenu}
            />
          </MobileRow>

          {categories.map((category, i) => {
            const hasSubs = category.children.length > 0;
            const isExpanded = expanded === category.slug;
            return (
              <MobileRow key={category.slug} index={i + 1} open={menuOpen}>
                {hasSubs ? (
                  <div className="border-ink/10 border-b">
                    <div className="flex items-stretch">
                      <MobileLink
                        href={localePath(lang, `/?categoria=${category.slug}#catalogo`)}
                        label={category.name}
                        onNavigate={closeMenu}
                        bare
                      />
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : category.slug)}
                        aria-expanded={isExpanded}
                        aria-controls={`mobile-sub-${category.slug}`}
                        aria-label={t.header.subcategories(category.name)}
                        className="text-ink-muted active:text-ink flex w-16 shrink-0 touch-manipulation items-center justify-center"
                      >
                        <Chevron
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                    {/* grid-rows 0fr → 1fr: anima la altura sin medirla */}
                    <div
                      id={`mobile-sub-${category.slug}`}
                      className={`grid transition-[grid-template-rows] duration-400 ease-out motion-reduce:transition-none ${
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <ul
                        inert={!isExpanded}
                        className={`border-ink/15 ml-1 overflow-hidden border-l pl-5 transition-opacity duration-300 ${
                          isExpanded ? "mb-4 opacity-100" : "opacity-0"
                        }`}
                      >
                        {category.children.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={localePath(lang, `/?categoria=${sub.slug}#catalogo`)}
                              onClick={closeMenu}
                              aria-current={activeCategory === sub.slug ? "page" : undefined}
                              className="headline text-ink-soft active:text-accent-deep aria-[current=page]:text-ink block py-3 text-2xl"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <MobileLink
                    href={localePath(lang, `/?categoria=${category.slug}#catalogo`)}
                    label={category.name}
                    onNavigate={closeMenu}
                  />
                )}
              </MobileRow>
            );
          })}

          <MobileRow index={categories.length + 1} open={menuOpen}>
            <MobileLink
              href={localePath(lang, "/#lookbook")}
              label={t.header.lookbook}
              onNavigate={closeMenu}
            />
          </MobileRow>
          <MobileRow index={categories.length + 2} open={menuOpen}>
            <MobileLink
              href={localePath(lang, "/carrito")}
              label={t.header.cart}
              onNavigate={closeMenu}
            />
          </MobileRow>
        </nav>
      </div>
    </>
  );
}

/** Entrada escalonada de cada fila del menú móvil. */
function MobileRow({
  index,
  open,
  children,
}: {
  index: number;
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`transition-[opacity,transform] duration-600 ease-out motion-reduce:transition-none ${
        open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ transitionDelay: open ? `${80 + Math.min(index, MAX_STAGGER) * 50}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function MobileLink({
  href,
  label,
  onNavigate,
  bare = false,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
  /** dentro de una fila con acordeón: sin borde propio, lo pone la fila */
  bare?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`headline text-ink active:text-accent-deep block py-5 text-4xl ${
        bare ? "flex-1" : "border-ink/10 border-b"
      }`}
    >
      {label}
    </Link>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
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
