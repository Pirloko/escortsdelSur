import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { RegistroClienteForm } from "@/components/RegistroClienteForm";

export default function RegistroCliente() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = searchParams.get("redirect") || "/";

  const handleSuccess = () => {
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <SeoHead title="Registro de clientes | Punto Cachero" description="Registro para clientes." canonicalPath="/registro-cliente" robots="noindex, nofollow" noSocial />
      <div className="w-full max-w-sm space-y-6">
        <RegistroClienteForm onSuccess={handleSuccess} />
        <p className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
