import React, { useEffect, useState } from 'react';
import Avatar from '../components/Avatar';
import { formatCurrency } from '../utils/format';
import './DeudasView.css';

const STATUS_META = {
  PENDING: { label: 'Pendiente', className: 'status-pending' },
  STARTED: { label: 'Pago iniciado', className: 'status-started' },
  PAID: { label: 'Pagado', className: 'status-paid' },
};

const DEFAULT_EMPTY_STATE = { title: 'Sin deudas pendientes', message: 'No tienes deudas pendientes en este grupo' };

export default function DeudasView({ debts = [], emptyState = DEFAULT_EMPTY_STATE, onStartPayment, onMarkAsPaid }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('PENDING');
  const [statusMap, setStatusMap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setStatusMap(Object.fromEntries((debts || []).map((debt) => [debt.id, debt.status || 'PENDING'])));
  }, [debts]);

  const handleOpenConfirm = (debt, mode) => {
    setSelectedDebt(debt);
    setModalMode(mode);
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setSelectedDebt(null);
    setModalMode('PENDING');
    setSubmitError('');
  };

  const handleConfirmPay = async () => {
    if (!selectedDebt || isSubmitting) return;

    if (modalMode === 'STARTED') {
      onStartPayment?.(selectedDebt);
      setStatusMap((current) => ({ ...current, [selectedDebt.id]: 'STARTED' }));
      closeModal();
      return;
    }

    if (modalMode === 'PAID' && onMarkAsPaid) {
      setIsSubmitting(true);
      setSubmitError('');
      try {
        await onMarkAsPaid(selectedDebt);
        setStatusMap((current) => ({ ...current, [selectedDebt.id]: 'PAID' }));
      } catch (error) {
        setSubmitError(error.message || 'No pudimos registrar el pago. Intenta de nuevo.');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }

    closeModal();
  };

  const confirmMessage = () => {
    const amount = formatCurrency(selectedDebt.amount);
    if (modalMode === 'STARTED') {
      return `¿Deseas iniciar el pago de ${amount} a ${selectedDebt.otherName}? El flujo quedará marcado como “Pago iniciado”.`;
    }
    return selectedDebt.owedByMe
      ? `¿Confirmas que ya pagaste ${amount} a ${selectedDebt.otherName}? Esta acción no se puede deshacer.`
      : `¿Confirmas que ${selectedDebt.otherName} ya te pagó ${amount}? Esta acción no se puede deshacer.`;
  };

  return (
    <div className="splitflow-container">
      <section className="section-title">
        <h2>TUS DEUDAS — VISTA PERSONAL</h2>
      </section>

      {debts.length === 0 ? (
        <div className="empty-state-card">
          {emptyState.showBadge !== false && <div className="success-icon-badge" aria-hidden="true">✓</div>}
          <h3>{emptyState.title}</h3>
          <p className="empty-subtitle">{emptyState.message}</p>
        </div>
      ) : (
        <div className="debts-list">
          {debts.map((debt) => {
            const currentStatus = statusMap[debt.id] || debt.status || 'PENDING';
            const statusInfo = STATUS_META[currentStatus] || STATUS_META.PENDING;

            return (
              <article key={debt.id} className="debt-card">
                <div className="debt-info">
                  <Avatar name={debt.otherName} size="small" />
                  <div>
                    <div className="debt-main-text">
                      {debt.owedByMe ? `Debes a ${debt.otherName}` : `${debt.otherName} te debe`}
                    </div>
                    <span className={`status-pill ${statusInfo.className}`}>{statusInfo.label}</span>
                  </div>
                </div>
                <div className="debt-right">
                  <span className="debt-amount">{formatCurrency(debt.amount)}</span>
                  {debt.owedByMe && currentStatus === 'PENDING' && (
                    <button className="btn-outline-pay" type="button" onClick={() => handleOpenConfirm(debt, 'STARTED')}>
                      Iniciar pago
                    </button>
                  )}
                  {(debt.owedByMe ? currentStatus === 'STARTED' : currentStatus !== 'PAID') && (
                    <button className="btn-outline-pay btn-primary-soft" type="button" onClick={() => handleOpenConfirm(debt, 'PAID')}>
                      Marcar como pagado
                    </button>
                  )}
                  {currentStatus === 'PAID' && (
                    <span className="paid-inline">Pagado</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && selectedDebt && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="payment-title">
            <h3 id="payment-title">
              {modalMode === 'STARTED' ? 'Confirmar inicio de pago' : 'Confirmar pago'}
            </h3>
            <p>{confirmMessage()}</p>
            {submitError && <p className="text-danger small" role="alert">{submitError}</p>}
            <div className="modal-actions">
              <button className="btn-secondary" type="button" onClick={closeModal} disabled={isSubmitting}>Cancelar</button>
              <button className="btn-primary" type="button" onClick={handleConfirmPay} disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : modalMode === 'STARTED' ? 'Iniciar pago' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
