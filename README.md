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
- `src/proxy.ts` — protege `/admin/*` (reemplaza al antiguo `middleware.ts`
  en Next.js 16).
- `prisma/schema.prisma` — modelo de datos (Manzana, Lote, Reserva,
  AdminUser, ProyectoConfig).
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

## Pendiente para producción

- Conectar una pasarela de pagos real (Stripe/Culqi/Conekta) — por ahora el
  apartado/compra es un registro simulado en base de datos.
- Reemplazar las imágenes/ilustraciones genéricas por fotografía real del
  fraccionamiento y su plano oficial (el DWG/PDF entregado no traía
  coordenadas utilizables para un mapa geográficamente exacto; el mapa
  actual es un diagrama esquemático por manzana).
- Definir roles adicionales (vendedores) si se requiere acceso limitado.
- Cambiar `AUTH_SECRET` y la contraseña del admin antes de desplegar.
