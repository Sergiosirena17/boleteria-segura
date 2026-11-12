import Fastify from 'fastify';
import cors from '@fastify/cors';
import prisma from './db.js';
import { newSeed, generateToken, verifyToken } from './qr.js';
import { hashPassword, checkPassword, createToken, verifyAuth } from './auth.js';

export function buildServer() {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });

  app.get('/health', async () => ({ status: 'ok' }));

  app.post('/register', async (req, reply) => {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return reply.code(400).send({ error: 'Faltan campos' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return reply.code(409).send({ error: 'El correo ya está registrado' });

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password) },
    });
    return reply.code(201).send({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });
  });

  app.post('/login', async (req, reply) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return reply.code(400).send({ error: 'Faltan campos' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await checkPassword(password, user.password))) {
      return reply.code(401).send({ error: 'Correo o contraseña incorrectos' });
    }
    return { token: createToken(user), user: { id: user.id, name: user.name, email: user.email } };
  });

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
    verifyAuth(req, reply);
    if (reply.sent) return;

    const { eventId, deviceId } = req.body ?? {};
    if (!eventId || !deviceId) return reply.code(400).send({ error: 'Faltan campos' });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return reply.code(404).send({ error: 'Evento no encontrado' });
    if (event.stock <= 0) return reply.code(409).send({ error: 'Evento agotado' });

    await prisma.event.update({ where: { id: eventId }, data: { stock: event.stock - 1 } });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ticket = await prisma.ticket.create({
      data: {
        holder: user.name,
        deviceId,
        seed: newSeed(),
        eventId,
        userId: user.id,
      },
      include: { event: true },
    });

    const payment = await prisma.payment.create({
      data: { amount: event.price, ticketId: ticket.id },
    });

    const { seed, ...pub } = ticket;
    return reply.code(201).send({ ...pub, payment });
  });

  app.post('/payments/:id/confirm', async (req, reply) => {
    verifyAuth(req, reply);
    if (reply.sent) return;

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { ticket: true },
    });
    if (!payment) return reply.code(404).send({ error: 'Pago no encontrado' });
    if (payment.ticket.userId !== req.user.id) return reply.code(403).send({ error: 'No autorizado' });
    if (payment.status !== 'pending') return reply.code(409).send({ error: 'El pago ya fue procesado' });

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'paid', method: req.body?.method || 'yape' },
    });
    return updated;
  });

  app.get('/tickets/:id/qr', async (req, reply) => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { payment: true },
    });
    if (!ticket) return reply.code(404).send({ error: 'Entrada no encontrada' });
    if (req.query.deviceId !== ticket.deviceId) {
      return reply.code(403).send({ error: 'La entrada está ligada a otro dispositivo' });
    }
    if (!ticket.payment || ticket.payment.status !== 'paid') {
      return reply.code(402).send({ error: 'Pago pendiente' });
    }
    return generateToken(ticket);
  });

  app.get('/tickets', async (req) => {
    const { deviceId } = req.query;
    if (!deviceId) return [];
    const tickets = await prisma.ticket.findMany({
      where: { deviceId },
      include: { event: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map(({ seed, ...t }) => t);
  });

  app.post('/validate', async (req) => {
    const { token } = req.body ?? {};
    const result = await verifyToken(
      token,
      (id) => prisma.ticket.findUnique({ where: { id } }),
    );
    if (!result.valid) return result;

    await prisma.ticket.update({
      where: { id: result.ticket.id },
      data: { used: true },
    });

    await prisma.payment.updateMany({
      where: { ticketId: result.ticket.id, status: 'paid' },
      data: { status: 'released' },
    });

    return { valid: true, holder: result.ticket.holder, eventId: result.ticket.eventId };
  });

  return app;
}
