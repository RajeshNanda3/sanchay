-- CreateTable
CREATE TABLE "VendorQrCode" (
    "qr_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "title" TEXT,
    "points" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorQrCode_pkey" PRIMARY KEY ("qr_id")
);

-- CreateTable
CREATE TABLE "PointIssueRequest" (
    "request_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "qr_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,

    CONSTRAINT "PointIssueRequest_pkey" PRIMARY KEY ("request_id")
);

-- AddForeignKey
ALTER TABLE "VendorQrCode" ADD CONSTRAINT "VendorQrCode_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointIssueRequest" ADD CONSTRAINT "PointIssueRequest_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointIssueRequest" ADD CONSTRAINT "PointIssueRequest_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointIssueRequest" ADD CONSTRAINT "PointIssueRequest_qr_id_fkey" FOREIGN KEY ("qr_id") REFERENCES "VendorQrCode"("qr_id") ON DELETE RESTRICT ON UPDATE CASCADE;
