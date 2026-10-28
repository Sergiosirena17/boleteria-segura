import Fastify from 'fastify';
import cors from '@fastify/cors';
import crypto from 'node:crypto';
import { events, tickets } from './data.js';
import { newSeed, generateToken, verifyToken } from './qr.js';

export function buildServer() {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/events', async (req) => {
    const { city, category } = req.query;
    return events.filter(
      (e) => (!city || e.city === city) && (!category || e.category === category),
    );
  });

  app.get('/events/:id', async (req, reply) => {
    const event = events.find((e) => e.id === req.params.id);
    if (!event) return reply.code(404).send({ error: 'Evento no encontrado' });
    return event;
  });

  // Compra simulada: el pago con Mercado Pago / Yape se integra después
  app.post('/tickets', async (req, reply) => {
    const { eventId, holder, deviceId } = req.body ?? {};
    const event = events.find((e) => e.id === eventId);
    if (!event) return reply.code(404).send({ error: 'Evento no encontrado' });
    if (!holder || !deviceId) {
      return reply.code(400).send({ error: 'Faltan holder o deviceId' });
    }
    if (event.stock <= 0) return reply.code(409).send({ error: 'Evento agotado' });

    event.stock -= 1;
    const ticket = {
      id: crypto.randomUUID().slice(0, 8),
      eventId,
      holder,
      deviceId,
      seed: newSeed(),
      used: false,
    };
    tickets.set(ticket.id, ticket);
    const { seed, ...publicTicket } = ticket;
    return reply.code(201).send(publicTicket);
  });

  app.get('/tickets/:id/qr', async (req, reply) => {
    const ticket = tickets.get(req.params.id);
    if (!ticket) return reply.code(404).send({ error: 'Entrada no encontrada' });
    if (req.query.deviceId !== ticket.deviceId) {
      return reply.code(403).send({ error: 'La entrada está ligada a otro dispositivo' });
    }
    return generateToken(ticket);
  });

  // Lo usará el lector en puerta
  app.post('/validate', async (req) => {
    const result = verifyToken(req.body?.token, (id) => tickets.get(id));
    if (!result.valid) return result;
    result.ticket.used = true;
    return { valid: true, holder: result.ticket.holder, eventId: result.ticket.eventId };
  });

  return app;
}
