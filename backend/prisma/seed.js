import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const events = [
  {
    id: 'ev-001',
    name: 'Noche Electrónica Vol. 8',
    venue: 'Teatro Montana',
    city: 'Arequipa',
    category: 'Música',
    date: new Date('2026-11-07T22:00:00-05:00'),
    price: 35,
    stock: 120,
  },
  {
    id: 'ev-002',
    name: 'Latin Beats Festival',
    venue: 'Kefren',
    city: 'Arequipa',
    category: 'Música',
    date: new Date('2026-11-14T21:00:00-05:00'),
    price: 35,
    stock: 0,
  },
  {
    id: 'ev-003',
    name: 'Stand-up: Risas en el Centro',
    venue: 'DaCapo',
    city: 'Arequipa',
    category: 'Comedia',
    date: new Date('2026-11-21T20:30:00-05:00'),
    price: 25,
    stock: 60,
  },
  {
    id: 'ev-004',
    name: 'Rock en el Misti',
    venue: 'Estadio Melgar',
    city: 'Arequipa',
    category: 'Música',
    date: new Date('2026-12-05T19:00:00-05:00'),
    price: 60,
    stock: 300,
  },
];

async function main() {
  for (const e of events) {
    await prisma.event.upsert({ where: { id: e.id }, update: e, create: e });
  }

  const demo = await prisma.user.upsert({
    where: { email: 'sergio@demo.com' },
    update: {},
    create: {
      name: 'Sergio S.',
      email: 'sergio@demo.com',
      password: await bcrypt.hash('123456', 10),
    },
  });

  console.log('Seed: 4 eventos + usuario demo (sergio@demo.com / 123456)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
