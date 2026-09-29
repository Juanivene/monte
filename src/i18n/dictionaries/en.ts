import type { Dictionary } from "./es";

/**
 * Textos fijos de la tienda en inglés. Borrador para que lo revise una
 * persona antes de lanzar: está todo acá, en un solo archivo, con la misma
 * forma que es.ts (TypeScript avisa si falta o sobra una clave).
 */
const en: Dictionary = {
  meta: {
    tagline: "Independent design clothing",
    description:
      "Independent design clothing. Hoodies, tees and accessories made in Tucumán, Argentina, in small batches.",
    notFound: "Page not found",
    productNotFound: "Product not found",
    orderReceived: "Order received",
    cart: "Cart",
    checkout: "Checkout",
  },
  header: {
    all: "All",
    lookbook: "Lookbook",
    cart: "Cart",
    home: (site) => `${site} — home`,
    openMenu: "Open menu",
    closeMenu: "Close menu",
    languageLabel: "Language",
    switchLabel: "Ver el sitio en español",
  },
  theme: {
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
  catalog: {
    eyebrow: "Catalog",
    allTitle: "The Full Drop",
    sizesNote:
      "Sizes XS to XXL. Stock updates live: if a size isn't listed, it's already gone.",
    emptyCategoryTitle: (category) => `Nothing in ${category} yet`,
    emptyCategoryBody: "Try another category or browse the full catalog.",
    emptyTitle: "The first drop is on its way",
    emptyBody:
      "We're finishing up the collection. In the meantime, take a look at the lookbook.",
    items: (n) => `${n} ${n === 1 ? "piece" : "pieces"}`,
    showing: (visible, total) => `Showing ${visible} of ${total}`,
    showMore: "Show more",
    showAll: "Show all products",
  },
  card: {
    noImage: "No image",
    soldOut: "Sold out",
    lastUnits: "Last few left",
    noSizes: "No sizes left",
    view: "View →",
  },
  product: {
    breadcrumb: "Breadcrumb",
    home: "Home",
    finalPrice: "Final price. Shipping is arranged separately.",
    color: "Color",
    otherColor: "See another color",
    description: "Description",
    shippingTitle: "Shipping",
    shippingBody:
      "We ship within 24 business hours. Nationwide shipping across Argentina by mail, and motorbike delivery within Buenos Aires City. Shipping cost is arranged over WhatsApp, together with payment.",
    returnsTitle: "Exchanges & returns",
    returnsBody:
      "You have 30 days from delivery to exchange your size, as long as the piece is unworn and still has its tag.",
    sizeQuestion: "Not sure about your size? Ask us →",
    keepBrowsing: "Keep browsing",
    viewAll: "View all →",
    whatsappQuestion: (product) => `Hi! I have a question about "${product}".`,
    prevImage: "Previous image",
    nextImage: "Next image",
    viewImage: (n) => `View image ${n}`,
  },
  size: {
    label: "Size",
    withSize: (size) => `Size ${size}`,
  },
  addToCart: {
    added: "Added to cart",
    viewCart: "View cart",
    soldOutTitle: "Sold out",
    soldOutBody:
      "This piece was made in a small batch and it's all gone. Message us if you'd like to know when it's back.",
    oversize: "Oversized fit",
    chooseSize: "Choose a size to continue.",
    unitsLeft: (n, size) => `Only ${n} left in ${size}.`,
    available: (size) => `Available in ${size}.`,
    add: "Add to cart",
  },
  cart: {
    emptyTitle: "Your cart is empty",
    emptyBody:
      "Nothing here yet. Take a look at the collection: each design comes in small numbers.",
    viewCollection: "Shop the collection",
    title: "Your cart",
    removed: "Removed from your cart",
    remove: "Remove",
    removeLabel: (product, size) => `Remove ${product} size ${size}`,
    decrease: "Remove one",
    increase: "Add one",
    summary: "Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingTbd: "To be arranged",
    total: "Total",
    checkout: "Checkout",
    keepShopping: "← Keep shopping",
  },
  checkout: {
    emptyBody: "Add something before placing your order.",
    step: "Step 2 of 2",
    title: "Checkout",
    intro:
      "Leave us your details and we'll hold your order. We'll arrange payment and shipping with you afterwards, over WhatsApp.",
    buyerSection: "Your details",
    shippingSection: "Shipping address",
    paymentSection: "Payment method",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    street: "Street address",
    city: "City",
    state: "State / Province",
    postalCode: "ZIP / Postal code",
    country: "Country",
    defaultCountry: "United States",
    notes: "Delivery notes (optional)",
    notesPlaceholder: "Buzzer, delivery hours, landmarks…",
    transfer: "Bank transfer / zelle",
    card: "Card",
    transferHint:
      "We'll arrange payment and shipping afterwards, over WhatsApp.",
    cardHint: "Pay now with a credit or debit card, via PayPal.",
    sending: "Sending…",
    confirm: "Place order",
    continueToPayment: "Continue to payment",
    yourOrder: "Your order",
    qtyAndSize: (qty, size) => `${qty} × Size ${size}`,
    transferFootnote:
      "No payment is taken here. Once you confirm, we'll arrange payment and shipping over WhatsApp.",
    cardFootnote: "Payment is processed securely through PayPal.",
  },
  errors: {
    buyerName: "Please enter your full name",
    buyerEmail: "Please enter a valid email",
    buyerPhone: "Please enter a contact phone number",
    shippingStreet: "Please enter your street address",
    shippingCity: "Please enter your city",
    shippingCountry: "Please enter your country",
    emptyCart: "Your cart is empty",
    invalid: "Please check the form details",
    productUnavailable: "One of the products is no longer available",
    notEnoughStock: (product, size) =>
      `There isn't enough stock of "${product}" in size ${size}`,
    paypalStart: "We couldn't start the payment",
    paypalConfirm: "We couldn't confirm the payment",
    paypalGeneric: "Something went wrong with PayPal. Please try again.",
    paypalDeclined:
      "Your payment was declined. Please try another card or payment method.",
    paypalPending: (code) =>
      `PayPal put your payment on hold for review. Please don't pay again: message us with this code and we'll sort it out: ${code}`,
    paypalAmount: (code) =>
      `We couldn't verify the payment amount. Please message us with this code: ${code}`,
    paypalNotConfirmed: "The payment couldn't be confirmed",
    mockPaying: "Processing mock payment...",
    mockPay: "Pay with PayPal (mock mode)",
  },
  order: {
    number: (ref) => `Order #${ref}`,
    thanks: (name) => `Thank you, ${name}!`,
    paidBody:
      "Your payment is confirmed and we've emailed you a summary. We're already getting your order ready.",
    reservedBody:
      "Your order is on hold and we've emailed you a summary. All that's left is to arrange payment and shipping.",
    yourOrder: "Your order",
    shipTo: "Shipping to",
    back: "← Back to the shop",
    lastStep: "Last step",
    whatsappBody:
      "We opened WhatsApp with your order summary ready to send. If it didn't open, tap here.",
    whatsappCta: "Continue on WhatsApp",
  },
  notFound: {
    eyebrow: "Error 404",
    title: "Lost in\nthe wild",
    body: "This page doesn't exist, or the piece you were looking for is no longer available. Our runs are small: once something sells out, it leaves the catalog.",
    cta: "Shop the collection",
    lookbook: "Go to the lookbook",
  },
  footer: {
    shop: "Shop",
    help: "Help",
    follow: "Follow us",
    allCatalog: "Full catalog",
    lookbook: "Lookbook",
    myCart: "My cart",
    rights: (year, site) => `© ${year} ${site}. All rights reserved.`,
  },
  whatsapp: {
    contact: "Hi! I was browsing the shop and have a question.",
    orderIntro: (name, ref) => `Hi! I'm ${name}, I just placed order #${ref}:`,
    orderItem: (qty, product, size, price) =>
      `• ${qty}x ${product} - Size ${size} - ${price} each`,
    orderTotal: (total) => `Total: ${total}`,
    orderOutro: "I'd like to arrange payment and shipping. Thanks!",
  },
  emails: {
    confirmationSubject: (ref) => `We received your order #${ref}`,
    confirmationTitle: (name) => `Thanks for your order, ${name}!`,
    confirmationBody: (ref) =>
      `We received your order #${ref}. We'll reach out on WhatsApp to arrange payment and shipping.`,
    shipTo: "Shipping to:",
    itemLine: (qty, product, size) => `${qty}x ${product} — Size ${size}`,
    total: "Total",
    questions:
      "Any questions? Just reply to this email or message us on WhatsApp.",
    hello: (name) => `Hi ${name},`,
    orderRef: (ref) => `Order #${ref}.`,
    status: {
      CONFIRMADO: {
        subject: "Your order is confirmed",
        message: "We've confirmed your order and we're getting it ready.",
      },
      ENVIADO: {
        subject: "Your order is on its way",
        message:
          "Your order has shipped. We'll let you know on WhatsApp about any shipping updates.",
      },
      ENTREGADO: {
        subject: "Your order was delivered",
        message: "Your order shows as delivered. We hope you love it!",
      },
      CANCELADO: {
        subject: "Your order was cancelled",
        message:
          "Your order was cancelled. If you think this is a mistake, message us on WhatsApp.",
      },
    },
  },
};

export default en;

