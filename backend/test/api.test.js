import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/server.js';
import prisma from '../src/db.js';

const app = buildServer();

after(async () => {
  await prisma.ticket.deleteMany({});
  await prisma.$disconnect();
});

test('GET /events devuelve los eventos de la base de datos', async () => {
  const res = await app.inject('/events');
  const events = res.json();
  assert.equal(res.statusCode, 200);
  assert.ok(events.length >= 4);
  assert.ok(events.some((e) => e.name === 'Rock en el Misti'));
});

test('GET /events?city=Arequipa filtra por ciudad', async () => {
  const res = await app.inject('/events?city=Arequipa');
  const events = res.json();
  assert.ok(events.every((e) => e.city === 'Arequipa'));
});

test('flujo completo con base de datos: comprar, QR, validar', async () => {
  const buy = await app.inject({
    method: 'POST',
    url: '/tickets',
    payload: { eventId: 'ev-001', holder: 'Diego Z.', deviceId: 'test-phone' },
  });
  assert.equal(buy.statusCode, 201);
  const { id } = buy.json();

  const otherPhone = await app.inject(`/tickets/${id}/qr?deviceId=wrong-phone`);
  assert.equal(otherPhone.statusCode, 403);

  const qr = await app.inject(`/tickets/${id}/qr?deviceId=test-phone`);
  assert.equal(qr.statusCode, 200);
  const { token } = qr.json();

  const valid = await app.inject({
    method: 'POST',
    url: '/validate',
    payload: { token },
  });
  assert.equal(valid.json().valid, true);
  assert.equal(valid.json().holder, 'Diego Z.');

  const reuse = await app.inject({
    method: 'POST',
    url: '/validate',
    payload: { token },
  });
  assert.equal(reuse.json().reason, 'Entrada ya fue usada');
});

test('POST /tickets devuelve 409 si el evento está agotado', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/tickets',
    payload: { eventId: 'ev-002', holder: 'Nikolas Z.', deviceId: 'test-phone' },
  });
  assert.equal(res.statusCode, 409);
});

test('GET /tickets?deviceId= devuelve las entradas del dispositivo', async () => {
  const res = await app.inject('/tickets?deviceId=test-phone');
  const tickets = res.json();
  assert.ok(tickets.length >= 1);
  assert.ok(tickets[0].event);
  assert.ok(!tickets[0].seed);
});
