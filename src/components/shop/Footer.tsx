import Link from "next/link";
import Image from "next/image";
import { shots } from "@/lib/lookbook";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Monte";
const whatsappNumber = process.env.WHATSAPP_NUMBER;

export function Footer({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  return (
    <footer className="bg-ink text-bone mt-24 sm:mt-32">
      {/* Franja editorial: foto ancha + claim */}
      <div className="relative isolate overflow-hidden">
        <Image
          src={shots.trioSenda.src}
          alt={shots.trioSenda.alt}
          placeholder="blur"
          sizes="100vw"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_35%] opacity-35"
        />
        <div className="container-page py-20 text-center sm:py-28">
          <p className="eyebrow text-bone/60">Tucumán · Argentina</p>
          <p className="headline mx-auto mt-5 max-w-3xl text-[10vw] leading-[0.92] sm:text-6xl lg:text-7xl">
            Tiradas cortas,
            <br />
            hechas para usarse
          </p>
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="headline text-2xl">
            {siteName}
            <span className="text-accent">.</span>
          </p>
          <p className="text-bone/55 mt-4 max-w-xs text-sm leading-relaxed">
            Indumentaria de diseño independiente. Cada prenda sale en cantidades
            chicas: cuando se agota, se agota.
          </p>
        </div>

        <FooterColumn title="Tienda">
          <FooterLink href="/">Todo el catálogo</FooterLink>
          {categories.map((category) => (
            <FooterLink
              key={category.slug}
              href={`/?categoria=${category.slug}`}
            >
              {category.name}
            </FooterLink>
          ))}
          <FooterLink href="/#lookbook">Lookbook</FooterLink>
        </FooterColumn>

        <FooterColumn title="Ayuda">
          <FooterLink href="/carrito">Mi carrito</FooterLink>
          <li className="text-bone/55 text-sm">Envíos a todo el país</li>
          <li className="text-bone/55 text-sm">
            Cambios dentro de los 30 días
          </li>
          <li className="text-bone/55 text-sm">Pago coordinado por WhatsApp</li>
        </FooterColumn>

        <FooterColumn title="Seguinos">
          <li>
            <a
              href="https://instagram.com/monteclub.arg"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-bone/55 hover:text-bone text-sm transition-colors"
            >
              Instagram
            </a>
          </li>
          {whatsappNumber && (
            <li>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-bone/55 hover:text-bone text-sm transition-colors"
              >
                WhatsApp
              </a>
            </li>
          )}
        </FooterColumn>
      </div>

      <div className="border-bone/10 border-t">
        <div className="container-page text-bone/40 flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {siteName}. Todos los derechos
            reservados.
          </span>
          <span className="eyebrow text-bone/30">Made In Tucumán</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow text-bone/40">{title}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="link-underline text-bone/55 hover:text-bone text-sm transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

