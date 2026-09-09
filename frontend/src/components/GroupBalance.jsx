import React, { useEffect, useState } from 'react';
import { getBalanceBreakdown, getGroupBalances, settlePayment } from '../services/api';

const initials = (name = '') => name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
const formatAmount = (amount) => `$${Number(amount).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const GroupBalance = ({ groupId, refreshKey = 0, view = 'saldos' }) => {
  const [summary, setSummary] = useState({ balances: {}, debts: [] });
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [message, setMessage] = useState('');
  const [paymentToConfirm, setPaymentToConfirm] = useState(null);

  const loadBalances = () => {
    setLoading(true);
    getGroupBalances(groupId)
      .then((data) => setSummary(data))
      .catch((err) => console.error('Error al cargar los balances:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBalances();
  }, [groupId, refreshKey]);

  const toggleBreakdown = async (member) => {
    if (expandedMember === member) {
      setExpandedMember(null);
      return;
    }
    try {
      const data = await getBalanceBreakdown(groupId, member);
      setBreakdown({ ...breakdown, [member]: data });
      setExpandedMember(member);
    } catch {
      setMessage('No pudimos cargar el desglose de este saldo.');
    }
  };

  const settleDebt = async (debt) => {
    try {
      await settlePayment(groupId, debt);
      setMessage('Pago registrado. La deuda quedó saldada.');
      setPaymentToConfirm(null);
      loadBalances();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) return <p>Calculando saldos y deudas...</p>;

  const balanceEntries = Object.entries(summary.balances || {});
  const debts = summary.debts || [];
  
  if (!summary.hasExpenses) {
    return <p className="text-muted">Todavía no hay saldos - registra el primer gasto para ver cuánto corresponde a cada persona</p>;
  }
  
  if (view === 'deudas' && summary.hadDebts && debts.length === 0) {
    return (
      <div className="settled-banner p-4 text-center rounded-4" role="status">
        <div className="display-6 mb-2" aria-hidden="true">✓</div>
        <h3 className="mb-2">Todas las cuentas están saldadas</h3>
        <p className="mb-0">¡Todo el mundo está al día!</p>
      </div>
    );
  }

  const orderedBalances = [...balanceEntries].sort(([, first], [, second]) => Math.abs(second) - Math.abs(first));

  return (
    <div className="mt-3">
      {message && <p className="text-success" role="status">{message}</p>}
      
      {view !== 'deudas' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Saldos del grupo</h4>
            <span className="text-muted small">Ordenados por impacto</span>
          </div>
          <div className="d-grid gap-2 mb-4">
            {orderedBalances.map(([member, balance]) => (
              <div key={member} className="balance-tile p-3 rounded-3">
                <button 
                  className="btn btn-link p-0 text-decoration-none d-flex justify-content-between align-items-center w-100" 
                  onClick={() => toggleBreakdown(member)}
                >
                  <span className="d-flex align-items-center gap-2">
                    <span className={`avatar ${balance < -0.005 ? 'avatar-muted' : ''}`}>{initials(member)}</span>
                    <span className="text-start">
                      <strong className="d-block">{member}</strong>
                      <small className="text-muted">
                        {balance < -0.005 ? `${member} debe` : balance > 0.005 ? `Le deben a ${member}` : 'Está a mano'}
                      </small>
                    </span>
                  </span>
                  <span className={`fw-bold ${balance < -0.005 ? 'amount-negative' : balance > 0.005 ? 'amount-positive' : 'amount-neutral'}`}>
                    {balance < -0.005 ? '-' : balance > 0.005 ? '+' : ''}${Math.abs(balance).toFixed(2)}
                  </span>
                </button>
                
                {expandedMember === member && (
                  <div className="mt-3 ps-3 border-start">
                    <strong className="small">Desglose de {member}</strong>
                    {breakdown[member]?.length ? (
                      <ul className="list-unstyled small mt-2 mb-0">
                        {breakdown[member].map((item) => (
                          <li key={item.expenseId} className="d-flex justify-content-between mb-1">
                            <span>{item.description} <span className="text-muted">({item.expenseDate || 'Hoy'})</span></span>
                            <span>${Number(item.amount).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted small mt-2 mb-0">No participaste en ningún gasto de este grupo todavía</p>
                    )}
                    {breakdown[member]?.length > 0 && (
                      <div className="border-top mt-2 pt-2 d-flex justify-content-between small fw-bold">
                        <span>Total verificado</span>
                        <span>${breakdown[member].reduce((sum, item) => sum + Number(item.amount), 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'deudas' && <h3 className="mb-3">TUS DEUDAS — VISTA PERSONAL</h3>}
      
      {view !== 'saldos' && (
        <>
          {debts.length === 0 ? (
            <p className="text-muted">No tienes deudas pendientes en este grupo</p>
          ) : (
            <div className="d-grid gap-3">
              {debts.map((debt) => (
                <article key={`${debt.debtor}-${debt.creditor}`} className="expense-tile">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <strong className="d-block">Debes a {debt.creditor}</strong>
                      <span className="status-pill status-pending d-inline-block mt-2">Pendiente</span>
                    </div>
                    <strong className="amount-negative text-nowrap">{formatAmount(debt.amount)}</strong>
                  </div>
                  <button className="btn btn-outline-primary btn-sm mt-3" onClick={() => setPaymentToConfirm(debt)}>
                    Marcar como pagado
                  </button>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {paymentToConfirm && (
        <div 
          className="payment-modal-backdrop" 
          role="presentation" 
          onMouseDown={(event) => { if (event.target === event.currentTarget) setPaymentToConfirm(null); }}
        >
          <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
            <h2 id="payment-title" className="h4">Confirmar pago</h2>
            <p>¿Confirmas que ya pagaste {formatAmount(paymentToConfirm.amount)} a {paymentToConfirm.creditor}? Esta acción no se puede deshacer.</p>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-light" onClick={() => setPaymentToConfirm(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => settleDebt(paymentToConfirm)}>Confirmar</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default GroupBalance;