-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "toEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);
