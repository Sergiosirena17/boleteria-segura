import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateToken, verifyToken, newSeed } from '../src/qr.js';

const ticket = { id: 't1', deviceId: 'phone-A', seed: newSeed(), used: false };
const find = (id) => (id === ticket.id ? ticket : undefined);

test('un QR recién generado es válido', async () => {
  const { token } = generateToken(ticket);
  const result = await verifyToken(token, find);
  assert.equal(result.valid, true);
});

test('un QR de hace 2 minutos está expirado', async () => {
  const { token } = generateToken(ticket, Date.now() - 120_000);
  const result = await verifyToken(token, find);
  assert.equal(result.reason, 'QR expirado');
});

test('un QR con la firma alterada se rechaza', async () => {
  const { token } = generateToken(ticket);
  const forged = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
  const result = await verifyToken(forged, find);
  assert.equal(result.reason, 'Firma inválida');
});

test('verifyToken funciona con findTicket async', async () => {
  const asyncFind = async (id) => (id === ticket.id ? ticket : undefined);
  const { token } = generateToken(ticket);
  const result = await verifyToken(token, asyncFind);
  assert.equal(result.valid, true);
});
