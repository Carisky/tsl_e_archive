import prisma from '../prisma/client';

export class AuditLogService {
  static async create(userId: number | undefined, action: string, details?: string) {
    await prisma.auditLog.create({ data: { userId, action, details } });
  }

  static async list() {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }
}
