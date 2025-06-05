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
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        // По умолчанию даём роль с id = 1
        roleId: 1,
      },
      select: {
        id: true,
        username: true,
        email: true,
        roleId: true,
      },
    });

    return user;
  }

  // Аутентификация: проверяем email + password
  static async login(data: IUserLogin) {
    const { email, password } = data;

    // 1. Ищем пользователя по email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    // 2. Сравниваем хеши
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Неверный email или пароль');
    }

    // 3. Возвращаем объект без поля password
    const { password: _p, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
