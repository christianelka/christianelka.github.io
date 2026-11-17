import { ArrowRight, Globe, Sparkles, Users } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const SOLUTIONS = [
  {
    icon: Users,
    title: "Connect people",
    text: "Bring people together around shared goals and interests, and turn strangers into teammates and friends.",
  },
  {
    icon: Sparkles,
    title: "Create opportunities",
    text: "Discover chances to learn, collaborate, and build something meaningful, for yourself and for others.",
  },
  {
    icon: Globe,
    title: "Grow stronger",
    text: "Reach beyond borders with a community that supports you, challenges you, and celebrates your progress.",
  },
] as const;

export default function SolutionsSection() {
  return (
    <section
      id="solutions"
      aria-label="Solutions"
      className="scroll-mt-20 bg-[#F2F7F3] px-5 py-20 text-[#0F4125] sm:py-24 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Solutions"
          title="Everything you need to grow together"
          description="Three simple ways KINORA helps people move forward, together."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SOLUTIONS.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="flex flex-col rounded-3xl border border-[#E4EFE8] bg-white p-7 shadow-[0_2px_12px_rgba(15,65,37,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(15,65,37,0.10)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#367C52] text-white">
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="font-heading mt-5 text-lg font-bold tracking-[-0.02em]">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-[1.65] text-[#0F4125]/70">
                {text}
              </p>
              <a
                href="#contact"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#367C52] transition-colors hover:text-[#0F4125]"
              >
                Get started
                <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
