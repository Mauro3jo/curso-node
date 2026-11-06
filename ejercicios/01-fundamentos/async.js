import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const employees = [{ id: 1, nombre: 'Mauro' }, { id: 2, nombre: 'Ana' }];
const salaries = [{ id: 1, salario: 1000 }, { id: 2, salario: 1500 }];

export function employeeCallback(id, callback) {
  setImmediate(() => {
    const employee = employees.find(value => value.id === id);
    callback(employee ? null : new Error('El empleado no existe'), employee && { ...employee });
  });
}
export function getEmployee(id) {
  return new Promise((resolveEmployee, reject) => employeeCallback(id, (error, employee) => error ? reject(error) : resolveEmployee(employee)));
}
export async function getSalary(id) {
  const salary = salaries.find(value => value.id === id);
  if (!salary) throw new Error('El salario no existe');
  return salary.salario;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { id, nombre } = await getEmployee(1);
  console.log(`${nombre}: salario de ejemplo ${await getSalary(id)}`);
  try { await getEmployee(99); } catch (error) { console.log(error.message); }
}
