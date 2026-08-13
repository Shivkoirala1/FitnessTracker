import { CREATOR } from "../data/gymInfo.js";

const ICONS = {
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="10" x2="7" y2="17" strokeLinecap="round" />
      <circle cx="7" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M11 17v-4.5a2.5 2.5 0 0 1 5 0V17" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="11" y1="10" x2="11" y2="17" strokeLinecap="round" />
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 8h-2a2 2 0 0 0-2 2v2H9v3h2v6h3v-6h2.2l.8-3H14v-1.5c0-.5.3-1 1-1h1V8Z" strokeLinejoin="round" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  ),
};

const PLATFORMS = [
  { key: "instagram", label: "Instagram", href: CREATOR.instagram },
  { key: "linkedin", label: "LinkedIn", href: CREATOR.linkedin },
  { key: "facebook", label: "Facebook", href: CREATOR.facebook },
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
