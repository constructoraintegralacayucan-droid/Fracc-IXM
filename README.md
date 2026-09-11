# Terravista — Fraccionamiento Ixmegallo

Plataforma de venta de lotes (mapa interactivo, financiamiento, apartados y
panel de administración) para el Fraccionamiento Ixmegallo en Acayucan,
Veracruz. Inspirada en la funcionalidad de plataformas tipo lotización, con
identidad propia (paleta sand/green/greige, tipografía serif de lujo).

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- Sesión de administrador con JWT firmado (`jose`) en cookie httpOnly
  (sin dependencias externas de auth)

## Requisitos

- Node.js 20.9+
- PostgreSQL corriendo localmente (o cambia `DATABASE_URL`)

## Primeros pasos

```bash
cp .env.example .env
# edita .env con tu DATABASE_URL y un AUTH_SECRET aleatorio

npm install
npx prisma migrate dev
npx prisma db seed   # carga las 8 manzanas / 182 lotes reales del Excel
npm run dev
```

Sitio público: http://localhost:3000
Panel admin: http://localhost:3000/admin/login

**Usuario admin de prueba** (creado por el seed):

- Correo: `admin@ixmegallo.mx`
- Contraseña: `Ixmegallo2026!`

Cámbiala en cuanto tengas acceso al panel (o edítala directo en la base de
datos) antes de usar esto en producción.

## Estructura

- `src/app/(site)` — sitio público: landing, mapa de lotes, calculadora de
  financiamiento, formulario de apartado.
- `src/app/admin` — panel de administración protegido:
  - `(auth)/login` — login.
  - `(protected)/dashboard` — métricas globales y por manzana.
  - `(protected)/lotes` — edición de estatus/precio/comprador por lote.
  - `(protected)/reservas` — cola de solicitudes de apartado del sitio
    público (confirmar/cancelar).
  - `(protected)/lotes/[id]` — asignar/crear cuenta de cliente para un
    lote, definir su plan de pagos, y registrar/eliminar pagos.
- `src/app/cliente` — portal del comprador:
  - `(auth)/login` — login del cliente (cuenta separada del admin).
  - `(protected)/dashboard` — "mi lote": estado de cuenta detallado,
    saldo, próxima cuota y aviso de atraso, solo de sus propios lotes.
- `src/proxy.ts` — protege `/admin/*` y `/cliente/*` (reemplaza al antiguo
  `middleware.ts` en Next.js 16).
- `prisma/schema.prisma` — modelo de datos (Manzana, Lote, Reserva,
  AdminUser, ProyectoConfig, Cliente, Pago).
- `prisma/seed.ts` + `prisma/lotes-seed.json` — carga los datos reales
  extraídos de `Expedientes_Ixmegallo_septiembre_2026.xlsx`.

## Reglas de negocio implementadas

- **Estatus de lote**: `DISPONIBLE`, `APARTADO` (comprador asignado con
  saldo pendiente > 0, o reserva pública activa), `VENDIDO` (saldo = 0).
- **Financiamiento**: sin intereses por defecto (tasa configurable en
  `ProyectoConfig`), inicial mínima configurable (10% por defecto), plazos
  de 6 a 96 meses.
- **Apartado público**: al enviar el formulario de un lote disponible, el
  lote pasa a `APARTADO` de inmediato (bloqueo temporal) y se crea una
  `Reserva` en estatus `PENDIENTE` que el admin debe confirmar o cancelar
  desde `/admin/reservas`. Cancelar libera el lote de vuelta a
  `DISPONIBLE`.
- **Cuentas de clientes y pagos**: desde `/admin/lotes/[id]` el admin crea
  una cuenta de cliente (correo + contraseña temporal) y la asigna a un
  lote (un mismo cliente puede tener varios lotes), define el plan
  (número de pagos, monto por pago, fecha de la primera cuota) y va
  registrando cada pago recibido. `lib/pagos.ts` calcula automáticamente
  cuántas cuotas debieron pagarse a la fecha, cuántas van pagadas, y si
  hay atraso (en cuotas y en días). El cliente ve todo esto — y solo
  esto, nunca los lotes de otros compradores — en `/cliente/dashboard`
  tras iniciar sesión en `/cliente/login`.

## Despliegue en producción (Vercel + Neon)

1. **Base de datos — Neon (Postgres serverless, capa gratuita)**
   - Crea una cuenta en https://neon.tech y un proyecto nuevo.
   - En el diálogo "Connect to your database" copia **dos** connection
     strings distintos (usa el toggle "Connection pooling" para alternar
     entre ambos):
     - Con el toggle **activado** (host con `-pooler`) → este es
       `DATABASE_URL`, el que usa la app en cada request.
     - Con el toggle **desactivado** (host sin `-pooler`) → este es
       `DIRECT_URL`, solo para migraciones. Es obligatorio: las
       migraciones de Prisma fallan con error `P1002` (tiempo de espera
       agotado al adquirir un bloqueo) si intentas correrlas contra la
       conexión pooled, porque esa pasa por PgBouncer en modo
       transacción y no soporta bloqueos de sesión.

2. **Vercel**
   - En https://vercel.com → **Add New → Project** → importa el repo
     `constructoraintegralacayucan-droid/Fracc-IXM` de GitHub.
   - Framework se detecta solo como Next.js, no cambies el Build Command
     (ya quedó configurado en `package.json` para correr
     `prisma migrate deploy && next build`, así que las migraciones se
     aplican solas en cada deploy).
   - En **Environment Variables** agrega:
     - `DATABASE_URL` → el connection string **pooled** de Neon (con
       `-pooler`).
     - `DIRECT_URL` → el connection string **directo** de Neon (sin
       `-pooler`).
     - `AUTH_SECRET` → un valor aleatorio largo. Puedes generarlo con
       `openssl rand -base64 32`.
   - Dale **Deploy**.

3. **Cargar los datos reales (una sola vez)**
   Después del primer deploy exitoso, corre el seed apuntando a la base de
   producción desde tu máquina (o desde esta sesión):
   ```bash
   DATABASE_URL="<el mismo connection string de Neon>" npx prisma db seed
   ```
   Esto crea las 8 manzanas, los 182 lotes y el usuario admin
   (`admin@ixmegallo.mx` / `Ixmegallo2026!`).

4. **Después del primer login en producción**
   - Cambia la contraseña del admin (por ahora se cambia directo en la base
     de datos o agregando una pantalla de "cambiar contraseña" — no está
     implementada todavía).
   - Verifica que `/admin/reservas` reciba las solicitudes reales.

## Pendiente para producción

- Conectar una pasarela de pagos real (Stripe/Culqi/Conekta) — por ahora el
  apartado/compra es un registro simulado en base de datos.
- Reemplazar las imágenes/ilustraciones genéricas por fotografía real del
  fraccionamiento y su plano oficial (el DWG/PDF entregado no traía
  coordenadas utilizables para un mapa geográficamente exacto; el mapa
  actual es un diagrama esquemático por manzana).
- Definir roles adicionales (vendedores) si se requiere acceso limitado.
- Cambiar `AUTH_SECRET` y la contraseña del admin antes de desplegar.
