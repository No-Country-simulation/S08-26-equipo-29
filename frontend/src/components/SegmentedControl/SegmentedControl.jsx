import './SegmentedControl.css';

const SegmentedControl = ({ options, value, onChange, className = '', ...rest }) => {
  const classes = ['sf-segmented', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="tablist" {...rest}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={`sf-segmented__option ${option.value === value ? 'is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
