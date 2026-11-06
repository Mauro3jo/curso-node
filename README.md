# Turnos

Gestor de turnos con Node.js, Express y Socket.IO. Permite sacar un número, atenderlo desde un escritorio y mostrar los últimos cuatro llamados en una pantalla pública. Los cambios se actualizan en todas las pestañas conectadas.

## Ejecutar

Requiere Node.js 22 o superior y npm.

```sh
npm ci
npm start
```

Abrí [localhost:3000](http://127.0.0.1:3000). Desde el inicio podés entrar a **Sacar turno**, **Escritorio** o **Pantalla pública**. Para probarlo, abrí las tres opciones en pestañas distintas, generá algunos números e ingresá un nombre de escritorio para atenderlos.

Los turnos se guardan en `data/queue.json` y se recuperan al reiniciar. La numeración se reinicia al cambiar el día, según la hora local del servidor. `PORT` permite cambiar el puerto y `DATA_FILE`, la ubicación del archivo. No necesita claves ni un archivo `.env`.

## Pruebas

```sh
npm test
npm run check
```

Las pruebas cubren persistencia, orden de atención, cambio de fecha, entradas inválidas y comunicación entre clientes Socket.IO.

Pensado para ejecutarse localmente en una sola instancia. Escucha en `127.0.0.1` y no incluye autenticación. Para usarlo en una red compartida hace falta agregar control de acceso y una base de datos compartida si se ejecutan varias instancias.

Referencia: ejercicio de colas con Socket.IO de Fernando Herrera ([Klerith](https://github.com/Klerith)). Esta implementación se reconstruyó a partir de los materiales disponibles; no es una recuperación del código original.
