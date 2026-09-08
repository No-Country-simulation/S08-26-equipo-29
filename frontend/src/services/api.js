const API_URL = 'http://localhost:8080/api';

// Usuarios
export const getUsers = async () => {
    const response = await fetch(`${API_URL}/users`);
    return response.json();
};

export const createUser = async (userData) => {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return response.json();
};

// Gastos
export const getExpenses = async () => {
    const response = await fetch(`${API_URL}/expenses`);
    return response.json();
};

export const createExpense = async (expenseData) => {
    const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
    });
    return response.json();
};