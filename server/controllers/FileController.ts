import { Request, Response } from 'express';
import { FileService } from '../services/FileService';

export class FileController {
  static async upload(req: Request, res: Response): Promise<void> {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ error: 'No file' });
      return;
    }
    const categoryIds = (req.body.categories || '')
      .split(',')
      .map((v: string) => parseInt(v))
      .filter((v: number) => !isNaN(v));
    const userId = (req as any).userId as number | undefined;
    const created = await FileService.upload(file.originalname, file.buffer, userId, categoryIds);
    res.json(created);
  }

  static async list(req: Request, res: Response): Promise<void> {
    const q = req.query.q as string | undefined;
    const files = await FileService.list(q);
    res.json(files);
  }
}
