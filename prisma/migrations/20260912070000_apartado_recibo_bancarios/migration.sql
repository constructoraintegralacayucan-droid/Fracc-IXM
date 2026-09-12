-- AlterTable
ALTER TABLE "Desarrollo" ADD COLUMN "datosBancarios" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN "reservaId" TEXT;

-- CreateIndex
CREATE INDEX "Pago_reservaId_idx" ON "Pago"("reservaId");

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;
