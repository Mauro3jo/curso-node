const $ = id => document.getElementById(id);
const socket = io({ autoConnect: false });
let joined = false, busy = false, joinData;
let authenticated = false;
$('join').hidden = true;
fetch('config').then(response => response.json()).then(config => {
  authenticated = config.authenticated;
  $('account').hidden = !authenticated;
  $('join').hidden = authenticated;
  $('name-label').hidden = authenticated;
  $('name').required = !authenticated;
  $('status').textContent = authenticated ? 'Iniciá sesión o creá una cuenta.' : 'Elegí tu nombre y una sala.';
}).catch(() => { $('status').textContent = 'No se pudo cargar la configuración.'; });
async function login(register = false) {
  const credentials = { correo: $('email').value, password: $('password').value };
  try {
    if (register) {
      const created = await fetch('/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...credentials, nombre: $('account-name').value }) });
      if (!created.ok) throw new Error((await created.json()).msg);
    }
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.msg);
    socket.auth = { token: result.token };
    $('password').value = '';
    $('account').hidden = true; $('join').hidden = false;
    $('status').textContent = `Sesión de ${result.usuario.nombre}. Elegí una sala.`;
  } catch (error) { $('status').textContent = error.message; }
}
$('account').addEventListener('submit', event => { event.preventDefault(); login(); });
$('register').addEventListener('click', () => login(true));
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
  if ((authenticated || joinData.nombre) && joinData.sala) socket.connect();
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
