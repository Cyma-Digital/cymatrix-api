-- CreateTable
CREATE TABLE "group" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" INTEGER,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
