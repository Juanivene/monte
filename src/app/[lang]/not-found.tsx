import { NotFoundContent } from "@/components/shop/NotFoundContent";

// not-found no recibe params: el título va en los dos idiomas y el contenido
// sale del idioma del layout (NotFoundContent lo lee del LocaleProvider).
export const metadata = { title: "404 · Página no encontrada / Page not found" };

export default function ShopNotFound() {
  return <NotFoundContent />;
}
