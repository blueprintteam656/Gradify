export default function Card({ children, title, className = '', ...rest }) {
  return (
    <div className={`card ${className}`} {...rest}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
}
