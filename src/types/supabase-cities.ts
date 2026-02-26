/**
 * Tipos para la tabla Supabase `cities`.
 * Sincronizar con migración: supabase/migrations/20260224000000_create_cities_seo.sql
 */

export interface DbCity {
  id: string;
  slug: string;
  name: string;
  profiles: number;
  image: string | null;
  keyword_primary: string;
  seo_title: string;
  seo_description: string;
  seo_content: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbCityInsert {
  slug: string;
  name: string;
  profiles?: number;
  image?: string | null;
  keyword_primary: string;
  seo_title: string;
  seo_description: string;
  seo_content: string;
}
