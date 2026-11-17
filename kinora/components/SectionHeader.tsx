type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      <span
        className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
          dark ? "text-[#7ED3A2]" : "text-[#367C52]"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`font-heading max-w-[560px] text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] sm:text-[32px] ${
          dark ? "text-white" : "text-[#0F4125]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`max-w-[520px] text-sm leading-[1.7] ${
            dark ? "text-white/75" : "text-[#0F4125]/70"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
