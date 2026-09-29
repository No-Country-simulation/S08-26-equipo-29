// Indica si el texto quedó copiado: sin HTTPS o sin permiso del navegador el portapapeles no está disponible
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
