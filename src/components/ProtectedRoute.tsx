import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
  /** Si true, esta ruta es accesible cuando el usuario debe cambiar contraseña (ej. /cambiar-contrasena) */
  allowWhenMustChangePassword?: boolean;
}

/**
 * Protege rutas según rol. Si no hay sesión, redirige a login.
 * Si hay sesión pero el rol no está en allowedRoles, redirige a fallbackPath o a home.
 * Si el usuario tiene must_change_password y esta ruta no lo permite, redirige a /cambiar-contrasena.
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = "/",
  allowWhenMustChangePassword = false,
}: ProtectedRouteProps) {
  const { user, role, mustChangePassword, isBlocked, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (mustChangePassword && !allowWhenMustChangePassword) {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  if (allowedRoles?.includes("registered_user") && role === "registered_user" && isBlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-display font-bold text-foreground mb-2">Cuenta pausada</h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          Tu cuenta de publicador está pausada. No puedes acceder a la gestión de perfiles. Contacta al administrador si crees que es un error.
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-xl bg-gold px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  if (allowWhenMustChangePassword && !mustChangePassword && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "registered_user") return <Navigate to="/cuenta" replace />;
  }

  if (allowedRoles != null && allowedRoles.length > 0 && role != null && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "registered_user") return <Navigate to="/cuenta" replace />;
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
