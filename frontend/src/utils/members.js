export const YOU_LABEL = 'Tú';
const ORGANIZER_LABEL = 'Organizador';
const DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Nombres que la interfaz usa para identificar personas: un miembro con ese nombre se vería igual que otro distinto
const withoutAccents = (name) => name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const isReservedName = (name) => [YOU_LABEL, ORGANIZER_LABEL].some((reserved) => withoutAccents(reserved) === withoutAccents(String(name)));

// El creador del grupo entra con el identificador de su dispositivo como alias: nunca debe mostrarse tal cual
export const memberLabel = (alias, myAlias) => {
  if (alias === myAlias) return YOU_LABEL;
  return DEVICE_ID_PATTERN.test(alias) ? ORGANIZER_LABEL : alias;
};
