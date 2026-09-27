import { useId } from 'react';
import FormField from './FormField';
import { controlClasses, errorIdFor } from './controlStyles';

export default function Input({
  label,
  labelAction,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helper,
  leftIcon,
  rightSlot,
  size = 'lg',
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;

  return (
    <FormField
      id={inputId}
      label={label}
      labelAction={labelAction}
      error={error}
      helper={helper}
      className={className}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorIdFor(inputId) : undefined}
          className={`${controlClasses({ size, error: Boolean(error) })} ${leftIcon ? 'pl-10' : 'pl-3'} ${rightSlot ? 'pr-10' : 'pr-3'}`}
          {...rest}
        />
        {rightSlot && (
          <span className="absolute top-1/2 right-3 flex -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    </FormField>
  );
}
