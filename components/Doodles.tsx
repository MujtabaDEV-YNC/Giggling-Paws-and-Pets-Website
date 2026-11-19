/** Hand-drawn accents shared across sections. Decorative only. */

export function Dashes({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path
        d="M8 30 L14 20 M18 30 L20 14 M28 30 L32 20"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 44" aria-hidden="true" focusable="false">
      <path
        d="M24 40 C10 30 4 22 6 13 C8 6 17 4 22 11 C24 14 24 14 26 11 C31 4 41 6 42 14 C43 23 36 30 24 40 Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
