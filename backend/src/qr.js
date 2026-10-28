import crypto from 'node:crypto';

export const WINDOW_SECONDS = 30;

export function newSeed() {
  return crypto.randomBytes(32).toString('hex');
}

export function currentWindow(now = Date.now()) {
  return Math.floor(now / 1000 / WINDOW_SECONDS);
}

function sign(seed, ticketId, deviceId, window) {
  return crypto
    .createHmac('sha256', seed)
    .update(`${ticketId}:${deviceId}:${window}`)
    .digest('hex')
    .slice(0, 16);
}

// Token que va dentro del QR: ticketId.ventana.firma
export function generateToken(ticket, now = Date.now()) {
  const window = currentWindow(now);
  const signature = sign(ticket.seed, ticket.id, ticket.deviceId, window);
  const secondsLeft = WINDOW_SECONDS - (Math.floor(now / 1000) % WINDOW_SECONDS);
  return { token: `${ticket.id}.${window}.${signature}`, secondsLeft };
}

// Acepta la ventana actual y la anterior para tolerar desfases de reloj
export function verifyToken(token, findTicket, now = Date.now()) {
  const [ticketId, windowStr, signature] = String(token).split('.');
  const ticket = findTicket(ticketId);
  if (!ticket) return { valid: false, reason: 'Entrada no existe' };
  if (ticket.used) return { valid: false, reason: 'Entrada ya fue usada' };

  const window = Number(windowStr);
  const current = currentWindow(now);
  if (window !== current && window !== current - 1) {
    return { valid: false, reason: 'QR expirado' };
  }

  const expected = sign(ticket.seed, ticket.id, ticket.deviceId, window);
  const ok =
    signature?.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!ok) return { valid: false, reason: 'Firma inválida' };

  return { valid: true, ticket };
}
