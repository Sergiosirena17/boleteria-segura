import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/server.js';
import { generateToken, verifyToken, newSeed } from '../src/qr.js';

const ticket = { id: 't1', deviceId: 'phone-A', seed: newSeed(), used: false };
const find = (id) => (id === ticket.id ? ticket : undefined);

test('un QR recién generado es válido', () => {
  const { token } = generateToken(ticket);
  assert.equal(verifyToken(token, find).valid, true);
});

test('un QR de hace 2 minutos está expirado', () => {
  const { token } = generateToken(ticket, Date.now() - 120_000);
  assert.equal(verifyToken(token, find).reason, 'QR expirado');
});

test('un QR con la firma alterada se rechaza', () => {
  const { token } = generateToken(ticket);
  const forged = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
  assert.equal(verifyToken(forged, find).reason, 'Firma inválida');
});

test('flujo completo: comprar, generar QR, entrar y no poder reusar', async () => {
  const app = buildServer();
  const buy = await app.inject({
    method: 'POST',
    url: '/tickets',
    payload: { eventId: 'ev-001', holder: 'Sergio S.', deviceId: 'phone-A' },
  });
  assert.equal(buy.statusCode, 201);
  const { id } = buy.json();

  const otherPhone = await app.inject(`/tickets/${id}/qr?deviceId=phone-B`);
  assert.equal(otherPhone.statusCode, 403);

  const { token } = (await app.inject(`/tickets/${id}/qr?deviceId=phone-A`)).json();
  const first = await app.inject({ method: 'POST', url: '/validate', payload: { token } });
  assert.equal(first.json().valid, true);

  const second = await app.inject({ method: 'POST', url: '/validate', payload: { token } });
  assert.equal(second.json().reason, 'Entrada ya fue usada');
});
