import { TRPCError } from '@trpc/server';
import { dbPaymentGateway } from 'database';
import { z } from 'zod';
import { encryptGatewayCredentials } from '../utils/gateway-credentials';
import { getPaymentGatewayEnvironment, getPolarSetupErrorMessage } from '../utils/payment-gateway';
import { syncPolarCatalog, validatePolarAccessToken } from '../utils/polar';
import { platformAdminProcedure, router } from '../utils/trpc';

const paymentGatewayEnvironmentSchema = z.enum(['SANDBOX', 'PRODUCTION']);

export const paymentGatewaysRouter = router({
  list: platformAdminProcedure
    .input(z.object({ environment: paymentGatewayEnvironmentSchema }).optional())
    .query(async ({ input }) => {
      const gateways = await dbPaymentGateway.list(input?.environment ?? getPaymentGatewayEnvironment());
      return gateways.map(({ encryptedCredentials: _credentials, ...gateway }) => ({
        ...gateway,
        hasCredentials: Boolean(_credentials),
      }));
    }),
  savePolar: platformAdminProcedure
    .input(
      z.object({
        accessToken: z.string().trim().min(1).optional(),
        enabled: z.boolean(),
        environment: paymentGatewayEnvironmentSchema,
        webhookUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const environment = input.environment;
      const existing = await dbPaymentGateway.findByProvider('POLAR', environment);
      if (!existing && !input.accessToken) throw new Error('An access token is required for initial setup');

      if (input.accessToken) {
        try {
          await validatePolarAccessToken(input.accessToken, environment);
        } catch (error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: getPolarSetupErrorMessage(error, environment) });
        }
      }

      const gateway = await dbPaymentGateway.upsert({
        provider: 'POLAR',
        environment,
        displayName: 'Polar',
        encryptedCredentials: input.accessToken
          ? encryptGatewayCredentials({ accessToken: input.accessToken })
          : existing!.encryptedCredentials,
        enabled: false,
        configuration: existing?.configuration ?? {},
      });
      let result;
      try {
        result = await syncPolarCatalog(gateway.id, input.webhookUrl);
      } catch (error) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: getPolarSetupErrorMessage(error, environment) });
      }
      await dbPaymentGateway.update(gateway.id, { enabled: input.enabled });
      return result;
    }),
  setEnabled: platformAdminProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean() }))
    .mutation(({ input }) => dbPaymentGateway.update(input.id, { enabled: input.enabled })),
  sync: platformAdminProcedure
    .input(z.object({ id: z.string(), webhookUrl: z.string().url().optional() }))
    .mutation(({ input }) => syncPolarCatalog(input.id, input.webhookUrl)),
});
