import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegistroClienteFormProps {
  onSuccess?: () => void;
  /** Si true, no muestra enlaces de "Iniciar sesión" / "Volver" (p. ej. dentro de un modal). */
  compact?: boolean;
}

export function RegistroClienteForm({ onSuccess, compact = false }: RegistroClienteFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password, {
      display_name: username.trim() || undefined,
    });
    setLoading(false);
    if (err) {
      const msg = err.message || "";
      const isDuplicateName =
        (err as { code?: string }).code === "23505" ||
        /unique|duplicate|duplicado|ya existe|violates unique/i.test(msg);
      setError(isDuplicateName ? "Ese nombre de usuario ya está en uso. Elige otro." : msg || "Error al registrarse");
      return;
    }
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-foreground">Registro con e-mail</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Registro solo para clientes (Mayores de 18 años)
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="reg-username">Nombre de usuario</Label>
          <Input
            id="reg-username"
            type="text"
            placeholder="Tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-surface border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-email">Correo electrónico</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-surface border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-password">Contraseña</Label>
          <Input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="bg-surface border-border"
          />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Al registrarme declaro ser mayor de edad
        </p>
        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          disabled={loading}
        >
          {loading ? "Creando cuenta…" : "Registrarme"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-gold hover:underline" onClick={() => onSuccess?.()}>
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
