// node src/controllers/rideController.test.js
const assert = require('node:assert');
const { parseBody } = require('./rideController');

const base = { date: '2026-08-25', driver: 'Teinha' };
const value = (extra) => parseBody({ ...base, ...extra }).data.value;

// Tabela de preços
assert.strictEqual(value({ period: 'manha', type: 'normal' }), 10);
assert.strictEqual(value({ period: 'tarde', type: 'normal' }), 15);
assert.strictEqual(value({ period: 'manha', type: 'especial' }), 20);
assert.strictEqual(value({ period: 'tarde', type: 'especial' }), 20);
assert.strictEqual(value({ period: 'manha', type: 'nao_foi' }), 0);
assert.strictEqual(value({ period: 'tarde', type: 'nao_foi' }), 0);

// route só sobrevive em corrida especial
assert.strictEqual(parseBody({ ...base, period: 'manha', type: 'especial', route: 'Casa - Josi' }).data.route, 'Casa - Josi');
assert.strictEqual(parseBody({ ...base, period: 'manha', type: 'normal', route: 'Casa - Josi' }).data.route, null);

// Data normalizada para meia-noite UTC (o dedupe depende disso)
assert.strictEqual(parseBody({ ...base, period: 'manha', type: 'normal' }).data.date.toISOString(), '2026-08-25T00:00:00.000Z');
assert.strictEqual(
  parseBody({ ...base, date: '2026-08-25T21:30:00-03:00', period: 'manha', type: 'normal' }).data.date.toISOString(),
  '2026-08-25T00:00:00.000Z'
);

// Entradas inválidas não viram corrida
assert.ok(parseBody({ ...base, period: 'noite', type: 'normal' }).error);
assert.ok(parseBody({ ...base, period: 'manha', type: 'qualquer' }).error);
assert.ok(parseBody({ ...base, driver: 'Fulano', period: 'manha', type: 'normal' }).error);
assert.ok(parseBody({ ...base, date: 'xx', period: 'manha', type: 'normal' }).error);

console.log('rideController: OK');
process.exit(0); // o pool do prisma segura o event loop
