"use client";

import { useEffect, useState } from "react";

export function HeroCarousel({ imagenes }: { imagenes: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imagenes.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % imagenes.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [imagenes.length]);

  if (imagenes.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {imagenes.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-forest-950/90" />
    </div>
  );
}
