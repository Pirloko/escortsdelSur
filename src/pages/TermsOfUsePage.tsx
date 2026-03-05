import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";

const LEGAL_PROSE = "prose prose-invert prose-sm max-w-none text-muted-foreground space-y-6";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Términos de uso | holacachero.cl"
        description="Condiciones de uso de la plataforma holacachero.cl. Uso permitido, responsabilidades y ley aplicable."
        canonicalPath="/terminos-de-uso"
        robots="index, follow"
        noSocial
      />
      <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-copper transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Términos de uso</span>
        </nav>
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Términos de uso del sitio</h1>

        <div className={LEGAL_PROSE}>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Introducción</h2>
            <p>
              El acceso y uso del sitio holacachero.cl implica la aceptación de los presentes términos de uso.
              Si no está de acuerdo con ellos, le rogamos que no utilice la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Descripción del servicio</h2>
            <p>
              El sitio funciona como una plataforma digital donde se publican perfiles y se permite la interacción entre usuarios.
              La plataforma actúa únicamente como intermediaria tecnológica: no presta servicios directos ni garantiza acuerdos entre usuarios.
              Cualquier relación o transacción que surja entre usuarios es exclusiva responsabilidad de las partes involucradas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Registro de usuarios</h2>
            <p>
              Los usuarios que se registren en el sitio deben proporcionar información veraz y actualizada.
              Es responsabilidad del usuario mantener la confidencialidad de sus credenciales y notificar cualquier uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Uso permitido del sitio</h2>
            <p>
              El sitio debe utilizarse únicamente para fines legales y de conformidad con estos términos.
              El uso de la plataforma está destinado a mayores de 18 años.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Usos prohibidos</h2>
            <p className="mb-2">Queda expresamente prohibido:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Realizar spam o envío masivo de mensajes no solicitados.</li>
              <li>Cometer fraude o utilizar el sitio con fines engañosos.</li>
              <li>Suplantar la identidad de otra persona o entidad.</li>
              <li>Publicar contenido ilegal, difamatorio o que vulnere derechos de terceros.</li>
              <li>Acosar, intimidar o hostigar a otros usuarios.</li>
            </ul>
            <p className="mt-2">El incumplimiento puede dar lugar a la suspensión o eliminación de la cuenta.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contenido generado por usuarios</h2>
            <p>
              Los usuarios son responsables del contenido que publican en la plataforma.
              La plataforma no se hace responsable de la veracidad, legalidad o idoneidad de dicho contenido,
              aunque se reserva el derecho de retirar contenidos que vulneren estos términos o la ley aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitación de responsabilidad</h2>
            <p>
              El sitio no es responsable por acuerdos, transacciones o interacciones entre usuarios realizados dentro o fuera de la plataforma.
              La plataforma se ofrece &quot;tal cual&quot; y no garantiza la disponibilidad ininterrumpida ni la ausencia de errores.
              En la medida permitida por la ley, se excluye la responsabilidad por daños indirectos o consecuentes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Propiedad intelectual</h2>
            <p>
              El diseño, marca, logotipos y contenido propio del sitio pertenecen a la plataforma holacachero.cl o a sus licenciantes.
              Queda prohibida la reproducción, distribución o uso no autorizado sin consentimiento previo por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Cambios en los términos</h2>
            <p>
              La plataforma puede modificar estos términos en cualquier momento. Los cambios serán publicados en esta página con indicación de la fecha de actualización.
              El uso continuado del sitio tras la publicación de modificaciones implica la aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales competentes del país.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Contacto</h2>
            <p>
              Para consultas sobre estos términos de uso puede contactarnos a través de los canales indicados en el sitio (por ejemplo, formulario de contacto o correo electrónico).
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link to="/" className="text-sm text-copper hover:underline">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
