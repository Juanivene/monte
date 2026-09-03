# Tienda

MVP de e-commerce para una marca de indumentaria de diseño independiente. Catálogo,
carrito y checkout que arma el pedido y deriva a WhatsApp para coordinar pago y envío
(sin pasarela de pago todavía). Panel de administración para gestionar productos,
categorías y pedidos.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Postgres en [Neon](https://neon.tech) + Prisma 7 (con el driver adapter de Neon)
- Imágenes de producto en Vercel Blob
- Emails transaccionales con Resend + react-email
- Sesión de admin con cookie firmada (jose), sin dependencias de auth pesadas

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copiá `.env.example` a `.env` y completá:

- `DATABASE_URL`: connection string de un proyecto en [Neon](https://neon.tech) (con `?sslmode=require`).
- `BLOB_READ_WRITE_TOKEN`: se genera al crear un Blob Store en Vercel (Storage → Blob).
- `RESEND_API_KEY` y `EMAIL_FROM`: de tu cuenta en [Resend](https://resend.com). `EMAIL_FROM` necesita un dominio verificado en Resend para producción.
- `ADMIN_NOTIFICATION_EMAIL`: a qué email le llega el aviso de "nuevo pedido".
- `SESSION_SECRET`: string random largo, por ejemplo `openssl rand -base64 32`.
- `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`: credenciales del admin inicial. Solo se usan una vez al correr el seed; después la contraseña se cambia desde `/admin/ajustes`, no desde acá.
- `WHATSAPP_NUMBER`: número del vendedor en formato internacional sin `+` ni espacios.
- `NEXT_PUBLIC_SITE_NAME`: nombre de la marca, se muestra en el header.

### 3. Base de datos

```bash
npm run db:push    # crea las tablas en Neon a partir de prisma/schema.prisma
npm run db:seed    # crea el usuario admin inicial
```

Para cambios de schema más adelante, usar `npm run db:migrate` en vez de `db:push`
(genera migraciones versionadas en `prisma/migrations`).

### 4. Correr la app

```bash
npm run dev
```

- Tienda: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Estructura

```
prisma/schema.prisma        modelo de datos
prisma/seed.ts               crea el admin inicial
src/app/(shop)/...           catálogo, producto, carrito, checkout, pedido recibido
src/app/admin/...            login + panel protegido (productos, categorías, pedidos)
src/app/api/blob/upload/     endpoint que autoriza la subida de imágenes a Vercel Blob
src/server/actions/          server actions (checkout, productos, categorías, pedidos, auth)
src/lib/                     prisma client, sesión, validaciones (zod), carrito, whatsapp, emails
src/emails/                  templates de react-email
src/components/shop/         componentes de la tienda
src/components/admin/        componentes del panel
```

## Notas de diseño

- **Colores de producto**: cada color es un `Product` distinto (con su propio slug,
  fotos y stock por talle) vinculado a otros vía `ProductGroup`, para poder mostrarlos
  como swatches que navegan entre sí. Se puede crear un producto directamente como
  color de otro existente, o vincular dos productos ya creados después.
- **Stock**: no se descuenta automáticamente al confirmar un pedido; el admin lo
  ajusta a mano desde el panel. El checkout sí valida que haya stock suficiente al
  momento de comprar.
- **Pago y envío**: el checkout no cobra nada. Crea el pedido en estado `PENDIENTE`,
  manda los emails de confirmación/aviso, y redirige a WhatsApp con un resumen
  pre-armado para coordinar el resto. La dirección de envío se guarda igual desde
  ya, para cuando se agregue cálculo de envío real.
- **Preparado para pagos reales**: el total ya se calcula y persiste server-side por
  pedido; agregar Stripe u otro método más adelante implica sumar un paso antes de
  redirigir a WhatsApp, no rehacer el modelo de datos.

## Deploy en Vercel

1. Crear un proyecto en Neon y uno de Blob Storage en Vercel; conseguir una API key
   de Resend.
2. Importar el repo en Vercel y cargar las mismas variables de entorno que en `.env`
   (Project Settings → Environment Variables). `postinstall` corre `prisma generate`
   automáticamente en cada deploy.
3. Correr `npm run db:push` (o `db:migrate deploy`) apuntando al `DATABASE_URL` de
   producción antes del primer deploy, y `npm run db:seed` para crear el admin.
