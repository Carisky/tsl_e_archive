import { Request, Response, NextFunction } from 'express';
import { UserService, IUserRegister, IUserLogin } from '../services/UserService';
import { generateToken } from '../utils/auth';

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
      const token = generateToken({ userId: user.id, email: user.email });
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
      const token = generateToken({ userId: user.id, email: user.email });
      res.status(200).json({ user, token });
    } catch (err) {
      res.status(401).json({ error: (err as Error).message });
    }
  }
}
