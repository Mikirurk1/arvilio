/** Shared Arvilio logomark (book + progress line). Keep in sync with `public/brand/logo-mark.svg`. */
export function LogoMarkSvg({
  className,
  accentClassName,
}: {
  className?: string;
  accentClassName?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path
        d="M10.25 9.75 16 8.25l5.75 1.5v12.75L16 20.25l-5.75 1.5V9.75Z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M16 8.25v13.75" stroke="currentColor" strokeWidth="1.55" />
      <path
        d="M12.25 13h7.5"
        className={accentClassName}
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M12.25 16h5.75"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity={0.92}
      />
    </svg>
  );
}
