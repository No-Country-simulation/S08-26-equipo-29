import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './JoinGroupFlow.css';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

function InviteQr({ value }) {
  return (
    <div className="join-flow__qr" role="img" aria-label={`Código QR para ${value}`}>
      <QRCodeSVG value={value} size={192} bgColor="#ffffff" fgColor="#1d2a55" level="M" includeMargin />
    </div>
  );
}

export default function JoinGroupFlow({
  group,
  inviteCode,
  availableAliases,
  onJoin,
  onBack,
  error: externalError,
}) {
  const inviteUrl = useMemo(() => `${window.location.origin}/join/${inviteCode}`, [inviteCode]);
  const [step, setStep] = useState('invite');
  const [selectedAlias, setSelectedAlias] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showCustomName, setShowCustomName] = useState(false);
  const [error, setError] = useState(externalError || '');

  const pendingAliases = useMemo(
    () => availableAliases.filter((alias) => alias && alias.trim()),
    [availableAliases]
  );

  const shareInvite = async () => {
    try {
      await navigator.clipboard?.writeText(inviteUrl);
      setError('Enlace copiado.');
    } catch {
      setError('No se pudo copiar el enlace.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const alias = (selectedAlias || customAlias).trim();

    if (!alias) {
      setError('Debes elegir un nombre o escribir el tuyo.');
      return;
    }

    if (alias.length > 40) {
      setError('El nombre no puede superar los 40 caracteres.');
      return;
    }

    try {
      setError('');
      // Enviamos el DTO estructurado que espera el backend (JoinGroupRequest)
      await onJoin({
        alias: alias,
        deviceId: null,
        email: null
      });
    } catch (joinError) {
      setError(joinError.message || 'No pudimos confirmar tu ingreso.');
    }
  };

  const resetCustomName = () => {
    setShowCustomName(false);
    setCustomAlias('');
    setSelectedAlias('');
  };

  return (
    <main className="join-flow-shell">
      <section className="join-flow-card">
        {step === 'invite' ? (
          <>
            <div className="join-flow__header">
              <button type="button" className="join-flow__back-button" onClick={onBack} aria-label="Volver">
                ←
              </button>
              <span className="join-flow__eyebrow">Invitación</span>
            </div>

            <h1 className="join-flow__title">Únete a {group?.name || 'al grupo'}</h1>
            <p className="join-flow__subtitle">Mira el código QR o comparte este enlace con el grupo.</p>

            <div className="join-flow__qr-card">
              <InviteQr value={inviteUrl} />
              <div className="join-flow__code-info">
                <span>Grupo</span>
                <strong>{inviteCode}</strong>
              </div>
            </div>

            <button type="button" className="join-flow__primary-button" onClick={shareInvite}>
              Copiar enlace
            </button>

            <button type="button" className="join-flow__secondary-link" onClick={() => setStep('identity')}>
              Ya tengo mi nombre →
            </button>
          </>
        ) : (
          <form className="join-flow__identity-form" onSubmit={handleSubmit}>
            <div className="join-flow__header">
              <button type="button" className="join-flow__back-button" onClick={() => setStep('invite')} aria-label="Volver a la invitación">
                ←
              </button>
              <span className="join-flow__eyebrow">Tu identidad</span>
            </div>

            <h2 className="join-flow__section-title">¿Quién de estos sos tú?</h2>
            <p className="join-flow__supporting-text">Elegí tu nombre o agregá el tuyo si no aparece.</p>

            {pendingAliases.length > 0 && !showCustomName ? (
              <div className="join-flow__options">
                {pendingAliases.map((alias) => (
                  <label
                    key={alias}
                    className={`join-flow__option ${selectedAlias === alias ? 'is-selected' : ''}`}
                  >
                    <span className="join-flow__option-copy">
                      <strong>{alias}</strong>
                    </span>
                    <input
                      type="radio"
                      name="identity"
                      value={alias}
                      checked={selectedAlias === alias}
                      onChange={(event) => {
                        setSelectedAlias(event.target.value);
                        setCustomAlias('');
                      }}
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {(showCustomName || pendingAliases.length === 0) && (
              <div className="join-flow__input-wrap">
                <label htmlFor="custom-alias">Tu nombre</label>
                <input
                  id="custom-alias"
                  type="text"
                  value={customAlias}
                  maxLength={40}
                  onChange={(event) => {
                    setCustomAlias(event.target.value);
                    setSelectedAlias('');
                  }}
                  placeholder="Ej. Carlos"
                  autoFocus
                />
              </div>
            )}

            {pendingAliases.length > 0 && !showCustomName && (
              <button type="button" className="join-flow__secondary-link" onClick={() => setShowCustomName(true)}>
                No aparece mi nombre
              </button>
            )}

            {showCustomName && pendingAliases.length > 0 && (
              <button type="button" className="join-flow__secondary-link" onClick={resetCustomName}>
                Volver a la lista
              </button>
            )}

            {error && <p className="join-flow__error" role="alert">{error}</p>}

            <button type="submit" className="join-flow__primary-button">
              Unirme al grupo
            </button>
          </form>
        )}
      </section>
    </main>
  );
}