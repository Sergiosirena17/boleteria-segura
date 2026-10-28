// Datos de ejemplo mientras conectamos PostgreSQL (siguiente sprint)
export const events = [
  {
    id: 'ev-001',
    name: 'Noche Electrónica Vol. 8',
    venue: 'Teatro Montana',
    city: 'Arequipa',
    date: '2026-11-07T22:00:00-05:00',
    category: 'Música',
    price: 35,
    stock: 120,
  },
  {
    id: 'ev-002',
    name: 'Latin Beats Festival',
    venue: 'Kefren',
    city: 'Arequipa',
    date: '2026-11-14T21:00:00-05:00',
    category: 'Música',
    price: 35,
    stock: 0,
  },
  {
    id: 'ev-003',
    name: 'Stand-up: Risas en el Centro',
    venue: 'DaCapo',
    city: 'Arequipa',
    date: '2026-11-21T20:30:00-05:00',
    category: 'Comedia',
    price: 25,
    stock: 60,
  },
  {
    id: 'ev-004',
    name: 'Rock en el Misti',
    venue: 'Estadio Melgar',
    city: 'Arequipa',
    date: '2026-12-05T19:00:00-05:00',
    category: 'Música',
    price: 60,
    stock: 300,
  },
];

export const tickets = new Map();
