import type {
  BillingInterval,
  PaymentGateway,
  PaymentGatewayEnvironment,
  PaymentGatewayProduct,
  PaymentGatewayProvider,
  Prisma,
} from '@prisma/client';
import { prismaClient } from '../client';

export type { BillingInterval, PaymentGateway, PaymentGatewayEnvironment, PaymentGatewayProduct, PaymentGatewayProvider };

const includeProducts = {
  products: { orderBy: [{ tierIndex: 'asc' as const }, { billingInterval: 'asc' as const }] },
} satisfies Prisma.PaymentGatewayInclude;

export const dbPaymentGateway = {
  list: (environment: PaymentGatewayEnvironment) =>
    prismaClient.paymentGateway.findMany({ where: { environment }, include: includeProducts, orderBy: { displayName: 'asc' } }),
  listEnabled: (environment: PaymentGatewayEnvironment) =>
    prismaClient.paymentGateway.findMany({
      where: { environment, enabled: true },
      include: includeProducts,
      orderBy: { displayName: 'asc' },
    }),
  findById: (id: string) =>
    prismaClient.paymentGateway.findUnique({ where: { id }, include: includeProducts }),
  findByProvider: (provider: PaymentGatewayProvider, environment: PaymentGatewayEnvironment) =>
    prismaClient.paymentGateway.findUnique({
      where: { provider_environment: { provider, environment } },
      include: includeProducts,
    }),
  upsert: (data: {
    provider: PaymentGatewayProvider;
    environment: PaymentGatewayEnvironment;
    displayName: string;
    encryptedCredentials: string;
    enabled?: boolean;
    configuration?: Prisma.InputJsonValue;
  }) =>
    prismaClient.paymentGateway.upsert({
      where: { provider_environment: { provider: data.provider, environment: data.environment } },
      create: data,
      update: {
        displayName: data.displayName,
        encryptedCredentials: data.encryptedCredentials,
        enabled: data.enabled,
        configuration: data.configuration,
      },
      include: includeProducts,
    }),
  update: (id: string, data: Prisma.PaymentGatewayUpdateInput) =>
    prismaClient.paymentGateway.update({ where: { id }, data, include: includeProducts }),
  upsertProduct: (data: Omit<PaymentGatewayProduct, 'id' | 'createdAt' | 'updatedAt'>) =>
    prismaClient.paymentGatewayProduct.upsert({
      where: {
        paymentGatewayId_tierIndex_billingInterval: {
          paymentGatewayId: data.paymentGatewayId,
          tierIndex: data.tierIndex,
          billingInterval: data.billingInterval,
        },
      },
      create: data,
      update: data,
    }),
  findProduct: (paymentGatewayId: string, tierIndex: number, billingInterval: BillingInterval) =>
    prismaClient.paymentGatewayProduct.findUnique({
      where: { paymentGatewayId_tierIndex_billingInterval: { paymentGatewayId, tierIndex, billingInterval } },
    }),
  findProductByExternalId: (paymentGatewayId: string, externalProductId: string) =>
    prismaClient.paymentGatewayProduct.findUnique({
      where: { paymentGatewayId_externalProductId: { paymentGatewayId, externalProductId } },
    }),
};
