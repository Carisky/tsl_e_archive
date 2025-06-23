import { Router } from 'express';
import { AuditLogController } from '../controllers/AuditLogController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: List audit logs
 *     tags: [AuditLog]
 *     responses:
 *       200:
 *         description: List logs
 *       403:
 *         description: Forbidden
 */
router.get('/', authMiddleware as any, (req, res) => {
  if ((req as any).userRole === 'ADMIN' || (req as any).userRole === 'SUPERADMIN') {
    AuditLogController.list(req, res);
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
});

export default router;
