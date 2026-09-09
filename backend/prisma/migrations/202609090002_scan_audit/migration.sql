-- CreateTable
CREATE TABLE "ScanEvent" (
    "id" TEXT NOT NULL,
    "clientEventId" TEXT,
    "scannedValueHash" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "suspiciousReason" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "deviceId" TEXT,
    "networkStatus" TEXT NOT NULL DEFAULT 'ONLINE',
    "scannedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "ScanEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScanEvent_clientEventId_key" ON "ScanEvent"("clientEventId");
CREATE INDEX "ScanEvent_userId_scannedAt_idx" ON "ScanEvent"("userId", "scannedAt");
CREATE INDEX "ScanEvent_productId_scannedAt_idx" ON "ScanEvent"("productId", "scannedAt");
CREATE INDEX "ScanEvent_isSuspicious_createdAt_idx" ON "ScanEvent"("isSuspicious", "createdAt");

ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScanEvent" ADD CONSTRAINT "ScanEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
