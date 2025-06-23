import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import { AuditLogService } from '../services/AuditLogService';

export class CategoryController {
  static async list(_req: Request, res: Response) {
    const categories = await CategoryService.list();
    res.json(categories);
  }

  static async create(req: Request, res: Response): Promise<void> {
    if ((req as any).userRole !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const { name } = req.body;
    const category = await CategoryService.create(name);
    await AuditLogService.create((req as any).userId, 'CATEGORY_CREATE', `category:${category.id}`);
    res.status(201).json(category);
  }

  static async update(req: Request, res: Response): Promise<void> {
    if ((req as any).userRole !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const category = await CategoryService.update(id, name);
    await AuditLogService.create((req as any).userId, 'CATEGORY_UPDATE', `category:${id}`);
    res.json(category);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    if ((req as any).userRole !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const id = parseInt(req.params.id);
    await CategoryService.remove(id);
    await AuditLogService.create((req as any).userId, 'CATEGORY_DELETE', `category:${id}`);
    res.status(204).end();
  }
}
