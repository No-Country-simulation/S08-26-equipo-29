import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon = false,
  type = 'button',
  className = '',
  ...rest
}) => {
  const classes = ['sf-button', `sf-button--${variant}`, `sf-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      <span className="sf-button__label">{children}</span>
      {icon && (
        <svg className="sf-button__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

export default Button;
