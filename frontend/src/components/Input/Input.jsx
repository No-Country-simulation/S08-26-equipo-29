import { useId } from 'react';
import './Input.css';

const Input = ({
  label,
  helperText,
  error,
  size = 'large',
  disabled = false,
  rightIcon,
  id,
  className = '',
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  const wrapperClasses = [
    'sf-input',
    `sf-input--${size}`,
    disabled && 'sf-input--disabled',
    error && 'sf-input--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="sf-input__label">
          {label}
        </label>
      )}
      <div className="sf-input__field">
        <input
          id={inputId}
          className="sf-input__control"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          {...rest}
        />
        {rightIcon && <span className="sf-input__icon">{rightIcon}</span>}
      </div>
      {(error || helperText) && (
        <span className={`sf-input__helper ${error ? 'sf-input__helper--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
