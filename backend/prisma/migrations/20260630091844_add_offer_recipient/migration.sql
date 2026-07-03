-- CreateTable
CREATE TABLE "OfferRecipient" (
    "offer_recipient_id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "notified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemed_at" TIMESTAMP(3),

    CONSTRAINT "OfferRecipient_pkey" PRIMARY KEY ("offer_recipient_id")
);

-- AddForeignKey
ALTER TABLE "OfferRecipient" ADD CONSTRAINT "OfferRecipient_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "Offer"("offer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferRecipient" ADD CONSTRAINT "OfferRecipient_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
