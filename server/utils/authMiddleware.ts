import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  let token: string | null = null;
  if (auth) token = auth.split(' ')[1];
  else if (typeof req.query.token === 'string') token = req.query.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(token);
    (req as any).userId = payload.userId;
    (req as any).userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
