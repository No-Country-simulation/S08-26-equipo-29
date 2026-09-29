const STORAGE_KEY = 'splitflow.groups';

const sameId = (first, second) => String(first) === String(second);

// Solo se conserva lo que Home y el detalle necesitan: versiones anteriores guardaban el grupo completo, con los miembros
const toPublicGroup = ({ id, name, currency, inviteCode, aliases, ownerId }) => ({ id, name, currency, inviteCode, aliases, ownerId });

export const getStoredGroups = () => {
    try {
        const groups = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(groups) ? groups.filter((group) => group && typeof group === 'object').map(toPublicGroup) : [];
    } catch {
        return [];
    }
};

// El guardado local es solo un apoyo: si el navegador lo rechaza (cuota llena, modo privado) la app debe seguir funcionando
export const saveStoredGroups = (groups) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch {
        // sin almacenamiento disponible
    }
};

export const clearStoredGroups = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // sin almacenamiento disponible
    }
};

export const findStoredGroup = (groupId) => getStoredGroups().find((group) => sameId(group.id, groupId));

export const upsertStoredGroup = (group) => {
    const groups = getStoredGroups();
    const alreadyStored = groups.some((stored) => sameId(stored.id, group.id));
    saveStoredGroups(alreadyStored
        ? groups.map((stored) => (sameId(stored.id, group.id) ? { ...stored, ...group } : stored))
        : [...groups, group]);
};
