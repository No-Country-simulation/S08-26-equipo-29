// "Pago iniciado" es un aviso solo de este dispositivo: el servidor únicamente conoce deudas pendientes y saldadas
const storageKey = (groupId) => `splitflow.startedPayments.${groupId}`;

export const getStartedPayments = (groupId) => {
    try {
        const debtIds = JSON.parse(localStorage.getItem(storageKey(groupId)) || '[]');
        return new Set(Array.isArray(debtIds) ? debtIds : []);
    } catch {
        return new Set();
    }
};

// El guardado local es solo un apoyo: si el navegador lo rechaza (cuota llena, modo privado) la app debe seguir funcionando
const saveStartedPayments = (groupId, debtIds) => {
    try {
        localStorage.setItem(storageKey(groupId), JSON.stringify([...debtIds]));
    } catch {
        // sin almacenamiento disponible
    }
};

export const markPaymentStarted = (groupId, debtId) => {
    saveStartedPayments(groupId, getStartedPayments(groupId).add(debtId));
};

export const clearStartedPayment = (groupId, debtId) => {
    const debtIds = getStartedPayments(groupId);
    debtIds.delete(debtId);
    saveStartedPayments(groupId, debtIds);
};

// Olvida los avisos de deudas que ya no existen para que no reaparezcan sobre una deuda nueva del mismo par
export const keepStartedPaymentsOf = (groupId, currentDebtIds) => {
    const stored = [...getStartedPayments(groupId)];
    const kept = stored.filter((debtId) => currentDebtIds.includes(debtId));
    if (kept.length !== stored.length) saveStartedPayments(groupId, new Set(kept));
};
