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
    let query = `
      SELECT
        f.id,
        f.key,
        f.filename,
        f."userId",
        f."createdAt",
        COALESCE(
          json_agg(json_build_object('category', json_build_object('id', c.id, 'name', c.name)))
          FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM "Files" f
      LEFT JOIN "FileCategories" fc ON fc."fileId" = f.id
      LEFT JOIN "Categories" c ON c.id = fc."categoryId"
      WHERE f."deletedAt" IS NULL`;
    const params: any[] = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` AND f."filename" ILIKE $${params.length}`;
    }
    query += ' GROUP BY f.id ORDER BY f."createdAt" DESC';
    const files = await prisma.$queryRawUnsafe(query, ...params);
    return files.map((f: any) => ({
      ...f,
      categories: typeof f.categories === 'string' ? JSON.parse(f.categories) : f.categories,
    }));
  }

  static async get(id: number) {
    const result = await prisma.$queryRawUnsafe(
      'SELECT * FROM "Files" WHERE id = $1 AND "deletedAt" IS NULL LIMIT 1',
      id,
    );
    return result[0] || null;
  }

  static async download(id: number) {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return null;
    const data = await downloadFromS3(file.key);
    return { file, data };
  }

  static async softDelete(id: number) {
    await prisma.$executeRawUnsafe('UPDATE "Files" SET "deletedAt" = NOW() WHERE id = $1', id);
  }

  static async forceDelete(id: number) {
    const f = await prisma.file.findUnique({ where: { id } });
    if (!f) return;
    await deleteFromS3(f.key);
    await prisma.file.delete({ where: { id } });
  }
}
