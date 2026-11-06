# Tareas de consola

Crear, listar, completar, reabrir y borrar tareas desde un menú. Guarda el estado en `data/tasks.json`, sin base de datos externa.

Desde la raíz: `npm run tareas`. La opción 5 recibe los IDs de todas las tareas que querés dejar completadas; las demás vuelven a pendientes. El borrado pide confirmación.

Referencia: `node-console-app-todo-0.5.0` de Fernando Herrera. Se usan `readline` y UUID nativos de Node en lugar de las dependencias antiguas del ejemplo.
