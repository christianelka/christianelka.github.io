"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = ["About", "Solutions", "Community", "Contact"] as const;

function LeafMark() {
  return (
    <svg
      width="18"
      height="18"
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`anim-navbar fixed inset-x-0 top-0 z-20 transition-all duration-300 ${
        scrolled
          ? "bg-[#397C50]/90 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="relative flex items-center justify-between px-5 py-[18px] md:px-8 md:py-5 lg:px-12"
      >
        {/* Brand */}
        <a
          href="#top"
          className="flex items-center gap-[7px] text-white"
          aria-label="KINORA — back to top"
        >
          <LeafMark />
          <span
            className="font-heading text-sm font-bold tracking-[-0.03em]"
            style={{ fontSize: "14px" }}
          >
            KINORA
          </span>
        </a>

        {/* Center links — truly centered, hidden on mobile */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          {NAV_LINKS.map((label) => (
            <li key={label}>
              <a
                href={`#${label.toLowerCase()}`}
                className="text-[11px] font-normal text-white/80 no-underline transition-opacity duration-200 hover:text-white hover:opacity-100"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#contact"
          className="rounded-full bg-white/85 px-4 py-3 text-[10px] font-medium text-[#0F4125] backdrop-blur-sm transition-all duration-200 hover:bg-white"
        >
          Get Started
        </a>
      </nav>
    </header>
  );
}
