import './Badge.css';

const Badge = ({ children, count, size, className = '', style, ...rest }) => {
  const classes = ['sf-badge', className].filter(Boolean).join(' ');
  const mergedStyle = size ? { ...style, '--sf-badge-size': `${size}px` } : style;

  return (
    <span className={classes} style={mergedStyle} {...rest}>
      {count !== undefined ? `+${count}` : children}
    </span>
  );
};

export default Badge;
