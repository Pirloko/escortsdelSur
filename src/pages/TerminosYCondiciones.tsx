import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";

export default function TerminosYCondiciones() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Términos y Condiciones | Punto Cachero"
        description="Términos y condiciones de uso del marketplace Punto Cachero."
        canonicalPath="/terminos-y-condiciones"
        robots="noindex, follow"
        noSocial
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Términos y condiciones</span>
        </nav>
        <h1 className="text-3xl font-display font-bold mb-8">Términos y condiciones</h1>

        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Aceptación</h2>
            <p>
              El acceso y uso de este sitio constituye la aceptación de los presentes términos y condiciones. Si no está de acuerdo, no utilice el servicio.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Uso del servicio</h2>
            <p>
              Este marketplace está destinado a usuarios mayores de edad. Queda prohibido el uso para fines ilegales o que vulneren derechos de terceros. Los perfiles publicados deben corresponder a personas que ofrecen servicios de acompañamiento de forma voluntaria y legal.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Contenido y responsabilidad</h2>
            <p>
              Cada anunciante es responsable del contenido de su perfil. La plataforma no garantiza la veracidad de la información publicada y actúa como intermediario. Cualquier acuerdo o transacción entre usuarios es exclusivamente entre las partes.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Privacidad</h2>
            <p>
              El tratamiento de datos personales se rige por nuestra <Link to="/politica-de-privacidad" className="text-gold hover:underline">Política de privacidad</Link>.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos. Los cambios serán publicados en esta página. El uso continuado del sitio tras las modificaciones implica aceptación.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contacto</h2>
            <p>
              Para consultas sobre estos términos puede contactarnos a través de los canales indicados en el sitio.
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link to="/" className="text-sm text-gold hover:underline">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
