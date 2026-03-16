import { useParams, Link } from "react-router-dom";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, SlidersHorizontal, Phone } from "lucide-react";
import { IconWhatsApp } from "@/components/IconWhatsApp";
import { SeoHead } from "@/components/SeoHead";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getCityBySlug, filterCategories, filterAges } from "@/lib/data";
import { ALLOWED_CITY_SLUGS } from "@/lib/site-config";
import { getCitySeo, getSeoContentWordCount } from "@/lib/cities-seo-data";
import { FeaturedProfileCard } from "@/components/FeaturedProfileCard";
import { WatermarkedImage } from "@/components/WatermarkedImage";
import { trackProfileClickFromList } from "@/lib/analytics";

const GalleryViewerModal = lazy(() => import("@/components/GalleryViewerModal").then((m) => ({ default: m.GalleryViewerModal })));
import { CitySeoBlock } from "@/components/CitySeoBlock";
import { JsonLdCity } from "@/components/JsonLd";
import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getWhatsAppProfileUrl } from "@/lib/whatsapp";
import { getProfileUrl } from "@/lib/seo-programmatic";
import { isSupabaseStorageUrl, getSupabaseImageTransformUrl } from "@/lib/supabase-image";

const ESTADOS_TIME_LABELS = ["HACE 2 MIN.", "HACE 5 MIN.", "HACE 7 MIN.", "HACE 15 MIN.", "HACE 30 MIN.", "HACE 1 HORA", "HACE UNAS HORAS"];
const PROFILES_PAGE_SIZE = 12;

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor((seed * (i + 1)) % (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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
  const staticCity = citySlug ? getCityBySlug(citySlug) : null;
  const seo = citySlug ? getCitySeo(citySlug) : null;
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeAge, setActiveAge] = useState<string | null>(null);

  // Al ingresar a la página de ciudad, mostrar la parte superior (hero, título, filtros)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [citySlug]);

  type CityRow = { id: string; slug: string; name: string; profiles: number; image: string | null; is_active?: boolean; meta_robots?: string | null };
  type EscortRow = { id: string; name: string; age: number; badge: string | null; image: string | null; available: boolean; whatsapp?: string | null; time_slot?: string | null; time_slots?: string[] | null; subidas_per_day?: number | null; promotion?: string | null; description?: string | null; nationality?: string | null; gallery?: string[] | null; slug?: string | null; vip_extras?: string[] | null };

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

  const nowIso = useMemo(() => new Date().toISOString(), []);
  const {
    data: escortProfilesData,
    isLoading: profilesLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["escort_profiles_by_city", cityId],
    queryFn: async ({ pageParam }): Promise<EscortRow[]> => {
      if (!supabase || !cityId) return [];
      const from = pageParam * PROFILES_PAGE_SIZE;
      const to = from + PROFILES_PAGE_SIZE - 1;
      const { data } = await supabase
        .from("escort_profiles")
        .select("id, name, age, badge, image, available, whatsapp, time_slot, time_slots, subidas_per_day, promotion, description, nationality, gallery, slug, vip_extras")
        .eq("city_id", cityId)
        .not("promotion", "is", null)
        .gt("active_until", nowIso)
        .order("promotion", { ascending: true })
        .order("updated_at", { ascending: false })
        .range(from, to);
      return (data ?? []) as EscortRow[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PROFILES_PAGE_SIZE ? allPages.length : undefined,
    enabled: !!cityId && !!supabase,
  });

  const escortProfiles = useMemo(
    () => (escortProfilesData?.pages ?? []).flat(),
    [escortProfilesData?.pages]
  );

  const { data: statusPhrases = [] } = useQuery({
    queryKey: ["status_phrases"],
    queryFn: async (): Promise<{ id: string; text: string }[]> => {
      if (!supabase) return [];
      const { data } = await supabase.from("status_phrases").select("id, text").order("updated_at", { ascending: false });
      return (data ?? []) as { id: string; text: string }[];
    },
    enabled: !!supabase,
  });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  type HotStoryRow = { id: string; content: string; story_date: string; escort_profile_id: string; escort_profiles: { id: string; name: string; city_id: string } | null };
  const { data: hotStoriesRaw = [], error: hotStoriesError } = useQuery({
    queryKey: ["hot_stories"],
    queryFn: async (): Promise<HotStoryRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("hot_stories")
        .select("id, content, story_date, escort_profile_id, escort_profiles(id, name, city_id)")
        .order("story_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as HotStoryRow[];
    },
    enabled: !!supabase,
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
    image: p.image ?? "/marcadeagua.png",
    available: p.available,
    whatsapp: (p as EscortRow).whatsapp ?? null,
    promotion: (p as EscortRow).promotion ?? null,
    description: (p as EscortRow).description ?? null,
    nationality: (p as EscortRow).nationality ?? null,
    galleryCount: Array.isArray((p as EscortRow).gallery) ? (p as EscortRow).gallery!.length : 0,
    gallery: Array.isArray((p as EscortRow).gallery) ? (p as EscortRow).gallery! : [],
    slug: (p as EscortRow).slug ?? null,
    vip_extras: Array.isArray((p as EscortRow).vip_extras) ? (p as EscortRow).vip_extras! : [],
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

  type ProfileItem = { id: string; name: string; age: number; city: string; badge: string; image: string; available: boolean; whatsapp?: string | null; promotion?: string | null; description?: string | null; nationality?: string | null; galleryCount?: number; gallery?: string[]; slug?: string | null; vip_extras?: string[] };

  const toTelUrl = (raw: string | null | undefined): string | null => {
    if (!raw || !raw.trim()) return null;
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 8) return null;
    const num = digits.startsWith("56") ? "+" + digits : "+56" + digits;
    return `tel:${num}`;
  };
  // Galería: promoción "galeria" o extra VIP "incluir_galeria"
  const galleryProfiles: ProfileItem[] = profiles.filter((p) => {
    const item = p as ProfileItem;
    return item.promotion === "galeria" || (Array.isArray(item.vip_extras) && item.vip_extras.includes("incluir_galeria"));
  });
  // VIP: mismo orden (subidas), pero con promoción "destacada" primero en el grid
  const profilesSorted =
    [...profiles].sort((a, b) => {
      const pa = (a as ProfileItem).promotion;
      const pb = (b as ProfileItem).promotion;
      if (pa === "destacada" && pb !== "destacada") return -1;
      if (pa !== "destacada" && pb === "destacada") return 1;
      return 0;
    });
  const [galleryViewerOpen, setGalleryViewerOpen] = useState(false);
  const [galleryViewerProfile, setGalleryViewerProfile] = useState<{
    name: string;
    photos: string[];
    profileHref?: string;
    telUrl?: string | null;
    whatsappUrl?: string | null;
    profileId?: string;
    city?: string;
  } | null>(null);
  const [estadosTimeBucket, setEstadosTimeBucket] = useState(() => Math.floor(Date.now() / (5 * 60 * 1000)));
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setEstadosTimeBucket(Math.floor(Date.now() / (5 * 60 * 1000))), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const profilesToShow = profilesSorted;

  // Scroll infinito: cuando el sentinel es visible, cargar más (sin duplicar si ya está cargando)
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = loadMoreSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Preload LCP: primera imagen de perfil (URL transformada si es Supabase)
  useEffect(() => {
    const firstImage = profilesToShow[0]?.image;
    if (!firstImage || typeof firstImage !== "string") return;
    const href = isSupabaseStorageUrl(firstImage)
      ? getSupabaseImageTransformUrl(firstImage, { variant: "profile" })
      : firstImage;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      if (link.parentNode === document.head) document.head.removeChild(link);
    };
  }, [profilesToShow[0]?.image]);

  const openGalleryViewer = (profile: ProfileItem) => {
    const gallery = profile.gallery ?? [];
    const photos = profile.image ? [profile.image, ...gallery] : gallery;
    if (photos.length === 0) return;
    const profileHref = getProfileUrl(profile, citySlug ?? undefined);
    const tel = toTelUrl(profile.whatsapp);
    const wa = getWhatsAppProfileUrl(profile.whatsapp, profile.id, profile.city, profileHref);
    trackProfileClickFromList({ profile_id: profile.id, profile_name: profile.name, city: profile.city, list_context: "galeria" });
    setGalleryViewerProfile({
      name: profile.name,
      photos,
      profileHref,
      telUrl: tel,
      whatsappUrl: wa,
      profileId: profile.id,
      city: profile.city,
    });
    setGalleryViewerOpen(true);
  };

  const isRancagua = citySlug?.toLowerCase() === "rancagua";
  const title =
    seo?.seo_title ??
    (isRancagua
      ? "Escorts en Rancagua | Putas, Damas de Compañía y Acompañantes – Hola Cachero"
      : `Escorts en ${city.name} | Perfiles Premium en el Sur de Chile`);
  const description =
    seo?.seo_description ??
    (isRancagua
      ? "Escorts en Rancagua, putas en Rancagua, damas de compañía y acompañantes en Rancagua. Sexo en Rancagua y Sexosur. Perfiles premium en Hola Cachero."
      : `Perfiles y acompañantes en ${city.name}. Escort en ${city.name}. Servicio premium en el sur de Chile.`);
  const thinContent = seo && getSeoContentWordCount(seo.seo_content ?? "") < 600;
  const robots =
    thinContent ? "noindex, nofollow" : dbCity?.meta_robots != null ? dbCity.meta_robots : dbCity?.is_active === false ? "noindex, nofollow" : "index, follow";
  const noIndex = robots.startsWith("noindex");
  const otherCities = activeCitiesList.filter(
    (c) => c.slug !== citySlug && ALLOWED_CITY_SLUGS.includes(c.slug)
  );

  const estadosFeedItems = useMemo(() => {
    if (profiles.length === 0 || statusPhrases.length === 0) return [];
    const seed = estadosTimeBucket / 1e6;
    const shuffledProfiles = shuffleArray(profiles, seed);
    const shuffledPhrases = shuffleArray([...statusPhrases], seed + 0.1);
    const count = Math.min(10, profiles.length, statusPhrases.length, Math.max(5, Math.floor(profiles.length * 0.8)));
    const items: { profileId: string; profileSlug: string | null; profileName: string; phrase: string; timeLabel: string; cityName: string }[] = [];
    for (let i = 0; i < count; i++) {
      const profile = shuffledProfiles[i % shuffledProfiles.length];
      const phrase = shuffledPhrases[i % shuffledPhrases.length];
      const timeLabel = ESTADOS_TIME_LABELS[Math.floor((seed * 100 + i) % ESTADOS_TIME_LABELS.length)];
      items.push({
        profileId: profile.id,
        profileSlug: (profile as ProfileItem).slug ?? null,
        profileName: profile.name.toUpperCase(),
        phrase: phrase.text,
        timeLabel,
        cityName: city.name,
      });
    }
    return items;
  }, [profiles, statusPhrases, city.name, estadosTimeBucket]);

  const hotStoriesForCity = useMemo(() => {
    if (!cityId) return [];
    const profileIdsInCity = new Set(escortProfiles.map((p) => p.id));
    return hotStoriesRaw
      .filter((h) => {
        if (profileIdsInCity.has(h.escort_profile_id)) return true;
        return h.escort_profiles?.city_id === cityId;
      })
      .sort((a, b) => b.story_date.localeCompare(a.story_date));
  }, [hotStoriesRaw, cityId, escortProfiles]);

  const formatStoryDate = (dateStr: string) => {
    try {
      return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

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

      {/* Header: dimensiones fijas para CLS — overlay suave para que la imagen se vea mejor */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <img
          src={city.image || "/Sewell.jpg"}
          alt={`Perfiles y acompañantes en ${city.name}, sur de Chile`}
          className="absolute inset-0 w-full h-full object-cover object-center"
          width={1200}
          height={480}
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 from-15% via-background/35 via-45% to-transparent" />

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
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            {isRancagua ? "Escorts en Rancagua" : city.name}
          </h1>
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

      {/* Galería: estilo historias (círculos + nombre). Al pulsar se abre el visor de fotos del perfil. */}
      {!profilesLoading && galleryProfiles.length > 0 && (
        <div className="w-full mt-2">
          <h2 className="text-lg font-display font-bold mb-3 px-4">Galería</h2>
          <div className="overflow-x-auto overflow-y-hidden pb-2">
            <div className="flex gap-8 px-4 min-w-0" style={{ width: "max-content" }}>
              {galleryProfiles.map((profile) => {
                const photos = profile.image
                  ? [profile.image, ...(profile.gallery ?? [])]
                  : profile.gallery ?? [];
                const hasPhotos = photos.length > 0;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => hasPhotos && openGalleryViewer(profile as ProfileItem)}
                    disabled={!hasPhotos}
                    className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
                    aria-label={hasPhotos ? `Ver galería de ${profile.name}` : `${profile.name} (sin fotos)`}
                  >
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-white overflow-hidden bg-muted shrink-0 group-hover:border-gold/80 transition-colors">
                      <WatermarkedImage
                        src={profile.image}
                        alt={profile.name}
                        className="absolute inset-0 w-full h-full"
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate max-w-[140px] sm:max-w-[168px] text-center">
                      {profile.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {galleryViewerProfile && (
            <Suspense fallback={null}>
              <GalleryViewerModal
                open={galleryViewerOpen}
                onOpenChange={setGalleryViewerOpen}
                profileName={galleryViewerProfile.name}
                photos={galleryViewerProfile.photos}
                profileHref={galleryViewerProfile.profileHref}
                telUrl={galleryViewerProfile.telUrl}
                whatsappUrl={galleryViewerProfile.whatsappUrl}
                profileId={galleryViewerProfile.profileId}
                city={galleryViewerProfile.city}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* VIP: listado horizontal (imagen izquierda, texto derecho) */}
      <div className="px-4 max-w-7xl mx-auto mt-6">
        <h2 className="text-lg font-display font-bold mb-3">VIP</h2>
        {profilesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex rounded-2xl border border-border bg-card overflow-hidden h-40 shimmer" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Aún no hay perfiles publicados en esta ciudad.</p>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {profilesToShow.map((profile) => (
              <motion.div key={profile.id} variants={fadeUp}>
                <FeaturedProfileCard
                  profile={{
                    id: profile.id,
                    name: profile.name,
                    age: profile.age,
                    city: profile.city,
                    badge: profile.badge,
                    image: profile.image,
                    available: profile.available,
                    whatsapp: profile.whatsapp ?? null,
                    description: (profile as ProfileItem).description ?? null,
                    nationality: (profile as ProfileItem).nationality ?? null,
                    galleryCount: (profile as ProfileItem).galleryCount ?? 0,
                    gallery: (profile as ProfileItem).gallery ?? [],
                    slug: (profile as ProfileItem).slug ?? null,
                    vip_extras: (profile as ProfileItem).vip_extras ?? [],
                  }}
                  citySlug={citySlug ?? undefined}
                />
              </motion.div>
            ))}
            {hasNextPage && <div ref={loadMoreSentinelRef} className="h-4 w-full" aria-hidden />}
            {isFetchingNextPage && (
              <div className="space-y-4 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={`skeleton-${i}`} className="flex rounded-2xl border border-border bg-card overflow-hidden h-40 shimmer" />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Estados actualizados: feed de frases asignadas aleatoriamente a perfiles */}
      {estadosFeedItems.length > 0 && (
        <section className="px-4 max-w-7xl mx-auto mt-8 pt-6 border-t border-border/50" aria-labelledby="estados-actualizados-heading">
          <h2 id="estados-actualizados-heading" className="text-xl font-display font-bold mb-4 text-foreground">
            ESTADOS ACTUALIZADOS.
          </h2>
          <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto" role="region" aria-label="Listado de estados actualizados">
              <ul className="divide-y divide-border">
                {estadosFeedItems.map((item, i) => (
                <li key={`${item.profileId}-${i}`} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-gold text-sm uppercase tracking-wide">{item.profileName}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.timeLabel}</span>
                  </div>
                  <p className="text-sm text-foreground leading-snug">{item.phrase}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{item.cityName}</p>
                    <Link
                    to={getProfileUrl({ id: item.profileId, slug: item.profileSlug }, citySlug ?? undefined)}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-gold hover:text-gold/80 transition-colors"
                  >
                    Ver perfil
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Historias calientes: todas las fechas para SEO, en caja con scroll */}
      {hotStoriesForCity.length > 0 && (
        <section className="px-4 max-w-7xl mx-auto mt-8 pt-6 border-t border-border/50" aria-labelledby="historias-calientes-heading">
          <h2 id="historias-calientes-heading" className="text-xl font-display font-bold mb-4 text-foreground">
            Historias calientes
          </h2>
          <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto p-4 space-y-4" role="region" aria-label="Historias por fecha">
              {hotStoriesForCity.map((story) => {
                const escort = escortProfiles.find((p) => p.id === story.escort_profile_id);
                const profileName = escort?.name ?? story.escort_profiles?.name ?? "Perfil";
                const profileSlug = (escort as EscortRow | undefined)?.slug ?? null;
                return (
                <article key={story.id} className="rounded-lg border border-border/60 bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-gold text-sm uppercase tracking-wide">
                      {profileName}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatStoryDate(story.story_date)}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-3">{story.content}</p>
                  <Link
                    to={getProfileUrl({ id: story.escort_profile_id, slug: profileSlug }, citySlug ?? undefined)}
                    className="text-sm font-medium text-gold hover:text-gold/80 transition-colors inline-flex items-center gap-1.5"
                  >
                    Ver perfil
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              );
              })}
            </div>
          </div>
        </section>
      )}

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
