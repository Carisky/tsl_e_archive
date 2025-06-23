import { Request, Response } from 'express';
import { AuditLogService } from '../services/AuditLogService';

export class AuditLogController {
  static async list(_req: Request, res: Response): Promise<void> {
    const logs = await AuditLogService.list();
    res.json(logs);
  }
}
