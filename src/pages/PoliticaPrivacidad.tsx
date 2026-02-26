import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Política de privacidad | Punto Cachero"
        description="Política de privacidad y tratamiento de datos personales de Punto Cachero."
        canonicalPath="/politica-de-privacidad"
        robots="noindex, follow"
        noSocial
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-gold transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Política de privacidad</span>
        </nav>
        <h1 className="text-3xl font-display font-bold mb-8">Política de privacidad</h1>

        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Responsable del tratamiento</h2>
            <p>
              Los datos personales recabados a través de este sitio son tratados por el responsable del proyecto Punto Cachero, conforme a la legislación chilena aplicable en materia de protección de datos.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Datos que recogemos</h2>
            <p>
              Podemos recoger datos de registro (correo, nombre, teléfono cuando se proporciona), datos de uso del sitio y, en el caso de perfiles publicados, la información que el usuario decida incluir en su anuncio (fotos, descripción, zona, etc.).
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Finalidad</h2>
            <p>
              Los datos se utilizan para gestionar cuentas, publicar y mostrar perfiles en el marketplace, mejorar el servicio y cumplir obligaciones legales cuando corresponda.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Base legal y conservación</h2>
            <p>
              El tratamiento se basa en el consentimiento y en la ejecución del contrato de uso del servicio. Los datos se conservan mientras sea necesario para esas finalidades o por obligación legal.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Derechos</h2>
            <p>
              Usted puede acceder, rectificar, solicitar eliminación o limitación del tratamiento de sus datos, así como oponerse y presentar reclamaciones ante la autoridad de control, de acuerdo con la ley chilena.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Seguridad y terceros</h2>
            <p>
              Aplicamos medidas técnicas y organizativas para proteger los datos. Solo compartimos información con terceros cuando sea necesario para el servicio (por ejemplo, infraestructura de hosting) o por obligación legal.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Cambios</h2>
            <p>
              Cualquier cambio en esta política se publicará en esta página. Se recomienda revisarla periódicamente.
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
