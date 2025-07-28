/*
  Warnings:

  - Added the required column `familia` to the `Fossil` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fossil" ADD COLUMN     "familia" TEXT NOT NULL;
