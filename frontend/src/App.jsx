import React, { useState, useEffect } from 'react';
import { getUsers, createUser, getExpenses, createExpense } from './services/api';

function App() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Formulario de Usuario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Formulario de Gasto
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
      const expensesData = await getExpenses();
      setExpenses(expensesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    await createUser({ username, email, password: '123' });
    setUsername('');
    setEmail('');
    loadData();
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    await createExpense({ description, amount: parseFloat(amount), paidBy });
    setDescription('');
    setAmount('');
    setPaidBy('');
    loadData();
  };

  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-primary mb-4 text-center">SplitFlow - Gestión de Gastos 💸</h1>

      <div className="row">
        {/* Columna Izquierda: Usuarios */}
        <div className="col-md-6">
          <div className="card p-4 mb-4 shadow-sm">
            <h3>Registrar Participante</h3>
            <form onSubmit={handleUserSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-success w-100">Guardar Usuario</button>
            </form>
          </div>

          <div className="card p-4 shadow-sm">
            <h3>Participantes Registrados</h3>
            <ul className="list-group mt-3">
              {users.map((u) => (
                <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {u.username} <span className="text-muted">{u.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Columna Derecha: Gastos */}
        <div className="col-md-6">
          <div className="card p-4 mb-4 shadow-sm">
            <h3>Registrar un Gasto</h3>
            <form onSubmit={handleExpenseSubmit}>
              <div className="mb-3">
                <label className="form-label">Descripción (ej. Cena, Supermercado)</label>
                <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Importe ($)</label>
                <input type="number" step="0.01" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">¿Quién pagó?</label>
                <select className="form-select" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
                  <option value="">Seleccionar participante...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.username}>{u.username}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">Registrar Gasto</button>
            </form>
          </div>

          <div className="card p-4 shadow-sm">
            <h3>Gastos Registrados</h3>
            <ul className="list-group mt-3">
              {expenses.map((ex) => (
                <li key={ex.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{ex.description}</strong> <br />
                    <small className="text-muted">Pagado por: {ex.paidBy}</small>
                  </div>
                  <span className="badge bg-danger fs-6">${ex.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;