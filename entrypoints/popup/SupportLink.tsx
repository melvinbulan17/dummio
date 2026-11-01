import { SUPPORT_URL } from "@/src/links";

export function SupportLink() {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2 border-t border-line bg-dummy-yellow-soft px-4 py-2.5 text-xs text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dummy-yellow"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-dummy-yellow-text"
      >
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <path d="M6 2v2M10 2v2M14 2v2" />
      </svg>
      <span className="flex-1">Saving you time? Buy me a coffee.</span>
      <span className="font-medium text-dummy-yellow-text group-hover:underline">
        Ko-fi →
      </span>
    </a>
  );
}
