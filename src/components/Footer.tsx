import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { ACTIVE_CITY_SLUG } from "@/lib/site-config";

const footerCities = [{ name: "Rancagua", slug: ACTIVE_CITY_SLUG }] as const;

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-gold" />
              <span className="font-display text-lg font-bold">Sur Premium</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El marketplace exclusivo del sur de Chile.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4">Ciudades</h4>
            <ul className="space-y-2">
              {footerCities.map(({ name, slug }) => (
                <li key={slug}>
                  <Link to={`/${slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Ver perfiles en {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terminos-y-condiciones" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link to="/politica-de-privacidad" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div />
        </div>

        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Sur Premium. Todos los derechos reservados.</p>
          <div className="h-px w-12 bg-gold/30 md:hidden" />
        </div>
      </div>
    </footer>
  );
}
