import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";

const LEGAL_PROSE = "prose prose-invert prose-sm max-w-none text-muted-foreground space-y-6";

export default function RaffleTermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Términos y reglas del sorteo | holacachero.cl"
        description="Reglas del sorteo mensual de holacachero.cl: participación, tickets, premio y reclamo."
        canonicalPath="/rifa/terminos"
        robots="index, follow"
        noSocial
      />
      <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-copper transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/rifa" className="hover:text-copper transition-colors">Rifa</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Términos y reglas</span>
        </nav>
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Términos y reglas del sorteo</h1>

        <div className={LEGAL_PROSE}>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Descripción del sorteo</h2>
            <p>
              La plataforma holacachero.cl puede realizar sorteos periódicos entre usuarios registrados.
              Estos términos regulan las condiciones de participación, premios y reclamo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Participación</h2>
            <p>
              Solo usuarios registrados en la plataforma pueden participar en el sorteo.
              Ser mayor de 18 años es requisito indispensable. La plataforma se reserva el derecho de excluir a usuarios que incumplan las normas del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Sistema de tickets</h2>
            <p>
              Cada ticket representa una papeleta en el sorteo. Más tickets significan mayor probabilidad de ganar.
              El número de tickets acumulados por usuario es el que se considera al momento del sorteo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Cómo se obtienen tickets</h2>
            <p>
              Los tickets pueden obtenerse mediante la participación en actividades del sitio, como el Desafío del Día,
              interacciones dentro de la plataforma y otras acciones que la plataforma indique en cada momento.
              Las reglas concretas de asignación de tickets se publican en la sección de la rifa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Selección del ganador</h2>
            <p>
              El ganador se selecciona aleatoriamente entre todos los tickets participantes, de forma ponderada según el número de tickets de cada usuario.
              El sorteo es realizado por la plataforma y su resultado es inapelable, salvo error técnico demostrable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Premio</h2>
            <p>
              El premio consiste en 1 hora exclusiva con el perfil que el ganador elija dentro de la plataforma,
              conforme a la disponibilidad y condiciones del perfil seleccionado. El premio no es canjeable por dinero ni por otro bien o servicio distinto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Notificación al ganador</h2>
            <p>
              El ganador será notificado dentro de su cuenta. Se mostrará un botón especial &quot;Cobrar premio&quot; que abrirá WhatsApp hacia un número configurado por el administrador, para coordinar la entrega del premio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Reclamo del premio</h2>
            <p>
              El ganador deberá contactar mediante el botón indicado para coordinar el premio.
              Cualquier acuerdo posterior entre el ganador y el perfil elegido es exclusiva responsabilidad de las partes; la plataforma actúa únicamente como intermediaria tecnológica.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Plazo para reclamar</h2>
            <p>
              El premio debe reclamarse dentro del plazo definido por la plataforma (indicado en la notificación o en la sección de la rifa).
              Si el ganador no reclama en plazo, la plataforma puede declarar el premio caducado sin responsabilidad adicional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Exclusión de responsabilidad</h2>
            <p>
              La plataforma actúa únicamente como intermediaria tecnológica del sorteo. No se responsabiliza por acuerdos posteriores entre el ganador y los perfiles, ni por la prestación efectiva del servicio vinculado al premio fuera de la coordinación inicial.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Modificación o cancelación</h2>
            <p>
              La plataforma puede modificar o cancelar el sorteo si lo considera necesario por razones de seguridad, legales o de funcionamiento, sin que ello genere derecho a indemnización para los participantes.
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link to="/rifa" className="text-sm text-copper hover:underline">← Volver a la rifa</Link>
        </p>
      </div>
    </div>
  );
}
