import Fastify from 'fastify';
import cors from '@fastify/cors';
import prisma from './db.js';
import { newSeed, generateToken, verifyToken } from './qr.js';

export function buildServer() {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/events', async (req) => {
    const where = {};
    if (req.query.city) where.city = req.query.city;
    if (req.query.category) where.category = req.query.category;
    return prisma.event.findMany({ where });
  });

  app.get('/events/:id', async (req, reply) => {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return reply.code(404).send({ error: 'Evento no encontrado' });
    return event;
  });

  app.post('/tickets', async (req, reply) => {
    const { eventId, holder, deviceId } = req.body ?? {};
    if (!holder || !deviceId) {
      return reply.code(400).send({ error: 'Faltan holder o deviceId' });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return reply.code(404).send({ error: 'Evento no encontrado' });
    if (event.stock <= 0) return reply.code(409).send({ error: 'Evento agotado' });

    await prisma.event.update({
      where: { id: eventId },
      data: { stock: event.stock - 1 },
    });

    const ticket = await prisma.ticket.create({
      data: { holder, deviceId, seed: newSeed(), eventId },
    });

    const { seed, ...publicTicket } = ticket;
    return reply.code(201).send(publicTicket);
  });

  app.get('/tickets/:id/qr', async (req, reply) => {
    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return reply.code(404).send({ error: 'Entrada no encontrada' });
    if (req.query.deviceId !== ticket.deviceId) {
      return reply.code(403).send({ error: 'La entrada está ligada a otro dispositivo' });
    }
    return generateToken(ticket);
  });

  app.get('/tickets', async (req) => {
    const { deviceId } = req.query;
    if (!deviceId) return [];
    const tickets = await prisma.ticket.findMany({
      where: { deviceId },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map(({ seed, ...t }) => t);
  });

  app.post('/validate', async (req, reply) => {
    const { token } = req.body ?? {};
    const result = verifyToken(
      token,
      (id) => prisma.ticket.findUnique({ where: { id } }),
    );

    const resolved = await result;
    if (!resolved.valid) return resolved;

    await prisma.ticket.update({
      where: { id: resolved.ticket.id },
      data: { used: true },
    });

    return {
      valid: true,
      holder: resolved.ticket.holder,
      eventId: resolved.ticket.eventId,
    };
  });

  return app;
}
