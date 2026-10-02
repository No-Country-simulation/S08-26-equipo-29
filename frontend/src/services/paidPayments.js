const DATABASE_NAME = 'splitflow-payment-history';
const STORE_NAME = 'payments';
const DATABASE_VERSION = 1;

const openDatabase = () => new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
        reject(new Error('Este navegador no permite guardar el historial de pagos.'));
        return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { keyPath: 'storageId' });
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir el historial de pagos.'));
});

const runStoreRequest = async (mode, createRequest) => {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = createRequest(transaction.objectStore(STORE_NAME));
        let result;

        request.onsuccess = () => { result = request.result; };
        request.onerror = () => reject(request.error || new Error('No se pudo guardar el historial de pagos.'));
        transaction.oncomplete = () => {
            database.close();
            resolve(result);
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error || new Error('No se pudo guardar el historial de pagos.'));
        };
        transaction.onabort = () => {
            database.close();
            reject(transaction.error || new Error('No se pudo guardar el historial de pagos.'));
        };
    });
};

export const getPaidPayments = async (groupId) => {
    const payments = await runStoreRequest('readonly', (store) => store.getAll());
    return payments.filter((payment) => String(payment.groupId) === String(groupId));
};

export const savePaidPayment = async (groupId, payment) => {
    const storedPayment = {
        ...payment,
        groupId: String(groupId),
        storageId: `${groupId}:${payment.id}`,
    };
    await runStoreRequest('readwrite', (store) => store.put(storedPayment));
    return storedPayment;
};

export const removePaidPayment = (groupId, paymentId) => runStoreRequest(
    'readwrite',
    (store) => store.delete(`${groupId}:${paymentId}`),
);