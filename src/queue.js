import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class Queue {
  #state;
  #file;
  #clock;

  constructor(file, clock = () => new Date()) {
    this.#file = file;
    this.#clock = clock;
    this.#state = this.#empty();
    try {
      const saved = JSON.parse(readFileSync(file, 'utf8'));
      const validTicket = t => t && Number.isSafeInteger(t.numero) && t.numero > 0 && t.numero <= saved.ultimo;
      if (typeof saved.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(saved.fecha) ||
          !Number.isSafeInteger(saved.ultimo) || saved.ultimo < 0 ||
          !Array.isArray(saved.tickets) || !saved.tickets.every(t => validTicket(t) && t.escritorio === null) ||
          !Array.isArray(saved.ultimos4) || saved.ultimos4.length > 4 ||
          !saved.ultimos4.every(t => validTicket(t) && typeof t.escritorio === 'string' && t.escritorio.trim().length > 0 && t.escritorio.length <= 40)) {
        throw new Error('El archivo de turnos tiene un formato inválido');
      }
      this.#state = saved;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    this.#refresh();
  }

  #date() {
    const now = this.#clock();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  #empty() { return { fecha: this.#date(), ultimo: 0, tickets: [], ultimos4: [] }; }

  #save(next) {
    // ponytail: guardado síncrono para una sola instancia local; usar una BD al escalar.
    mkdirSync(dirname(this.#file), { recursive: true });
    writeFileSync(`${this.#file}.tmp`, JSON.stringify(next), { mode: 0o600 });
    renameSync(`${this.#file}.tmp`, this.#file);
    this.#state = next;
  }

  #refresh() {
    if (this.#state.fecha !== this.#date()) this.#save(this.#empty());
  }

  snapshot() {
    this.#refresh();
    const { ultimo, tickets, ultimos4 } = this.#state;
    return { ultimo, pendientes: tickets.length, ultimos4: structuredClone(ultimos4) };
  }

  next() {
    this.#refresh();
    const next = structuredClone(this.#state);
    const ticket = { numero: next.ultimo + 1, escritorio: null };
    if (!Number.isSafeInteger(ticket.numero)) throw new Error('Se alcanzó el límite de turnos');
    next.ultimo = ticket.numero;
    next.tickets.push(ticket);
    this.#save(next);
    return { ...ticket };
  }

  attend(desk) {
    if (typeof desk !== 'string' || !desk.trim() || desk.trim().length > 40) {
      throw new Error('El escritorio debe tener entre 1 y 40 caracteres');
    }
    this.#refresh();
    const next = structuredClone(this.#state);
    const ticket = next.tickets.shift();
    if (!ticket) return null;
    ticket.escritorio = desk.trim();
    next.ultimos4 = [ticket, ...next.ultimos4].slice(0, 4);
    this.#save(next);
    return { ...ticket };
  }
}
