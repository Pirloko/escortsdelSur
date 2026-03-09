import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { WatermarkedImage } from "@/components/WatermarkedImage";
import { getAnalyticsDashboard } from "@/lib/admin-analytics";
import { computeTopEscortsScore } from "@/lib/top-escorts-algorithm";
import { getProfileUrl } from "@/lib/seo-programmatic";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/seo-programmatic";

const TOP_N = 10;

export default function TopEscortsPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const slug = citySlug || "rancagua";

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["top_escorts_analytics", slug],
    queryFn: () => getAnalyticsDashboard({ city: slug, days: 30 }),
    staleTime: 5 * 60 * 1000,
  });

  const profileIds =
    analytics?.topProfiles && analytics.topProfiles.length > 0
      ? computeTopEscortsScore(analytics.topProfiles)
          .slice(0, TOP_N)
          .map((p) => p.profile_id)
      : [];

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["top_escorts_profiles", profileIds],
    queryFn: async () => {
      if (!supabase || profileIds.length === 0) return [];
      const { data } = await supabase
        .from("escort_profiles")
        .select("id, name, age, badge, image, zone, slug, cities(name)")
        .in("id", profileIds);
      const list = (data ?? []) as Array<{
        id: string;
        name: string;
        age: number;
        badge: string | null;
        image: string | null;
        zone: string | null;
        slug: string | null;
        cities: { name?: string } | null;
      }>;
      const order = profileIds.slice();
      return order
        .map((id) => list.find((p) => p.id === id))
        .filter(Boolean) as typeof list;
    },
    enabled: profileIds.length > 0 && !!supabase,
  });

  const cityName = slug === "rancagua" ? "Rancagua" : slug;
  const title = `Top Escorts en ${cityName} | Perfiles más populares – Hola Cachero`;
  const description = `Descubre las escorts más populares en ${cityName}. Ranking basado en visitas, contacto por WhatsApp y tiempo en perfil. Perfiles verificados en Hola Cachero.`;

  const itemListJsonLd =
    profiles && profiles.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Top Escorts en ${cityName}`,
          description,
          numberOfItems: profiles.length,
          itemListElement: profiles.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              name: p.name,
              url: `${SITE_URL}${getProfileUrl({ id: p.id, slug: p.slug }, slug)}`,
            },
          })),
        }
      : null;

  if (loadingAnalytics || (profileIds.length > 0 && loadingProfiles)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando ranking…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SeoHead
        title={title}
        description={description}
        canonicalPath={`/${slug}/top-escorts`}
        robots="index, follow"
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Top Escorts en {cityName}
        </h1>
        <p className="text-muted-foreground mb-8">
          Perfiles más populares según visitas, contactos y tiempo de lectura.
        </p>

        {profiles && profiles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to={getProfileUrl(profile, slug)}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-gold/40 transition-colors"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  <WatermarkedImage
                    src={profile.image ?? ""}
                    alt={profile.name}
                    className="absolute inset-0"
                    imgClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {profile.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/50 text-xs text-white">
                      {profile.badge}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-lg text-foreground">{profile.name}</h2>
                  {profile.zone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      {profile.zone}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm text-gold font-medium mt-2 group-hover:underline">
                    Ver perfil
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Aún no hay datos de ranking para esta ciudad. El top se actualiza con la analítica de
            visitas y contactos.
          </p>
        )}

        {/* Contenido SEO 400-600 palabras */}
        <article className="mt-16 prose prose-invert prose-sm max-w-none text-muted-foreground">
          <h2 className="text-xl font-display font-bold text-foreground mb-4">
            Escorts más populares en {cityName}
          </h2>
          <p>
            En Hola Cachero el ranking de las escorts más populares en {cityName} se actualiza con
            datos reales: número de visitas al perfil, clics en WhatsApp y en teléfono, y tiempo que
            los usuarios pasan viendo cada perfil. Así puedes descubrir qué acompañantes generan
            más interés y mejor valoran los visitantes.
          </p>
          <p>
            Las zonas más demandadas en {cityName} suelen ser el centro y sectores como Machalí y
            Cachapoal, donde muchas profesionales ofrecen atención a domicilio o en apartamento.
            El ranking refleja tanto la popularidad por visitas como por contactos efectivos,
            ayudando a quienes buscan acompañantes con buena aceptación.
          </p>
          <p>
            La experiencia de los usuarios que navegan por los perfiles permite mejorar la oferta:
            los perfiles con más tiempo de lectura y más clics de contacto suelen ofrecer fotos
            claras, descripciones detalladas y datos de contacto visibles. Recomendamos revisar
            servicios incluidos, zonas de atención y disponibilidad antes de contactar.
          </p>
          <p>
            Si buscas escorts en {cityName}, el top de perfiles más populares es un buen punto de
            partida. Todos los anuncios que aparecen en el ranking están verificados en la
            plataforma. Para más opciones, explora las categorías por tipo de servicio o zona en
            Hola Cachero.
          </p>
        </article>
      </div>
    </div>
  );
}
