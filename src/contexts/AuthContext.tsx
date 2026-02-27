import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  age: number | null;
  city_id: string | null;
  is_blocked?: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isBlocked: boolean;
  mustChangePassword: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; profile?: Profile | null; user?: User | null }>;
  signUp: (email: string, password: string, meta?: { display_name?: string; age?: number; city_id?: string; whatsapp?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    const { data } = await supabase
      .from("profiles")
      .select("id, role, display_name, avatar_url, age, city_id, is_blocked")
      .eq("id", userId)
      .single();
    return data as Profile | null;
  }, []);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id || !supabase) {
      if (!user?.id) setProfile(null);
      return null;
    }
    const p = await fetchProfile(user.id);
    setProfile(p);
    return p;
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user?.id) {
        fetchProfile(s.user.id).then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user?.id) {
        setIsLoading(true);
        fetchProfile(s.user.id).then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    if (user?.id && !profile) refreshProfile();
  }, [user?.id, profile, refreshProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error("Supabase no configurado") };
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      const profile = data.user?.id ? await fetchProfile(data.user.id) : null;
      setSession({ ...data.session! });
      setUser(data.user);
      setProfile(profile);
      return { error: null, profile, user: data.user ?? null };
    },
    [fetchProfile]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      meta?: { display_name?: string; age?: number; city_id?: string; whatsapp?: string }
    ) => {
      if (!supabase) return { error: new Error("Supabase no configurado") };

      const skipValidation = import.meta.env.VITE_SKIP_EMAIL_VALIDATION === "true";
      const signupSecret = import.meta.env.VITE_SIGNUP_SECRET;

      if (skipValidation && signupSecret) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signup-no-validate`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Signup-Secret": signupSecret,
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            display_name: meta?.display_name ?? null,
            age: meta?.age ?? null,
            whatsapp: meta?.whatsapp ?? null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: new Error(data.error || `Error ${res.status}`) };
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        return { error: signInErr ?? null };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "visitor",
            display_name: meta?.display_name ?? null,
            age: meta?.age ?? null,
            city_id: meta?.city_id ?? null,
            whatsapp: meta?.whatsapp ?? null,
          },
        },
      });
      return { error };
    },
    []
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const value: AuthState = {
    user,
    session,
    profile,
    role: profile?.role ?? null,
    isBlocked: profile?.is_blocked === true,
    mustChangePassword: user?.user_metadata?.must_change_password === true,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
