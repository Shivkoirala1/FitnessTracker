import { CREATOR } from "../data/gymInfo.js";

const ICONS = {
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  
};

const PLATFORMS = [
  { key: "instagram", label: "Instagram", href: CREATOR.instagram },
  
];

export default function SocialLinks({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {PLATFORMS.map((p) => (
        <a
          key={p.key}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={p.label}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-panel border border-line text-muted hover:text-signal hover:border-signal transition-colors"
        >
          {ICONS[p.key]}
        </a>
      ))}
    </div>
  );
}
