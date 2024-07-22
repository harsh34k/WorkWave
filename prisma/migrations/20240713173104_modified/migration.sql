/*
  Warnings:

  - The values [Tenth,Twelfth,Graduation,PostGraduation,Phd] on the enum `Education` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Education_new" AS ENUM ('TENTH', 'TWELFTH', 'GRADUATION', 'POSTGRADUATION', 'PHD');
ALTER TABLE "Job" ALTER COLUMN "education" TYPE "Education_new" USING ("education"::text::"Education_new");
ALTER TYPE "Education" RENAME TO "Education_old";
ALTER TYPE "Education_new" RENAME TO "Education";
DROP TYPE "Education_old";
COMMIT;
