# Chat por salas

Chat local con lista de participantes, mensajes públicos, privados y los últimos diez mensajes públicos de cada sala. El servidor asigna la identidad del mensaje y rechaza destinatarios de otra sala.

Ejecutá `npm run chat` desde la raíz y abrí `http://127.0.0.1:3003` en varias pestañas. Elegí nombres diferentes para entrar a una misma sala. El modo por nombre es una demostración sin autenticación; no prueba quién es una persona.

Referencia: `socket-chat-1.0.0.zip` de Fernando Herrera. Se reconstruye la interfaz sin copiar las plantillas o librerías compiladas del material.

## Chat autenticado

Ejecutá `npm run rest -- --demo` y abrí `http://127.0.0.1:3001/chat/`. Registrá usuarios distintos, iniciá sesión y elegí una sala. En este modo la identidad viene de MongoDB y el JWT se valida al conectar y al enviar mensajes. Los tokens se mantienen en memoria del navegador.

Este segundo modo corresponde a `curso-node-socket-chat-main.zip`; comparte registro y login con la API. El historial de diez mensajes y los participantes son temporales, como en el ejemplo original. La revisión visual en navegador sigue pendiente por la restricción de Computer Use.
