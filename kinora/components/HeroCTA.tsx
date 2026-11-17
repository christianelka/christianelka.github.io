import { ArrowRight } from "lucide-react";

type HeroCTAProps = {
  href?: string;
  children?: React.ReactNode;
  variant?: "dark" | "light";
};

export default function HeroCTA({
  href = "#contact",
  children = "Get Started",
  variant = "dark",
}: HeroCTAProps) {
  const isLight = variant === "light";
  return (
    <a
      href={href}
      className={`mt-[17px] inline-flex items-center gap-[10px] rounded-full px-[23px] py-[11px] text-xs font-semibold shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
        isLight
          ? "bg-white text-[#0F4125] hover:bg-[#EAF5EE]"
          : "bg-[#080B09] text-white hover:bg-[#1A211C]"
      }`}
    >
      {children}
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          isLight ? "bg-[#0F4125]/10" : "bg-white/15"
        }`}
      >
        <ArrowRight size={11} strokeWidth={2.5} aria-hidden="true" />
      </span>
    </a>
  );
}
