import { randomUUID } from 'node:crypto';
import { readJson, writeJson } from '../../lib/json-file.js';

export class Tasks {
  #file;
  #tasks;
  constructor(file) {
    this.#file = file;
    this.#tasks = readJson(file, []);
    if (!Array.isArray(this.#tasks) || !this.#tasks.every(t => t && typeof t.id === 'string' && typeof t.desc === 'string' && (t.completadoEn === null || typeof t.completadoEn === 'string'))) {
      throw new Error('El archivo de tareas tiene un formato inválido');
    }
  }
  #save(next) { writeJson(this.#file, next); this.#tasks = next; }
  list(filter = 'todas') {
    if (!['todas', 'completadas', 'pendientes'].includes(filter)) throw new Error('Filtro inválido');
    return structuredClone(this.#tasks.filter(t => filter === 'todas' || (filter === 'completadas' ? !!t.completadoEn : !t.completadoEn)));
  }
  add(desc) {
    if (typeof desc !== 'string' || !desc.trim() || desc.trim().length > 500) throw new Error('La descripción debe tener de 1 a 500 caracteres');
    const task = { id: randomUUID(), desc: desc.trim(), completadoEn: null };
    this.#save([...this.#tasks, task]);
    return { ...task };
  }
  complete(ids) {
    if (!Array.isArray(ids) || ids.some(id => !this.#tasks.some(t => t.id === id))) throw new Error('La tarea no existe');
    this.#save(this.#tasks.map(t => ({ ...t, completadoEn: ids.includes(t.id) ? t.completadoEn || new Date().toISOString() : null })));
  }
  remove(id) {
    if (!this.#tasks.some(t => t.id === id)) throw new Error('La tarea no existe');
    this.#save(this.#tasks.filter(t => t.id !== id));
  }
}
