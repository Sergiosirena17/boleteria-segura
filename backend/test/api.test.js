import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/server.js';
import prisma from '../src/db.js';

const app = buildServer();
let token;
let ticketId;
let paymentId;

before(async () => {
  const reg = await app.inject({
    method: 'POST',
    url: '/register',
    payload: { name: 'Test User', email: 'test@test.com', password: 'test123' },
  });
  token = reg.json().token;
});

after(async () => {
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({ where: { email: 'test@test.com' } });
  await prisma.$disconnect();
});

test('register devuelve token y usuario', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/register',
    payload: { name: 'Otro', email: 'otro@test.com', password: '123' },
  });
  assert.equal(res.statusCode, 201);
  assert.ok(res.json().token);
  await prisma.user.delete({ where: { email: 'otro@test.com' } });
});

test('login con credenciales correctas', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/login',
    payload: { email: 'test@test.com', password: 'test123' },
  });
  assert.equal(res.statusCode, 200);
  assert.ok(res.json().token);
});

test('login con contraseña incorrecta falla', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/login',
    payload: { email: 'test@test.com', password: 'wrong' },
  });
  assert.equal(res.statusCode, 401);
});

test('comprar sin token da 401', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/tickets',
    payload: { eventId: 'ev-001', deviceId: 'phone-A' },
  });
  assert.equal(res.statusCode, 401);
});

test('comprar con token crea ticket y pago pendiente', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/tickets',
    headers: { authorization: `Bearer ${token}` },
    payload: { eventId: 'ev-001', deviceId: 'phone-A' },
  });
  assert.equal(res.statusCode, 201);
  const body = res.json();
  assert.ok(body.payment);
  assert.equal(body.payment.status, 'pending');
  ticketId = body.id;
  paymentId = body.payment.id;
});

test('QR no disponible si pago pendiente', async () => {
  const res = await app.inject(`/tickets/${ticketId}/qr?deviceId=phone-A`);
  assert.equal(res.statusCode, 402);
});

test('confirmar pago', async () => {
  const res = await app.inject({
    method: 'POST',
    url: `/payments/${paymentId}/confirm`,
    headers: { authorization: `Bearer ${token}` },
    payload: { method: 'yape' },
  });
  assert.equal(res.json().status, 'paid');
});

test('QR disponible después del pago', async () => {
  const res = await app.inject(`/tickets/${ticketId}/qr?deviceId=phone-A`);
  assert.equal(res.statusCode, 200);
  assert.ok(res.json().token);
});

test('validar entrada libera el pago (escrow)', async () => {
  const qr = await app.inject(`/tickets/${ticketId}/qr?deviceId=phone-A`);
  const res = await app.inject({
    method: 'POST',
    url: '/validate',
    payload: { token: qr.json().token },
  });
  assert.equal(res.json().valid, true);
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  assert.equal(payment.status, 'released');
});

test('evento agotado da 409', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/tickets',
    headers: { authorization: `Bearer ${token}` },
    payload: { eventId: 'ev-002', deviceId: 'phone-A' },
  });
  assert.equal(res.statusCode, 409);
});
