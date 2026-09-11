-- AlterTable
ALTER TABLE "ProyectoConfig" ADD COLUMN     "ofertaActiva" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ofertaFin" TIMESTAMP(3),
ADD COLUMN     "ofertaTitulo" TEXT,
ADD COLUMN     "plazoMaxPublico" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "plazoRecomendado" INTEGER NOT NULL DEFAULT 12,
ALTER COLUMN "inicialMinimoPct" SET DEFAULT 20;
