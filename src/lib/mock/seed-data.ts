import "server-only";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/slug";
import { MOCK_MODE, MOCK_ADMIN_EMAIL, MOCK_ADMIN_PASSWORD } from "./config";
import { seedInsert, store, genId } from "./store";

const globalForSeed = globalThis as unknown as { mockSeeded?: boolean };

type SeedProduct = {
  name: string;
  colorName?: string;
  nameEn?: string;
  colorNameEn?: string;
  descriptionEn?: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: Partial<Record<"XS" | "S" | "M" | "L" | "XL" | "XXL", number>>;
  isActive?: boolean;
  group?: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Buzo Monte",
    colorName: "Negro",
    nameEn: "Monte Hoodie",
    colorNameEn: "Black",
    descriptionEn:
      "Oversized hoodie with eyelets, 380gsm combed cotton. Relaxed fit with ribbed cuffs and waistband.",
    group: "buzo-monte",
    category: "Buzos",
    price: 68,
    description:
      "Buzo oversize con ojales, algodón peinado de 380gsm. Calce amplio, puño y cintura acanalados.",
    images: [
      "/lookbook/buzo-negro-porton.png",
      "/lookbook/buzo-negro-viaducto-01.png",
      "/lookbook/buzo-negro-viaducto-02.png",
    ],
    stock: { XS: 4, S: 8, M: 10, L: 7, XL: 3, XXL: 0 },
  },
  {
    name: "Buzo Monte",
    colorName: "Teal",
    nameEn: "Monte Hoodie",
    colorNameEn: "Teal",
    descriptionEn:
      "Oversized hooded sweatshirt, 380gsm combed cotton. Relaxed fit with ribbed cuffs and waistband.",
    group: "buzo-monte",
    category: "Buzos",
    price: 68,
    description:
      "Buzo oversize con capucha, algodón peinado de 380gsm. Calce amplio, puño y cintura acanalados.",
    images: [
      "/lookbook/buzo-teal-torre-01.png",
      "/lookbook/buzo-teal-torre-02.png",
      "/lookbook/buzo-teal-torre-03.png",
      "/lookbook/buzo-teal-cochera.png",
      "/lookbook/buzo-teal-pasaje.png",
    ],
    stock: { XS: 2, S: 2, M: 1, L: 0, XL: 0, XXL: 0 },
  },
  {
    name: "Remera Monte",
    colorName: "Negra",
    nameEn: "Monte Tee",
    colorNameEn: "Black",
    descriptionEn: "Oversized tee in 220gsm combed cotton, crew neck.",
    group: "remera-monte",
    category: "Remeras",
    price: 32,
    description: "Remera oversize de algodón peinado 220gsm, cuello redondo.",
    images: ["/lookbook/remera-negra-roca.png", "/lookbook/remera-negra-rocas.png"],
    stock: { XS: 6, S: 12, M: 14, L: 9, XL: 5, XXL: 2 },
  },
  {
    name: "Remera Monte",
    colorName: "Verde",
    nameEn: "Monte Tee",
    colorNameEn: "Green",
    descriptionEn: "Oversized tee in 220gsm combed cotton, crew neck.",
    group: "remera-monte",
    category: "Remeras",
    price: 32,
    description: "Remera oversize de algodón peinado 220gsm, cuello redondo.",
    images: ["/lookbook/remera-verde-mar.png", "/lookbook/remeras-arena.png"],
    stock: { XS: 3, S: 5, M: 6, L: 4, XL: 0, XXL: 0 },
  },
  {
    name: "Tote Bag Monte",
    nameEn: "Monte Tote Bag",
    category: "Accesorios",
    price: 22,
    description: "Tote de lona cruda de 12oz, asas reforzadas. Un solo tamaño.",
    images: ["/lookbook/tote-playa.png"],
    stock: { M: 40 },
  },
  {
    name: "Buzo Monte",
    colorName: "Archivo (oculto)",
    category: "Buzos",
    price: 55,
    description: "Edición anterior, descontinuada.",
    images: ["/lookbook/buzo-negro-viaducto-02.png"],
    stock: { S: 0, M: 0, L: 0 },
    isActive: false,
  },
];

