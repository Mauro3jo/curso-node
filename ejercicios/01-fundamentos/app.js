const saludar = nombre => `Saludos ${nombre}`;
console.log('Hola Mundo');
console.log(saludar('Mauro'));
console.log('Inicio de programa');
setTimeout(() => console.log('Primer Timeout'), 30);
setTimeout(() => console.log('Segundo Timeout'), 0);
setTimeout(() => console.log('Tercer Timeout'), 0);
console.log('Fin de programa');
