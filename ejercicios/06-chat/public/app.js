const $ = id => document.getElementById(id);
const socket = io({ autoConnect: false });
let joined = false, busy = false, joinData;
function controls() { document.querySelector('#send button').disabled = !joined || !socket.connected || busy; }
function showMessage(message) {
  const row = document.createElement('li');
  row.textContent = `${new Date(message.fecha).toLocaleTimeString()} · ${message.nombre}${message.privado ? ' (privado)' : ''}: ${message.mensaje}`;
  $('messages').append(row);
  while ($('messages').children.length > 100) $('messages').firstChild.remove();
  row.scrollIntoView({ block: 'nearest' });
}
socket.on('connect', async () => {
  try {
    const reply = await socket.timeout(5000).emitWithAck('entrar-chat', joinData);
    joined = reply.ok;
    $('status').textContent = reply.ok ? 'Conectado' : reply.msg;
    $('join').hidden = joined;
    $('conversation').hidden = !joined;
    $('room-title').textContent = joinData.sala;
    if (!joined) socket.disconnect();
  } catch { $('status').textContent = 'No se pudo ingresar a la sala.'; socket.disconnect(); }
  controls();
});
socket.on('disconnect', () => { joined = false; $('status').textContent = 'Sin conexión'; controls(); });
socket.on('connect_error', () => { $('status').textContent = 'No se pudo conectar'; controls(); });
socket.on('historial', messages => { $('messages').replaceChildren(); messages.forEach(showMessage); });
socket.on('mensaje', showMessage);
socket.on('usuarios', people => {
  const previous = $('recipient').value;
  $('recipient').replaceChildren(new Option('Toda la sala', ''));
  people.filter(p => p.id !== socket.id).forEach(p => $('recipient').append(new Option(p.nombre, p.id)));
  if ([...$('recipient').options].some(x => x.value === previous)) $('recipient').value = previous;
});
$('join').addEventListener('submit', event => {
  event.preventDefault();
  joinData = { nombre: $('name').value.trim(), sala: $('room').value.trim() };
  if (joinData.nombre && joinData.sala) socket.connect();
});
$('send').addEventListener('submit', async event => {
  event.preventDefault();
  if (!joined || busy || !socket.connected) return;
  busy = true; controls();
  try {
    const reply = await socket.timeout(5000).emitWithAck('enviar-mensaje', { mensaje: $('message').value, para: $('recipient').value });
    if (reply.ok) $('message').value = ''; else $('status').textContent = reply.msg;
  } catch { $('status').textContent = 'No llegó la confirmación. Revisá los mensajes antes de repetir.'; }
  finally { busy = false; controls(); }
});
