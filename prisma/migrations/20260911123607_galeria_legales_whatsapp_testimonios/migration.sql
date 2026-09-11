-- CreateEnum
CREATE TYPE "EstatusTestimonio" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "ProyectoConfig" ADD COLUMN     "avisoPrivacidad" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "disclaimer" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "terminosCondiciones" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsapp" TEXT;

-- CreateTable
CREATE TABLE "ImagenGaleria" (
    "id" TEXT NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImagenGaleria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonio" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "nombre" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL DEFAULT 5,
    "estatus" "EstatusTestimonio" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImagenGaleria_orden_idx" ON "ImagenGaleria"("orden");

-- CreateIndex
CREATE INDEX "Testimonio_estatus_idx" ON "Testimonio"("estatus");

-- AddForeignKey
ALTER TABLE "Testimonio" ADD CONSTRAINT "Testimonio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Data migration: backfill legal/disclaimer templates on the existing config row
UPDATE "ProyectoConfig" SET
  "disclaimer" = 'Los precios, promociones y disponibilidad están sujetos a cambio sin previo aviso. El precio "desde" mostrado en esta página aplica únicamente a lotes seleccionados, no a la totalidad del fraccionamiento. Las imágenes son ilustrativas y pueden no representar la ubicación exacta de cada lote.',
  "terminosCondiciones" = 'Términos y Condiciones

Última actualización: [fecha]

1. Objeto
Estos Términos y Condiciones regulan el uso del sitio web de Terravista, operado por Constructora Integral Acayucan ("la Constructora"), así como el proceso de apartado, compra y financiamiento de lotes en los fraccionamientos aquí promocionados.

2. Del apartado de lotes
El apartado de un lote a través del sitio no constituye una compraventa. Es una solicitud que la Constructora debe confirmar. El monto de apartado, el plazo para completar el pago o firmar el contrato correspondiente, y las condiciones para su devolución o retención en caso de cancelación, serán las que la Constructora comunique al cliente al confirmar el apartado.

3. Del financiamiento directo
Los planes de financiamiento mostrados (enganche mínimo, plazos, mensualidades) son estimados y sin intereses salvo que se indique lo contrario. Están sujetos a la firma de un contrato de compraventa o promesa de compraventa que detalle las condiciones definitivas.

4. Precios y disponibilidad
Los precios, la disponibilidad de lotes y las promociones (incluyendo ofertas por tiempo limitado) pueden cambiar sin previo aviso y no constituyen una oferta vinculante hasta la firma del contrato correspondiente.

5. Cancelaciones
La Constructora se reserva el derecho de cancelar un apartado si el cliente no completa los pagos o trámites acordados en los plazos establecidos, liberando el lote para su venta a terceros.

6. Uso del portal de clientes
El acceso al portal de clientes (estado de cuenta) es personal e intransferible. El cliente es responsable de mantener la confidencialidad de sus credenciales de acceso.

7. Propiedad intelectual
El contenido de este sitio (textos, imágenes, planos esquemáticos) es propiedad de la Constructora y no puede reproducirse sin autorización.

8. Modificaciones
La Constructora podrá modificar estos Términos y Condiciones en cualquier momento. Los cambios aplican a partir de su publicación en este sitio.

9. Legislación aplicable
Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia se someterá a los tribunales competentes de Acayucan, Veracruz.

10. Contacto
Para dudas sobre estos Términos y Condiciones, contáctanos en constructoraintegral_acayucan@hotmail.com o al 924 112 2354.

— Este es un texto de referencia. Se recomienda que un abogado lo revise y lo adapte a la razón social, RFC y condiciones reales de la Constructora antes de su uso definitivo. —',
  "avisoPrivacidad" = 'Aviso de Privacidad

Última actualización: [fecha]

Constructora Integral Acayucan ("la Constructora"), con domicilio en Calle Ixmegallo, entrando por Ignacio Zaragoza, esquina calle Ixmegallo, rumbo a Cobanal, Acayucan, Veracruz, es responsable del tratamiento de los datos personales que nos proporciones a través de este sitio, de conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.

1. Datos personales que recabamos
Nombre completo, teléfono, correo electrónico, y en su caso datos relacionados con el apartado, compra y financiamiento de un lote (montos, plazos, historial de pagos).

2. Finalidades del tratamiento
- Dar seguimiento a tu solicitud de apartado o información.
- Elaborar y dar seguimiento a tu plan de financiamiento.
- Darte acceso al portal de clientes con tu estado de cuenta.
- Contactarte por teléfono, correo o WhatsApp sobre tu trámite.
- Fines estadísticos y de mejora de nuestros servicios.

3. Transferencia de datos
Tus datos no serán transferidos a terceros salvo que sea necesario para la formalización legal de tu compra (por ejemplo, notarías) o por requerimiento de autoridad competente.

4. Derechos ARCO
Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales (derechos ARCO). Para ejercerlos, contáctanos en constructoraintegral_acayucan@hotmail.com o al 924 112 2354.

5. Uso de cookies y tecnologías similares
Este sitio puede utilizar cookies técnicas necesarias para su funcionamiento (por ejemplo, mantener tu sesión iniciada en el portal de clientes o administración).

6. Cambios a este aviso
Nos reservamos el derecho de actualizar este Aviso de Privacidad. Cualquier cambio será publicado en esta misma página.

— Este es un texto de referencia. Se recomienda que un abogado lo revise y lo adapte a la razón social, RFC y procesos reales de la Constructora antes de su uso definitivo. —',
  "whatsapp" = '9241122354'
WHERE "terminosCondiciones" = '';

