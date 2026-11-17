import { Heart, ShieldCheck, Users } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const VALUES = [
  {
    icon: Users,
    title: "People first",
    text: "Every connection starts with people. We put real relationships before numbers, reach, or noise.",
  },
  {
    icon: Heart,
    title: "Care in every connection",
    text: "A kind word, a shared opportunity, a helping hand. Small acts that make a community feel like home.",
  },
  {
    icon: ShieldCheck,
    title: "Trust you can rely on",
    text: "A safe, welcoming space where people show up as themselves and look out for one another.",
  },
] as const;

export default function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About KINORA"
      className="scroll-mt-20 bg-white px-5 py-20 text-[#0F4125] sm:py-24 md:px-8 lg:px-12"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center">
          <SectionHeader
            align="left"
            eyebrow="About KINORA"
            title="A community built on trust and togetherness"
            description="KINORA is a place where people meet, share, and grow. We believe a better tomorrow is not built alone. It is built together, one connection at a time."
          />
          <p className="mt-5 max-w-[520px] text-sm leading-[1.7] text-[#0F4125]/70">
            What started as a simple idea, bringing good people closer,
            became a community that learns together, creates together, and
            lifts each other up along the way.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-4 rounded-3xl border border-[#E4EFE8] bg-[#F7FAF8] p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#367C52] text-white">
                <Icon size={19} strokeWidth={2} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-heading text-[15px] font-bold tracking-[-0.02em]">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-[1.65] text-[#0F4125]/70">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
