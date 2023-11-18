/*
  Warnings:

  - You are about to alter the column `date` on the `invoice` table. The data in that column could be lost. The data in that column will be cast from `VarChar(60)` to `Date`.

*/
-- DropIndex
DROP INDEX `Invoice_customerId_fkey` ON `invoice`;

-- AlterTable
ALTER TABLE `invoice` MODIFY `date` DATE NOT NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
