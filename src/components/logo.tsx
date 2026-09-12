export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" className={className} aria-hidden="true">
      <path
        d="M6 214V92C6 46.5344 48.4051 6 100 6C151.595 6 194 46.5344 194 92V214"
        fill="none"
        stroke="currentColor"
        strokeWidth={11}
        strokeLinecap="round"
      />
      <clipPath id="terranova-arch">
        <path d="M9 214V92C9 48.1332 50.1076 9.5 100 9.5C149.892 9.5 191 48.1332 191 92V214H9Z" />
      </clipPath>
      <g clipPath="url(#terranova-arch)">
        <circle cx="127" cy="66" r="24" fill="var(--color-gold-500, #c9a96b)" />
        <path
          d="M-10 158C30 138 55 118 95 118C135 118 150 148 210 128V230H-10V158Z"
          fill="var(--color-forest-900, #1b3a2f)"
        />
        <path
          d="M-10 190C34 158 58 150 96 150C134 150 158 178 210 158V230H-10V190Z"
          fill="var(--color-sage-500, #6b7f5b)"
        />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  subtitle = true,
}: {
  className?: string;
  markClassName?: string;
  subtitle?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className={markClassName ?? "h-9 w-9 text-forest-900"} />
      <span className="leading-tight">
        <span className="block font-display text-xl font-bold uppercase tracking-[0.08em] text-forest-900">
          Terranova App
        </span>
        {subtitle && (
          <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-forest-700/60">
            by Constructora Integral Acayucan
          </span>
        )}
      </span>
    </span>
  );
}
