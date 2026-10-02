const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`;

const request = async (url, options) => {
    try {
        return await fetch(url, options);
    } catch {
        throw new Error(
            'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.'
        );
    }
};

const parseResponse = async (response) => {
    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = typeof body === 'string' ? body : body?.message;
        const error = new Error(
            message || `La solicitud falló (${response.status})`
        );
        error.status = response.status;
        throw error;
    }

    return body;
};

// Grupos
export const getGroups = async (deviceId) => {
    const response = await request(
        `${API_URL}/groups?deviceId=${encodeURIComponent(deviceId)}`
    );
    return parseResponse(response);
};

export const createGroup = async (groupData) => {
    const response = await request(`${API_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
    });
    return parseResponse(response);
};

export const getGroupByInviteCode = async (inviteCode) => {
    const response = await request(
        `${API_URL}/groups/invite/${encodeURIComponent(inviteCode)}`
    );
    return parseResponse(response);
};

export const getGroupMembers = async (groupId) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/members`
    );
    return parseResponse(response);
};

export const joinGroup = async (groupId, memberData) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/members`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData),
        }
    );
    return parseResponse(response);
};

export const removeMember = async (groupId, memberId) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/members/${memberId}`,
        {
            method: 'DELETE',
        }
    );

    if (response.status === 204) {
        return true;
    }

    return parseResponse(response);
};

// Usuarios
export const getUsers = async () => {
    const response = await request(`${API_URL}/users`);
    return parseResponse(response);
};

export const createUser = async (userData) => {
    const response = await request(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return parseResponse(response);
};

// Gastos
export const getExpenses = async (groupId) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/expenses`
    );
    return parseResponse(response);
};

export const createExpense = async (groupId, expenseData) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/expenses`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenseData),
        }
    );
    return parseResponse(response);
};

// Balances
export const getGroupBalances = async (groupId) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/balances`
    );
    return parseResponse(response);
};

export const getBalanceBreakdown = async (groupId, member) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/balances/${encodeURIComponent(member)}/breakdown`
    );
    return parseResponse(response);
};

// Pagos
export const settlePayment = async (
    groupId,
    { debtor, creditor, amount }
) => {
    const response = await request(
        `${API_URL}/groups/${groupId}/payments`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                debtor,
                creditor,
                amount,
            }),
        }
    );
    return parseResponse(response);
};