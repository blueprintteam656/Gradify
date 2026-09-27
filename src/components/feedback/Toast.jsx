export default function Toast({ message, type = 'info', onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      {onClose && <button type="button" onClick={onClose}>✕</button>}
    </div>
  );
}