function seedProducts() {
  const categoryIds = new Map<string, string>();
  const categoryNamesEn: Record<string, string> = {
    Buzos: "Hoodies",
    Remeras: "Tees",
    Accesorios: "Accessories",
  };
  for (const [name, nameEn] of Object.entries(categoryNamesEn)) {
    const category = seedInsert("category", { name, nameEn, slug: slugify(name) });
    categoryIds.set(name, category.id);
  }

  const groupIds = new Map<string, string>();
  const usedSlugs = new Set<string>();

  for (const p of PRODUCTS) {
    let groupId: string | undefined;
    if (p.group) {
      groupId = groupIds.get(p.group);
      if (!groupId) {
        groupId = seedInsert("productGroup", {}).id as string;
        groupIds.set(p.group, groupId);
      }
    }

    let slug = slugify(p.colorName ? `${p.name}-${p.colorName}` : p.name);
    let attempt = 1;
    while (usedSlugs.has(slug)) {
      attempt += 1;
      slug = `${slugify(p.colorName ? `${p.name}-${p.colorName}` : p.name)}-${attempt}`;
    }
    usedSlugs.add(slug);

    const product = seedInsert("product", {
      name: p.name,
      slug,
      description: p.description,
      price: p.price,
      colorName: p.colorName ?? null,
      nameEn: p.nameEn ?? null,
      colorNameEn: p.colorNameEn ?? null,
      descriptionEn: p.descriptionEn ?? null,
      isActive: p.isActive ?? true,
      categoryId: categoryIds.get(p.category) ?? null,
      groupId: groupId ?? null,
    });

    p.images.forEach((url, order) => {
      seedInsert("productImage", { url, order, productId: product.id });
    });

    for (const [size, stock] of Object.entries(p.stock)) {
      seedInsert("productVariant", { size, stock, productId: product.id });
    }
  }
}

function seedAdmin() {
  seedInsert("admin", {
    email: MOCK_ADMIN_EMAIL,
    passwordHash: bcrypt.hashSync(MOCK_ADMIN_PASSWORD, 10),
  });
}

function seedOrders() {
  const products = store.product;
  const buzoNegro = products.find((p) => p.colorName === "Negro");
  const remeraVerde = products.find((p) => p.colorName === "Verde");
  const tote = products.find((p) => p.name === "Tote Bag Monte");
  if (!buzoNegro || !remeraVerde || !tote) return;

  function order(data: Record<string, unknown>, items: Record<string, unknown>[]) {
    const created = seedInsert("order", data);
    for (const item of items) {
      seedInsert("orderItem", { ...item, orderId: created.id });
    }
    return created;
  }

  order(
    {
      buyerName: "Sofía Martínez",
      buyerEmail: "sofia.martinez@example.com",
      buyerPhone: "+5491122334455",
      shippingStreet: "Av. Corrientes 1234",
      shippingCity: "CABA",
      shippingState: "Buenos Aires",
      shippingPostalCode: "C1043",
      shippingCountry: "Argentina",
      shippingNotes: "Timbre 3B",
      total: 68,
      status: "PENDIENTE",
      paymentMethod: "TRANSFERENCIA",
      paypalOrderId: null,
      paidAt: null,
    },
    [
      {
        productId: buzoNegro.id,
        productName: `${buzoNegro.name} (${buzoNegro.colorName})`,
        size: "M",
        quantity: 1,
        unitPrice: buzoNegro.price,
      },
    ],
  );

  order(
    {
      buyerName: "Julián Gómez",
      buyerEmail: "julian.gomez@example.com",
      buyerPhone: "+5491166778899",
      shippingStreet: "Calle Falsa 123",
      shippingCity: "Rosario",
      shippingState: "Santa Fe",
      shippingPostalCode: "S2000",
      shippingCountry: "Argentina",
      shippingNotes: null,
      total: Number(remeraVerde.price) + Number(tote.price),
      status: "CONFIRMADO",
      paymentMethod: "PAYPAL",
      paypalOrderId: `MOCK-${genId()}`,
      paidAt: new Date(),
    },
    [
      {
        productId: remeraVerde.id,
        productName: `${remeraVerde.name} (${remeraVerde.colorName})`,
        size: "S",
        quantity: 1,
        unitPrice: remeraVerde.price,
      },
      {
        productId: tote.id,
        productName: tote.name,
        size: "M",
        quantity: 1,
        unitPrice: tote.price,
      },
    ],
  );
}

const ANNOUNCEMENT_LEGENDS: [string, string][] = [
  ["Hecho en Tucumán", "Made in Tucumán"],
  ["Envíos a todo el país", "Nationwide shipping"],
  ["Tiradas cortas y numeradas", "Small, numbered batches"],
  ["Cambios dentro de los 30 días", "Exchanges within 30 days"],
  ["Coordinamos pago y envío por WhatsApp", "Payment and shipping arranged over WhatsApp"],
];

const HERO_LEGENDS = ["Monte", "Miami", "First Drop 2026"];

function seedLegends() {
  ANNOUNCEMENT_LEGENDS.forEach(([text, textEn], order) => {
    seedInsert("legend", { group: "ANNOUNCEMENT", text, textEn, order });
  });
  HERO_LEGENDS.forEach((text, order) => {
    seedInsert("legend", { group: "HERO", text, order });
  });
}

export function ensureMockSeed() {
  if (!MOCK_MODE || globalForSeed.mockSeeded) return;
  globalForSeed.mockSeeded = true;

  seedProducts();
  seedAdmin();
  seedOrders();
  seedLegends();

   
  console.log(
    `\n🧪 Monte en modo mock — DB, PayPal y subida de imágenes simulados.\n   Admin: ${MOCK_ADMIN_EMAIL} / ${MOCK_ADMIN_PASSWORD}\n`,
  );
}
