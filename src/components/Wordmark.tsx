export function Wordmark() {
  return (
    <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
      <svg aria-hidden="true" viewBox="0 0 128 128" className="size-5">
        <rect
          x="6"
          y="6"
          width="116"
          height="116"
          rx="26"
          fill="#17171a"
          stroke="#8c8b88"
          strokeWidth="8"
        />
        <rect x="24" y="32" width="64" height="16" rx="8" fill="#5a5a62" />
        <rect x="24" y="56" width="80" height="16" rx="8" fill="#ffc21a" />
        <rect x="24" y="80" width="48" height="16" rx="8" fill="#5a5a62" />
      </svg>
      Dummio
    </div>
  );
}
