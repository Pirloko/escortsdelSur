import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { CityRoute } from "./pages/CityRoute";
import { BottomNav } from "./components/BottomNav";

const ProfilePage = lazy(() => import("./pages/ProfilePage"));
import NotFound from "./pages/NotFound";
const Login = lazy(() => import("./pages/Login"));
const Registro = lazy(() => import("./pages/Registro"));
const RegistroCliente = lazy(() => import("./pages/RegistroCliente"));
const CompletarPerfil = lazy(() => import("./pages/CompletarPerfil"));
const CambiarContrasena = lazy(() => import("./pages/CambiarContrasena"));
const MiPerfil = lazy(() => import("./pages/MiPerfil"));
const Cuenta = lazy(() => import("./pages/Cuenta"));
const TerminosYCondiciones = lazy(() => import("./pages/TerminosYCondiciones"));
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPublicadores = lazy(() => import("./pages/admin/AdminPublicadores"));
const AdminUsuarios = lazy(() => import("./pages/admin/AdminUsuarios"));
const AdminComentarios = lazy(() => import("./pages/admin/AdminComentarios"));
const AdminVisitantes = lazy(() => import("./pages/admin/AdminVisitantes"));
const AdminCiudades = lazy(() => import("./pages/admin/AdminCiudades"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground text-sm">Cargando…</span></div>}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/registro-cliente" element={<RegistroCliente />} />
              <Route
                path="/completar-perfil"
                element={
                  <ProtectedRoute>
                    <CompletarPerfil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cambiar-contrasena"
                element={
                  <ProtectedRoute allowWhenMustChangePassword>
                    <CambiarContrasena />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mi-perfil"
                element={
                  <ProtectedRoute allowedRoles={["visitor"]}>
                    <MiPerfil />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cuenta"
                element={
                  <ProtectedRoute allowedRoles={["registered_user"]}>
                    <Cuenta />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cuenta/perfil/:profileId"
                element={
                  <ProtectedRoute allowedRoles={["registered_user"]}>
                    <Cuenta />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="publicadores" element={<AdminPublicadores />} />
                <Route path="perfiles" element={<AdminUsuarios />} />
                <Route path="visitantes" element={<AdminVisitantes />} />
                <Route path="comentarios" element={<AdminComentarios />} />
                <Route path="ciudades" element={<AdminCiudades />} />
              </Route>
              <Route path="/terminos-y-condiciones" element={<TerminosYCondiciones />} />
              <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
              <Route path="/perfil/:profileId" element={<ProfilePage />} />
              <Route path="/:citySlug" element={<CityRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          </Suspense>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
