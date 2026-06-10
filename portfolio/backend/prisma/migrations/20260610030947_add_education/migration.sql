-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "grade" TEXT,
    "activities" TEXT,
    "description" TEXT,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "logoUrl" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);
