export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="error-state">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}
