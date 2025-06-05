import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  static async list(_req: Request, res: Response) {
    const categories = await CategoryService.list();
    res.json(categories);
  }

  static async create(req: Request, res: Response) {
    const { name } = req.body;
    const category = await CategoryService.create(name);
    res.status(201).json(category);
  }

  static async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    const category = await CategoryService.update(id, name);
    res.json(category);
  }

  static async remove(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await CategoryService.remove(id);
    res.status(204).end();
  }
}
