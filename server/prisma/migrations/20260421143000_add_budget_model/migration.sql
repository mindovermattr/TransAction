CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "month_start" TIMESTAMP(3) NOT NULL,
    "tag" "TransactionTag" NOT NULL,
    "limit" INTEGER NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Budget_user_id_idx" ON "Budget"("user_id");
CREATE INDEX "Budget_user_id_month_start_idx" ON "Budget"("user_id", "month_start");
CREATE INDEX "Budget_user_id_tag_month_start_is_archived_idx" ON "Budget"("user_id", "tag", "month_start", "is_archived");
CREATE UNIQUE INDEX "Budget_active_unique_idx" ON "Budget"("user_id", "tag", "month_start") WHERE "is_archived" = false;

ALTER TABLE "Budget"
ADD CONSTRAINT "Budget_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
