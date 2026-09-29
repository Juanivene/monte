import "server-only";
import { nanoid } from "nanoid";
import { Prisma } from "@prisma/client";

/**
 * Motor de datos en memoria que imita la superficie de la Prisma Client que
 * usa esta app (findMany/findUnique/count/create/update/updateMany/upsert/delete/
 * deleteMany/$transaction, con where/include/select/orderBy/take), a medida
 * de las consultas que realmente existen en el código — no es un ORM
 * genérico. Así el resto del código (server actions, páginas) no cambia una
 * sola línea cuando corre en modo mock: solo cambia de dónde vienen los
 * datos. Ver src/lib/prisma.ts.
 */

export type ModelName =
  | "admin"
  | "category"
  | "product"
  | "productImage"
  | "productVariant"
  | "productGroup"
  | "order"
  | "orderItem"
  | "legend"
  | "siteContent";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Where = Record<string, any> | undefined;
 
type OrderBy = Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[] | undefined;

type RelationDef =
  | { kind: "belongsTo"; foreignKey: string; target: ModelName }
  | { kind: "hasMany"; foreignKey: string; target: ModelName };

const RELATIONS: Record<ModelName, Record<string, RelationDef>> = {
  admin: {},
  category: {
    products: { kind: "hasMany", foreignKey: "categoryId", target: "product" },
  },
  product: {
    category: { kind: "belongsTo", foreignKey: "categoryId", target: "category" },
    group: { kind: "belongsTo", foreignKey: "groupId", target: "productGroup" },
    images: { kind: "hasMany", foreignKey: "productId", target: "productImage" },
    variants: { kind: "hasMany", foreignKey: "productId", target: "productVariant" },
    orderItems: { kind: "hasMany", foreignKey: "productId", target: "orderItem" },
  },
  productImage: {
    product: { kind: "belongsTo", foreignKey: "productId", target: "product" },
  },
  productVariant: {
    product: { kind: "belongsTo", foreignKey: "productId", target: "product" },
  },
  productGroup: {
    products: { kind: "hasMany", foreignKey: "groupId", target: "product" },
  },
  order: {
    items: { kind: "hasMany", foreignKey: "orderId", target: "orderItem" },
  },
  orderItem: {
    order: { kind: "belongsTo", foreignKey: "orderId", target: "order" },
    product: { kind: "belongsTo", foreignKey: "productId", target: "product" },
  },
  legend: {},
  siteContent: {},
};

const WITH_TIMESTAMPS = new Set<ModelName>([
  "admin",
  "category",
  "product",
  "order",
  "legend",
  "siteContent",
]);

export type Store = Record<ModelName, Doc[]>;

function emptyStore(): Store {
  return {
    admin: [],
    category: [],
    product: [],
    productImage: [],
    productVariant: [],
    productGroup: [],
    order: [],
    orderItem: [],
    legend: [],
    siteContent: [],
  };
}

const globalForMock = globalThis as unknown as { mockStore?: Store };
export const store: Store = globalForMock.mockStore ?? emptyStore();
if (process.env.NODE_ENV !== "production") {
  globalForMock.mockStore = store;
}

export function genId(): string {
  return nanoid(24);
}

function isPlainFilterObject(value: unknown): value is Doc {
  return (
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Date) &&
    !Array.isArray(value)
  );
}

function matchWhere(model: ModelName, item: Doc, where: Where): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, value]) => {
    const relDef = RELATIONS[model][key];
    if (relDef) {
      if (relDef.kind === "belongsTo") {
        const fk = item[relDef.foreignKey];
        const target = fk != null ? store[relDef.target].find((d) => d.id === fk) : undefined;
        return target ? matchWhere(relDef.target, target, value) : false;
      }
      const related = store[relDef.target].filter((d) => d[relDef.foreignKey] === item.id);
      return related.some((d) => matchWhere(relDef.target, d, value));
    }

    if (isPlainFilterObject(value)) {
      if ("in" in value) return (value.in as unknown[]).includes(item[key]);
      if ("notIn" in value) return !(value.notIn as unknown[]).includes(item[key]);
      if ("not" in value) return item[key] !== value.not;
      if ("contains" in value) {
        const haystack = String(item[key] ?? "");
        const needle = String(value.contains);
        return value.mode === "insensitive"
          ? haystack.toLowerCase().includes(needle.toLowerCase())
          : haystack.includes(needle);
      }
      return true;
    }

    return item[key] === value;
  });
}

