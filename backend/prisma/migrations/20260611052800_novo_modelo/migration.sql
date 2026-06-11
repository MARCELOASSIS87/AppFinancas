/*
  Warnings:

  - You are about to drop the column `notes` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethodId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `PaymentMethod` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recorrente` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_paymentMethodId_fkey`;

-- DropIndex
DROP INDEX `Transaction_paymentMethodId_fkey` ON `Transaction`;

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Transaction` DROP COLUMN `notes`,
    DROP COLUMN `paymentMethodId`,
    ADD COLUMN `recorrente` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `PaymentMethod`;
