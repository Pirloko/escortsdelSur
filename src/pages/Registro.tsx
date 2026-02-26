import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [numero, setNumero] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ageNum = parseInt(edad, 10);
    const meta = {
      display_name: nombre.trim() || undefined,
      age: !Number.isNaN(ageNum) && ageNum > 0 ? ageNum : undefined,
      whatsapp: numero.trim() || undefined,
    };
    const { error: err } = await signUp(email, password, meta);
    setLoading(false);
    if (err) {
      setError(err.message || "Error al registrarse");
      return;
    }
    navigate("/completar-perfil", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <SeoHead title="Crear cuenta (solo escorts) | Punto Cachero" description="Registro para acompañantes." canonicalPath="/registro" robots="noindex, nofollow" noSocial />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Crear cuenta</h1>
          <p className="text-sm font-medium text-gold mt-2">
            Solo para acompañantes que quieren publicar su perfil
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Después te pediremos completar tu perfil para aparecer en el sitio.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
              minLength={6}
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número de contacto</Label>
            <Input
              id="numero"
              type="tel"
              placeholder="+569 12345678"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de usuario</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edad">Edad</Label>
            <Input
              id="edad"
              type="number"
              min={18}
              placeholder="Ej. 25"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              required
              className="bg-surface border-border"
            />
          </div>
          <Button type="submit" className="w-full bg-gold text-primary-foreground hover:bg-gold/90" disabled={loading}>
            {loading ? "Creando cuenta…" : "Registrarme"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-gold hover:underline">
            Inicia sesión
          </Link>
        </p>
        <p className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
