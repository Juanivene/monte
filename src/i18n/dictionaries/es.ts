/**
 * Textos fijos de la tienda en español (la versión original de la marca).
 * La versión en inglés (en.ts) tiene que tener exactamente la misma forma:
 * TypeScript avisa si falta una clave.
 *
 * Lo que se edita desde el admin (textos del home, productos, categorías,
 * leyendas) no está acá: vive en la base, con su propia versión en inglés.
 */
const es = {
  meta: {
    tagline: "Indumentaria de diseño independiente",
    description:
      "Indumentaria de diseño independiente. Buzos, remeras y accesorios hechos en Tucumán, en tiradas cortas.",
    notFound: "Página no encontrada",
    productNotFound: "Producto no encontrado",
    orderReceived: "Pedido recibido",
    cart: "Carrito",
    checkout: "Finalizar pedido",
  },
  header: {
    all: "Todo",
    lookbook: "Lookbook",
    cart: "Carrito",
    home: (site: string) => `${site} — inicio`,
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    switchTo: "English",
    switchToShort: "EN",
    switchLabel: "Ver el sitio en inglés",
  },
  theme: {
    toLight: "Cambiar a modo claro",
    toDark: "Cambiar a modo oscuro",
  },
  catalog: {
    eyebrow: "Catálogo",
    allTitle: "Todo el Drop",
    sizesNote:
      "Talles del XS al XXL. Los stocks se actualizan en vivo: si un talle no aparece, es porque ya voló.",
    emptyCategoryTitle: (category: string) => `Nada en ${category} por ahora`,
    emptyCategoryBody: "Probá con otra categoría o mirá todo el catálogo.",
    emptyTitle: "Se viene la primera",
    emptyBody:
      "Estamos terminando de cargar la colección. Mientras tanto, date una vuelta por el lookbook.",
    items: (n: number) => `${n} ${n === 1 ? "prenda" : "prendas"}`,
    showing: (visible: number, total: number) => `Mostrando ${visible} de ${total}`,
    showMore: "Ver más",
    showAll: "Ver todos los productos",
  },
  card: {
    noImage: "Sin imagen",
    soldOut: "Agotado",
    lastUnits: "Últimas unidades",
    noSizes: "Sin talles",
    view: "Ver →",
  },
  product: {
    breadcrumb: "Migas de pan",
    home: "Inicio",
    finalPrice: "Precio final. El envío se coordina aparte.",
    color: "Color",
    otherColor: "Ver otro color",
    description: "Descripción",
    shippingTitle: "Envíos",
    shippingBody:
      "Despachamos dentro de las 24 h hábiles. Envíos a todo el país por correo y entrega en moto dentro de CABA. El costo se coordina por WhatsApp junto con el pago.",
    returnsTitle: "Cambios y devoluciones",
    returnsBody:
      "Tenés 30 días desde que recibís el pedido para cambiar el talle, siempre que la prenda esté sin uso y con su etiqueta.",
    sizeQuestion: "¿Dudas con el talle? Consultanos →",
    keepBrowsing: "Seguí mirando",
    viewAll: "Ver todo →",
    whatsappQuestion: (product: string) => `¡Hola! Quería consultar por "${product}".`,
    prevImage: "Imagen anterior",
    nextImage: "Imagen siguiente",
    viewImage: (n: number) => `Ver imagen ${n}`,
  },
  size: {
    label: "Talle",
    withSize: (size: string) => `Talle ${size}`,
  },
  addToCart: {
    added: "Agregado al carrito",
    viewCart: "Ver carrito",
    soldOutTitle: "Agotado",
    soldOutBody:
      "Esta prenda salió en tirada corta y ya no quedan unidades. Escribinos si querés que te avisemos cuando vuelva.",
    oversize: "Moldería oversize",
    chooseSize: "Elegí un talle para continuar.",
    unitsLeft: (n: number, size: string) =>
      `Quedan ${n} ${n === 1 ? "unidad" : "unidades"} en ${size}.`,
    available: (size: string) => `Disponible en ${size}.`,
    add: "Agregar al carrito",
  },
  cart: {
    emptyTitle: "Tu carrito está vacío",
    emptyBody: "Todavía no agregaste nada. Date una vuelta por la colección: sale poco de cada diseño.",
    viewCollection: "Ver colección",
    title: "Tu carrito",
    removed: "Lo sacamos del carrito",
    remove: "Quitar",
    removeLabel: (product: string, size: string) => `Quitar ${product} talle ${size}`,
    decrease: "Restar uno",
    increase: "Sumar uno",
    summary: "Resumen",
    subtotal: "Subtotal",
    shipping: "Envío",
    shippingTbd: "A coordinar",
    total: "Total",
    checkout: "Finalizar pedido",
    keepShopping: "← Seguir comprando",
  },
  checkout: {
    emptyBody: "Agregá algo antes de completar el pedido.",
    step: "Paso 2 de 2",
    title: "Finalizar pedido",
    intro:
      "Dejanos tus datos y el pedido queda reservado. El pago y el envío los coordinamos después, por WhatsApp.",
    buyerSection: "Tus datos",
    shippingSection: "Dirección de envío",
    paymentSection: "Método de pago",
    name: "Nombre y apellido",
    email: "Email",
    phone: "Teléfono",
    street: "Calle y número",
    city: "Localidad",
    state: "Provincia",
    postalCode: "Código postal",
    country: "País",
    defaultCountry: "Argentina",
    notes: "Notas para la entrega (opcional)",
    notesPlaceholder: "Timbre, horarios, referencias…",
    transfer: "Transferencia",
    card: "Tarjeta",
    transferHint: "Coordinamos el pago y el envío después, por WhatsApp.",
    cardHint: "Pagás ahora con tarjeta de crédito o débito, vía PayPal.",
    sending: "Enviando…",
    confirm: "Confirmar pedido",
    continueToPayment: "Continuar al pago",
    yourOrder: "Tu pedido",
    qtyAndSize: (qty: number, size: string) => `${qty} × Talle ${size}`,
    transferFootnote:
      "No se procesa ningún pago acá. Después de confirmar, coordinamos el pago y el envío por WhatsApp.",
    cardFootnote: "El pago se procesa de forma segura a través de PayPal.",
  },
  /** Mensajes de validación y errores que puede ver el comprador. */
  errors: {
    buyerName: "Ingresá tu nombre completo",
    buyerEmail: "Ingresá un email válido",
    buyerPhone: "Ingresá un teléfono de contacto",
    shippingStreet: "Ingresá la calle y número",
    shippingCity: "Ingresá la localidad",
    shippingCountry: "Ingresá el país",
    emptyCart: "El carrito está vacío",
    invalid: "Revisá los datos del formulario",
    productUnavailable: "Uno de los productos ya no está disponible",
    notEnoughStock: (product: string, size: string) =>
      `No hay suficiente stock de "${product}" en talle ${size}`,
    paypalStart: "No se pudo iniciar el pago",
    paypalConfirm: "No se pudo confirmar el pago",
    paypalGeneric: "Ocurrió un error con PayPal. Probá de nuevo.",
    paypalDeclined: "El pago fue rechazado. Probá con otra tarjeta o medio de pago.",
    paypalPending: (code: string) =>
      `PayPal dejó tu pago pendiente de revisión. No vuelvas a pagar: escribinos con este código y lo resolvemos: ${code}`,
    paypalAmount: (code: string) =>
      `No pudimos validar el monto del pago. Escribinos con este código: ${code}`,
    paypalNotConfirmed: "El pago no se pudo confirmar",
    mockPaying: "Procesando pago simulado...",
    mockPay: "Pagar con PayPal (modo mock)",
  },
  order: {
    number: (ref: string) => `Pedido #${ref}`,
    thanks: (name: string) => `¡Gracias, ${name}!`,
    paidBody:
      "Tu pago fue confirmado y te mandamos un mail con el resumen. Ya arrancamos a preparar tu pedido.",
    reservedBody:
      "Ya tenemos tu pedido reservado y te mandamos un mail con el resumen. Ahora solo falta coordinar el pago y el envío.",
    yourOrder: "Tu pedido",
    shipTo: "Envío a",
    back: "← Volver a la tienda",
    lastStep: "Último paso",
    whatsappBody:
      "Abrimos WhatsApp con el resumen listo para enviar. Si no se abrió solo, tocá acá.",
    whatsappCta: "Continuar por WhatsApp",
  },
  notFound: {
    eyebrow: "Error 404",
    title: "Te fuiste\nal monte",
    body:
      "Esta página no existe, o la prenda que buscabas ya no está disponible. Nuestras tiradas son cortas: cuando algo se agota, sale del catálogo.",
    cta: "Ver colección",
    lookbook: "Ir al lookbook",
  },
  footer: {
    shop: "Tienda",
    help: "Ayuda",
    follow: "Seguinos",
    allCatalog: "Todo el catálogo",
    lookbook: "Lookbook",
    myCart: "Mi carrito",
    rights: (year: number, site: string) => `© ${year} ${site}. Todos los derechos reservados.`,
  },
  /** Mensajes que el comprador le manda a la tienda por WhatsApp. */
  whatsapp: {
    contact: "¡Hola! Estaba mirando la tienda y quería hacerles una consulta.",
    orderIntro: (name: string, ref: string) => `Hola! Soy ${name}, acabo de hacer el pedido #${ref}:`,
    orderItem: (qty: number, product: string, size: string, price: string) =>
      `• ${qty}x ${product} - Talle ${size} - ${price} c/u`,
    orderTotal: (total: string) => `Total: ${total}`,
    orderOutro: "Quería coordinar el pago y el envío. ¡Gracias!",
  },
  emails: {
    confirmationSubject: (ref: string) => `Recibimos tu pedido #${ref}`,
    confirmationTitle: (name: string) => `¡Gracias por tu pedido, ${name}!`,
    confirmationBody: (ref: string) =>
      `Recibimos tu pedido #${ref}. Te vamos a contactar por WhatsApp para coordinar el pago y el envío.`,
    shipTo: "Envío a:",
    itemLine: (qty: number, product: string, size: string) => `${qty}x ${product} — Talle ${size}`,
    total: "Total",
    questions: "Si tenés alguna duda, respondé este email o escribinos por WhatsApp.",
    hello: (name: string) => `Hola, ${name}`,
    orderRef: (ref: string) => `Pedido #${ref}.`,
    status: {
      CONFIRMADO: {
        subject: "Tu pedido fue confirmado",
        message: "Confirmamos tu pedido y ya lo estamos preparando.",
      },
      ENVIADO: {
        subject: "Tu pedido está en camino",
        message:
          "Despachamos tu pedido. Te vamos a avisar por WhatsApp cualquier novedad del envío.",
      },
      ENTREGADO: {
        subject: "Tu pedido fue entregado",
        message: "Tu pedido figura como entregado. ¡Esperamos que lo disfrutes!",
      },
      CANCELADO: {
        subject: "Tu pedido fue cancelado",
        message: "Tu pedido fue cancelado. Si creés que es un error, escribinos por WhatsApp.",
      },
    },
  },
};

export default es;
export type Dictionary = typeof es;
