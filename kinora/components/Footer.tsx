const NAV_LINKS = ["About", "Solutions", "Community", "Contact"] as const;

function LeafMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M12 21.5v-8.2"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13.3C12 8.9 9.2 5.8 4.3 5.6c.2 4.9 3 8 7.7 7.7Z"
        fill="#FFFFFF"
      />
      <path
        d="M12.4 11.4c.3-4.2 2.9-6.6 7.4-6.8-.3 4.7-2.9 7.3-7.4 6.8Z"
        fill="#FFFFFF"
        opacity="0.85"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0B2E1C] px-5 py-8 text-white md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
        <a href="#top" className="flex items-center gap-2" aria-label="KINORA — back to top">
          <LeafMark />
          <span className="font-heading text-[13px] font-bold tracking-[-0.03em]">
            KINORA
          </span>
        </a>

        <ul className="flex flex-wrap items-center justify-center gap-5">
          {NAV_LINKS.map((label) => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase()}`}
                className="text-[11px] text-white/70 transition-opacity hover:text-white"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-center text-[11px] text-white/50 sm:text-right">
          © 2026 KINORA. All rights reserved.
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          Fictional brand concept.
        </p>
      </div>
    </footer>
  );
}
