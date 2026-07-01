-- CreateTable
CREATE TABLE "effect" (
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

    CONSTRAINT "effect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_effect" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "effect_id" INTEGER NOT NULL,

    CONSTRAINT "user_effect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_effect_user_id_effect_id_key" ON "user_effect"("user_id", "effect_id");

-- AddForeignKey
ALTER TABLE "effect" ADD CONSTRAINT "effect_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_effect" ADD CONSTRAINT "user_effect_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_effect" ADD CONSTRAINT "user_effect_effect_id_fkey" FOREIGN KEY ("effect_id") REFERENCES "effect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
