# Handover a cuentas del cliente — checklist en orden

Estado: el proyecto ya está funcionando (Netlify + Cloudflare R2 + Neon), pero todo vive
en cuentas personales del desarrollador. Este archivo es el orden en el que hay que ir
pasando cada pieza a cuentas del cliente antes de considerar el proyecto "entregado".

## Ya hecho

- [x] Migrado el hosting de Vercel (Hobby, prohibía uso comercial) a Netlify (Free, permite
      uso comercial). Deploy corriendo en Netlify, cuenta del desarrollador.
- [x] Migradas las imágenes de producto de Vercel Blob a Cloudflare R2 (bucket
      `monte-products`, cuenta del desarrollador). Código en
      `src/lib/r2.ts` / `src/app/api/blob/upload/route.ts` / `ImageUploader.tsx`.
- [x] Env vars cargadas en Netlify (mismas que en `.env` local, ver README).

## 1. Dominio

- [ ] Registrar el dominio a nombre del cliente (su email, su tarjeta). Elegir registrador
      barato para el costo a largo plazo (ej. Cloudflare Registrar, precio de costo sin
      markup) en vez del de Netlify (markup fuerte en la renovación).
- [ ] Apuntar el DNS del dominio al sitio de Netlify (registro `A`/`CNAME` según indique
      Netlify al agregar el dominio custom en Site configuration → Domain management).

Bloquea el paso 5 (Resend necesita un dominio propio para verificar el remitente).

## 2. PayPal Business (en paralelo, no depende de nada)

- [ ] El cliente crea su propia cuenta PayPal Business y completa el KYC.
- [ ] Con esa cuenta, entra a developer.paypal.com/dashboard → Apps & Credentials → tab
      **Live** → Create App (tipo Merchant).
- [ ] Pasa el Client ID / Secret (live) al desarrollador para cargarlos en Netlify:
      `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.
- [ ] Recién ahí, cambiar `PAYPAL_ENV=live` en Netlify y redeployar.

## 3. Neon (base de datos)

Hoy vive en un proyecto de Neon de la cuenta del desarrollador. Guarda PII real de
compradores (nombre, email, teléfono, dirección de envío completa — ver `Order` en
`prisma/schema.prisma`).

- [ ] El cliente crea una organización en Neon.
- [ ] Desde el proyecto actual: Integrations → desconectar cualquier integración (Vercel,
      GitHub) antes de transferir.
- [ ] Project → Settings → Transfer → elegir la organización del cliente.
- [ ] El `DATABASE_URL` no cambia con la transferencia — no hace falta redeployar por esto.

## 4. Cloudflare (R2 — imágenes de producto, y dominio si se compró ahí)

- [ ] Si el dominio se registró en Cloudflare (paso 1), esa cuenta ya queda directamente a
      nombre del cliente — no hay nada que transferir en ese caso.
- [ ] Si R2 quedó en una cuenta de Cloudflare del desarrollador separada de la del dominio:
      mover el bucket `monte-products` a la cuenta/organización del cliente (o recrear el
      bucket ahí y correr de nuevo el script de migración de imágenes que ya se usó una vez
      para pasar de Vercel Blob a R2, apuntando ahora al nuevo bucket).
- [ ] Regenerar el API Token (Access Key ID / Secret) desde la cuenta del cliente y
      actualizar `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_ACCOUNT_ID` en Netlify.

## 5. Netlify (hosting)

- [ ] El cliente crea (o se agrega a) una cuenta/team de Netlify con su propio método de
      pago si en algún momento se necesita un plan pago.
- [ ] Transferir el sitio: Site configuration → General → Transfer this site → elegir el
      team destino. Vos podés seguir como miembro con acceso de deploy.
- [ ] Revisar que las env vars viajen con la transferencia; si no, volver a cargarlas.

## 6. Resend (emails transaccionales)

Requiere el dominio del paso 1 ya registrado y con DNS accesible.

- [ ] Agregar el subdominio de envío en Resend (Domains → Add Domain) y publicar los
      registros SPF/DKIM que da el dashboard en el DNS del dominio del cliente.
- [ ] Configurar DMARC empezando en `p=none`, subir a `quarantine`/`reject` con el tiempo.
- [ ] Actualizar `EMAIL_FROM` en Netlify a una dirección del dominio propio (ej.
      `pedidos@tudominio.com`), reemplazando la de prueba `onboarding@resend.dev`.
- [ ] Reactivar el envío de emails: en `src/lib/send-order-emails.ts` el envío está
      comentado/deshabilitado a propósito — descomentar el bloque cuando esto esté listo.
- [ ] La cuenta de Resend en sí puede seguir siendo del desarrollador; lo que tiene que ser
      del cliente es el dominio de envío.

## 7. GitHub

- [ ] Crear una GitHub Organization (no queda en la cuenta personal del desarrollador ni en
      la del cliente individualmente, es una entidad propia).
- [ ] Transferir el repo `monte` a esa organización.
- [ ] Invitar al cliente como miembro/owner de la organización.
- [ ] El desarrollador se queda como colaborador con permiso de deploy (push + conectar el
      repo a Netlify), el resto de las cuentas (dominio, PayPal, Neon, Cloudflare, Netlify,
      Resend) quedan íntegramente del cliente.

## 8. Texto/acuerdo por escrito con el cliente

- [ ] Redactar (mail o párrafo en el presupuesto) qué cuentas quedan de quién, qué incluye
      el mantenimiento, y el deslinde de responsabilidad por el uso del negocio una vez
      entregado. Se puede hacer en paralelo a todo lo anterior, no depende de nada técnico.
