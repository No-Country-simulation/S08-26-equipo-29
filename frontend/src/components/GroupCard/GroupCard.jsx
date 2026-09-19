import Avatar from '../Avatar';
import Badge from '../Badge';
import './GroupCard.css';

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningTriangleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h17.78A1.5 1.5 0 0022.18 18L13.71 3.86a1.5 1.5 0 00-2.42 0z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="sf-group-card__chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GroupCard = ({
  name,
  status,
  members = [],
  maxAvatars = 3,
  onClick,
  className = '',
  ...rest
}) => {
  const visibleMembers = members.slice(0, maxAvatars);
  const overflowCount = members.length - visibleMembers.length;
  const classes = ['sf-group-card', className].filter(Boolean).join(' ');
  const Element = onClick ? 'button' : 'div';

  return (
    <Element
      type={onClick ? 'button' : undefined}
      className={classes}
      onClick={onClick}
      {...rest}
    >
      {status && (
        <span className={`sf-group-card__status sf-group-card__status--${status}`}>
          {status === 'paid' ? <CheckCircleIcon /> : <WarningTriangleIcon />}
        </span>
      )}
      <span className="sf-group-card__avatars">
        {visibleMembers.map((member, index) => (
          <Avatar
            key={member.id ?? index}
            src={member.src}
            name={member.name}
            size="small"
            className="sf-group-card__avatar"
          />
        ))}
        {overflowCount > 0 && <Badge count={overflowCount} size={28} className="sf-group-card__avatar" />}
      </span>
      <span className="sf-group-card__name">{name}</span>
      <ChevronRightIcon />
    </Element>
  );
};

export default GroupCard;
