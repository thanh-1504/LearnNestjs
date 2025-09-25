-- DropIndex
DROP INDEX "Role_name_key";

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "description" SET DEFAULT '';

  CREATE UNIQUE INDEX role_name_unique
   ON "Role" (name)
   WHERE "deletedAt" IS NULL;


