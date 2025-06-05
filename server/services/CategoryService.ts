import prisma from '../prisma/client';

export class CategoryService {
  static list() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  static async create(name: string) {
    return prisma.category.create({ data: { name } });
  }

  static async update(id: number, name: string) {
    return prisma.category.update({ where: { id }, data: { name } });
  }

  static async remove(id: number) {
    return prisma.category.delete({ where: { id } });
  }
}
