import { fileURLToPath } from 'node:url';
import { Tasks } from './tasks.js';
import { consoleInput } from '../../lib/console.js';

const input = consoleInput();
try {
  const tasks = new Tasks(process.env.TASKS_FILE || fileURLToPath(new URL('../../data/tasks.json', import.meta.url)));
  while (true) {
    console.log('\n1 Crear tarea\n2 Listar todas\n3 Completadas\n4 Pendientes\n5 Seleccionar completadas\n6 Borrar tarea\n0 Salir');
    const option = await input.ask('Opción: ');
    if (option === null || option === '0') break;
    try {
      if (option === '1') {
        const desc = await input.ask('Descripción: ');
        if (desc === null) break;
        tasks.add(desc);
      } else if (['2', '3', '4'].includes(option)) {
        for (const task of tasks.list({ 2: 'todas', 3: 'completadas', 4: 'pendientes' }[option])) {
          console.log(`${task.id} | ${task.desc} | ${task.completadoEn || 'Pendiente'}`);
        }
      } else if (option === '5') {
        tasks.list().forEach(t => console.log(`${t.id} | ${t.desc} | ${t.completadoEn ? 'Completada' : 'Pendiente'}`));
        const answer = await input.ask('IDs completados separados por coma (vacío: todas pendientes): ');
        if (answer === null) break;
        tasks.complete(answer ? answer.split(',').map(x => x.trim()) : []);
      } else if (option === '6') {
        tasks.list().forEach(t => console.log(`${t.id} | ${t.desc}`));
        const id = await input.ask('ID a borrar (vacío: cancelar): ');
        if (id && (await input.ask('¿Confirmás? Escribí si: ')) === 'si') tasks.remove(id);
      } else console.log('Opción inválida.');
    } catch (error) { console.error(error.message); }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { input.close(); }
