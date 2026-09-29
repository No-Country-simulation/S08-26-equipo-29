// Acepta el código suelto o el enlace completo de invitación y lo deja en el formato del servidor (mayúsculas)
export const parseInviteCode = (input) => {
  let path = String(input ?? '').trim();
  try {
    path = new URL(path).pathname;
  } catch {
    // no es un enlace: se usa el texto tal cual
  }
  return (path.split('/').filter(Boolean).pop() ?? '').replace(/\s+/g, '').toUpperCase();
};
