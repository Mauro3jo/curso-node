import { randomUUID } from 'node:crypto';

export function attachChat(io) {
  const people = new Map(), history = new Map();
  const users = room => [...people.values()].filter(p => p.sala === room);
  const announce = room => io.to(`sala:${room}`).emit('usuarios', users(room));
  const valid = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
  io.on('connection', socket => {
    socket.on('entrar-chat', async (payload, ack) => {
      if (typeof ack !== 'function') return;
      if (people.has(socket.id)) return ack({ ok: false, msg: 'Ya ingresaste a una sala' });
      if (!valid(payload?.nombre, 80) || !valid(payload?.sala, 40)) return ack({ ok: false, msg: 'Nombre y sala son obligatorios' });
      const nombre = payload.nombre.trim(), sala = payload.sala.trim();
      if (users(sala).some(p => p.nombre.toLowerCase() === nombre.toLowerCase())) return ack({ ok: false, msg: 'Ese nombre ya está en la sala' });
      const person = { id: socket.id, nombre, sala };
      people.set(socket.id, person);
      await socket.join(`sala:${sala}`);
      socket.emit('historial', history.get(sala) || []);
      announce(sala);
      ack({ ok: true, usuario: person });
    });
    socket.on('enviar-mensaje', (payload, ack) => {
      if (typeof ack !== 'function') return;
      const person = people.get(socket.id);
      if (!person) return ack({ ok: false, msg: 'Ingresá a una sala antes de enviar mensajes' });
      if (!valid(payload?.mensaje, 1000)) return ack({ ok: false, msg: 'El mensaje debe tener de 1 a 1000 caracteres' });
      const message = { id: randomUUID(), de: person.id, nombre: person.nombre, mensaje: payload.mensaje.trim(), fecha: Date.now(), privado: !!payload.para };
      if (payload.para) {
        const target = people.get(payload.para);
        if (!target || target.sala !== person.sala) return ack({ ok: false, msg: 'El destinatario no está en tu sala' });
        io.to(target.id).emit('mensaje', message);
        if (target.id !== socket.id) socket.emit('mensaje', message);
      } else {
        history.set(person.sala, [...(history.get(person.sala) || []), message].slice(-10));
        io.to(`sala:${person.sala}`).emit('mensaje', message);
      }
      ack({ ok: true, mensaje: message });
    });
    socket.on('disconnect', () => {
      const person = people.get(socket.id);
      if (!person) return;
      people.delete(socket.id);
      if (!users(person.sala).length) history.delete(person.sala);
      announce(person.sala);
    });
  });
}
