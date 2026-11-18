-- CreateEnum
CREATE TYPE "TipoDescuentoCupon" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- CreateTable
CREATE TABLE "Cupon" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoDescuento" "TipoDescuentoCupon" NOT NULL DEFAULT 'PORCENTAJE',
    "valor" DECIMAL(12,2) NOT NULL,
    "desarrolloId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "usosMaximos" INTEGER,
    "usosActuales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cupon_codigo_key" ON "Cupon"("codigo");

-- CreateIndex
CREATE INDEX "Cupon_desarrolloId_idx" ON "Cupon"("desarrolloId");

-- AddForeignKey
ALTER TABLE "Cupon" ADD CONSTRAINT "Cupon_desarrolloId_fkey" FOREIGN KEY ("desarrolloId") REFERENCES "Desarrollo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN "cuponId" TEXT,
ADD COLUMN "descuentoAplicado" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "Reserva_cuponId_idx" ON "Reserva"("cuponId");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_cuponId_fkey" FOREIGN KEY ("cuponId") REFERENCES "Cupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
