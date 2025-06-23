import bcrypt from 'bcrypt';
import prisma from '../prisma/client';

export interface IUserRegister {
  username: string;
  email: string;
  password: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export class UserService {
  // Регистрация: хешируем пароль и сохраняем пользователя
  static async register(data: IUserRegister) {
    const { username, email, password } = data;

    // 1. Проверка дублирования
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existing) {
      throw new Error('Email или username уже используются');
    }

    // 2. Хешируем пароль
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Создаём пользователя
    // Убеждаемся, что дефолтная роль существует
    const defaultRole = await prisma.role.upsert({
      where: { role: 'USER' },
      update: {},
      create: { role: 'USER' },
    });

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        // По умолчанию даём базовую роль
        roleId: defaultRole.id,
      },
      include: {
        role: true,
      },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.role,
    };
  }

  // Аутентификация: проверяем email + password
  static async login(data: IUserLogin) {
    const { email, password } = data;

    // 1. Ищем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // 2. Сравниваем хеши
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Неверный email или пароль');
    }

    // 3. Возвращаем объект без поля password
    const { password: _p, roleId: _roleId, role, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, role: role.role };
  }

  // Список всех пользователей с ролями
  static async list() {
    const users = await prisma.user.findMany({ include: { role: true }, orderBy: { id: 'asc' } });
    return users.map((u: any) => {
      const { password, roleId, role, ...rest } = u;
      return { ...rest, role: role.role };
    });
  }

  // Изменить роль пользователя
  static async setRole(userId: number, roleName: string) {
    const role = await prisma.role.findUnique({ where: { role: roleName } });
    if (!role) {
      throw new Error('Role not found');
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: { role: true },
    });
    const { password, roleId, role: r, ...rest } = user;
    return { ...rest, role: r.role };
  }
}
