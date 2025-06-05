import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Генерация токена (e.g. доступен payload: { userId, email })
export function generateToken(payload: { userId: number; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Верификация токена
export function verifyToken(token: string): { userId: number; email: string; role: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
}
