import { ColaboradorLoginForm } from "@/components/colaborador-login-form";
import { LogoMark } from "@/components/logo";

export const metadata = { title: "Colaboradores | Terranova" };

export default function ColaboradorLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-sand-50 p-8 shadow-2xl">
        <LogoMark className="h-10 w-10 text-forest-900" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
          Terranova
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-forest-900">
          Colaboradores
        </h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Levanta solicitudes de apartado para tus clientes
        </p>

        <div className="mt-7">
          <ColaboradorLoginForm />
        </div>
      </div>
    </div>
  );
}
