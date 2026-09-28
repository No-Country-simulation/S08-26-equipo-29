import './Tag.css';

const Tag = ({ children, className = '', ...rest }) => {
  const classes = ['sf-tag', className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
};

export default Tag;
