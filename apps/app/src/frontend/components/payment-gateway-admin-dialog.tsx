import { Button, Field, Input, NativeSelect, Stack, Switch, Text } from '@chakra-ui/react';
import { BRAND } from '@vemetric/common/brand';
import { useEffect, useState } from 'react';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { toaster } from '@/components/ui/toaster';
import { trpc } from '@/utils/trpc';

type PaymentGatewayEnvironment = 'SANDBOX' | 'PRODUCTION';

const getDefaultEnvironment = (): PaymentGatewayEnvironment =>
  typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'SANDBOX' : 'PRODUCTION';

const getDefaultWebhookUrl = (environment: PaymentGatewayEnvironment) => {
  if (typeof window === 'undefined') return '';
  if (environment === 'PRODUCTION' && window.location.hostname.includes('localhost')) {
    return `${BRAND.siteUrl}/pg/polar`;
  }
  return `${window.location.origin}/pg/polar`;
};

export function PaymentGatewayAdminDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [environment, setEnvironment] = useState<PaymentGatewayEnvironment>(getDefaultEnvironment);
  const [accessToken, setAccessToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(() => getDefaultWebhookUrl(getDefaultEnvironment()));
  const [enabled, setEnabled] = useState(false);
  const { data: gateways = [], refetch } = trpc.paymentGateways.list.useQuery({ environment }, { enabled: open });
  const polar = gateways.find((gateway) => gateway.provider === 'POLAR');
  useEffect(() => {
    setEnabled(polar?.enabled ?? false);
  }, [environment, polar]);
  const { mutateAsync: save, isLoading } = trpc.paymentGateways.savePolar.useMutation({
    onSuccess: () => toaster.success({ title: 'Polar gateway saved and synchronized' }),
    onError: (error) => toaster.error({ title: 'Polar setup failed', description: error.message }),
  });

  return (
    <DialogRoot open={open} onOpenChange={({ open: next }) => onOpenChange(next)}>
      <DialogContent maxW={{ base: 'calc(100vw - 24px)', md: '560px' }}>
        <DialogHeader>
          <DialogTitle>Payment gateways</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack gap={5}>
            <Text color="fg.muted">
              Credentials are encrypted before they are stored in the database and are never returned to this screen.
            </Text>
            <Field.Root>
              <Field.Label>Polar environment</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  aria-label="Polar environment"
                  value={environment}
                  onChange={(event) => {
                    const nextEnvironment = event.target.value as PaymentGatewayEnvironment;
                    setWebhookUrl((currentUrl) =>
                      currentUrl === getDefaultWebhookUrl(environment)
                        ? getDefaultWebhookUrl(nextEnvironment)
                        : currentUrl,
                    );
                    setEnvironment(nextEnvironment);
                    setAccessToken('');
                  }}
                >
                  <option value="SANDBOX">Sandbox (test payments)</option>
                  <option value="PRODUCTION">Production (live payments)</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Field.HelperText>
                {environment === 'SANDBOX'
                  ? 'Use an access token created in Polar Sandbox.'
                  : 'Use an access token created in Polar Production. Live charges are possible when enabled.'}
              </Field.HelperText>
            </Field.Root>
            <Field.Root>
              <Field.Label>
                Polar access token {polar?.hasCredentials ? '(leave blank to keep current token)' : ''}
              </Field.Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={accessToken}
                onChange={(event) => setAccessToken(event.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Webhook URL</Field.Label>
              <Input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
            </Field.Root>
            <Switch.Root checked={enabled} onCheckedChange={({ checked }) => setEnabled(Boolean(checked))}>
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label>Enable Polar checkout</Switch.Label>
            </Switch.Root>
            <Text fontSize="sm" color="fg.muted">
              {polar?.products.length ?? 0} synchronized products
            </Text>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            colorPalette="purple"
            loading={isLoading}
            onClick={async () => {
              await save({ accessToken: accessToken || undefined, enabled, environment, webhookUrl });
              setAccessToken('');
              await refetch();
            }}
          >
            Save and sync
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
