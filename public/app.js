const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const views = { emitir: 'issue', escritorio: 'desk', pantalla: 'display' };
const view = views[params.get('vista')] || 'home';
for (const id of ['home', 'issue', 'desk', 'display']) $(id).hidden = id !== view;

let desk = params.get('escritorio')?.trim() || '';
let state = { ultimo: 0, pendientes: 0, ultimos4: [] };
let busy = false;
const socket = io();

function controls() {
  $('next').disabled = busy || !socket.connected;
  $('attend').disabled = busy || !socket.connected || !desk || state.pendientes === 0;
}

function selectDesk() {
  $('desk-form').hidden = !!desk;
  $('desk-active').hidden = !desk;
  $('desk-label').textContent = desk;
  controls();
}

socket.on('connect', () => {
  $('connection').textContent = 'Conectado';
  controls();
});
socket.on('disconnect', () => {
  $('connection').textContent = 'Sin conexión. Reconectando…';
  controls();
});
socket.on('connect_error', () => {
  $('connection').textContent = 'No se pudo conectar al servidor';
  controls();
});
socket.on('estado-actual', next => {
  state = next;
  $('last').textContent = state.ultimo;
  $('pending').textContent = state.pendientes;
  const current = state.ultimos4.find(ticket => ticket.escritorio === desk);
  if (current) $('attending').textContent = `N.º ${current.numero}`;
  else if (state.ultimo === 0) $('attending').textContent = '—';
  const calls = $('calls');
  calls.replaceChildren();
  for (const ticket of state.ultimos4) {
    const card = document.createElement('article');
    card.className = 'card';
    const number = document.createElement('strong');
    number.className = 'call-number';
    number.textContent = `N.º ${ticket.numero}`;
    const label = document.createElement('p');
    label.textContent = ticket.escritorio;
    card.append(number, label);
    calls.append(card);
  }
  if (!state.ultimos4.length) calls.textContent = 'Todavía no hay llamados.';
  controls();
});

async function command(event, payload) {
  if (busy || !socket.connected) return;
  busy = true;
  controls();
  $('message').textContent = '';
  try {
    const reply = payload === undefined
      ? await socket.timeout(5000).emitWithAck(event)
      : await socket.timeout(5000).emitWithAck(event, payload);
    if (!reply.ok) $('message').textContent = reply.msg;
    else if (event === 'siguiente-ticket') $('issued').textContent = `N.º ${reply.ticket.numero}`;
    else $('message').textContent = `Llamando al turno ${reply.ticket.numero}.`;
  } catch {
    $('message').textContent = 'No llegó la confirmación. Revisá el estado antes de repetir la operación.';
    if (socket.connected) socket.emit('consultar-estado');
  } finally {
    busy = false;
    controls();
  }
}

$('next').addEventListener('click', () => command('siguiente-ticket'));
$('attend').addEventListener('click', () => command('atender-ticket', { escritorio: desk }));
$('desk-form').addEventListener('submit', event => {
  event.preventDefault();
  desk = $('desk-name').value.trim();
  if (!desk || desk.length > 40) { desk = ''; return; }
  params.set('escritorio', desk);
  history.replaceState(null, '', `/?${params}`);
  selectDesk();
  socket.emit('consultar-estado');
});
if (desk.length > 40) desk = '';
selectDesk();
