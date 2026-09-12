-- CreateEnum
CREATE TYPE "TipoOrdenPago" AS ENUM ('RESERVA', 'CUOTA');

-- CreateEnum
CREATE TYPE "EstatusOrdenPago" AS ENUM ('PENDIENTE', 'PAGADA', 'FALLIDA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "OrdenPago" (
    "id" TEXT NOT NULL,
    "conektaOrderId" TEXT NOT NULL,
    "checkoutUrl" TEXT NOT NULL,
    "tipo" "TipoOrdenPago" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "estatus" "EstatusOrdenPago" NOT NULL DEFAULT 'PENDIENTE',
    "loteId" TEXT,
    "reservaId" TEXT,
    "clienteId" TEXT,
    "numeroCuota" INTEGER,
    "pagoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenPago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrdenPago_conektaOrderId_key" ON "OrdenPago"("conektaOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenPago_pagoId_key" ON "OrdenPago"("pagoId");

-- CreateIndex
CREATE INDEX "OrdenPago_estatus_idx" ON "OrdenPago"("estatus");

-- CreateIndex
CREATE INDEX "OrdenPago_loteId_idx" ON "OrdenPago"("loteId");

-- CreateIndex
CREATE INDEX "OrdenPago_clienteId_idx" ON "OrdenPago"("clienteId");

-- CreateIndex
CREATE INDEX "OrdenPago_reservaId_idx" ON "OrdenPago"("reservaId");

-- AddForeignKey
ALTER TABLE "OrdenPago" ADD CONSTRAINT "OrdenPago_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenPago" ADD CONSTRAINT "OrdenPago_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenPago" ADD CONSTRAINT "OrdenPago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenPago" ADD CONSTRAINT "OrdenPago_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;
