export function table(base, until = 10) {
  if (!Number.isInteger(base) || base < 1 || base > 1000 || !Number.isInteger(until) || until < 1 || until > 1000) throw new Error('Base y hasta deben ser enteros entre 1 y 1000');
  return Array.from({ length: until }, (_, i) => `${base} x ${i + 1} = ${base * (i + 1)}`).join('\n') + '\n';
}
