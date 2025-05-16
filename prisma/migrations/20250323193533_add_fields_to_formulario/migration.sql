/*
  Warnings:

  - You are about to drop the column `creadoEn` on the `formulario` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `formulario` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `formulario` table. All the data in the column will be lost.
  - Added the required column `fields` to the `Formulario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Formulario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `formulario` DROP COLUMN `creadoEn`,
    DROP COLUMN `descripcion`,
    DROP COLUMN `titulo`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fields` JSON NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
