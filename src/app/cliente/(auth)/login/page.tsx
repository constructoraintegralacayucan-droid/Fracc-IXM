import { ClienteLoginForm } from "@/components/cliente-login-form";
import { LogoMark } from "@/components/logo";

export const metadata = { title: "Mi cuenta | Terranova App" };

export default function ClienteLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-sand-50 p-8 shadow-2xl">
        <LogoMark className="h-10 w-10 text-forest-900" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
          Terranova App
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-forest-900">
          Mi cuenta
        </h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Consulta el estado de tu lote y tus pagos
        </p>

        <div className="mt-7">
          <ClienteLoginForm />
        </div>
      </div>
    </div>
  );
}
