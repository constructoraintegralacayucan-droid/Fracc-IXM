-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_email_key" ON "Colaborador"("email");

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN "comprobantePago" TEXT;
ALTER TABLE "Reserva" ADD COLUMN "colaboradorId" TEXT;

-- CreateIndex
CREATE INDEX "Reserva_colaboradorId_idx" ON "Reserva"("colaboradorId");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
