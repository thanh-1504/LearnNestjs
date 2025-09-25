import envConfig from 'src/shared/config';
import { RoleName } from 'src/shared/constrants/role-constrant';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();
const hasingService = new HashingService();
const main = async () => {
  const rolesCount = await prisma.role.count();
  if (rolesCount > 0) throw new Error('Roles already exits');
  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: 'Admin Role',
      },
      {
        name: RoleName.Client,
        description: 'Client role',
      },
      {
        name: RoleName.Seller,
        description: 'Seller Role',
      },
    ],
  });
  const adminRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.Admin },
  });
  const adminUser = await prisma.user.create({
    data: {
      name: envConfig.ADMIN_NAME,
      email: envConfig.ADMIN_EMAIL,
      password: await hasingService.hashPassword(envConfig.ADMIN_PASSWORD),
      phoneNumber: envConfig.ADMIN_PHONENUMBER,
      roleId: adminRole.id,
    },
  });
  return {
    createdRoleCount: roles.count,
    adminUser,
  };
};
main()
  .then(({ createdRoleCount, adminUser }) => {
    console.log(`Created ${createdRoleCount} roles`);
    console.log(`Created admin user ${adminUser.email} `);
  })
  .catch((error) => {
    console.log(error);
  });
