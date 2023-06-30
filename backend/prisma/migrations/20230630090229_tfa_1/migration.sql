-- CreateTable
CREATE TABLE "TfaRegistration" (
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TfaRegistration_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "TfaRegistration" ADD CONSTRAINT "TfaRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
