import prisma from '../prisma/client';
import { uploadToS3, downloadFromS3, deleteFromS3 } from './S3Service';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  static async upload(filename: string, buffer: Buffer, userId: number | undefined, categories: number[]) {
    const key = uuidv4();
    await uploadToS3(key, buffer);
    const file = await prisma.file.create({
      data: {
        key,
        filename,
        userId,
        categories: {
          create: categories.map((categoryId) => ({ categoryId })),
        },
      },
      include: { categories: { include: { category: true } } },
    });
    return file;
  }

  static async list(search?: string) {
    return prisma.file.findMany({
      // Casting to `any` is required because the generated Prisma client
      // does not include the `deletedAt` field in its typings. The database
      // column exists, so we can still filter on it at runtime.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: {
        deletedAt: null,
        ...(search
          ? { filename: { contains: search, mode: 'insensitive' } }
          : {}),
      } as any,
      include: { categories: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async get(id: number) {
    return prisma.file.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: { id, deletedAt: null } as any,
    });
  }

  static async download(id: number) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return null;
    const data = await downloadFromS3(file.key);
    return { file, data };
  }

  static async softDelete(id: number) {
    await (prisma.file.update as any)({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async forceDelete(id: number) {
    const f = await prisma.file.findUnique({ where: { id } });
    if (!f) return;
    await deleteFromS3(f.key);
    await prisma.file.delete({ where: { id } });
  }
}
