import bcrypt from 'bcrypt';
import prisma from './client';

async function main() {
  // roles
  const superadminRole = await prisma.role.upsert({
    where: { role: 'SUPERADMIN' },
    update: {},
    create: { role: 'SUPERADMIN' },
  });
  const adminRole = await prisma.role.upsert({
    where: { role: 'ADMIN' },
    update: {},
    create: { role: 'ADMIN' },
  });
  const userRole = await prisma.role.upsert({
    where: { role: 'USER' },
    update: {},
    create: { role: 'USER' },
  });

  // permissions
  const permissions = ['FILE_UPLOAD', 'FILE_EDIT', 'FILE_DELETE', 'USER_MANAGE', 'USER_DELETE_SOFT', 'USER_DELETE_FORCE'];
  const permissionRecords = await Promise.all(
    permissions.map((p) =>
      prisma.permission.upsert({ where: { permission: p }, update: {}, create: { permission: p } })
    )
  );

  // role permissions
  const permissionMap: Record<string, number> = Object.fromEntries(permissionRecords.map((p) => [p.permission, p.id]));

  // admin + superadmin for upload edit delete
  const adminPermissions = ['FILE_UPLOAD', 'FILE_EDIT', 'FILE_DELETE', 'USER_DELETE_SOFT'];
  for (const perm of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permissionMap[perm] } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permissionMap[perm] },
    });
  }
  const superPerms = [...adminPermissions, 'USER_MANAGE', 'USER_DELETE_FORCE'];
  for (const perm of superPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superadminRole.id, permissionId: permissionMap[perm] } },
      update: {},
      create: { roleId: superadminRole.id, permissionId: permissionMap[perm] },
    });
  }
  // user only upload
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: userRole.id, permissionId: permissionMap['FILE_UPLOAD'] } },
    update: {},
    create: { roleId: userRole.id, permissionId: permissionMap['FILE_UPLOAD'] },
  });

  // default superadmin
  const hashedPassword = await bcrypt.hash('superadmin', 10);
  await prisma.user.upsert({
    where: { email: 'super@admin.com' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'super@admin.com',
      password: hashedPassword,
      roleId: superadminRole.id,
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
