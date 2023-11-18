-- DropIndex
DROP INDEX `Invoice_customerId_fkey` ON `invoice`;

-- AlterTable
ALTER TABLE `invoice` MODIFY `date` VARCHAR(60) NOT NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
