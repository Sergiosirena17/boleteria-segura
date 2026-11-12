import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'boleteria-segura-dev-2026';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
}

export function verifyAuth(request, reply) {
  const header = request.headers.authorization;
  if (!header) return reply.code(401).send({ error: 'No autorizado' });
  try {
    const token = header.replace('Bearer ', '');
    request.user = jwt.verify(token, SECRET);
  } catch {
    return reply.code(401).send({ error: 'Token inválido' });
  }
}
