import React, { useEffect, useRef, useState } from 'react';
import { getBalanceBreakdown, getGroupBalances } from '../services/api';
import Button from './Button';
import Avatar from './Avatar';
import SinSaldos from '../public/sinSaldos.svg';
import { formatCurrency } from '../utils/format';
import { memberLabel } from '../utils/members';

const SKELETON_ROW_WIDTHS = [72, 55, 64, 48];
const SKELETON_SHOW_DELAY = 200;
const SLOW_LOAD_HINT_DELAY = 5000;

const balanceCaption = (name, isMe, balance) => {
  if (balance < -0.005) return isMe ? 'Debes' : `${name} debe`;
  if (balance > 0.005) return isMe ? 'Te deben' : `Le deben a ${name}`;
  return isMe ? 'Estás a mano' : 'Está a mano';
};

const GroupBalance = ({ groupId, refreshKey = 0, myAlias, onRegisterExpense }) => {
  const [summary, setSummary] = useState({ balances: {}, debts: [] });
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);
  const [expandedMember, setExpandedMember] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [breakdownError, setBreakdownError] = useState('');
  const [loadError, setLoadError] = useState('');
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const loadBalances = () => {
    setLoading(true);
    setLoadError('');
    setShowSkeleton(false);
    setSlowLoad(false);
    clearTimers();
    timersRef.current = [
      setTimeout(() => setShowSkeleton(true), SKELETON_SHOW_DELAY),
      setTimeout(() => setSlowLoad(true), SLOW_LOAD_HINT_DELAY),
    ];

    getGroupBalances(groupId)
      .then((data) => setSummary(data))
      .catch((err) => {
        console.error('Error al cargar los balances:', err);
        setLoadError(err.message || 'No pudimos cargar los saldos.');
      })
      .finally(() => {
        clearTimers();
        setLoading(false);
        setShowSkeleton(false);
        setSlowLoad(false);
      });
  };

  useEffect(() => {
    loadBalances();
    return clearTimers;
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
      setBreakdownError('');
    } catch {
      setBreakdownError('No pudimos cargar el desglose de este saldo.');
    }
  };

  if (loading) {
    if (!showSkeleton) return null;
    return (
      <div className="balances-skeleton" aria-busy="true" aria-live="polite">
        {SKELETON_ROW_WIDTHS.map((width, row) => (
          <div key={row} className="balances-skeleton__row">
            <span className="balances-skeleton__row-start">
              <span className="balances-skeleton__pulse balances-skeleton__avatar" />
              <span className="balances-skeleton__pulse balances-skeleton__name-line" style={{ width: `${width}%` }} />
            </span>
            <span className="balances-skeleton__pulse balances-skeleton__amount-line" />
          </div>
        ))}
        <p className="balances-skeleton__caption">
          {slowLoad ? 'Esto está tardando más de lo esperado…' : 'Cargando saldos...'}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mt-3">
        <p className="text-danger" role="alert">{loadError}</p>
        <Button variant="secondary" size="small" onClick={loadBalances}>Reintentar</Button>
      </div>
    );
  }

  const balanceEntries = Object.entries(summary.balances || {});

  if (!summary.hasExpenses) {
    return (
      <div className="balances-empty text-center" role="status">
        <img src={SinSaldos} alt="Ilustración de saldos" className="mb-3" />
        <h3 className="mb-2">Todavía no hay saldos</h3>
        <p className="text-muted mb-4">Registra el primer gasto para ver cuánto corresponde a cada persona.</p>
        {onRegisterExpense && (
          <Button variant="primary" onClick={onRegisterExpense}>+ Registrar gasto</Button>
        )}
      </div>
    );
  }

  const orderedBalances = [...balanceEntries].sort(([, first], [, second]) => Math.abs(second) - Math.abs(first));
  const allSettled = summary.hadDebts && (summary.debts || []).length === 0;

  return (
    <div className="mt-3">
      {breakdownError && <p className="text-danger" role="alert">{breakdownError}</p>}

      {allSettled && (
        <div className="settled-banner p-4 text-center rounded-4 mb-4" role="status">
          <div className="display-6 mb-2" aria-hidden="true">✓</div>
          <h3 className="mb-2">Todas las cuentas están saldadas</h3>
          <p className="mb-0">¡Todo el mundo está al día!</p>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center direction-column mb-3">
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
                <Avatar name={memberLabel(member, myAlias)} size="small" className="sf-balance-avatar" />
                <span className="text-start">
                  <strong className="d-block">{memberLabel(member, myAlias)}</strong>
                  <small className="text-muted">
                    {balanceCaption(memberLabel(member, myAlias), member === myAlias, balance)}
                  </small>
                </span>
              </span>
              <span className={`fw-bold ${balance < -0.005 ? 'amount-negative' : balance > 0.005 ? 'amount-positive' : 'amount-neutral'}`}>
                {balance < -0.005 ? '-' : balance > 0.005 ? '+' : ''}{formatCurrency(Math.abs(balance))}
              </span>
            </button>

            {expandedMember === member && (
              <div className="mt-3 ps-3 border-start">
                <strong className="small">Desglose de {memberLabel(member, myAlias)}</strong>
                {breakdown[member]?.length ? (
                  <ul className="list-unstyled small mt-2 mb-0">
                    {breakdown[member].map((item) => (
                      <li key={item.expenseId} className="d-flex justify-content-between mb-1">
                        <span>{item.description} <span className="text-muted">({item.expenseDate || 'Hoy'})</span></span>
                        <span>{formatCurrency(item.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted small mt-2 mb-0">{member === myAlias ? 'No participaste' : `${memberLabel(member, myAlias)} no participó`} en ningún gasto de este grupo todavía</p>
                )}
                {breakdown[member]?.length > 0 && (
                  <div className="border-top mt-2 pt-2 d-flex justify-content-between small fw-bold">
                    <span>Total verificado</span>
                    <span>{formatCurrency(breakdown[member].reduce((sum, item) => sum + Number(item.amount), 0))}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupBalance;
