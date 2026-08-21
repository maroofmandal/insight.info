import { dbPaymentGateway } from 'database';
import { z } from 'zod';
import { encryptGatewayCredentials } from '../utils/gateway-credentials';
import { getPaymentGatewayEnvironment } from '../utils/payment-gateway';
import { syncPolarCatalog } from '../utils/polar';
import { platformAdminProcedure, router } from '../utils/trpc';

export const paymentGatewaysRouter = router({
  list: platformAdminProcedure.query(async () => {
    const gateways = await dbPaymentGateway.list(getPaymentGatewayEnvironment());
    return gateways.map(({ encryptedCredentials: _credentials, ...gateway }) => ({
      ...gateway,
      hasCredentials: Boolean(_credentials),
    }));
  }),
  savePolar: platformAdminProcedure
    .input(z.object({ accessToken: z.string().min(1).optional(), enabled: z.boolean(), webhookUrl: z.string().url().optional() }))
    .mutation(async ({ input }) => {
      const environment = getPaymentGatewayEnvironment();
      const existing = await dbPaymentGateway.findByProvider('POLAR', environment);
      if (!existing && !input.accessToken) throw new Error('An access token is required for initial setup');
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
      const result = await syncPolarCatalog(gateway.id, input.webhookUrl);
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
