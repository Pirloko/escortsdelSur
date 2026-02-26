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
  const { user, role, mustChangePassword, isLoading } = useAuth();
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
