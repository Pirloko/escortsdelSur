import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";

const LEGAL_PROSE = "prose prose-invert prose-sm max-w-none text-muted-foreground space-y-6";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Política de privacidad | holacachero.cl"
        description="Política de privacidad de holacachero.cl. Información recopilada, uso, cookies y derechos del usuario."
        canonicalPath="/privacidad"
        robots="index, follow"
        noSocial
      />
      <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-copper transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Política de privacidad</span>
        </nav>
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Política de privacidad</h1>

        <div className={LEGAL_PROSE}>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Información recopilada</h2>
            <p>
              Recopilamos datos de registro (correo electrónico, nombre, y cuando se proporciona, teléfono u otros datos de perfil),
              datos de navegación y uso del sitio (dirección IP, páginas visitadas, dispositivo), y en el caso de perfiles publicados,
              la información que el usuario decida incluir en su anuncio (fotos, descripción, zona, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Uso de la información</h2>
            <p>
              La información se utiliza para mejorar la plataforma y la experiencia del usuario: gestionar cuentas, publicar y mostrar perfiles,
              personalizar contenidos cuando aplique, analizar el uso del sitio y cumplir obligaciones legales cuando corresponda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Cookies</h2>
            <p>
              El sitio utiliza cookies para el funcionamiento técnico (por ejemplo, sesión e identificación) y, en su caso, para analítica.
              Puede gestionar o rechazar cookies desde la configuración de su navegador o mediante el banner de cookies que se muestra al entrar al sitio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Seguridad</h2>
            <p>
              La plataforma implementa medidas de seguridad técnicas y organizativas para proteger la información frente a accesos no autorizados,
              pérdida o alteración. Los datos se almacenan en infraestructura con estándares de seguridad adecuados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Derechos del usuario</h2>
            <p>
              Los usuarios pueden solicitar acceso, rectificación, eliminación o limitación del tratamiento de sus datos, así como oponerse al tratamiento
              y presentar reclamaciones ante la autoridad de protección de datos, de acuerdo con la ley chilena aplicable.
              Para ejercer estos derechos puede contactarnos a través de los canales indicados en el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Cambios en la política</h2>
            <p>
              Esta política puede modificarse en cualquier momento. Los cambios serán publicados en esta página con la fecha de actualización.
              Se recomienda revisarla periódicamente. El uso continuado del sitio tras los cambios implica la aceptación de la política actualizada.
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
