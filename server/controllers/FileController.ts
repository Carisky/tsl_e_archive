import { Request, Response } from 'express';
import { FileService } from '../services/FileService';

function mimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'txt':
    case 'text':
      return 'text/plain';
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

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

  static async get(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const file = await FileService.get(id);
    if (!file) {
      res.status(404).end();
      return;
    }
    res.json(file);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const { filename } = req.body;
    const file = await FileService.update(id, filename);
    res.json(file);
  }

  static async download(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const result = await FileService.download(id);
    if (!result) {
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', mimeType(result.file.filename));
    // Allow browser preview without forcing download
    res.send(Buffer.from(result.data));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const role = (req as any).userRole;
    if (role === 'SUPERADMIN' && req.query.force === 'true') {
      await FileService.forceDelete(id);
    } else {
      await FileService.softDelete(id);
    }
    res.status(204).end();
  }
}
