MAIL
- Resend está en modo sandbox: sin dominio verificado solo llegan mails a la cuenta vinculada.
- Verificar un dominio propio en Resend (registros SPF, DKIM y DMARC en el DNS).
- EMAIL_FROM debe salir de ese dominio (ej. pedidos@tudominio.com), no de uno de prueba.
- El dominio de envío debería ser el dominio real del negocio del cliente, no uno mío.
- La cuenta de Resend puede quedar mía, pero el dominio de envío tiene que ser del cliente.

PAGO
- La cuenta de PayPal Business tiene que ser del cliente, no mía, antes de pasar a PAYPAL_ENV=live.
- Si el Client ID/Secret son de mi cuenta, el dinero real de las ventas me llega a mí (implicancias fiscales/impositivas para mí, no para el cliente).
- PayPal exige verificación de identidad (KYC) de la cuenta business, tiene que estar a nombre del cliente.
- Acción: que el cliente cree su propia cuenta Business en PayPal, genere su app en developer.paypal.com/dashboard, y yo solo cargo sus credenciales (NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) como variables de entorno en producción.

BASE DE DATOS (Neon) Y VERCEL BLOB
- Van a tener datos reales de clientes (pedidos, emails, direcciones) = PII de terceros en una cuenta a mi nombre.
- Riesgo: filtración de datos, reclamo de un comprador, o que el cliente quiera migrar/exportar en el futuro.
- Recomendado: transferir el proyecto de Neon a una cuenta/organización del cliente, o crear la instancia de producción directamente en su cuenta.
- Igual criterio para Vercel Blob (imágenes de productos).

DESPLIEGUE (Vercel)
- El hosting en sí no maneja plata ni PII directamente, pero:
  - La facturación por uso (bandwidth, funciones, etc.) me llega a mí si crece el tráfico.
  - Ante un incidente (caída, filtración de logs, reporte de contenido/abuso) la cuenta responsable frente a Vercel es la mía.
- Opción intermedia: crear un Vercel Team y agregar al cliente como miembro/owner con facturación a su tarjeta — yo sigo deployando y administrando, pero costo y responsabilidad quedan del lado del cliente.
- Si no, transferir el proyecto directamente a una cuenta del cliente.

DOMINIO
- Registrar siempre a nombre del cliente (con su email/tarjeta), aunque yo lo configure.
- Es de lo más fácil de dejar mal (registrarlo a mi nombre "para no complicar" y después ser un dolor de cabeza transferirlo).

REPO (GitHub)
- Riesgo bajo: solo código, sin datos de producción ni plata.
- Puede quedar en mi cuenta mientras yo mantenga el sitio.
- Si en algún momento el cliente quiere independencia (cambiar de desarrollador), transferir el repo o darle acceso de colaborador.

RESUMEN DE OWNERSHIP
- PayPal Business: del cliente (obligatorio antes de ir a live)
- Dominio: del cliente
- Neon (DB): del cliente, o transferir antes de producción real
- Vercel Blob: ídem, junto con la DB
- Resend: cuenta puede quedar mía, pero dominio de envío del cliente
- Vercel (hosting): ideal team del cliente con acceso mío; mínimo aceptable dejarlo mío pero avisando la exposición
- GitHub: puede quedar en mi cuenta sin problema

PENDIENTE
- Dejar por escrito con el cliente (aunque sea un mail o párrafo en el presupuesto/contrato) qué cuentas son de él, qué incluye el mantenimiento, y que no me hago responsable por el uso del negocio una vez entregado.
