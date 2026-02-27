/**
 * Tipos generados para Supabase. Sincronizar con migraciones en supabase/migrations.
 */
export type UserRole = "admin" | "registered_user" | "visitor";

export interface ProfilesRow {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  age: number | null;
  city_id: string | null;
  created_at: string;
  updated_at: string;
  is_blocked?: boolean;
  email?: string | null;
  contact_phone?: string | null;
}

export interface EscortProfilesRow {
  id: string;
  user_id: string | null;
  city_id: string;
  name: string;
  age: number;
  badge: string | null;
  image: string | null;
  available: boolean;
  gallery: string[];
  description: string | null;
  zone: string | null;
  schedule: string | null;
  whatsapp: string | null;
  services_included: string[];
  services_extra: string[];
  active_until: string | null;
  time_slot: string | null;
  subidas_per_day: number | null;
  promotion: string | null;
   credits?: number | null;
  created_at: string;
  updated_at: string;
}

export interface FavoritesRow {
  id: string;
  user_id: string;
  escort_profile_id: string;
  created_at: string;
}

export interface ProfileCommentsRow {
  id: string;
  escort_profile_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface ProfileViewsRow {
  id: string;
  user_id: string;
  escort_profile_id: string;
  viewed_at: string;
}

export interface CreditTransactionsRow {
  id: string;
  user_id: string;
  escort_profile_id: string | null;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export interface CitiesRow {
  id: string;
  slug: string;
  name: string;
  profiles: number;
  image: string | null;
  keyword_primary: string;
  seo_title: string;
  seo_description: string;
  seo_content: string;
  created_at: string;
  updated_at: string;
  /** Indexación progresiva: si false, no se listan ni se incluyen en sitemap. */
  is_active?: boolean;
  /** Meta robots: "index, follow" | "noindex, nofollow" | "noindex, follow". Null = index, follow. */
  meta_robots?: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow;
        Insert: Omit<ProfilesRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfilesRow, "id">>;
      };
      favorites: {
        Row: FavoritesRow;
        Insert: Omit<FavoritesRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<FavoritesRow, "id">>;
      };
      profile_comments: {
        Row: ProfileCommentsRow;
        Insert: Omit<ProfileCommentsRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<ProfileCommentsRow, "id">>;
      };
      profile_views: {
        Row: ProfileViewsRow;
        Insert: Omit<ProfileViewsRow, "id"> & { id?: string };
        Update: Partial<Omit<ProfileViewsRow, "id">>;
      };
      credit_transactions: {
        Row: CreditTransactionsRow;
        Insert: Omit<CreditTransactionsRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<CreditTransactionsRow, "id">>;
      };
      escort_profiles: {
        Row: EscortProfilesRow;
        Insert: Omit<EscortProfilesRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EscortProfilesRow, "id">>;
      };
      cities: {
        Row: CitiesRow;
        Insert: Omit<CitiesRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CitiesRow, "id">>;
      };
    };
  };
}
