import React, { useEffect, useState } from 'react';
import Avatar from '../components/Avatar';
import './DeudasView.css';
import SinDeudas from './Sindeudas.svg';
import exitoRegistro from './exitoRegistro.svg';

const createProofPreview = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
    image.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('No se pudo procesar la imagen.'));
        return;
      }
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    image.src = String(reader.result || '');
  };
  reader.readAsDataURL(file);
});

const STATUS_META = {
  PENDING: { label: 'Pendiente', className: 'status-pending' },
  STARTED: { label: 'Pago iniciado', className: 'status-started' },
  PAYMENT_SUBMITTED: { label: 'En revisión', className: 'status-started' },
  PAID: { label: 'Pagado', className: 'status-paid' },
};

const formatClosedDate = (value) => {
  if (!value) return 'Fecha no registrada';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no registrada';
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export default function DeudasView({ groupName = 'Viaje Melgar', debts = [], onMarkAsPaid }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPhase, setModalPhase] = useState('upload');
  const [statusMap, setStatusMap] = useState({});
  const [proofMap, setProofMap] = useState({});
  const [uploadedImage, setUploadedImage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [screenMode, setScreenMode] = useState('list');
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  useEffect(() => {
    setStatusMap(Object.fromEntries((debts || []).map((debt) => [debt.id, debt.status || 'PENDING'])));
  }, [debts]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedDebt(null);
    setUploadedImage('');
    setUploadError('');
    setModalPhase('upload');
  };

  const handleOpenConfirm = (debt) => {
    setSelectedDebt(debt);
    setModalPhase('upload');
    setUploadedImage('');
    setUploadError('');
    setShowModal(true);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('El comprobante debe ser una imagen.');
      return;
    }

    try {
      setUploadedImage(await createProofPreview(file));
      setUploadError('');
    } catch (error) {
      setUploadError(error.message);
    }
  };

  const handleUploadNext = () => {
    if (!uploadedImage) {
      setUploadError('Debes subir la imagen del comprobante para continuar.');
      return;
    }

    setUploadError('');
    setModalPhase('confirm');
  };

  const handleConfirmPay = async () => {
    if (!selectedDebt) return;
    if (!uploadedImage) {
      setUploadError('No hay un comprobante para registrar el pago.');
      return;
    }

    setIsSavingPayment(true);
    setUploadError('');
    try {
      const registeredDebt = onMarkAsPaid ? await onMarkAsPaid(selectedDebt, uploadedImage) : null;
      const paidDebtId = registeredDebt?.id || selectedDebt.id;

      setStatusMap((current) => ({ ...current, [paidDebtId]: 'PAID' }));
      setProofMap((current) => ({ ...current, [paidDebtId]: uploadedImage }));
      setPaymentNotice({
        message: `¡Registro exitoso! El pago de ${formatCurrency(selectedDebt.amount)} a ${selectedDebt.creditorName || selectedDebt.creditor} quedó registrado.`,
        image: uploadedImage,
      });
      setShowModal(false);
      setSelectedDebt(null);
      setUploadedImage('');
      setModalPhase('upload');
      setScreenMode('success');
    } catch (error) {
      setUploadError(error.message || 'No se pudo registrar el pago. Intenta de nuevo.');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleViewResult = () => {
    setScreenMode('result');
  };

  const formatCurrency = (amount) => `$${Number(amount).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="splitflow-container">
      {screenMode === 'success' ? (
        <div className="payment-success-screen" role="status">
          <div className="payment-success-screen__circle">
            <img src={exitoRegistro} alt="Registro exitoso" />
          </div>
          <h3>¡Registro exitoso!</h3>
          <button type="button" className="btn-primary success-action" onClick={handleViewResult}>
            Ver resultado
          </button>
        </div>
      ) : (
        <>
          {paymentNotice && screenMode === 'result' && (
            <div className="payment-success-banner" role="status">
              {paymentNotice.image && <img src={paymentNotice.image} alt="Comprobante registrado" className="success-proof-image" />}
              <span>{paymentNotice.message}</span>
            </div>
          )}

          {debts.length === 0 ? (
            <div className="empty-state-card">
              <img src={SinDeudas} alt="Sin deudas" />
              <h3>No tienes deudas <span className="splitflow-link-button">en este grupo</span></h3>
              <p className="empty-subtitle">Si el grupo sigue con gastos activos, otras deudas pueden seguir en curso.</p>
            </div>
          ) : (
            <div className="debts-list">
              {debts.map((debt) => {
                const currentStatus = statusMap[debt.id] || debt.status || 'PENDING';
                const statusInfo = STATUS_META[currentStatus] || STATUS_META.PENDING;
                const proofImage = proofMap[debt.id] || debt.proofImage;
                const closedAt = debt.closedAt || new Date().toISOString();

                return (
                  <article key={debt.id} className="debt-card">
                    <div className="debt-info">
                      <Avatar name={debt.creditorName || debt.creditor || 'Usuario'} size="small" />
                      <div>
                        <div className="debt-main-text">Debes a {debt.creditorName || debt.creditor}</div>
                        <span className={`status-pill ${statusInfo.className}`}>{statusInfo.label}</span>
                      </div>
                    </div>
                    <div className="debt-right">
                      <span className="debt-amount">{formatCurrency(debt.amount)}</span>
                      {currentStatus === 'PENDING' && (
                        <button className="btn-outline-pay" type="button" onClick={() => handleOpenConfirm(debt)}>
                          Informar pago
                        </button>
                      )}
                      {currentStatus === 'STARTED' && (
                        <button className="btn-outline-pay btn-primary-soft" type="button" onClick={() => handleOpenConfirm(debt)}>
                          Informar pago
                        </button>
                      )}
                      {currentStatus === 'PAYMENT_SUBMITTED' && (
                        <span className="paid-inline status-review">En revisión</span>
                      )}
                      {currentStatus === 'PAID' && (
                        <>
                          <div className="paid-status-meta">
                            <span className="paid-inline">Pagado</span>
                            <time className="debt-closed-date" dateTime={closedAt}>
                              {formatClosedDate(closedAt)}
                            </time>
                          </div>
                          {proofImage ? (
                            <img
                              src={proofImage}
                              alt="Vista previa del comprobante de pago"
                              className="proof-thumbnail"
                            />
                          ) : (
                            <span className="proof-unavailable">Comprobante no disponible</span>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {showModal && selectedDebt && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="payment-title">
            <div className="modal-header">
              <h3 id="payment-title">
                {modalPhase === 'upload' ? 'Informar pago' : 'Confirmar pago'}
              </h3>
              <button className="modal-close-button" type="button" aria-label="Cerrar" onClick={closeModal}>×</button>
            </div>

            {modalPhase === 'upload' ? (
              <>
                <p className="modal-description">
                  Subí una imagen del comprobante para registrar el pago de {formatCurrency(selectedDebt.amount)} a {selectedDebt.creditorName || selectedDebt.creditor}.
                </p>

                <label className="upload-dropzone" htmlFor="payment-proof-upload">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Comprobante adjunto" className="upload-preview" />
                  ) : (
                    <span className="upload-placeholder">
                      <span className="upload-icon" aria-hidden="true">↑</span>
                      <span>Cargar comprobante</span>
                    </span>
                  )}
                </label>
                <input
                  id="payment-proof-upload"
                  className="upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {uploadError && <p className="upload-error">{uploadError}</p>}

                <div className="modal-actions">
                  <button className="btn-secondary" type="button" onClick={closeModal}>Cancelar</button>
                  <button className="btn-primary" type="button" onClick={handleUploadNext}>Continuar</button>
                </div>
              </>
            ) : (
              <>
                <div className="proof-summary">
                  <p>Comprobante adjunto</p>
                  <img src={uploadedImage} alt="Previsualización del comprobante" className="proof-preview" />
                </div>

                <p className="modal-description">
                  ¿Confirmás que ya realizaste el pago de {formatCurrency(selectedDebt.amount)} a {selectedDebt.creditorName || selectedDebt.creditor}?
                </p>

                {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}

                <div className="modal-actions">
                  <button className="btn-secondary" type="button" onClick={() => setModalPhase('upload')}>Volver</button>
                  <button className="btn-primary" type="button" onClick={handleConfirmPay} disabled={isSavingPayment}>
                    {isSavingPayment ? 'Registrando...' : 'Registrar pago'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}