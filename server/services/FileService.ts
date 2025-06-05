import prisma from '../prisma/client';
import { uploadToS3 } from './S3Service';
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
      where: search ? { filename: { contains: search, mode: 'insensitive' } } : {},
      include: { categories: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
