import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Weather } from '../ejercicios/03-clima/weather.js';

test('consulta ciudad y clima con parámetros seguros y conserva seis consultas', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'node-clima-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'history.json');
  const requests = [];
  const weather = new Weather({ file, mapboxKey: 'prueba', weatherKey: 'prueba', fetchImpl: async url => {
    requests.push(new URL(url));
    return Response.json(url.hostname === 'api.mapbox.com'
      ? { features: [{ properties: { mapbox_id: 'ciudad.1', full_address: 'Córdoba, Argentina' }, geometry: { coordinates: [-64.18, -31.42] } }] }
      : { weather: [{ description: 'cielo claro' }], main: { temp: 20, temp_min: 18, temp_max: 23 } });
  } });
  const [city] = await weather.cities('Córdoba & centro');
  assert.equal(city.lat, -31.42);
  assert.equal(requests[0].searchParams.get('q'), 'Córdoba & centro');
  assert.equal(requests[0].searchParams.get('types'), 'place');
  assert.deepEqual(await weather.current(city.lat, city.lng), { desc: 'cielo claro', temp: 20, min: 18, max: 23 });
  assert.equal(requests[1].searchParams.get('units'), 'metric');
  for (let i = 0; i < 8; i++) weather.remember(`consulta ${i}`);
  weather.remember('CONSULTA 6');
  assert.deepEqual(weather.history, ['CONSULTA 6', 'consulta 7', 'consulta 5', 'consulta 4', 'consulta 3', 'consulta 2']);
  assert.deepEqual(new Weather({ file }).history, weather.history);
});

test('distingue errores de credenciales, proveedor y respuesta inválida', async () => {
  const noKeys = new Weather();
  await assert.rejects(noKeys.cities('Córdoba'), /MAPBOX_KEY/);
  const failing = new Weather({ mapboxKey: 'prueba', weatherKey: 'prueba', fetchImpl: async () => new Response('no', { status: 401 }) });
  await assert.rejects(failing.cities('Córdoba'), /Mapbox.*401/);
  await assert.rejects(failing.current(100, 0), /coordenadas/i);
  const invalid = new Weather({ mapboxKey: 'prueba', weatherKey: 'prueba', fetchImpl: async () => Response.json({}) });
  await assert.rejects(invalid.current(0, 0), /respuesta/i);
});

test('la consola de clima se puede recorrer con datos de demostración', t => {
  const dir = mkdtempSync(join(tmpdir(), 'node-clima-cli-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, ['ejercicios/03-clima/cli.js', '--demo'], {
    input: '1\nCordoba\n1\n2\n0\n', encoding: 'utf8', env: { ...process.env, WEATHER_HISTORY: join(dir, 'history.json') }
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /DEMOSTRACIÓN/);
  assert.match(result.stdout, /20 °C/);
  assert.match(result.stdout, /Cordoba/);
});
