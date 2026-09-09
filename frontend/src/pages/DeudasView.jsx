import React, { useState } from 'react';
import './DeudasView.css'; // Asegúrate de tener los estilos o Tailwind configurados

export default function DeudasView({ groupName = "Viaje Melgar", debts = [], onMarkAsPaid }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenConfirm = (debt) => {
    setSelectedDebt(debt);
    setShowModal(true);
  };

  const handleConfirmPay = () => {
    if (selectedDebt && onMarkAsPaid) {
      onMarkAsPaid(selectedDebt.id);
    }
    setShowModal(false);
    setSelectedDebt(null);
  };

  return (
    <div className="splitflow-container">
      {/* Barra de Navegación Superior */}
      <header className="app-header">
        <button className="back-btn">&larr;</button>
        <h1>{groupName}</h1>
        <button className="fab-top">+</button>
      </header>

      {/* Pestañas Segmentadas */}
      <nav className="tabs-nav">
        <button className="tab-item">Gastos</button>
        <button className="tab-item">Saldos</button>
        <button className="tab-item active">Deudas</button>
      </nav>

      <main className="content-body">
        <section className="section-title">
          <h2>TUS DEUDAS — VISTA PERSONAL</h2>
        </section>

        {/* Lista de Deudas o Estado Vacío */}
        {debts.length === 0 ? (
          <div className="empty-state-card">
            <div className="success-icon-badge">✓</div>
            <h3>Todas las cuentas están saldadas</h3>
            <p className="empty-subtitle">No tienes deudas pendientes en este grupo</p>
          </div>
        ) : (
          <div className="debts-list">
            {debts.map((debt) => (
              <div key={debt.id} className="debt-card">
                <div className="debt-info">
                  <div className="avatar-circle">{debt.creditorName.charAt(0)}</div>
                  <div>
                    <div className="debt-main-text">
                      Debes a {debt.creditorName}
                    </div>
                    <span className="badge-pending">Pendiente</span>
                  </div>
                </div>
                <div className="debt-right">
                  <span className="debt-amount">${debt.amount.toLocaleString()}</span>
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

      {/* Modal de Confirmación (C9) */}
      {showModal && selectedDebt && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Confirmar pago</h3>
            <p>
              ¿Confirmas que ya pagaste ${selectedDebt.amount.toLocaleString()} a {selectedDebt.creditorName}? Esta acción no se puede deshacer.
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