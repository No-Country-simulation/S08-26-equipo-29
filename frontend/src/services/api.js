const API_URL = 'http://localhost:8080/api';

const parseResponse = async (response) => {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(typeof body === 'string' ? body : `La solicitud fallo (${response.status})`);
    }
    return body;
};

// Grupos
export const getGroups = async () => {
    const response = await fetch(`${API_URL}/groups`);
    return parseResponse(response);
};

export const createGroup = async (groupData) => {
    const response = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
    });
    return parseResponse(response);
};

export const getGroupByInviteCode = async (inviteCode) => {
    const response = await fetch(`${API_URL}/groups/invite/${inviteCode}`);
    return parseResponse(response);
};

export const getGroupMembers = async (groupId) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/members`);
    return parseResponse(response);
};

export const joinGroup = async (groupId, memberData) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
    });
    return parseResponse(response);
};

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
export const getExpenses = async (groupId) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/expenses`);
    return parseResponse(response);
};

export const createExpense = async (groupId, expenseData) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
    });
    return parseResponse(response);
};

export const getGroupBalances = async (groupId) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/balances`);
    return parseResponse(response);
};

export const getBalanceBreakdown = async (groupId, member) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/balances/${encodeURIComponent(member)}/breakdown`);
    return parseResponse(response);
};

export const settlePayment = async (groupId, debt) => {
    const response = await fetch(`${API_URL}/groups/${groupId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debt),
    });
    return parseResponse(response);
};