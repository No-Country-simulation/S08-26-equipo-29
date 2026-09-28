import { useState } from 'react';
import Tag from '../Tag';
import Button from '../Button';
import './ParticipantCard.css';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ParticipantCard = ({
  participants = [],
  onRemoveParticipant,
  onAddParticipant,
  addLabel = 'Agregar participante',
  placeholder = 'Nombre del participante',
  className = '',
  ...rest
}) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    const name = draft.trim();
    if (name) onAddParticipant?.(name);
    setDraft('');
    setAdding(false);
  };

  const classes = ['sf-participant-card', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {participants.map((participant) => (
        <div key={participant.id} className="sf-participant-card__row">
          <span className="sf-participant-card__name">{participant.name}</span>
          {participant.tag && <Tag>{participant.tag}</Tag>}
          {participant.removable !== false && onRemoveParticipant && (
            <button
              type="button"
              className="sf-participant-card__remove"
              aria-label={`Quitar a ${participant.name}`}
              onClick={() => onRemoveParticipant(participant.id)}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <div className="sf-participant-card__row">
          <input
            autoFocus
            className="sf-participant-card__input"
            value={draft}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && commitDraft()}
            onBlur={commitDraft}
          />
          <button
            type="button"
            className="sf-participant-card__remove"
            aria-label="Cancelar"
            onClick={() => {
              setDraft('');
              setAdding(false);
            }}
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <div className="sf-participant-card__row sf-participant-card__row--add">
          <Button variant="ghost" size="small" onClick={() => setAdding(true)}>
            {addLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParticipantCard;
