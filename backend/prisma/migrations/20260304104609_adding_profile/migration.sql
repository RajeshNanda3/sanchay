-- CreateTable
CREATE TABLE "UserProfile" (
    "profile_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "age" INTEGER,
    "avatar" TEXT,
    "address_at" TEXT,
    "address_po" TEXT,
    "address_market" TEXT,
    "address_dist" TEXT,
    "address_pin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "VendorProfile" (
    "vendor_profile_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "category" TEXT,
    "market_name" TEXT,
    "deals_with" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "address_at" TEXT,
    "address_po" TEXT,
    "address_market" TEXT,
    "address_dist" TEXT,
    "address_pin" TEXT,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("vendor_profile_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "UserProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_vendor_id_key" ON "VendorProfile"("vendor_id");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
