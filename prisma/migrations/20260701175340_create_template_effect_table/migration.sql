-- CreateTable
CREATE TABLE "template_effect" (
    "id" SERIAL NOT NULL,
    "effect_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,

    CONSTRAINT "template_effect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "template_effect_effect_id_template_id_key" ON "template_effect"("effect_id", "template_id");

-- AddForeignKey
ALTER TABLE "template_effect" ADD CONSTRAINT "template_effect_effect_id_fkey" FOREIGN KEY ("effect_id") REFERENCES "effect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_effect" ADD CONSTRAINT "template_effect_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
