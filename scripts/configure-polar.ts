import { dbPaymentGateway, prismaClient, type PaymentGatewayEnvironment } from 'database';
import { encryptGatewayCredentials } from '../apps/app/src/backend/utils/gateway-credentials';
import { syncPolarCatalog } from '../apps/app/src/backend/utils/polar';

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, '').split('=');
    return [key, value.join('=') || 'true'];
  }),
);
const environment = (args.get('environment')?.toUpperCase() ?? 'SANDBOX') as PaymentGatewayEnvironment;
if (!['SANDBOX', 'PRODUCTION'].includes(environment)) throw new Error('Use --environment=sandbox or production');
const webhookUrl = args.get('webhook-url');
const enabled = args.get('enable') === 'true';

process.stdout.write(`Paste the Polar ${environment.toLowerCase()} access token, then press Enter: `);
const accessToken = (await Bun.stdin.text()).trim();
if (!accessToken) throw new Error('No Polar access token received');

try {
  const gateway = await dbPaymentGateway.upsert({
    provider: 'POLAR',
    environment,
    displayName: 'Polar',
    encryptedCredentials: encryptGatewayCredentials({ accessToken }),
    enabled: false,
    configuration: {},
  });
  const result = await syncPolarCatalog(gateway.id, webhookUrl);
  await dbPaymentGateway.update(gateway.id, { enabled });
  console.log(`\nPolar ${environment.toLowerCase()} configured: ${result.products} products, webhook ${result.webhookConfigured ? 'configured' : 'not requested'}, gateway ${enabled ? 'enabled' : 'disabled'}.`);
} finally {
  await prismaClient.$disconnect();
}
