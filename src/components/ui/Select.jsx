import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import FormField from './FormField';
import { controlClasses, errorIdFor } from './controlStyles';

// Native <select> styled like Input. `options` = [{ value, label }].
export default function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  size = 'lg',
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const selectId = id ?? name ?? generatedId;
  const isEmpty = value === '' || value == null;

  return (
    <FormField id={selectId} label={label} error={error} className={className}>
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorIdFor(selectId) : undefined}
          className={`${controlClasses({ size, error: Boolean(error), muted: isEmpty })} cursor-pointer appearance-none truncate pr-10 pl-3`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
        />
      </div>
    </FormField>
  );
}
