import { useParams, Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Building2, Shield, Star, MessageCircle, Calendar, Phone, Heart, Globe, BadgeCheck } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { featuredProfiles, profileGallery } from "@/lib/data";
import { getCitySlugFromName } from "@/lib/seo";
import { JsonLdProfile } from "@/components/JsonLd";
import { ProfileCard } from "@/components/ProfileCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistroClienteForm } from "@/components/RegistroClienteForm";
import { ReviewExperienceForm } from "@/components/ReviewExperienceForm";
import { ReviewExperienceCard } from "@/components/ReviewExperienceCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ProfileCommentsRow, ReviewExperiencesRow } from "@/types/database";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const ProfilePage = () => {
  const { profileId } = useParams();
  const queryClient = useQueryClient();
  const { user, role, refreshProfile } = useAuth();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openRegistroCliente, setOpenRegistroCliente] = useState(false);
  const [openReviewForm, setOpenReviewForm] = useState(false);
  const [favoriteToggling, setFavoriteToggling] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  type DbProfile = {
    id: string;
    city_id: string;
    name: string;
    age: number;
    badge: string | null;
    image: string | null;
    available: boolean;
    description: string | null;
    zone: string | null;
    nationality: string | null;
    schedule: string | null;
    whatsapp: string | null;
    gallery: string[] | null;
    services_included?: string[] | null;
    services_extra?: string[] | null;
    active_until?: string | null;
    cities?: { name?: string; slug?: string } | null;
  };

  const { data: dbProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["escort_profile", profileId],
    queryFn: async (): Promise<DbProfile | null> => {
      if (!supabase || !profileId) return null;
      const { data } = await supabase
        .from("escort_profiles")
        .select("id, city_id, name, age, badge, image, available, description, nationality, zone, schedule, whatsapp, gallery, services_included, services_extra, active_until, cities(slug, name)")
        .eq("id", profileId)
        .single();
      return data as DbProfile | null;
    },
    enabled: !!profileId && !!supabase,
  });

  const { data: otherProfilesInCity = [] } = useQuery({
    queryKey: ["other_profiles_same_city", dbProfile?.city_id, profileId],
    queryFn: async () => {
      if (!supabase || !dbProfile?.city_id || !profileId) return [];
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("escort_profiles")
        .select("id, name, age, badge, image, available")
        .eq("city_id", dbProfile.city_id)
        .neq("id", profileId)
        .or(`active_until.is.null,active_until.gt.${now}`)
        .limit(4);
      return (data ?? []) as { id: string; name: string; age: number; badge: string | null; image: string | null; available: boolean }[];
    },
    enabled: !!dbProfile?.city_id && !!profileId && !!supabase,
  });

  const mockProfile = featuredProfiles.find((p) => p.id === profileId) || featuredProfiles[0];
  const citiesRow = dbProfile?.cities;
  const cityName = citiesRow?.name ?? mockProfile.city;
  const citySlugFromDb = citiesRow?.slug ?? null;
  const profile = dbProfile
    ? {
        id: dbProfile.id,
        name: dbProfile.name,
        age: dbProfile.age,
        city: cityName,
        badge: dbProfile.badge ?? "Perfil",
        image: dbProfile.image ?? "",
        available: dbProfile.available,
        description: dbProfile.description,
        nationality: dbProfile.nationality ?? null,
        zone: dbProfile.zone,
        schedule: dbProfile.schedule,
        whatsapp: dbProfile.whatsapp,
        gallery: Array.isArray(dbProfile.gallery) ? dbProfile.gallery : [],
        services_included: Array.isArray(dbProfile.services_included) ? dbProfile.services_included : [],
        services_extra: Array.isArray(dbProfile.services_extra) ? dbProfile.services_extra : [],
      }
    : mockProfile;
  const citySlug = citySlugFromDb ?? getCitySlugFromName(profile.city);
  const isUuid = profileId && /^[0-9a-f-]{36}$/i.test(profileId);
  const notFound = isUuid && !profileLoading && !dbProfile;
  const activeUntil = dbProfile?.active_until ?? null;
  const isProfileExpired = activeUntil ? new Date(activeUntil) < new Date() : false;

  // Registrar vista para visitantes/clientes (historial en Mi perfil)
  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor" || !profileId || !dbProfile?.id) return;
    const viewedAt = new Date().toISOString();
    // @ts-expect-error - generated Supabase types may not include profile_views
    supabase.from("profile_views").upsert({ user_id: user.id, escort_profile_id: profileId, viewed_at: viewedAt }, { onConflict: "user_id,escort_profile_id" }).then(() => {});
  }, [user?.id, role, profileId, dbProfile?.id]);

  const { data: favoriteRows } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!supabase || !user?.id) return [];
      const { data } = await supabase
        .from("favorites")
        .select("escort_profile_id")
        .eq("user_id", user.id);
      return (data ?? []) as { escort_profile_id: string }[];
    },
    enabled: !!user?.id && !!supabase,
  });
  const isInFavorites = !!profileId && (favoriteRows ?? []).some((r) => r.escort_profile_id === profileId);

  const { data: comments = [] } = useQuery({
    queryKey: ["profile_comments", profileId],
    queryFn: async (): Promise<ProfileCommentsRow[]> => {
      if (!supabase || !profileId) return [];
      const { data } = await supabase
        .from("profile_comments")
        .select("id, escort_profile_id, user_id, body, created_at")
        .eq("escort_profile_id", profileId)
        .order("created_at", { ascending: false });
      return (data ?? []) as ProfileCommentsRow[];
    },
    enabled: !!profileId && !!supabase,
  });

  const userIds = [...new Set(comments.map((c) => c.user_id))];
  const { data: commenterProfiles = [] } = useQuery({
    queryKey: ["profiles_display_names", userIds],
    queryFn: async () => {
      if (!supabase || userIds.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
      return (data ?? []) as { id: string; display_name: string | null }[];
    },
    enabled: !!supabase && userIds.length > 0,
  });
  const displayNameByUserId = Object.fromEntries(commenterProfiles.map((p) => [p.id, p.display_name ?? "Anónimo"]));

  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: reviews = [] } = useQuery({
    queryKey: ["review_experiences", profileId],
    queryFn: async (): Promise<ReviewExperiencesRow[]> => {
      if (!supabase || !profileId) return [];
      const { data } = await supabase
        .from("review_experiences")
        .select("*")
        .eq("escort_profile_id", profileId)
        .order("created_at", { ascending: false });
      return (data ?? []) as ReviewExperiencesRow[];
    },
    enabled: !!profileId && !!supabase,
  });
  const reviewsAvg = reviews.length
    ? reviews.reduce((s, r) => s + (r.promedio_final ?? 0), 0) / reviews.length
    : null;
  const reviewUserIds = [...new Set(reviews.map((r) => r.user_id))];
  const { data: reviewAuthorProfiles = [] } = useQuery({
    queryKey: ["profiles_display_names_reviews", reviewUserIds],
    queryFn: async () => {
      if (!supabase || reviewUserIds.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id, display_name").in("id", reviewUserIds);
      return (data ?? []) as { id: string; display_name: string | null }[];
    },
    enabled: !!supabase && reviewUserIds.length > 0,
  });
  const displayNameByReviewUserId = Object.fromEntries(reviewAuthorProfiles.map((p) => [p.id, p.display_name ?? "Anónimo"]));
  const { data: myReviewIn7Days = [] } = useQuery({
    queryKey: ["review_experiences_mine_7d", profileId, user?.id],
    queryFn: async () => {
      if (!supabase || !profileId || !user?.id) return [];
      const { data } = await supabase
        .from("review_experiences")
        .select("id")
        .eq("escort_profile_id", profileId)
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgoIso);
      return (data ?? []) as { id: string }[];
    },
    enabled: !!profileId && !!user?.id && !!supabase,
  });
  const alreadyReviewedIn7Days = myReviewIn7Days.length > 0;

  const startOfTodayUtc = new Date();
  startOfTodayUtc.setUTCHours(0, 0, 0, 0);
  const startOfTodayIso = startOfTodayUtc.toISOString();
  const todayKey = new Date().toISOString().slice(0, 10);
  const { data: myCommentsToday = [] } = useQuery({
    queryKey: ["profile_comments_mine_today", profileId, user?.id, todayKey],
    queryFn: async () => {
      if (!supabase || !profileId || !user?.id) return [];
      const { data } = await supabase
        .from("profile_comments")
        .select("id")
        .eq("escort_profile_id", profileId)
        .eq("user_id", user.id)
        .gte("created_at", startOfTodayIso);
      return (data ?? []) as { id: string }[];
    },
    enabled: !!profileId && !!user?.id && !!supabase,
  });
  const alreadyCommentedToday = myCommentsToday.length > 0;

  const submitComment = async () => {
    const body = commentBody.trim();
    if (!body || !user?.id || !profileId || !supabase || commentSubmitting || role !== "visitor") return;
    if (alreadyCommentedToday) {
      toast.error("Solo puedes dejar 1 comentario por día en cada perfil.");
      return;
    }
    setCommentSubmitting(true);
    // @ts-expect-error - generated Supabase types may not include profile_comments
    const { error } = await supabase.from("profile_comments").insert({ escort_profile_id: profileId, user_id: user.id, body });
    setCommentSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("Ya has dejado un comentario hoy en este perfil.");
      else toast.error(error.message);
      return;
    }
    setCommentBody("");
    queryClient.invalidateQueries({ queryKey: ["profile_comments", profileId] });
    queryClient.invalidateQueries({ queryKey: ["profile_comments_mine_today", profileId, user.id, todayKey] });
    toast.success("Comentario publicado. +1 ticket.");
  };

  const submitReviewExperience = async (payload: Record<string, unknown>) => {
    if (!supabase) return { error: new Error("Sin conexión") };
    // @ts-expect-error - review_experiences Insert type may not be in generated client
    const { error } = await supabase.from("review_experiences").insert(payload);
    return { error: error ? new Error(error.message) : null };
  };

  const toggleFavorite = async () => {
    if (!user?.id || !profileId || !supabase || favoriteToggling) return;
    setFavoriteToggling(true);
    if (isInFavorites) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("escort_profile_id", profileId);
      toast.success("Quitado de favoritos");
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, escort_profile_id: profileId });
      if (error) toast.error(error.message);
      else toast.success("Añadido a favoritos");
    }
    queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
    setFavoriteToggling(false);
  };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const galleryImages =
    profile.image || ("gallery" in profile && Array.isArray(profile.gallery) && profile.gallery.length > 0)
      ? [
          ...(profile.image ? [profile.image] : []),
          ...("gallery" in profile && Array.isArray(profile.gallery) ? profile.gallery : []),
        ].filter(Boolean)
      : profileGallery;
  const isRancagua = profile.city?.toLowerCase().includes("rancagua");
  const title = isRancagua
    ? `${profile.name} Escort en Rancagua | Acompañante VIP – Hola Cachero`
    : `${profile.name}, Escort en ${profile.city} | Perfil Disponible – Hola Cachero`;
  const description =
    "description" in profile && profile.description
      ? profile.description
      : isRancagua
        ? `${profile.name}, ${profile.age} años. Escort en Rancagua y acompañantes en Rancagua. Perfil verificado en Hola Cachero – damas de compañía en Rancagua.`
        : `${profile.name}, ${profile.age} años. Perfil verificado y disponible en ${profile.city}. Conecta con acompañantes premium en el sur de Chile.`;

  const ogImage = profile.image || (Array.isArray(profile.gallery) && profile.gallery.length > 0 ? profile.gallery[0] : undefined);
  const robots = isProfileExpired ? "noindex, nofollow" : "index, follow";

  if (profileLoading && isUuid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando perfil…</p>
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Perfil no encontrado.</p>
        <Link to="/" className="text-gold hover:underline">← Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <SeoHead
        title={title}
        description={description}
        canonicalPath={`/perfil/${profileId}`}
        ogImage={ogImage}
        robots={robots}
        noSocial={isProfileExpired}
      />
      <JsonLdProfile
        profileName={profile.name}
        profileId={profile.id}
        cityName={profile.city}
        citySlug={citySlug}
        image={profile.image}
        description={description}
      />
      {/* Gallery */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {galleryImages.map((img, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0">
                <div className="relative aspect-[3/4] md:aspect-[16/9] md:max-h-[70vh]">
                  <img src={img} alt={i === 0 ? `${profile.name}, perfil en ${profile.city}` : `Galería ${profile.name} - imagen ${i + 1}`} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back button + breadcrumb navegable */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3">
          <Link to={`/${citySlug}`} className="w-10 h-10 flex-shrink-0 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Volver a ciudad">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <nav className="min-w-0 flex-1 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gold transition-colors truncate">Inicio</Link>
            <span aria-hidden>/</span>
            <Link to={`/${citySlug}`} className="hover:text-gold transition-colors truncate">{profile.city}</Link>
            <span aria-hidden>/</span>
            <span className="text-gold truncate">{profile.name}</span>
          </nav>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {galleryImages.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "w-6 bg-gold" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Thumbnails (desktop) */}
        <div className="hidden md:flex gap-2 absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === selectedIndex ? "border-gold scale-110" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`${profile.name} - miniatura ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Content: padding-bottom amplio para que Adicionales no quede tapado por el CTA fijo */}
      <div className="px-4 max-w-3xl mx-auto -mt-8 relative z-10 pb-52 md:pb-56">
        <p className="mb-6">
          <Link to={`/${citySlug}`} className="text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-2">
            ← Ver todos los perfiles en {profile.city}
          </Link>
        </p>
        {isProfileExpired && (
          <div className="mb-6 p-4 rounded-2xl border border-amber-500/50 bg-amber-500/10">
            <p className="text-sm font-medium text-amber-200">
              Este perfil está temporalmente oculto y no aparece en los listados.
            </p>
          </div>
        )}
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          {/* Name & badges */}
          <motion.div variants={fadeUp} className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {isRancagua ? `${profile.name} escort en Rancagua` : `${profile.name}, ${profile.age}`}
                </h1>
                <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4" />
                  {profile.city}
                  {profile.age ? ` · ${profile.age} años` : ""}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-gold/90 text-xs font-semibold text-primary-foreground">
                {profile.badge}
              </span>
            </div>

            {/* Status tags */}
            <div className="flex gap-2 mt-4">
              {profile.available && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Disponible
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs text-muted-foreground">
                <Shield className="w-3 h-3 text-gold" />
                Verificada
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs text-muted-foreground">
                <Star className="w-3 h-3 text-gold" />
                4.9
              </span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeUp} className="mb-8">
            <h2 className="text-sm font-semibold text-gold uppercase tracking-wider mb-3">Sobre mí</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {"description" in profile && profile.description ? profile.description : "Perfil verificado. Conecta con acompañantes premium en el sur de Chile."}
            </p>
          </motion.div>

          {/* Details grid */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              ...("nationality" in profile && profile.nationality
                ? [{ icon: Globe, label: "Nacionalidad", value: profile.nationality }]
                : []),
              { icon: Building2, label: "Dirección", value: "schedule" in profile && profile.schedule ? profile.schedule : "—" },
              { icon: MapPin, label: "Zona", value: "zone" in profile && profile.zone ? profile.zone : "—" },
              { icon: Star, label: "Experiencia", value: "Verificada" },
              { icon: Shield, label: "Verificación", value: "Completa" },
              { icon: Calendar, label: "Disponibilidad", value: profile.available ? "Disponible" : "Consultar" },
              { icon: MessageCircle, label: "WhatsApp", value: "whatsapp" in profile && profile.whatsapp ? profile.whatsapp : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-4 rounded-2xl glass">
                <Icon className="w-4 h-4 text-gold mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </motion.div>

          {/* Servicios Incluidos y Adicionales */}
          {("services_included" in profile && profile.services_included?.length > 0) || ("services_extra" in profile && profile.services_extra?.length > 0) ? (
            <motion.div variants={fadeUp} className="space-y-8 mb-10">
              {"services_included" in profile && profile.services_included && profile.services_included.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Servicios Incluidos</p>
                  <div className="flex flex-wrap gap-3">
                    {profile.services_included.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 rounded-xl bg-red-700/90 text-white text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {"services_extra" in profile && profile.services_extra && profile.services_extra.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Adicionales</p>
                  <div className="flex flex-wrap gap-3">
                    {profile.services_extra.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 rounded-xl bg-red-700/90 text-white text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}

          {/* Reseñas verificadas de experiencia */}
          <motion.div variants={fadeUp} className="space-y-4 mb-10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reseñas de clientes
            </p>
            <p className="text-sm text-muted-foreground">
              Opiniones sobre {profile.name} en {profile.city}
            </p>
            {reviews.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <strong className="text-foreground">{reviewsAvg != null ? reviewsAvg.toFixed(1) : "—"}</strong>
                    <span className="text-muted-foreground">({reviews.length} reseña{reviews.length !== 1 ? "s" : ""})</span>
                  </span>
                </div>
                <ul className="space-y-4">
                  {reviews.slice(0, 5).map((r) => (
                    <li key={r.id}>
                      <ReviewExperienceCard
                        review={r}
                        authorDisplayName={displayNameByReviewUserId[r.user_id] ?? "Anónimo"}
                      />
                    </li>
                  ))}
                </ul>
                {reviews.length > 5 && (
                  <p className="text-sm text-muted-foreground">Mostrando las 5 reseñas más recientes.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay reseñas verificadas.</p>
            )}
          </motion.div>

          {/* Comentarios simples y acciones: comentario + reseña */}
          <motion.div variants={fadeUp} className="space-y-4 mb-10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comentarios</p>
            {comments.length > 0 ? (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{c.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {displayNameByUserId[c.user_id] ?? "Anónimo"} · {new Date(c.created_at).toLocaleDateString("es-CL", { dateStyle: "short" })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay comentarios.</p>
            )}
            <div className="flex flex-wrap gap-2 items-center">
              {!user ? (
                <>
                  <Button
                    variant="outline"
                    className="rounded-xl border-gold text-gold hover:bg-gold/10"
                    onClick={() => setOpenRegistroCliente(true)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Dejar comentario
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-gold text-gold hover:bg-gold/10"
                    onClick={() => setOpenRegistroCliente(true)}
                  >
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Dejar reseña verificada
                  </Button>
                </>
              ) : role !== "visitor" ? (
                <p className="text-sm text-muted-foreground">Solo los usuarios clientes pueden dejar comentarios y reseñas.</p>
              ) : (
                <>
                  {alreadyCommentedToday ? (
                    <p className="text-sm text-amber-500">Ya has dejado tu comentario de hoy. Podrás dejar otro mañana.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="min-w-[200px] flex-1">
                        <Textarea
                          placeholder="Escribe tu comentario… (+1 ticket)"
                          value={commentBody}
                          onChange={(e) => setCommentBody(e.target.value)}
                          className="min-h-[80px] resize-y rounded-xl"
                          maxLength={500}
                        />
                      </div>
                      <Button
                        className="rounded-xl bg-gold text-primary-foreground hover:bg-gold/90"
                        onClick={submitComment}
                        disabled={!commentBody.trim() || commentSubmitting}
                      >
                        {commentSubmitting ? "Enviando…" : "Enviar comentario"}
                      </Button>
                    </div>
                  )}
                  {alreadyReviewedIn7Days ? (
                    <p className="text-sm text-amber-500">Ya has dejado una reseña en este perfil en los últimos 7 días.</p>
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-xl border-gold text-gold hover:bg-gold/10"
                      onClick={() => setOpenReviewForm(true)}
                    >
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Dejar reseña verificada (+3 tickets)
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Otros perfiles en la misma ciudad: enlazado interno */}
        {otherProfilesInCity.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border/50" aria-labelledby="otros-perfiles-heading">
            <h2 id="otros-perfiles-heading" className="text-lg font-display font-bold mb-4">Otros perfiles en {profile.city}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {otherProfilesInCity.map((p) => (
                <ProfileCard
                  key={p.id}
                  profile={{
                    id: p.id,
                    name: p.name,
                    age: p.age,
                    city: profile.city,
                    badge: p.badge ?? "Perfil",
                    image: p.image ?? "",
                    available: p.available,
                  }}
                />
              ))}
            </div>
            <p className="mt-4">
              <Link to={`/${citySlug}`} className="text-sm text-gold hover:underline">
                Ver todos los perfiles en {profile.city} →
              </Link>
            </p>
          </section>
        )}
      </div>

      {/* Sticky CTA: Agregar a favoritos, Llamar y WhatsApp */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-40 px-4 pt-8 pb-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto space-y-4">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                setOpenRegistroCliente(true);
                return;
              }
              if (role === "visitor") {
                toggleFavorite();
                return;
              }
            }}
            disabled={role === "registered_user" || favoriteToggling}
            className={`w-full h-11 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isInFavorites
                ? "bg-gold/20 border border-gold text-gold hover:bg-gold/30"
                : "border border-gold text-gold hover:bg-gold/10"
            }`}
          >
            <Heart className={`w-4 h-4 ${isInFavorites ? "fill-gold" : ""}`} />
            {isInFavorites ? "En favoritos" : "Agregar a favoritos"}
          </button>
          <div className="flex gap-4">
            {profile.whatsapp ? (
              <>
                <a
                  href={`tel:${profile.whatsapp.replace(/\s/g, "")}`}
                  className="flex-1 h-12 rounded-2xl bg-gold text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 rounded-2xl bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </>
            ) : (
              <span className="flex-1 h-12 rounded-2xl glass text-sm text-muted-foreground flex items-center justify-center">
                Sin número de contacto
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Registro solo para clientes (al agregar a favoritos sin sesión) */}
      <Dialog open={openRegistroCliente} onOpenChange={setOpenRegistroCliente}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Registro de clientes</DialogTitle>
          </DialogHeader>
          <RegistroClienteForm
            compact
            onSuccess={() => {
              setOpenRegistroCliente(false);
              refreshProfile();
              toast.success("Cuenta creada. Ya puedes agregar a favoritos.");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal: Reseña verificada de experiencia */}
      <Dialog open={openReviewForm} onOpenChange={setOpenReviewForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reseña verificada de experiencia</DialogTitle>
          </DialogHeader>
          {profileId && user?.id && (
            <ReviewExperienceForm
              escortProfileId={profileId}
              userId={user.id}
              submitReview={submitReviewExperience}
              onSuccess={() => {
                setOpenReviewForm(false);
                queryClient.invalidateQueries({ queryKey: ["review_experiences", profileId] });
                queryClient.invalidateQueries({ queryKey: ["review_experiences_mine_7d", profileId, user.id] });
                toast.success("Reseña publicada. +3 tickets.");
              }}
              onError={(msg) => toast.error(msg)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
