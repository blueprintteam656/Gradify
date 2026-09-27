import Spinner from '../feedback/Spinner';

const VARIANTS = {
  primary: 'bg-primary text-white shadow-button enabled:hover:bg-primary-hover focus-visible:ring-primary/40',
  outline:
    'border border-step-active bg-white text-step-active enabled:hover:bg-step-active/5 focus-visible:ring-step-active/40',
  secondary:
    'border border-gray-200 bg-white text-primary enabled:hover:bg-gray-50 focus-visible:ring-primary/30',
};

// Horizontal padding is kept separate so a `px-*` in className can replace it cleanly.
const SIZES = {
  md: { box: 'h-10 rounded-lg text-sm', px: 'px-6' },
  lg: { box: 'h-11 rounded-lg text-sm', px: 'px-6' },
  xl: { box: 'h-12 rounded-xl text-base', px: 'px-6' },
  default: { box: 'h-[46px] rounded-lg text-base', px: 'px-4' },
};

export default function Button({
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

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses.box} ${padX} ${VARIANTS[variant] ?? VARIANTS.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