function applyOrderBy<T extends Doc>(list: T[], orderBy: OrderBy): T[] {
  if (!orderBy) return list;
  const clauses = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...list].sort((a, b) => {
    for (const clause of clauses) {
      const [key, dir] = Object.entries(clause)[0] as [string, "asc" | "desc"];
      const av = a[key];
      const bv = b[key];
      let cmp = 0;
      if (av instanceof Date && bv instanceof Date) cmp = av.getTime() - bv.getTime();
      else if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveRelation(model: ModelName, item: Doc, key: string, opts: any): unknown {
  const relDef = RELATIONS[model][key];
  if (!relDef) return item[key];
  const nested = opts && typeof opts === "object" ? opts : {};

  if (relDef.kind === "belongsTo") {
    const fk = item[relDef.foreignKey];
    if (fk == null) return null;
    const target = store[relDef.target].find((d) => d.id === fk);
    return target ? shape(relDef.target, target, nested) : null;
  }

  let list = store[relDef.target].filter((d) => d[relDef.foreignKey] === item.id);
  if (nested.where) list = list.filter((d) => matchWhere(relDef.target, d, nested.where));
  list = applyOrderBy(list, nested.orderBy);
  if (nested.skip) list = list.slice(nested.skip);
  if (nested.take != null) list = list.slice(0, nested.take);
  return list.map((d) => shape(relDef.target, d, nested));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(model: ModelName, item: Doc, args: any = {}): Doc {
  const { select, include } = args;

  if (select) {
    const out: Doc = {};
    for (const [key, value] of Object.entries(select)) {
      if (!value) continue;
      out[key] = RELATIONS[model][key]
        ? resolveRelation(model, item, key, value === true ? undefined : value)
        : item[key];
    }
    return out;
  }

  const out: Doc = { ...item };
  if (include) {
    for (const [key, value] of Object.entries(include)) {
      if (!value) continue;
      out[key] = resolveRelation(model, item, key, value === true ? undefined : value);
    }
  }
  return out;
}

function notFound(model: ModelName): Error {
  return new Error(`Mock: no se encontró el registro de "${model}"`);
}

/** data puede traer, además de campos propios, relaciones hasMany con {create: [...]} */
function splitData(
  model: ModelName,
   
  data: Doc,
): { own: Doc; nestedCreates: [string, Doc[]][] } {
  const own: Doc = {};
  const nestedCreates: [string, Doc[]][] = [];
  for (const [key, value] of Object.entries(data)) {
    const relDef = RELATIONS[model][key];
    if (relDef && relDef.kind === "hasMany" && isPlainFilterObject(value) && "create" in value) {
      const creates = value.create;
      nestedCreates.push([key, Array.isArray(creates) ? creates : [creates]]);
    } else {
      own[key] = value;
    }
  }
  return { own, nestedCreates };
}

function applyNestedCreates(model: ModelName, ownerId: string, nestedCreates: [string, Doc[]][]) {
  for (const [key, creates] of nestedCreates) {
    const relDef = RELATIONS[model][key];
    if (!relDef || relDef.kind !== "hasMany") continue;
    for (const data of creates) {
      store[relDef.target].push({ id: genId(), [relDef.foreignKey]: ownerId, ...data });
    }
  }
}

function cascadeOnDelete(model: ModelName, removed: Doc) {
  if (model === "product") {
    store.productImage = store.productImage.filter((d) => d.productId !== removed.id);
    store.productVariant = store.productVariant.filter((d) => d.productId !== removed.id);
  } else if (model === "category") {
    for (const p of store.product) {
      if (p.categoryId === removed.id) p.categoryId = null;
    }
  } else if (model === "productGroup") {
    for (const p of store.product) {
      if (p.groupId === removed.id) p.groupId = null;
    }
  } else if (model === "order") {
    store.orderItem = store.orderItem.filter((d) => d.orderId !== removed.id);
  }
}

function createModelApi(model: ModelName) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findMany: async (args: any = {}) => {
      let list = store[model].filter((d) => matchWhere(model, d, args.where));
      list = applyOrderBy(list, args.orderBy);
      if (args.skip) list = list.slice(args.skip);
      if (args.take != null) list = list.slice(0, args.take);
      return list.map((d) => shape(model, d, args));
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findFirst: async (args: any = {}) => {
      let list = store[model].filter((d) => matchWhere(model, d, args.where));
      list = applyOrderBy(list, args.orderBy);
      return list[0] ? shape(model, list[0], args) : null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findUnique: async (args: any) => {
      const found = store[model].find((d) => matchWhere(model, d, args.where));
      return found ? shape(model, found, args) : null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findUniqueOrThrow: async (args: any) => {
      const found = store[model].find((d) => matchWhere(model, d, args.where));
      if (!found) throw notFound(model);
      return shape(model, found, args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    count: async (args: any = {}) => store[model].filter((d) => matchWhere(model, d, args.where)).length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async (args: any) => {
      const { own, nestedCreates } = splitData(model, args.data);
      const now = new Date();
      const item: Doc = { id: genId(), ...own };
      if (WITH_TIMESTAMPS.has(model)) {
        item.createdAt = now;
        item.updatedAt = now;
      }
      store[model].push(item);
      applyNestedCreates(model, item.id, nestedCreates);
      return shape(model, item, args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async (args: any) => {
      const item = store[model].find((d) => matchWhere(model, d, args.where));
      if (!item) throw notFound(model);
      const { own, nestedCreates } = splitData(model, args.data);
      Object.assign(item, own);
      if (WITH_TIMESTAMPS.has(model)) item.updatedAt = new Date();
      applyNestedCreates(model, item.id, nestedCreates);
      return shape(model, item, args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMany: async (args: any) => {
      const list = store[model].filter((d) => matchWhere(model, d, args.where));
      for (const item of list) {
        Object.assign(item, args.data);
        if (WITH_TIMESTAMPS.has(model)) item.updatedAt = new Date();
      }
      return { count: list.length };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upsert: async (args: any) => {
      const item = store[model].find((d) => matchWhere(model, d, args.where));
      if (item) {
        Object.assign(item, args.update);
        if (WITH_TIMESTAMPS.has(model)) item.updatedAt = new Date();
        return shape(model, item, args);
      }
      const now = new Date();
      const created: Doc = { id: genId(), ...args.create };
      if (WITH_TIMESTAMPS.has(model)) {
        created.createdAt = now;
        created.updatedAt = now;
      }
      store[model].push(created);
      return shape(model, created, args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: async (args: any) => {
      const item = store[model].find((d) => matchWhere(model, d, args.where));
      if (!item) throw notFound(model);

      if (model === "product") {
        const hasOrders = store.orderItem.some((d) => d.productId === item.id);
        if (hasOrders) {
          throw new Prisma.PrismaClientKnownRequestError(
            "Mock: no se puede eliminar, tiene pedidos asociados",
            { code: "P2003", clientVersion: "mock" },
          );
        }
      }

      store[model] = store[model].filter((d) => d.id !== item.id);
      cascadeOnDelete(model, item);
      return shape(model, item, {});
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteMany: async (args: any = {}) => {
      const list = store[model].filter((d) => matchWhere(model, d, args.where));
      const ids = new Set(list.map((d) => d.id));
      store[model] = store[model].filter((d) => !ids.has(d.id));
      for (const item of list) cascadeOnDelete(model, item);
      return { count: list.length };
    },
  };
}

export type MockModelApi = ReturnType<typeof createModelApi>;

export function buildMockPrisma() {
  return {
    admin: createModelApi("admin"),
    category: createModelApi("category"),
    product: createModelApi("product"),
    productImage: createModelApi("productImage"),
    productVariant: createModelApi("productVariant"),
    productGroup: createModelApi("productGroup"),
    order: createModelApi("order"),
    orderItem: createModelApi("orderItem"),
    legend: createModelApi("legend"),
    siteContent: createModelApi("siteContent"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $transaction: async (arg: any) => {
      if (Array.isArray(arg)) return Promise.all(arg);
      if (typeof arg === "function") return arg(mockPrisma);
      return arg;
    },
    $disconnect: async () => {},
  };
}

export const mockPrisma = buildMockPrisma();

/** Inserción síncrona directa, solo para seedear datos al arrancar (ver seed-data.ts). */
export function seedInsert(model: ModelName, data: Doc): Doc {
  const now = new Date();
  const item: Doc = { id: data.id ?? genId(), ...data };
  if (WITH_TIMESTAMPS.has(model)) {
    item.createdAt ??= now;
    item.updatedAt ??= now;
  }
  store[model].push(item);
  return item;
}
