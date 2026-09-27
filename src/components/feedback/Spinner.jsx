const SIZES = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${SIZES[size] ?? SIZES.md} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading…</span>
    </span>
  );
}
