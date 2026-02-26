import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EscortProfilesRow } from "@/types/database";

interface DarAccesoDialogProps {
  escort: EscortProfilesRow & { cities?: { name: string } | null };
  onClose: () => void;
  onSuccess: () => void;
}

export function DarAccesoDialog({ escort, onClose, onSuccess }: DarAccesoDialogProps) {
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setLoading(true);
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-escort-user`;
    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const token = freshSession?.access_token;
      if (!token) {
        setError("Sesión caducada o no válida. Cierra sesión y vuelve a entrar como admin.");
        return;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          escort_profile_id: escort.id,
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fallback = res.status === 401 ? "Sesión caducada. Cierra sesión y vuelve a entrar como admin." : `Error ${res.status}`;
        const msg = data.detail || data.error || fallback;
        setError(msg);
        return;
      }
      setSuccess(true);
      setPassword("");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message.includes("Failed to fetch") || message.includes("NetworkError")
          ? "No se pudo conectar. Comprueba que la Edge Function 'create-escort-user' esté desplegada en Supabase y que VITE_SUPABASE_URL sea correcto."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dar acceso de login</DialogTitle>
          <DialogDescription>
            Crea una cuenta para <strong>{escort.name}</strong>
            {escort.cities?.name ? ` (${escort.cities.name})` : ""}. Podrá entrar en /login y editar su perfil en
            /cuenta.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="text-sm text-green-600 py-4">
            Listo. Indícale a {escort.name} que entre en /login con ese correo y la contraseña que configuraste.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label>Correo</Label>
              <Input
                type="email"
                placeholder="andrea@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-surface"
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña temporal</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-surface"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gold text-primary-foreground" disabled={loading}>
                {loading ? "Creando cuenta…" : "Crear cuenta y dar acceso"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
