const socket = io();
const status = document.getElementById('status');
const button = document.querySelector('button');
socket.on('connect', () => { status.textContent = 'Conectado'; button.disabled = false; });
socket.on('disconnect', () => { status.textContent = 'Sin conexión'; button.disabled = true; });
socket.on('enviar-mensaje', message => {
  const row = document.createElement('li'); row.textContent = message.mensaje;
  document.getElementById('messages').prepend(row);
});
document.querySelector('form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!socket.connected || button.disabled) return;
  const input = document.getElementById('message');
  button.disabled = true;
  try {
    const reply = await socket.timeout(5000).emitWithAck('enviar-mensaje', { mensaje: input.value });
    if (reply.ok) input.value = ''; else status.textContent = reply.msg;
  } catch { status.textContent = 'No llegó la confirmación.'; }
  finally { button.disabled = !socket.connected; }
});
