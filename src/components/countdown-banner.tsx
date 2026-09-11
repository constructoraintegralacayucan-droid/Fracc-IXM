"use client";

import { useEffect, useState } from "react";

function calcularRestante(fin: number) {
  const diff = Math.max(fin - Date.now(), 0);
  const dias = Math.floor(diff / 86_400_000);
  const horas = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutos = Math.floor((diff % 3_600_000) / 60_000);
  const segundos = Math.floor((diff % 60_000) / 1000);
  return { diff, dias, horas, minutos, segundos };
}

export function CountdownBanner({
  titulo,
  finISO,
}: {
  titulo: string;
  finISO: string;
}) {
  const fin = new Date(finISO).getTime();
  const [restante, setRestante] = useState<ReturnType<
    typeof calcularRestante
  > | null>(null);

  useEffect(() => {
    setRestante(calcularRestante(fin));
    const interval = setInterval(() => {
      setRestante(calcularRestante(fin));
    }, 1000);
    return () => clearInterval(interval);
  }, [fin]);

  if (!restante || restante.diff <= 0) return null;

  return (
    <div className="bg-gold-500 text-forest-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-5 py-2.5 text-center sm:px-8">
        <span className="text-sm font-semibold">{titulo}</span>
        <span className="font-mono text-sm font-bold tabular-nums">
          {restante.dias}d {String(restante.horas).padStart(2, "0")}h{" "}
          {String(restante.minutos).padStart(2, "0")}m{" "}
          {String(restante.segundos).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}
