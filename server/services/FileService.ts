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
      where: {
        deletedAt: null,
        ...(search
          ? { filename: { contains: search, mode: 'insensitive' } }
          : {}),
      },
      include: { categories: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async get(id: number) {
    return prisma.file.findUnique({
      where: { id, deletedAt: null },
      include: { categories: { include: { category: true } } },
    });
  }

  static async download(id: number) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return null;
    const data = await downloadFromS3(file.key);
    return { file, data };
  }

  static async update(id: number, filename: string) {
    return prisma.file.update({
      where: { id },
      data: { filename },
      include: { categories: { include: { category: true } } },
    });
  }

  static async softDelete(id: number) {
    await prisma.file.update({
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
