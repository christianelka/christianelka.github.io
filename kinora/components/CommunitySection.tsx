import { Check } from "lucide-react";
import HeroCTA from "@/components/HeroCTA";
import SectionHeader from "@/components/SectionHeader";

const PERKS = ["Events & meetups", "Mentorship", "Shared projects"] as const;

export default function CommunitySection() {
  return (
    <section
      id="community"
      aria-label="Community"
      className="scroll-mt-20 bg-[#0F4125] px-5 py-20 text-white sm:py-24 md:px-8 lg:px-12"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <SectionHeader
          dark
          eyebrow="Community"
          title="Grow stronger, together."
          description="Join people who show up for each other, learning, building, and celebrating wins side by side. There is always a seat for you here."
        />

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {PERKS.map((perk) => (
            <li
              key={perk}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm"
            >
              <Check size={13} strokeWidth={3} aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>

        <div className="anim-cta">
          <HeroCTA href="#contact" variant="light">
            Join the Community
          </HeroCTA>
        </div>
      </div>
    </section>
  );
}
