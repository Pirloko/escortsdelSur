import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, MapPin, ChevronDown, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { JsonLdHome } from "@/components/JsonLd";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { cities, featuredProfiles } from "@/lib/data";
import { ProfileCard } from "@/components/ProfileCard";
import { CityCard } from "@/components/CityCard";
import { Footer } from "@/components/Footer";

type CityRow = { id: string; slug: string; name: string };

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const Index = () => {
  const { user } = useAuth();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const { data: dbCities = [] } = useQuery({
    queryKey: ["cities-list"],
    queryFn: async (): Promise<CityRow[]> => {
      if (!supabase) return [];
      const { data } = await supabase.from("cities").select("id, slug, name").order("name");
      return (data ?? []) as CityRow[];
    },
    enabled: !!supabase,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SeoHead
        title="Escorts en el Sur de Chile | Perfiles Premium por Ciudad"
        description="Descubre perfiles y acompañantes premium en las principales ciudades del sur de Chile: Rancagua, Talca, Chillán, Concepción, Temuco y más. Servicio verificado y discreto."
        canonicalPath="/"
      />
      <JsonLdHome />
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(38_38%_60%_/_0.05)_0%,_transparent_60%)]" />
        
        <motion.div
          className="relative z-10 text-center max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-gold text-xs font-medium tracking-widest uppercase">
              <Star className="w-3 h-3" />
              Marketplace Exclusivo
            </span>
          </motion.div>
          
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
          >
            Descubre el Sur
            <span className="block text-gold">de Chile</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg md:text-xl mb-6 max-w-xl mx-auto">
            Conecta con perfiles exclusivos en las principales ciudades del sur
          </motion.p>

          {!user && (
            <motion.div variants={fadeUp} className="mb-10">
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-medium text-sm hover:bg-gold/90 transition-colors"
              >
                ¿Eres escort? Publica gratis aquí
              </Link>
            </motion.div>
          )}

          {/* Search + City Selector */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
              <input
                placeholder="Buscar perfiles..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl glass text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
              />
            </div>
            <div className="relative" ref={cityDropdownRef}>
              <button
                type="button"
                onClick={() => setCityDropdownOpen((o) => !o)}
                className="h-12 px-6 rounded-2xl glass flex items-center gap-2 text-sm text-foreground hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
                aria-expanded={cityDropdownOpen}
                aria-haspopup="listbox"
              >
                <MapPin className="w-4 h-4 text-gold" />
                Ciudad
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {cityDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass border border-white/10 py-2 z-50 max-h-64 overflow-y-auto">
                  {dbCities.length === 0 ? (
                    <p className="px-4 py-2.5 text-sm text-muted-foreground">No hay ciudades disponibles</p>
                  ) : (
                    dbCities.map((city) => (
                      <Link
                        key={city.id}
                        to={`/${city.slug}`}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-white/10 transition-colors"
                        onClick={() => setCityDropdownOpen(false)}
                      >
                        {city.name}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-gold/60" />
          </div>
        </motion.div>
      </section>

      {/* Featured Profiles */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Destacadas</h2>
              <p className="text-muted-foreground text-sm mt-1">Perfiles seleccionados para ti</p>
            </div>
            <Link to="/temuco" className="text-gold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {featuredProfiles.slice(0, 4).map((profile) => (
              <motion.div key={profile.id} variants={fadeUp}>
                <ProfileCard profile={profile} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Cities Section */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold">Ciudades Disponibles</h2>
            <p className="text-muted-foreground text-sm mt-1">Explora por ubicación</p>
          </motion.div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
            {cities.map((city) => (
              <motion.div key={city.id} variants={fadeUp} className="min-w-[240px] md:min-w-0">
                <CityCard city={city} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* More Featured */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Recién Llegadas</h2>
              <p className="text-muted-foreground text-sm mt-1">Nuevos perfiles esta semana</p>
            </div>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {featuredProfiles.slice(4).map((profile) => (
              <motion.div key={profile.id} variants={fadeUp}>
                <ProfileCard profile={profile} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
