import FeatureIcons from "@/components/FeatureIcons";
import HeroCTA from "@/components/HeroCTA";

export default function HeroContent() {
  return (
    <section
      aria-label="KINORA introduction"
      className="relative z-10 flex w-full flex-col items-center px-5 pt-[clamp(84px,11vh,126px)] text-center"
    >
      <FeatureIcons />

      <h1 className="anim-headline font-heading mt-5 max-w-[760px] text-[clamp(27px,8vw,36px)] font-extrabold uppercase leading-[1.05] tracking-[-0.045em] text-white sm:text-[clamp(32px,4vw,46px)]">
        Together, we build a
        <br className="hidden sm:block" />
        {` `}better tomorrow
      </h1>

      <p className="anim-subheading mt-3 max-w-[480px] text-[11px] font-normal leading-[1.6] text-white/80 md:text-xs">
        Connecting people, creating opportunities, and growing stronger
        together.
      </p>

      <div className="anim-cta">
        <HeroCTA />
      </div>
    </section>
  );
}
