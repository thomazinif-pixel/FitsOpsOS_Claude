/*
  Warnings:

  - Added the required column `nome` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('COO', 'MANAGER', 'ANALYST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- AlterTable
ALTER TABLE "kpis" ADD COLUMN     "department_id" TEXT,
ADD COLUMN     "owner_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cargo" "Cargo" NOT NULL DEFAULT 'ANALYST',
ADD COLUMN     "nome" TEXT NOT NULL DEFAULT 'Usuário',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "ultimo_login" TIMESTAMP(3);

-- Update existing users with meaningful names
UPDATE "users" SET "nome" = 'Admin Fitbank' WHERE "email" = 'admin@fitbank.com';
UPDATE "users" SET "nome" = 'Viewer Fitbank' WHERE "email" = 'viewer@fitbank.com';

-- Remove the default after populating
ALTER TABLE "users" ALTER COLUMN "nome" DROP DEFAULT;

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_nome_key" ON "departments"("nome");

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
