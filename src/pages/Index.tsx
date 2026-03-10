import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { JsonLdHome } from "@/components/JsonLd";
import { supabase } from "@/lib/supabase";
import { cities } from "@/lib/data";
import { ACTIVE_CITY_SLUG } from "@/lib/site-config";
import { FeaturedProfileCard } from "@/components/FeaturedProfileCard";
import { CityCard } from "@/components/CityCard";
import { HeroSection } from "@/components/HeroSection";
import { RaffleHighlightCard } from "@/components/RaffleHighlightCard";
import { BenefitsSection } from "@/components/BenefitsSection";
import { RaffleSection } from "@/components/RaffleSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { ThemeToggle } from "@/components/ThemeToggle";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80";

/** Baraja un array (Fisher-Yates) y devuelve hasta `take` elementos. */
function shuffleAndTake<T>(arr: T[], take: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, take);
}

/** Fecha del próximo sorteo (configurable). Ej: "31 Mar" o "1 de abril". */
const PROXIMO_SORTEO = "31 Mar";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Index() {
  const { data: dbCities = [] } = useQuery({
    queryKey: ["cities-list"],
    queryFn: async () => {
      if (!supabase) return [];
      const { data } = await supabase.from("cities").select("id, slug, name").order("name");
      return (data ?? []) as { id: string; slug: string; name: string }[];
    },
    enabled: !!supabase,
  });

  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      if (!supabase) return null;
      const [profilesRes, commentsRes, citiesRes] = await Promise.all([
        supabase.from("escort_profiles").select("id", { count: "exact", head: true }),
        supabase.from("profile_comments").select("id", { count: "exact", head: true }),
        supabase.from("cities").select("id", { count: "exact", head: true }),
      ]);
      return {
        usuarios: profilesRes.count ?? 0,
        comentarios: commentsRes.count ?? 0,
        ciudades: citiesRes.count ?? 0,
      };
    },
    enabled: !!supabase,
  });

  const firstCitySlug = ACTIVE_CITY_SLUG;
  const citiesForDisplay = cities.filter((c) => c.id === ACTIVE_CITY_SLUG);

  const { data: vipProfiles = [] } = useQuery({
    queryKey: ["home-vip-rancagua", ACTIVE_CITY_SLUG],
    queryFn: async () => {
      if (!supabase) return [];
      const { data: cityRow } = await supabase
        .from("cities")
        .select("id, name")
        .eq("slug", ACTIVE_CITY_SLUG)
        .single();
      if (!cityRow) return [];
      const now = new Date().toISOString();
      const { data: rows } = await supabase
        .from("escort_profiles")
        .select("id, name, age, badge, image, available, whatsapp, description, nationality, gallery, slug, vip_extras")
        .eq("city_id", (cityRow as { id: string; name: string }).id)
        .not("promotion", "is", null)
        .gt("active_until", now);
      type Row = { id: string; name: string; age: number; badge: string | null; image: string | null; available: boolean; whatsapp?: string | null; description?: string | null; nationality?: string | null; gallery?: string[] | null; slug?: string | null; vip_extras?: string[] | null };
      const list = (rows ?? []) as Row[];
      const cityName = (cityRow as { id: string; name: string }).name;
      const mapped = list.map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        city: cityName,
        badge: p.badge ?? "Perfil",
        image: p.image ?? DEFAULT_IMAGE,
        available: p.available,
        whatsapp: p.whatsapp ?? null,
        description: p.description ?? null,
        nationality: p.nationality ?? null,
        galleryCount: Array.isArray(p.gallery) ? p.gallery.length : 0,
        gallery: Array.isArray(p.gallery) ? p.gallery : [],
        slug: p.slug ?? null,
        vip_extras: Array.isArray(p.vip_extras) ? p.vip_extras : [],
      }));
      return shuffleAndTake(mapped, 4);
    },
    enabled: !!supabase,
  });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <ThemeToggle />
      <SeoHead
        title="Escorts en Rancagua y el Sur de Chile | Hola Cachero – Acompañantes y Damas de Compañía"
        description="Hola Cachero: escorts en Rancagua, acompañantes, damas de compañía y perfiles premium en el sur de Chile. Sexo en Rancagua y más ciudades. Servicio verificado y discreto."
        canonicalPath="/"
      />
      <JsonLdHome />

      <HeroSection firstCitySlug={firstCitySlug} />

      {/* VIP: lo importante son los perfiles, van primero */}
      <section className="px-4 py-16 max-w-7xl mx-auto" aria-labelledby="vip-heading">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2
                id="vip-heading"
                className="text-2xl md:text-3xl font-display font-bold text-foreground"
              >
                VIP
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Perfiles seleccionados para ti
              </p>
            </div>
            <Link
              to={`/${ACTIVE_CITY_SLUG}`}
              className="text-copper text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-300"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div
            variants={stagger}
            className="space-y-4"
          >
            {vipProfiles.map((profile) => (
              <motion.div key={profile.id} variants={fadeUp}>
                <FeaturedProfileCard
                  cardHref={`/${ACTIVE_CITY_SLUG}`}
                  profile={{
                    id: profile.id,
                    name: profile.name,
                    age: profile.age,
                    city: profile.city,
                    badge: profile.badge,
                    image: profile.image,
                    available: profile.available,
                    whatsapp: profile.whatsapp ?? null,
                    description: profile.description ?? null,
                    nationality: profile.nationality ?? null,
                    galleryCount: profile.galleryCount ?? 0,
                    gallery: profile.gallery ?? [],
                    slug: profile.slug ?? null,
                    vip_extras: profile.vip_extras ?? [],
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Ciudades */}
      <section className="px-4 py-16 max-w-7xl mx-auto" aria-labelledby="ciudades-heading">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-8">
            <h2
              id="ciudades-heading"
              className="text-2xl md:text-3xl font-display font-bold text-foreground"
            >
              Escorts en el sur: ciudades disponibles
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Escort en Rancagua, acompañantes y damas de compañía por ubicación</p>
          </motion.div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
            {citiesForDisplay.map((city) => (
              <motion.div key={city.id} variants={fadeUp} className="min-w-[240px] md:min-w-0">
                <CityCard city={city} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Bloque compacto: beneficios, rifa, comunidad y CTA (menos espacio para priorizar perfiles) */}
      <div className="border-t border-copper/20 py-4 space-y-2 bg-card/30">
        <RaffleHighlightCard />
        <BenefitsSection />
        <RaffleSection
          participantesCount={stats?.usuarios}
          proximoSorteo={PROXIMO_SORTEO}
        />
        <SocialProofSection
          usuarios={stats?.usuarios}
          comentarios={stats?.comentarios}
          ciudades={stats?.ciudades}
        />
        <FinalCTASection />
      </div>

      {/* Footer mínimo: enlace legal + copyright */}
      <footer className="border-t border-copper/30 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
          <p className="text-center">
            <Link
              to="/terminos-de-uso"
              className="text-sm text-gold hover:text-gold/80 underline underline-offset-2 transition-colors"
            >
              Términos de uso
            </Link>
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Hola Cachero – Escorts en Rancagua, acompañantes y damas de compañía en el sur de Chile.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} holacachero.cl. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
