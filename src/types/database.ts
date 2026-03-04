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
  publisher_credits?: number;
  pepitas_cobre?: number;
  tickets_rifa?: number;
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
  /** Múltiples franjas: cada una con 10 subidas/día. Si está vacío se usa time_slot. */
  time_slots?: string[] | null;
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

export interface StatusPhrasesRow {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface HotStoriesRow {
  id: string;
  escort_profile_id: string;
  story_date: string;
  content: string;
  created_at: string;
}

// Desafío del Día (quiz) - supabase/migrations/20260304000000_drop_puzzle_create_daily_quiz.sql
export interface DailyQuizRow {
  id: string;
  date: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyQuizQuestionsRow {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  image_url: string;
  order_number: number;
  created_at: string;
}

export interface UserQuizProgressRow {
  id: string;
  user_id: string;
  quiz_id: string;
  current_question: number;
  correct_answers: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Rifa mensual - supabase/migrations/20260305000000_raffle_system.sql
export type RaffleStatus = "active" | "closed";
export type RafflePrizeStatus = "pending" | "contacted" | "delivered";

export interface RafflesRow {
  id: string;
  title: string;
  description: string;
  month: number;
  year: number;
  status: RaffleStatus;
  winner_user_id: string | null;
  total_tickets: number;
  created_at: string;
  executed_at: string | null;
}

export interface RaffleParticipantsSnapshotRow {
  id: string;
  raffle_id: string;
  user_id: string;
  tickets_used: number;
  created_at: string;
}

export interface RafflePrizesRow {
  id: string;
  raffle_id: string;
  user_id: string;
  status: RafflePrizeStatus;
  claimed_at: string | null;
  created_at: string;
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
      status_phrases: {
        Row: StatusPhrasesRow;
        Insert: Omit<StatusPhrasesRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StatusPhrasesRow, "id">>;
      };
      hot_stories: {
        Row: HotStoriesRow;
        Insert: Omit<HotStoriesRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<HotStoriesRow, "id">>;
      };
      daily_quiz: {
        Row: DailyQuizRow;
        Insert: Omit<DailyQuizRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<DailyQuizRow, "id">>;
      };
      daily_quiz_questions: {
        Row: DailyQuizQuestionsRow;
        Insert: Omit<DailyQuizQuestionsRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<DailyQuizQuestionsRow, "id">>;
      };
      user_quiz_progress: {
        Row: UserQuizProgressRow;
        Insert: Omit<UserQuizProgressRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserQuizProgressRow, "id">>;
      };
      raffles: {
        Row: RafflesRow;
        Insert: Omit<RafflesRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<RafflesRow, "id">>;
      };
      raffle_participants_snapshot: {
        Row: RaffleParticipantsSnapshotRow;
        Insert: Omit<RaffleParticipantsSnapshotRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<RaffleParticipantsSnapshotRow, "id">>;
      };
      raffle_prizes: {
        Row: RafflePrizesRow;
        Insert: Omit<RafflePrizesRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<RafflePrizesRow, "id">>;
      };
    };
  };
}
