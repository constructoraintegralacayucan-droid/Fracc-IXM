-- CreateEnum
CREATE TYPE "EstatusLote" AS ENUM ('DISPONIBLE', 'APARTADO', 'VENDIDO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('CONTADO', 'CREDITO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "EstatusReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "Manzana" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "Manzana_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "manzanaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "clave" TEXT NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "areaM2" DOUBLE PRECISION,
    "frenteM" DOUBLE PRECISION,
    "fondoM" DOUBLE PRECISION,
    "estatus" "EstatusLote" NOT NULL DEFAULT 'DISPONIBLE',
    "tipoPago" "TipoPago",
    "anticipo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "apartadoMonto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "compradorNombre" TEXT,
    "compradorTelefono" TEXT,
    "compradorCorreo" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT,
    "montoReserva" DECIMAL(12,2) NOT NULL,
    "planTipoPago" "TipoPago" NOT NULL DEFAULT 'CONTADO',
    "plazoMeses" INTEGER,
    "inicialMonto" DECIMAL(12,2),
    "mensajeCliente" TEXT,
    "estatus" "EstatusReserva" NOT NULL DEFAULT 'PENDIENTE',
    "expiraEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProyectoConfig" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Fraccionamiento Ixmegallo',
    "ubicacion" TEXT NOT NULL DEFAULT 'Acayucan, Veracruz, México',
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "descripcion" TEXT NOT NULL DEFAULT '',
    "inicialMinimoPct" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "plazosMeses" INTEGER[] DEFAULT ARRAY[6, 12, 18, 24, 36, 48, 60, 72, 84, 96]::INTEGER[],
    "tasaInteres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservaMinima" DECIMAL(12,2) NOT NULL DEFAULT 5000,
    "plazoReservaDias" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProyectoConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manzana_numero_key" ON "Manzana"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_clave_key" ON "Lote"("clave");

-- CreateIndex
CREATE INDEX "Lote_manzanaId_idx" ON "Lote"("manzanaId");

-- CreateIndex
CREATE INDEX "Lote_estatus_idx" ON "Lote"("estatus");

-- CreateIndex
CREATE INDEX "Reserva_loteId_idx" ON "Reserva"("loteId");

-- CreateIndex
CREATE INDEX "Reserva_estatus_idx" ON "Reserva"("estatus");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_manzanaId_fkey" FOREIGN KEY ("manzanaId") REFERENCES "Manzana"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
