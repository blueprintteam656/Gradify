import Spinner from '../feedback/Spinner';

// `not-disabled:hover:` (instead of `enabled:`) so hover also works when rendered as a link.
const VARIANTS = {
  primary: 'bg-primary text-white shadow-button enabled:hover:bg-primary-hover focus-visible:ring-primary/40',
  outline:
    'border border-step-active bg-white text-step-active enabled:hover:bg-step-active/5 focus-visible:ring-step-active/40',
  secondary:
    'border border-gray-200 bg-white text-primary enabled:hover:bg-gray-50 focus-visible:ring-primary/30',
  navy: 'bg-navy-btn text-white shadow-btn-navy not-disabled:hover:bg-ink focus-visible:ring-navy-btn/40',
  plain:
    'border border-ink/10 bg-white text-ink not-disabled:hover:border-ink/20 not-disabled:hover:bg-gray-50 focus-visible:ring-ink/30',
};

// Horizontal padding is kept separate so a `px-*` in className can replace it cleanly.
const SIZES = {
  md: { box: 'h-10 rounded-lg text-sm', px: 'px-6' },
  lg: { box: 'h-11 rounded-lg text-sm', px: 'px-6' },
  xl: { box: 'h-12 rounded-xl text-base', px: 'px-6' },
  nav: { box: 'h-11 rounded-[10px] text-base', px: 'px-5' },
  cta: { box: 'h-[46px] rounded-[10px] text-sm', px: 'px-6' },
  default: { box: 'h-[46px] rounded-lg text-base', px: 'px-4' },
};

// Pass `as={Link}` (plus `to`) to render a router link styled as a button.
export default function Button({
  as: Component = 'button',
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  fullWidth = false,
  rightIcon,
  className = '',
  ...rest
}) {
  const sizeClasses = SIZES[size] ?? SIZES.default;
  const padX = /(^|\s)px-/.test(className) ? '' : sizeClasses.px;
  const isButton = Component === 'button';

  return (
    <Component
      {...(isButton ? { type, disabled: disabled || loading } : {})}
      onClick={onClick}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses.box} ${padX} ${VARIANTS[variant] ?? VARIANTS.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
      {!loading && rightIcon}
    </Component>
  );
}
