import { ArrowRight } from "lucide-react";

type HeroCTAProps = {
  href?: string;
  children?: React.ReactNode;
};

export default function HeroCTA({
  href = "#contact",
  children = "Get Started",
}: HeroCTAProps) {
  return (
    <a
      href={href}
      className="mt-[17px] inline-flex items-center gap-[10px] rounded-full bg-[#080B09] px-[23px] py-[11px] text-xs font-semibold text-white shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1A211C] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
    >
      {children}
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
        <ArrowRight size={11} strokeWidth={2.5} aria-hidden="true" />
      </span>
    </a>
  );
}
