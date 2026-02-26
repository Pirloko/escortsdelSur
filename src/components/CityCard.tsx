import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CityCardProps {
  city: {
    id: string;
    name: string;
    profiles: number;
    image: string;
  };
}

export function CityCard({ city }: CityCardProps) {
  return (
    <Link to={`/${city.id}`} className="group block">
      <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden bg-surface">
        <img
          src={city.image}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">{city.name}</h3>
            <p className="text-xs text-muted-foreground">{city.profiles} perfiles</p>
          </div>
          <div className="w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="w-4 h-4 text-gold" />
          </div>
        </div>
      </div>
    </Link>
  );
}
