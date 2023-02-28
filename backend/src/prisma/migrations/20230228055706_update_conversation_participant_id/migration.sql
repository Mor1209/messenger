/*
  Warnings:

  - The primary key for the `ConversationParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `ConversationParticipant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `body` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "body" TEXT NOT NULL;
