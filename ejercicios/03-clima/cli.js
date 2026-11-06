import { fileURLToPath } from 'node:url';
import { consoleInput } from '../../lib/console.js';
import { Weather } from './weather.js';
import '../../lib/env.js';

const input = consoleInput();
try {
  const demo = process.argv.includes('--demo');
  if (demo) console.log('DEMOSTRACIÓN: datos ficticios, sin consultas externas.');
  const weather = new Weather({ file: process.env.WEATHER_HISTORY || fileURLToPath(new URL('../../data/weather-history.json', import.meta.url)) });
  while (true) {
    console.log('\n1 Buscar ciudad\n2 Historial de consultas\n0 Salir');
    const option = await input.ask('Opción: ');
    if (option === null || option === '0') break;
    if (option === '2') { weather.history.forEach(x => console.log(x)); continue; }
    if (option !== '1') { console.log('Opción inválida.'); continue; }
    try {
      const query = await input.ask('Ciudad: ');
      if (query === null) break;
      const cities = demo ? [{ nombre: 'Córdoba, Argentina (ejemplo)', lat: -31.42, lng: -64.18 }] : await weather.cities(query);
      if (!cities.length) { console.log('No se encontraron ciudades.'); continue; }
      cities.forEach((x, i) => console.log(`${i + 1}. ${x.nombre}`));
      const answer = await input.ask('Elegí una ciudad (0: cancelar): ');
      if (answer === null) break;
      if (answer === '0') continue;
      const city = cities[Number(answer) - 1];
      if (!city) { console.log('Selección inválida.'); continue; }
      const current = demo ? { temp: 20, min: 18, max: 23, desc: 'cielo claro (ejemplo)' } : await weather.current(city.lat, city.lng);
      // Se guarda lo escrito por el usuario, no los resultados temporales de Mapbox.
      weather.remember(query);
      console.log(`${city.nombre}\n${current.temp} °C | Mínima ${current.min} °C | Máxima ${current.max} °C\n${current.desc}`);
    } catch (error) { console.error(error.message); }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { input.close(); }
