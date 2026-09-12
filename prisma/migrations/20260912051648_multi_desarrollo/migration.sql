-- Convierte el sitio de "un solo proyecto" a "varios desarrollos".
-- ProyectoConfig era una fila única con la configuración del proyecto;
-- ahora Desarrollo es una tabla con una fila por fraccionamiento. Este
-- script crea el desarrollo "ixmegallo" a partir de esa fila existente y
-- reasigna manzanas, imágenes y testimonios a ese desarrollo, sin perder
-- ningún dato real.

-- 1) Tabla Desarrollo
CREATE TABLE "Desarrollo" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Fraccionamiento Ixmegallo',
    "ubicacion" TEXT NOT NULL DEFAULT 'Acayucan, Veracruz, México',
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "descripcion" TEXT NOT NULL DEFAULT '',
    "imagenPortada" TEXT,
    "inicialMinimoPct" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "plazosMeses" INTEGER[] DEFAULT ARRAY[6,12,18,24,36,48,60,72,84,96]::INTEGER[],
    "plazoMaxPublico" INTEGER NOT NULL DEFAULT 24,
    "plazoRecomendado" INTEGER NOT NULL DEFAULT 12,
    "tasaInteres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reservaMinima" DECIMAL(12,2) NOT NULL DEFAULT 5000,
    "plazoReservaDias" INTEGER NOT NULL DEFAULT 3,
    "ofertaActiva" BOOLEAN NOT NULL DEFAULT false,
    "ofertaTitulo" TEXT,
    "ofertaFin" TIMESTAMP(3),
    "disclaimer" TEXT NOT NULL DEFAULT '',
    "terminosCondiciones" TEXT NOT NULL DEFAULT '',
    "avisoPrivacidad" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Desarrollo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Desarrollo_slug_key" ON "Desarrollo"("slug");
CREATE INDEX "Desarrollo_activo_orden_idx" ON "Desarrollo"("activo", "orden");

-- 2) Copiar la fila única de ProyectoConfig (si existe) al nuevo desarrollo "ixmegallo"
INSERT INTO "Desarrollo" (
    "id", "slug", "nombre", "ubicacion", "moneda", "descripcion",
    "inicialMinimoPct", "plazosMeses", "plazoMaxPublico", "plazoRecomendado",
    "tasaInteres", "reservaMinima", "plazoReservaDias", "ofertaActiva",
    "ofertaTitulo", "ofertaFin", "disclaimer", "terminosCondiciones",
    "avisoPrivacidad", "whatsapp", "activo", "orden", "updatedAt"
)
SELECT
    'ixmegallo', 'ixmegallo', "nombre", "ubicacion", "moneda", "descripcion",
    "inicialMinimoPct", "plazosMeses", "plazoMaxPublico", "plazoRecomendado",
    "tasaInteres", "reservaMinima", "plazoReservaDias", "ofertaActiva",
    "ofertaTitulo", "ofertaFin", "disclaimer", "terminosCondiciones",
    "avisoPrivacidad", "whatsapp", true, 0, CURRENT_TIMESTAMP
FROM "ProyectoConfig"
LIMIT 1;

-- Si por algún motivo no había fila en ProyectoConfig, crea un desarrollo
-- por defecto para que el resto del script (que asume al menos un
-- desarrollo) no falle.
INSERT INTO "Desarrollo" ("id", "slug", "updatedAt")
SELECT 'ixmegallo', 'ixmegallo', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Desarrollo");

-- 3) Manzana: agregar desarrolloId, rellenar, y migrar el unique constraint
ALTER TABLE "Manzana" ADD COLUMN "desarrolloId" TEXT;
UPDATE "Manzana" SET "desarrolloId" = (SELECT "id" FROM "Desarrollo" ORDER BY "createdAt" ASC LIMIT 1);
ALTER TABLE "Manzana" ALTER COLUMN "desarrolloId" SET NOT NULL;
DROP INDEX "Manzana_numero_key";
CREATE UNIQUE INDEX "Manzana_desarrolloId_numero_key" ON "Manzana"("desarrolloId", "numero");
ALTER TABLE "Manzana" ADD CONSTRAINT "Manzana_desarrolloId_fkey" FOREIGN KEY ("desarrolloId") REFERENCES "Desarrollo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4) Lote: agregar desarrolloId (tomado de su manzana), rellenar, migrar unique constraint
ALTER TABLE "Lote" ADD COLUMN "desarrolloId" TEXT;
UPDATE "Lote" l SET "desarrolloId" = m."desarrolloId" FROM "Manzana" m WHERE m."id" = l."manzanaId";
ALTER TABLE "Lote" ALTER COLUMN "desarrolloId" SET NOT NULL;
DROP INDEX "Lote_clave_key";
CREATE UNIQUE INDEX "Lote_desarrolloId_clave_key" ON "Lote"("desarrolloId", "clave");
CREATE INDEX "Lote_desarrolloId_idx" ON "Lote"("desarrolloId");
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_desarrolloId_fkey" FOREIGN KEY ("desarrolloId") REFERENCES "Desarrollo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5) ImagenGaleria: agregar desarrolloId y rellenar
ALTER TABLE "ImagenGaleria" ADD COLUMN "desarrolloId" TEXT;
UPDATE "ImagenGaleria" SET "desarrolloId" = (SELECT "id" FROM "Desarrollo" ORDER BY "createdAt" ASC LIMIT 1);
ALTER TABLE "ImagenGaleria" ALTER COLUMN "desarrolloId" SET NOT NULL;
DROP INDEX IF EXISTS "ImagenGaleria_orden_idx";
CREATE INDEX "ImagenGaleria_desarrolloId_orden_idx" ON "ImagenGaleria"("desarrolloId", "orden");
ALTER TABLE "ImagenGaleria" ADD CONSTRAINT "ImagenGaleria_desarrolloId_fkey" FOREIGN KEY ("desarrolloId") REFERENCES "Desarrollo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6) Testimonio: agregar desarrolloId y rellenar
ALTER TABLE "Testimonio" ADD COLUMN "desarrolloId" TEXT;
UPDATE "Testimonio" SET "desarrolloId" = (SELECT "id" FROM "Desarrollo" ORDER BY "createdAt" ASC LIMIT 1);
ALTER TABLE "Testimonio" ALTER COLUMN "desarrolloId" SET NOT NULL;
DROP INDEX IF EXISTS "Testimonio_estatus_idx";
CREATE INDEX "Testimonio_desarrolloId_estatus_idx" ON "Testimonio"("desarrolloId", "estatus");
ALTER TABLE "Testimonio" ADD CONSTRAINT "Testimonio_desarrolloId_fkey" FOREIGN KEY ("desarrolloId") REFERENCES "Desarrollo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7) Retirar la tabla de configuración única, ya migrada a Desarrollo
DROP TABLE "ProyectoConfig";
