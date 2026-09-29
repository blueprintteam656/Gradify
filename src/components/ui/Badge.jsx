const VARIANTS = {
  ai: 'bg-ai-accent-soft text-ai-accent',
  brand: 'bg-violet-100 text-brand-violet',
  neutral: 'bg-gray-100 text-gray-700',
};

// leading-[17px] keeps the md pill at ~25px tall per the Login design.
const SIZES = {
  sm: 'text-xs font-semibold',
  md: 'text-sm leading-[17px] font-medium',
};

// Hug-content pill: icon + text.
export default function Badge({ children, variant = 'ai', size = 'md', icon, className = '', ...rest }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${SIZES[size] ?? SIZES.md} ${VARIANTS[variant] ?? VARIANTS.ai} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
