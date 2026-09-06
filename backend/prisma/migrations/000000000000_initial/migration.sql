-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MANUFACTURER', 'SUPPLIER', 'WAREHOUSE', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('CREATED', 'QUALITY_CHECK', 'MANUFACTURED', 'PACKAGED', 'WAREHOUSE', 'DISTRIBUTED', 'RETAIL', 'IN_TRANSIT', 'DELIVERED', 'SOLD');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productCode" TEXT,
    "batchNumber" TEXT NOT NULL,
    "description" TEXT,
    "qrCode" TEXT NOT NULL,
    "qrImage" TEXT,
    "status" "public"."ProductStatus" NOT NULL,
    "rawMaterialSource" TEXT,
    "supplier" TEXT,
    "processingPlant" TEXT,
    "processingDate" TIMESTAMP(3),
    "qualityCheck" TEXT,
    "packagingUnit" TEXT,
    "packagingDate" TIMESTAMP(3),
    "warehouse" TEXT,
    "distributor" TEXT,
    "retailer" TEXT,
    "location" TEXT,
    "dispatchDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "temperature" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "manufacturerId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trace" (
    "id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "eventDate" TIMESTAMP(3),
    "temperature" DOUBLE PRECISION,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productCode_key" ON "public"."Product"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_batchNumber_key" ON "public"."Product"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Product_qrCode_key" ON "public"."Product"("qrCode");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trace" ADD CONSTRAINT "Trace_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trace" ADD CONSTRAINT "Trace_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
