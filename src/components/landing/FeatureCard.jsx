// Marketing feature tile: colored icon square, title, optional description.
export default function FeatureCard({ icon: Icon, iconBg, iconColor, title, description, className = '', style }) {
  return (
    <article
      style={style}
      className={`flex flex-col gap-4 rounded-2xl border border-ink/[0.04] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-ink/10 hover:shadow-md sm:p-8 ${className}`}
    >
      <span className={`flex size-9 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
      </div>
    </article>
  );
}
