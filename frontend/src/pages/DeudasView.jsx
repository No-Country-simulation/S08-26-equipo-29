import React, { useState } from 'react';
import './DeudasView.css';

export default function DeudasView({ groupName = "", debts = [], onMarkAsPaid }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenConfirm = (debt) => {
    setSelectedDebt(debt);
    setShowModal(true);
  };

  const handleConfirmPay = () => {
    if (selectedDebt && onMarkAsPaid) {
      onMarkAsPaid(selectedDebt);
    }
    setShowModal(false);
    setSelectedDebt(null);
  };

  return (
    <div className="splitflow-container">
      <main className="content-body p-0">
        <section className="section-title mb-3">
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
            {debts.map((debt, index) => (
              <div key={debt.id || index} className="debt-card">
                <div className="debt-info">
                  <div className="avatar-circle">
                    {(debt.creditorName || debt.creditor || '?').charAt(0)}
                  </div>
                  <div>
                    <div className="debt-main-text">
                      Debes a {debt.creditorName || debt.creditor}
                    </div>
                    <span className="badge-pending">Pendiente</span>
                  </div>
                </div>
                <div className="debt-right">
                  <span className="debt-amount">${Number(debt.amount).toLocaleString('es-CO')}</span>
                  <button 
                    className="btn-outline-pay" 
                    onClick={() => handleOpenConfirm(debt)}
                  >
                    Marcar como pagado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && selectedDebt && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Confirmar pago</h3>
            <p>
              ¿Confirmas que ya pagaste ${Number(selectedDebt.amount).toLocaleString('es-CO')} a {selectedDebt.creditorName || selectedDebt.creditor}? Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={handleConfirmPay}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}