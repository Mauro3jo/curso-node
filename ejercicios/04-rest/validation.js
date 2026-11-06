export function fail(status, message) { throw Object.assign(new Error(message), { status }); }
export function text(value, name, max = 100) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(400, `${name} debe tener de 1 a ${max} caracteres`);
  return value.trim();
}
export function email(value) {
  const result = text(value, 'Correo', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail(400, 'Correo inválido');
  return result;
}
export function password(value) {
  if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value, 'utf8') > 72) fail(400, 'La contraseña debe tener al menos 8 caracteres y como máximo 72 bytes');
  return value;
}
export function id(value) {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) fail(400, 'ID inválido');
  return value;
}
