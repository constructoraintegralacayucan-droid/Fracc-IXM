import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Acceso administrador | Terravista" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-sand-50 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
          Terravista
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-forest-900">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Fraccionamiento Ixmegallo
        </p>

        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
