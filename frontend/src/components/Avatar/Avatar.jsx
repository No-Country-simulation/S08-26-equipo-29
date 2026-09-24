import './Avatar.css';
import memoji from '../../public/memojis/memoji.svg';
import memoji1 from '../../public/memojis/memoji (1).svg';
import memoji2 from '../../public/memojis/memoji (2).svg';
import memoji3 from '../../public/memojis/memoji (3).svg';
import memoji4 from '../../public/memojis/memoji (4).svg';
import memoji5 from '../../public/memojis/memoji (5).svg';
import memoji6 from '../../public/memojis/memoji (6).svg';
import memoji7 from '../../public/memojis/memoji (7).svg';
import memoji8 from '../../public/memojis/memoji (8).svg';
import memoji9 from '../../public/memojis/memoji (9).svg';
import memoji10 from '../../public/memojis/memoji (10).svg';
import memoji11 from '../../public/memojis/memoji (11).svg';
import memoji12 from '../../public/memojis/memoji (12).svg';
import memoji13 from '../../public/memojis/Memoji (13).svg';
import memoji14 from '../../public/memojis/Memoji (14).svg';
import memoji15 from '../../public/memojis/Memoji (15).svg';
import memoji16 from '../../public/memojis/Memoji (16).svg';
import memoji17 from '../../public/memojis/Memoji (17).svg';
import memoji18 from '../../public/memojis/Memoji (18).svg';
import memoji19 from '../../public/memojis/Memoji (19).svg';

const MEMOJI_ASSETS = [
  memoji,
  memoji1,
  memoji2,
  memoji3,
  memoji4,
  memoji5,
  memoji6,
  memoji7,
  memoji8,
  memoji9,
  memoji10,
  memoji11,
  memoji12,
  memoji13,
  memoji14,
  memoji15,
  memoji16,
  memoji17,
  memoji18,
  memoji19,
];

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const getStableMemoji = (name = '') => {
  const seed = String(name).trim().toLowerCase();

  if (!seed) {
    return MEMOJI_ASSETS[0];
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return MEMOJI_ASSETS[hash % MEMOJI_ASSETS.length];
};

const Avatar = ({ src, name = '', size = 'medium', ring = 'indigo', className = '', ...rest }) => {
  const classes = ['sf-avatar', `sf-avatar--${size}`, `sf-avatar--ring-${ring}`, className]
    .filter(Boolean)
    .join(' ');
  const resolvedSrc = src || getStableMemoji(name);

  return (
    <span className={classes} role="img" aria-label={name} {...rest}>
      {resolvedSrc ? (
        <img src={resolvedSrc} alt="" className="sf-avatar__image" />
      ) : (
        <span aria-hidden="true">{getInitials(name) || '?'}</span>
      )}
    </span>
  );
};

export default Avatar;
