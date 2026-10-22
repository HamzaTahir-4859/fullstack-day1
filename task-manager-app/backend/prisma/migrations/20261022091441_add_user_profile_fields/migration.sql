-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatar" TEXT;
ALTER TABLE "User" ADD COLUMN "bio" TEXT DEFAULT 'Full-Stack Developer';
ALTER TABLE "User" ADD COLUMN "name" TEXT DEFAULT 'Hamza';
