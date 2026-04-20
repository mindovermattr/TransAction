CREATE TYPE "AccountType" AS ENUM ('cash', 'debit', 'savings', 'credit');

CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'debit',
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "opening_balance" INTEGER NOT NULL DEFAULT 0,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transfer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "user_id" INTEGER NOT NULL,
    "from_account_id" INTEGER NOT NULL,
    "to_account_id" INTEGER NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Transaction" ADD COLUMN "account_id" INTEGER;
ALTER TABLE "Income" ADD COLUMN "account_id" INTEGER;

INSERT INTO "Account" ("name", "type", "currency", "opening_balance", "is_archived", "user_id", "updatedAt")
SELECT 'Основной счет', 'debit', 'RUB', 0, false, "id", CURRENT_TIMESTAMP
FROM "User";

UPDATE "Transaction" AS t
SET "account_id" = a."id"
FROM "Account" AS a
WHERE a."user_id" = t."user_id"
  AND a."name" = 'Основной счет'
  AND t."account_id" IS NULL;

UPDATE "Income" AS i
SET "account_id" = a."id"
FROM "Account" AS a
WHERE a."user_id" = i."user_id"
  AND a."name" = 'Основной счет'
  AND i."account_id" IS NULL;

ALTER TABLE "Transaction" ALTER COLUMN "account_id" SET NOT NULL;
ALTER TABLE "Income" ALTER COLUMN "account_id" SET NOT NULL;

CREATE INDEX "Account_user_id_idx" ON "Account"("user_id");
CREATE INDEX "Transaction_account_id_idx" ON "Transaction"("account_id");
CREATE INDEX "Transaction_user_id_idx" ON "Transaction"("user_id");
CREATE INDEX "Income_account_id_idx" ON "Income"("account_id");
CREATE INDEX "Income_user_id_idx" ON "Income"("user_id");
CREATE INDEX "Transfer_user_id_idx" ON "Transfer"("user_id");
CREATE INDEX "Transfer_from_account_id_idx" ON "Transfer"("from_account_id");
CREATE INDEX "Transfer_to_account_id_idx" ON "Transfer"("to_account_id");

ALTER TABLE "Account"
ADD CONSTRAINT "Account_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Income"
ADD CONSTRAINT "Income_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_from_account_id_fkey"
FOREIGN KEY ("from_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transfer"
ADD CONSTRAINT "Transfer_to_account_id_fkey"
FOREIGN KEY ("to_account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
