// Centavos de un monto escrito como texto ("10.005" -> 1001). Se escala el texto y no el número para evitar el error
// binario de multiplicar por 100 (1.005 * 100 = 100.49999999999999) y coincidir con el redondeo del servidor
export const toCents = (value) => {
  const number = parseFloat(value);
  if (!Number.isFinite(number)) return 0;
  const cents = Math.round(Number(`${number}e2`));
  return Number.isFinite(cents) ? cents : Math.round(number * 100);
};

export const formatCurrency = (amount) => `$${Number(amount).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
