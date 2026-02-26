import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CambiarContrasena() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!supabase) {
      setError("Configuración no disponible");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    setLoading(false);
    if (updateError) {
      setError(updateError.message || "Error al cambiar la contraseña");
      return;
    }
    if (role === "admin") navigate("/admin", { replace: true });
    else navigate("/cuenta", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SeoHead title="Cambiar contraseña | Punto Cachero" description="Establece una nueva contraseña." canonicalPath="/cambiar-contrasena" robots="noindex, nofollow" noSocial />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Cambiar contraseña</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Es la primera vez que entras. Elige una contraseña nueva para tu cuenta.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Repetir contraseña</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="bg-surface border-border"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gold text-primary-foreground hover:bg-gold/90"
            disabled={loading}
          >
            {loading ? "Guardando…" : "Guardar nueva contraseña"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Sesión iniciada como <strong>{user?.email}</strong>
        </p>
      </div>
    </div>
  );
}
