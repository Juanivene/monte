import Link from "next/link";
import Image from "next/image";
import { shots } from "@/lib/lookbook";
import { Button } from "@/components/ui/Button";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Monte";

/**
 * `bare` es para el 404 de raíz: esa ruta cae fuera del grupo (shop), así que
 * no hereda header ni footer y necesita al menos una vuelta a la tienda.
 */
export function NotFoundContent({ bare = false }: { bare?: boolean }) {
  return (
    <>
      {bare && (
        <div className="border-ink/10 border-b">
          <div className="container-page py-5">
            <Link href="/" className="headline text-ink text-xl leading-none sm:text-2xl">
              {siteName}
              <span className="text-accent">.</span>
            </Link>
          </div>
        </div>
      )}
      <NotFoundBody />
    </>
  );
}

function NotFoundBody() {
  return (
    <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
      <div>
        <p className="eyebrow text-ink-muted">Error 404</p>
        <h1 className="headline mt-4 text-5xl sm:text-6xl lg:text-7xl">
          Te fuiste
          <br />
          al monte
        </h1>
        <p className="text-ink-soft mt-6 max-w-md text-[0.95rem] leading-relaxed">
          Esta página no existe, o la prenda que buscabas ya no está disponible. Nuestras tiradas
          son cortas: cuando algo se agota, sale del catálogo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/">
            <Button size="lg">Ver colección</Button>
          </Link>
          <Link href="/#lookbook">
            <Button size="lg" variant="secondary">
              Ir al lookbook
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-bone-dark relative aspect-4/5 overflow-hidden">
        <Image
          src={shots.buzoTealPasaje.src}
          alt={shots.buzoTealPasaje.alt}
          placeholder="blur"
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
