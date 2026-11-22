CREATE TYPE "PaperMarginMode" AS ENUM ('ISOLATED');

ALTER TABLE "paper_accounts"
ADD COLUMN "marginMode" "PaperMarginMode";
