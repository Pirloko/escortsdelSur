import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, SlidersHorizontal, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { SeoHead } from "@/components/SeoHead";
import { useQuery } from "@tanstack/react-query";
import { getCityBySlug, filterCategories, filterAges } from "@/lib/data";
import { getCitySeo, getSeoContentWordCount } from "@/lib/cities-seo-data";
import { ProfileCard } from "@/components/ProfileCard";
import { CitySeoBlock } from "@/components/CitySeoBlock";
import { JsonLdCity } from "@/components/JsonLd";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sortProfilesWithSubidas } from "@/lib/franjas";

const GALLERY_INTERVAL_MS = 5000;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const CityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const staticCity = citySlug ? getCityBySlug(citySlug) : null;
  const seo = citySlug ? getCitySeo(citySlug) : null;
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeAge, setActiveAge] = useState<string | null>(null);

  type CityRow = { id: string; slug: string; name: string; profiles: number; image: string | null; is_active?: boolean; meta_robots?: string | null };
  type EscortRow = { id: string; name: string; age: number; badge: string | null; image: string | null; available: boolean; whatsapp?: string | null; time_slot?: string | null; subidas_per_day?: number | null; promotion?: string | null };

  const { data: dbCity } = useQuery({
    queryKey: ["city", citySlug],
    queryFn: async (): Promise<CityRow | null> => {
      if (!supabase || !citySlug) return null;
      const { data } = await supabase.from("cities").select("id, slug, name, profiles, image, is_active, meta_robots").eq("slug", citySlug).single();
      return data as CityRow | null;
    },
    enabled: !!citySlug && !!supabase,
  });

  const cityId = dbCity?.id;
  const { data: activeCitiesList = [] } = useQuery({
    queryKey: ["cities-active"],
    queryFn: async (): Promise<{ slug: string; name: string }[]> => {
      if (!supabase) return [];
      const { data } = await supabase.from("cities").select("slug, name, is_active, meta_robots");
      const rows = (data ?? []) as { slug: string; name: string; is_active?: boolean; meta_robots?: string | null }[];
      return rows
        .filter((c) => c.is_active !== false && (!c.meta_robots || !c.meta_robots.toLowerCase().includes("noindex")))
        .map((c) => ({ slug: c.slug, name: c.name }));
    },
    enabled: !!supabase,
  });

  const { data: escortProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["escort_profiles_by_city", cityId],
    queryFn: async (): Promise<EscortRow[]> => {
      if (!supabase || !cityId) return [];
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("escort_profiles")
        .select("id, name, age, badge, image, available, whatsapp, time_slot, subidas_per_day, promotion")
        .eq("city_id", cityId)
        .or(`active_until.is.null,active_until.gt.${now}`);
      const rows = (data ?? []) as EscortRow[];
      return sortProfilesWithSubidas(rows);
    },
    enabled: !!cityId && !!supabase,
  });

  const city = dbCity
    ? { id: dbCity.slug, name: dbCity.name, profiles: dbCity.profiles ?? escortProfiles.length, image: dbCity.image ?? staticCity?.image ?? "" }
    : staticCity;
  if (!city) return null;

  const allProfiles = escortProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age,
    city: city.name,
    badge: p.badge ?? "Perfil",
    image: p.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    available: p.available,
    whatsapp: (p as EscortRow).whatsapp ?? null,
    promotion: (p as EscortRow).promotion ?? null,
  }));

  const byCategory =
    activeCategory === "Todas"
      ? allProfiles
      : allProfiles.filter((p) => (p.badge ?? "").trim() === activeCategory);

  const inAgeRange = (age: number): boolean => {
    if (!activeAge) return true;
    switch (activeAge) {
      case "18-22":
        return age >= 18 && age <= 22;
      case "23-26":
        return age >= 23 && age <= 26;
      case "27-30":
        return age >= 27 && age <= 30;
      case "30+":
        return age >= 30;
      default:
        return true;
    }
  };

  const profiles = activeAge ? byCategory.filter((p) => inAgeRange(p.age)) : byCategory;

  type ProfileItem = { id: string; name: string; age: number; city: string; badge: string; image: string; available: boolean; whatsapp?: string | null; promotion?: string | null };

  const toWhatsAppUrl = (raw: string | null | undefined): string | null => {
    if (!raw || !raw.trim()) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 8) return null;
    const num = digits.startsWith("56") ? digits : "56" + digits;
    return `https://wa.me/${num}`;
  };
  const toTelUrl = (raw: string | null | undefined): string | null => {
    if (!raw || !raw.trim()) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 8) return null;
    const num = digits.startsWith("56") ? "+" + digits : "+56" + digits;
    return `tel:${num}`;
  };
  // Galería: solo promoción "galeria", orden ya viene de sortProfilesWithSubidas (subidas 5 o 10 + franja)
  const galleryProfiles: ProfileItem[] = profiles.filter((p) => (p as ProfileItem).promotion === "galeria");
  // Destacadas: mismo orden (subidas), pero con promoción "destacada" primero en el grid
  const profilesSorted =
    [...profiles].sort((a, b) => {
      const pa = (a as ProfileItem).promotion;
      const pb = (b as ProfileItem).promotion;
      if (pa === "destacada" && pb !== "destacada") return -1;
      if (pa !== "destacada" && pb === "destacada") return 1;
      return 0;
    });
  const [galleryIndex, setGalleryIndex] = useState(0);
  useEffect(() => {
    if (galleryProfiles.length <= 1) return;
    const t = setInterval(() => {
      setGalleryIndex((i) => (i + 1) % galleryProfiles.length);
    }, GALLERY_INTERVAL_MS);
    return () => clearInterval(t);
  }, [galleryProfiles.length]);
  useEffect(() => {
    setGalleryIndex(0);
  }, [activeCategory, activeAge]);

  const title = seo?.seo_title ?? `Escorts en ${city.name} | Perfiles Premium en el Sur de Chile`;
  const description = seo?.seo_description ?? `Perfiles y acompañantes en ${city.name}. Servicio premium en el sur de Chile.`;
  const thinContent = seo && getSeoContentWordCount(seo.seo_content) < 600;
  const robots =
    thinContent ? "noindex, nofollow" : dbCity?.meta_robots != null ? dbCity.meta_robots : dbCity?.is_active === false ? "noindex, nofollow" : "index, follow";
  const noIndex = robots.startsWith("noindex");
  const otherCities = activeCitiesList.filter((c) => c.slug !== citySlug);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <SeoHead
        title={title}
        description={description}
        canonicalPath={`/${citySlug}`}
        ogImage={city.image || undefined}
        robots={robots}
        noSocial={noIndex}
        preloadImage={city.image || undefined}
      />
      {/* Canonical siempre a URL limpia; filtros ?categoria= ?edad= ?disponibilidad= no se indexan; si hay 0 resultados con filtro → noindex en futura implementación */}
      <JsonLdCity
        cityName={city.name}
        citySlug={citySlug!}
        profileCount={profiles.length}
        profileNames={profiles.map((p) => p.name)}
      />

      {/* Header: dimensiones fijas para CLS */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={city.image}
          alt={`Perfiles y acompañantes en ${city.name}, sur de Chile`}
          className="absolute inset-0 w-full h-full object-cover"
          width={1200}
          height={480}
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute top-4 left-4 z-10">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
        </div>

        <div className="absolute bottom-6 left-4 right-4 z-10">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-gold">{city.name}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">{city.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {profiles.length} perfil{profiles.length !== 1 ? "es" : ""} disponible{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 max-w-7xl mx-auto space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button className="flex-shrink-0 w-9 h-9 rounded-xl glass flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
          </button>
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-gold text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {filterAges.map((age) => (
            <button
              key={age}
              onClick={() => setActiveAge(activeAge === age ? null : age)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeAge === age
                  ? "bg-accent text-accent-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {age} años
            </button>
          ))}
        </div>
      </div>

      {/* Galería: carrusel 1 perfil a la vez (promoción), ancho completo */}
      {!profilesLoading && galleryProfiles.length > 0 && (
        <div className="w-full mt-2">
          <h2 className="text-lg font-display font-bold mb-3 px-4">Galería</h2>
          <div className="relative w-full overflow-hidden bg-surface aspect-[3/4] max-h-[70vh]">
            {galleryProfiles.map((profile, i) => (
              <div
                key={profile.id}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) return;
                  navigate(`/perfil/${profile.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if ((e.target as HTMLElement).closest("a")) return;
                    e.preventDefault();
                    navigate(`/perfil/${profile.id}`);
                  }
                }}
                className={`absolute inset-0 block transition-opacity duration-500 cursor-pointer ${i === galleryIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
              >
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 gradient-card" />
                {profile.badge && profile.badge !== "Perfil" && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-xs font-medium text-foreground/90 border border-white/10">
                      {profile.badge}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10 pb-5 px-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {profile.name}, {profile.age}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {profile.city}
                  </p>
                  <div className="flex gap-3 mt-4">
                    {toTelUrl((profile as ProfileItem).whatsapp) && (
                      <a
                        href={toTelUrl((profile as ProfileItem).whatsapp)!}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-sm text-foreground hover:bg-white/35 transition-colors border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Llamar"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    )}
                    {toWhatsAppUrl((profile as ProfileItem).whatsapp) && (
                      <a
                        href={toWhatsAppUrl((profile as ProfileItem).whatsapp)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors shadow-md"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="WhatsApp"
                      >
                        <IconWhatsApp size={22} className="text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Indicadores y navegación: debajo de la imagen, separados */}
          {galleryProfiles.length > 1 && (
            <div className="flex items-center justify-center gap-4 py-4 px-4 bg-background">
              <button
                type="button"
                onClick={() => setGalleryIndex((i) => (i === 0 ? galleryProfiles.length - 1 : i - 1))}
                className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2 items-center">
                {galleryProfiles.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`min-w-[10px] min-h-[10px] w-2.5 h-2.5 rounded-full transition-colors ${i === galleryIndex ? "bg-gold scale-110" : "bg-muted-foreground/40 hover:bg-muted-foreground/60"}`}
                    aria-label={`Ver perfil ${i + 1} de ${galleryProfiles.length}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setGalleryIndex((i) => (i === galleryProfiles.length - 1 ? 0 : i + 1))}
                className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Destacadas: grid de perfiles */}
      <div className="px-4 max-w-7xl mx-auto mt-6">
        <h2 className="text-lg font-display font-bold mb-3">Destacadas</h2>
        {profilesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl shimmer" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Aún no hay perfiles publicados en esta ciudad.</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {profilesSorted.map((profile) => (
              <motion.div key={profile.id} variants={fadeUp}>
                <ProfileCard profile={profile} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Enlazado interno: también disponible en otras ciudades activas */}
      {otherCities.length > 0 && (
        <section className="px-4 py-8 max-w-7xl mx-auto border-t border-border/50" aria-labelledby="tambien-disponible-heading">
          <h2 id="tambien-disponible-heading" className="text-lg font-display font-bold mb-3">También disponible en</h2>
          <ul className="flex flex-wrap gap-2">
            {otherCities.map((c) => (
              <li key={c.slug}>
                <Link to={`/${c.slug}`} className="text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-2">
                  Perfiles en {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bloque SEO: contenido único + enlaces internos; región y sur de Chile en texto */}
      <CitySeoBlock citySlug={citySlug!} cityName={city.name} />
    </div>
  );
};

export default CityPage;
