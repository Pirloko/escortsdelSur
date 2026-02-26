import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err, profile: profileAfterLogin, user: userAfterLogin } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message || "Error al iniciar sesión");
      return;
    }
    if (userAfterLogin?.user_metadata?.must_change_password === true) {
      navigate("/cambiar-contrasena", { replace: true });
      return;
    }
    const roleToUse = profileAfterLogin?.role ?? role;
    if (roleToUse === "admin") navigate("/admin", { replace: true });
    else if (roleToUse === "registered_user") navigate("/cuenta", { replace: true });
    else navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SeoHead title="Iniciar sesión | Punto Cachero" description="Acceso al panel de acompañantes." canonicalPath="/login" robots="noindex, nofollow" noSocial />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Accede con el correo y contraseña que te proporcionaron
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-surface border-border"
            />
          </div>
          <Button type="submit" className="w-full bg-gold text-primary-foreground hover:bg-gold/90" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            ¿Eres acompañante y quieres publicar?{" "}
            <Link to="/registro" className="text-gold hover:underline font-medium">
              Crear cuenta (solo escorts)
            </Link>
          </p>
          <p>
            ¿Eres cliente/visitante?{" "}
            <Link to="/registro-cliente" className="text-gold hover:underline font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
        <p className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
