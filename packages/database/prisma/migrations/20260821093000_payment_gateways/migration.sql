-- CreateEnum
CREATE TYPE "PaymentGatewayProvider" AS ENUM ('PADDLE', 'POLAR');

-- CreateEnum
CREATE TYPE "PaymentGatewayEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTH', 'YEAR');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "billing_info" ADD COLUMN "paymentProvider" "PaymentGatewayProvider" NOT NULL DEFAULT 'PADDLE';

-- CreateTable
CREATE TABLE "payment_gateway" (
    "id" TEXT NOT NULL,
    "provider" "PaymentGatewayProvider" NOT NULL,
    "environment" "PaymentGatewayEnvironment" NOT NULL,
    "displayName" VARCHAR NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "encryptedCredentials" TEXT NOT NULL,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_product" (
    "id" TEXT NOT NULL,
    "paymentGatewayId" TEXT NOT NULL,
    "tierIndex" INTEGER NOT NULL,
    "billingInterval" "BillingInterval" NOT NULL,
    "events" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "externalProductId" VARCHAR NOT NULL,
    "externalPriceId" VARCHAR,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateway_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_provider_environment_key" ON "payment_gateway"("provider", "environment");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_product_paymentGatewayId_tierIndex_billi_key" ON "payment_gateway_product"("paymentGatewayId", "tierIndex", "billingInterval");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_product_paymentGatewayId_externalProduct_key" ON "payment_gateway_product"("paymentGatewayId", "externalProductId");

-- AddForeignKey
ALTER TABLE "payment_gateway_product" ADD CONSTRAINT "payment_gateway_product_paymentGatewayId_fkey" FOREIGN KEY ("paymentGatewayId") REFERENCES "payment_gateway"("id") ON DELETE CASCADE ON UPDATE CASCADE;
