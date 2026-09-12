-- Precios públicos por defecto (todo el desarrollo) y por lote (opcional,
-- para excepciones). Columnas nuevas, con default o nulas: no requiere
-- backfill.

ALTER TABLE "Desarrollo"
  ADD COLUMN "precioContadoDefault" DECIMAL(12,2) NOT NULL DEFAULT 85000,
  ADD COLUMN "precioCreditoDefault" DECIMAL(12,2) NOT NULL DEFAULT 120000;

ALTER TABLE "Lote"
  ADD COLUMN "precioContado" DECIMAL(12,2),
  ADD COLUMN "precioCredito" DECIMAL(12,2);
