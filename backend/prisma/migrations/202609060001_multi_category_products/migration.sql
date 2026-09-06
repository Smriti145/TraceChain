ALTER TABLE "Product"
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN "brand" TEXT,
ADD COLUMN "variant" TEXT,
ADD COLUMN "barcode" TEXT,
ADD COLUMN "netQuantity" DECIMAL(18,3),
ADD COLUMN "unitOfMeasure" TEXT,
ADD COLUMN "countryOfOrigin" TEXT,
ADD COLUMN "expiryDate" TIMESTAMP(3),
ADD COLUMN "attributes" JSONB,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "Product_manufacturerId_createdAt_idx" ON "Product"("manufacturerId", "createdAt");
CREATE INDEX "Trace_productId_eventDate_idx" ON "Trace"("productId", "eventDate");
CREATE INDEX "Trace_updatedById_idx" ON "Trace"("updatedById");
