"use client";

import { useEffect, useState } from "react";

type Copo = {
  id: number;
  izquierda: number;
  tamano: number;
  duracion: number;
  retraso: number;
  opacidad: number;
  deriva: number;
};

const CANTIDAD_COPOS = 28;

export function SnowOverlay() {
  // Los copos se generan en el cliente (tras montar) para no depender de
  // valores aleatorios durante el render en servidor.
  const [copos, setCopos] = useState<Copo[] | null>(null);

  useEffect(() => {
    setCopos(
      Array.from({ length: CANTIDAD_COPOS }, (_, id) => ({
        id,
        izquierda: Math.random() * 100,
        tamano: 3 + Math.random() * 5,
        duracion: 9 + Math.random() * 10,
        retraso: Math.random() * 12,
        opacidad: 0.35 + Math.random() * 0.5,
        deriva: (Math.random() - 0.5) * 80,
      }))
    );
  }, []);

  if (!copos) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      {copos.map((c) => (
        <span
          key={c.id}
          className="copo-nieve"
          style={
            {
              "--copo-izquierda": `${c.izquierda}%`,
              "--copo-tamano": `${c.tamano}px`,
              "--copo-duracion": `${c.duracion}s`,
              "--copo-retraso": `${c.retraso}s`,
              "--copo-opacidad": c.opacidad,
              "--copo-deriva": `${c.deriva}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
