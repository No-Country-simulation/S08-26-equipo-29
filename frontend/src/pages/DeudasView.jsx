import React, { useEffect, useState } from 'react';
import './DeudasView.css';

const STATUS_META = {
  PENDING: { label: 'Pendiente', className: 'status-pending' },
  STARTED: { label: 'Pago iniciado', className: 'status-started' },
  PAID: { label: 'Pagado', className: 'status-paid' },
};

export default function DeudasView({ groupName = 'Viaje Melgar', debts = [], onMarkAsPaid }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('PENDING');
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    setStatusMap(Object.fromEntries((debts || []).map((debt) => [debt.id, debt.status || 'PENDING'])));
  }, [debts]);

  const handleOpenConfirm = (debt, mode) => {
    setSelectedDebt(debt);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleConfirmPay = async () => {
    if (!selectedDebt) return;

    if (modalMode === 'STARTED') {
      setStatusMap((current) => ({ ...current, [selectedDebt.id]: 'STARTED' }));
      setShowModal(false);
      setSelectedDebt(null);
      setModalMode('PENDING');
      return;
    }

    if (modalMode === 'PAID' && onMarkAsPaid) {
      await onMarkAsPaid(selectedDebt);
      setStatusMap((current) => ({ ...current, [selectedDebt.id]: 'PAID' }));
    }

    setShowModal(false);
    setSelectedDebt(null);
    setModalMode('PENDING');
  };

  const formatCurrency = (amount) => `$${Number(amount).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="splitflow-container">
      <header className="app-header">
        <div className="app-header-copy">
          <small className="eyebrow text-uppercase">SF-5</small>
          <h1>{groupName}</h1>
        </div>
        <button className="floating-action" type="button" aria-label="Agregar">+</button>
      </header>

      <section className="section-title">
        <h2>TUS DEUDAS — VISTA PERSONAL</h2>
      </section>

      {debts.length === 0 ? (
        <div className="empty-state-card">
          <div className="success-icon-badge">✓</div>
          <h3>Todas las cuentas están saldadas</h3>
          <p className="empty-subtitle">No tienes deudas pendientes en este grupo</p>
        </div>
      ) : (
        <div className="debts-list">
          {debts.map((debt) => {
            const currentStatus = statusMap[debt.id] || debt.status || 'PENDING';
            const statusInfo = STATUS_META[currentStatus] || STATUS_META.PENDING;

            return (
              <article key={debt.id} className="debt-card">
                <div className="debt-info">
                  <div className="avatar-circle">{(debt.creditorName || debt.creditor || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="debt-main-text">Debes a {debt.creditorName || debt.creditor}</div>
                    <span className={`status-pill ${statusInfo.className}`}>{statusInfo.label}</span>
                  </div>
                </div>
                <div className="debt-right">
                  <span className="debt-amount">{formatCurrency(debt.amount)}</span>
                  {currentStatus === 'PENDING' && (
                    <button className="btn-outline-pay" type="button" onClick={() => handleOpenConfirm(debt, 'STARTED')}>
                      Iniciar pago
                    </button>
                  )}
                  {currentStatus === 'STARTED' && (
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
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowModal(false); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="payment-title">
            <h3 id="payment-title">
              {modalMode === 'STARTED' ? 'Confirmar inicio de pago' : 'Confirmar pago'}
            </h3>
            <p>
              {modalMode === 'STARTED'
                ? `¿Deseas iniciar el pago de ${formatCurrency(selectedDebt.amount)} a ${selectedDebt.creditorName || selectedDebt.creditor}? El flujo quedará marcado como “Pago iniciado”.`
                : `¿Confirmas que ya pagaste ${formatCurrency(selectedDebt.amount)} a ${selectedDebt.creditorName || selectedDebt.creditor}? Esta acción no se puede deshacer.`}
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" type="button" onClick={handleConfirmPay}>
                {modalMode === 'STARTED' ? 'Iniciar pago' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}