-- CreateTable
CREATE TABLE "TfaRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TfaRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TfaRequest" ADD CONSTRAINT "TfaRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
