/*
  Warnings:

  - You are about to drop the column `duration` on the `Job` table. All the data in the column will be lost.
  - Changed the type of `education` on the `Job` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Education" AS ENUM ('Tenth', 'Twelfth', 'Graduation', 'PostGraduation', 'Phd');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "duration",
DROP COLUMN "education",
ADD COLUMN     "education" "Education" NOT NULL;
