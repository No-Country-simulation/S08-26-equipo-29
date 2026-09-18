import './Avatar.css';

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const Avatar = ({ src, name = '', size = 'medium', ring = 'indigo', className = '', ...rest }) => {
  const classes = ['sf-avatar', `sf-avatar--${size}`, `sf-avatar--ring-${ring}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} role="img" aria-label={name} {...rest}>
      {src ? (
        <img src={src} alt="" className="sf-avatar__image" />
      ) : (
        <span aria-hidden="true">{getInitials(name) || '?'}</span>
      )}
    </span>
  );
};

export default Avatar;
