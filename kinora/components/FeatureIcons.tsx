import { Globe, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Users, label: "Community" },
  { icon: Heart, label: "Care" },
  { icon: ShieldCheck, label: "Trust" },
  { icon: Sparkles, label: "Growth" },
  { icon: Globe, label: "Global" },
];

export default function FeatureIcons() {
  return (
    <ul
      aria-label="KINORA highlights"
      className="flex items-center gap-[5px]"
    >
      {FEATURES.map(({ icon: Icon, label }, index) => (
        <li
          key={label}
          className="anim-feature-icons flex h-8 w-8 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm"
          style={{ animationDelay: `${index * 70}ms` }}
          title={label}
        >
          <Icon size={14} strokeWidth={2.2} className="text-[#0F4125]" />
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ul>
  );
}
