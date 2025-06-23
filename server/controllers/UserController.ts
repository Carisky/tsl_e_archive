import { Request, Response, NextFunction } from 'express';
import { UserService, IUserRegister, IUserLogin } from '../services/UserService';
import { generateToken } from '../utils/auth';
import { AuditLogService } from '../services/AuditLogService';

export class UserController {
  // POST /register
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: IUserRegister = req.body;
      const user = await UserService.register(data);
      // После успешной регистрации сразу отдать JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      await AuditLogService.create(user.id, 'USER_REGISTER', user.email);
      res.status(201).json({ user, token });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  // POST /login
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: IUserLogin = req.body;
      const user = await UserService.login(data);
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      await AuditLogService.create(user.id, 'USER_LOGIN', user.email);
      res.status(200).json({ user, token });
    } catch (err) {
      res.status(401).json({ error: (err as Error).message });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    if ((req as any).userRole !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const users = await UserService.list();
    res.json(users);
  }

  static async setRole(req: Request, res: Response): Promise<void> {
    if ((req as any).userRole !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const id = parseInt(req.params.id, 10);
    const role = (req.body as any).role as string | undefined;
    if (!role) {
      res.status(400).json({ error: 'Role required' });
      return;
    }
    try {
      const user = await UserService.setRole(id, role);
      await AuditLogService.create((req as any).userId, 'USER_SETROLE', `user:${id}=${role}`);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
}
