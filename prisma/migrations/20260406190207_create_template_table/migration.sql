-- CreateTable
CREATE TABLE "template" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "preset" JSONB NOT NULL,
    "editable_fields" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" INTEGER,

    CONSTRAINT "template_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
