const VARIANTS = {
  ai: 'bg-ai-accent-soft text-ai-accent',
  neutral: 'bg-gray-100 text-gray-700',
};

// Hug-content pill: icon + text. leading-[17px] keeps the pill at ~25px tall per the design.
export default function Badge({ children, variant = 'ai', icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm leading-[17px] font-medium ${VARIANTS[variant] ?? VARIANTS.ai} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
