import React, { useState, useEffect } from 'react';

const GroupBalance = ({ groupId }) => {
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consumimos el endpoint de balances que creamos en Spring Boot
    fetch(`http://localhost:8080/api/groups/${groupId}/balances`)
      .then((res) => res.json())
      .then((data) => {
        setBalances(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar los balances:', err);
        setLoading(false);
      });
  }, [groupId]);

  if (loading) return <p>Calculando saldos y deudas...</p>;

  return (
    <div className="container mt-4">
      <h3>Resumen de Saldos del Grupo</h3>
      <ul className="list-group mt-3">
        {Object.keys(balances).length === 0 ? (
          <li className="list-group-item">No hay gastos registrados todavía.</li>
        ) : (
          Object.entries(balances).map(([concept, total]) => (
            <li key={concept} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{concept}</span>
              <span className="badge bg-primary rounded-pill">${total}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default GroupBalance;