-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_address_id_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_order_id_fkey";

-- AlterTable
ALTER TABLE "order" ALTER COLUMN "address_id" DROP NOT NULL,
ALTER COLUMN "shippingAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_item" ALTER COLUMN "order_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
