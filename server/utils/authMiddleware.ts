import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = verifyToken(token);
    (req as any).userId = payload.userId;
    (req as any).userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
