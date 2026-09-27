import { errorIdFor } from './controlStyles';

// Label row + control + optional helper + error message. Used by Input and Select.
export default function FormField({ id, label, labelAction, error, helper, className = '', children }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || labelAction) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={id} className="text-sm font-semibold text-gray-900">
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}
      {children}
      {helper}
      {error && (
        <p id={errorIdFor(id)} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
