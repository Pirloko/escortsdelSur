import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProfileCard } from "@/components/ProfileCard";
import { LogOut, Trash2, Heart, MessageSquare, Eye, Pencil } from "lucide-react";

type FavoriteWithProfile = {
  id: string;
  escort_profile_id: string;
  escort_profiles: {
    id: string;
    name: string;
    age: number;
    badge: string | null;
    image: string | null;
    available: boolean;
    cities: { name: string } | null;
  } | null;
};

type CommentWithProfile = {
  id: string;
  body: string;
  created_at: string;
  escort_profile_id: string;
  escort_profiles: { id: string; name: string; cities: { slug: string; name: string } | null } | null;
};

type ViewWithProfile = {
  id: string;
  viewed_at: string;
  escort_profile_id: string;
  escort_profiles: {
    id: string;
    name: string;
    age: number;
    badge: string | null;
    image: string | null;
    available: boolean;
    cities: { slug: string; name: string } | null;
  } | null;
};

export default function MiPerfil() {
  const { user, profile, role, isLoading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [favorites, setFavorites] = useState<FavoriteWithProfile[]>([]);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [views, setViews] = useState<ViewWithProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAge(profile.age != null ? String(profile.age) : "");
      setAvatarUrl(profile.avatar_url ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("favorites")
      .select("id, escort_profile_id, escort_profiles(id, name, age, badge, image, available, cities(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setFavorites((data as FavoriteWithProfile[]) ?? []));
  }, [user?.id, role]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("profile_comments")
      .select("id, body, created_at, escort_profile_id, escort_profiles(id, name, cities(slug, name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setComments((data as CommentWithProfile[]) ?? []));
  }, [user?.id, role]);

  useEffect(() => {
    if (!supabase || !user?.id || role !== "visitor") return;
    supabase
      .from("profile_views")
      .select("id, viewed_at, escort_profile_id, escort_profiles(id, name, age, badge, image, available, cities(slug, name))")
      .eq("user_id", user.id)
      .order("viewed_at", { ascending: false })
      .then(({ data }) => setViews((data as ViewWithProfile[]) ?? []));
  }, [user?.id, role]);

  if (isLoading || !user) return null;
  if (role !== "visitor") {
    if (role === "admin") return <Link to="/admin">Ir al panel admin</Link>;
    if (role === "registered_user") return <Link to="/cuenta">Editar mi perfil público</Link>;
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase || !user?.id) return;
    setAvatarError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setAvatarError("Formato no permitido. Usa JPG, PNG, WebP o GIF.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Máximo 2 MB.");
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    setUploadingAvatar(false);
    if (error) {
      setAvatarError(error.message || "Error al subir");
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl);
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    refreshProfile();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        age: age.trim() ? parseInt(age, 10) : null,
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) setMessage(error.message);
    else {
      setMessage("Guardado.");
      setEditingProfile(false);
      refreshProfile();
    }
  };

  const removeFavorite = async (escortProfileId: string) => {
    if (!supabase || !user?.id) return;
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("escort_profile_id", escortProfileId);
    setFavorites((prev) => prev.filter((f) => f.escort_profile_id !== escortProfileId));
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeleting(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!supabaseUrl || !token) {
      setDeleting(false);
      setDeleteDialogOpen(false);
      return;
    }
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleting(false);
        setDeleteDialogOpen(false);
        setMessage(data.error || "Error al eliminar la cuenta");
        return;
      }
      await signOut();
      navigate("/", { replace: true });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const favoriteProfiles = favorites
    .filter((f) => f.escort_profiles)
    .map((f) => ({
      id: f.escort_profiles!.id,
      name: f.escort_profiles!.name,
      age: f.escort_profiles!.age,
      city: f.escort_profiles!.cities?.name ?? "",
      badge: f.escort_profiles!.badge ?? "Perfil",
      image: f.escort_profiles!.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      available: f.escort_profiles!.available,
    }));

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-28">
      <SeoHead title="Mi perfil | Punto Cachero" description="Perfil de cliente." canonicalPath="/cuenta/mi-perfil" robots="noindex, nofollow" noSocial />
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Mi perfil</h1>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => signOut()}>
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Cuenta de cliente. Aquí puedes editar tu nombre, foto y ver tus favoritos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-28 w-28">
              <AvatarImage src={avatarUrl || undefined} alt={displayName || "Avatar"} />
              <AvatarFallback className="bg-gold/20 text-gold text-3xl">
                {(displayName || user.email)?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploadingAvatar}
                  onChange={handleAvatarUpload}
                />
                <span className="inline-flex items-center justify-center rounded-xl text-sm font-medium bg-gold text-primary-foreground hover:bg-gold/90 h-9 px-4">
                  {uploadingAvatar ? "Subiendo…" : "Subir foto de perfil"}
                </span>
              </label>
              <span className="text-xs text-muted-foreground">1 foto. JPG, PNG o WebP. Máx. 2 MB.</span>
              {avatarError && <p className="text-sm text-destructive">{avatarError}</p>}
            </div>
          </div>
          {message && (
            <p className={`text-sm ${message === "Guardado." ? "text-green-600" : "text-destructive"}`}>
              {message}
            </p>
          )}
          {editingProfile ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="display_name">Nombre de usuario</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-surface border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-surface border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 h-11 rounded-2xl bg-gold text-primary-foreground" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar"}
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={() => setEditingProfile(false)}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Nombre de usuario</p>
                <p className="text-base font-medium">{displayName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Edad</p>
                <p className="text-base font-medium">{age || "—"}</p>
              </div>
              <Button type="button" className="w-full h-11 rounded-2xl bg-gold text-primary-foreground gap-2" onClick={() => setEditingProfile(true)}>
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
            </div>
          )}
        </form>

        <section>
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-gold" />
            Mis favoritos
          </h2>
          {favoriteProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no tienes favoritos. En un perfil, pulsa &quot;Agregar a favoritos&quot; para guardarlo aquí.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favoriteProfiles.map((p) => (
                <div key={p.id} className="relative group">
                  <ProfileCard profile={p} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(p.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-destructive hover:bg-destructive/20"
                    aria-label="Quitar de favoritos"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-gold" />
            Historial de comentarios
          </h2>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no has dejado comentarios en ningún perfil. Puedes dejar uno por día en cada perfil que visites.
            </p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{c.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.created_at).toLocaleDateString("es-CL", { dateStyle: "medium" })}
                    {c.escort_profiles && (
                      <>
                        {" · "}
                        <Link to={`/perfil/${c.escort_profile_id}`} className="text-gold hover:underline">
                          {c.escort_profiles.name} → Ver perfil
                        </Link>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-display font-bold flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-gold" />
            Escorts que has visualizado
          </h2>
          {views.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cuando entres a un perfil, aparecerá aquí para que puedas volver a verlo.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {views
                .filter((v) => v.escort_profiles)
                .map((v) => ({
                  id: v.escort_profiles!.id,
                  name: v.escort_profiles!.name,
                  age: v.escort_profiles!.age,
                  city: v.escort_profiles!.cities?.name ?? "",
                  badge: v.escort_profiles!.badge ?? "Perfil",
                  image: v.escort_profiles!.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
                  available: v.escort_profiles!.available,
                }))
                .map((p) => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
            </div>
          )}
        </section>

        <div className="space-y-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full h-11 rounded-2xl border-destructive text-destructive hover:bg-destructive/10 gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar mi cuenta
          </Button>
          <p className="text-center">
            <Link to="/" className="text-sm text-gold hover:underline">← Volver al inicio</Link>
          </p>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán tus datos y favoritos. No podrás recuperar la cuenta. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Eliminando…" : "Eliminar cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
