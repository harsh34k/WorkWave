/*
  Warnings:

  - The values [ONE_YEAR,TWO_YEARS,THREE_YEARS,FOUR_YEARS,FIVE_YEARS] on the enum `Experience` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Experience_new" AS ENUM ('FRESHER', 'ONE_TO_TWO_YEARS', 'TWO_TO_THREE_YEARS', 'THREE_TO_FOUR_YEARS', 'FOUR_TO_FIVE_YEARS', 'ABOVE_FIVE_YEARS');
ALTER TABLE "Job" ALTER COLUMN "experience" TYPE "Experience_new" USING ("experience"::text::"Experience_new");
ALTER TYPE "Experience" RENAME TO "Experience_old";
ALTER TYPE "Experience_new" RENAME TO "Experience";
DROP TYPE "Experience_old";
COMMIT;
