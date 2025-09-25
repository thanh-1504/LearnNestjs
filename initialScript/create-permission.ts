import { NestFactory } from '@nestjs/core';
import { HTTPMethod } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { RoleName } from 'src/shared/constrants/role-constrant';
import { PrismaService } from 'src/shared/services/prisma.service';

const prismaService = new PrismaService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  const availableRoutes: [] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = String(
          layer.route?.stack[0].method,
        ).toUpperCase() as keyof typeof HTTPMethod;
        const moduleName = String(path.split('/')[1]).toUpperCase();
        return {
          path,
          method,
          name: method + ' ' + path,
          module: moduleName,
        };
      }
    })
    .filter((item) => item !== undefined);
  const result = await prismaService.permission.createMany({
    data: availableRoutes,
    skipDuplicates: true,
  });

  const updatedPermissions = await prismaService.permission.findMany({
    where: { deletedAt: null },
  });
  const adminRole = await prismaService.role.findFirstOrThrow({
    where: { name: RoleName.Admin, deletedAt: null },
  });
  await prismaService.role.update({
    where: { id: adminRole.id, deletedAt: null },
    data: {
      permissions: { set: updatedPermissions.map((item) => ({ id: item.id })) },
    },
  });
  console.log(result);
  process.exit(0);
}
bootstrap();
