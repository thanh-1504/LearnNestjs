-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "module" VARCHAR(500) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
