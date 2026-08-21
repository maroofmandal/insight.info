import { Button, Dialog, Field, Input, Stack, Switch, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { toaster } from '@/components/ui/toaster';
import { trpc } from '@/utils/trpc';

export function PaymentGatewayAdminDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [accessToken, setAccessToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(
    typeof window === 'undefined' ? '' : `${window.location.origin}/pg/polar`,
  );
  const [enabled, setEnabled] = useState(false);
  const { data: gateways = [], refetch } = trpc.paymentGateways.list.useQuery(undefined, { enabled: open });
  const polar = gateways.find((gateway) => gateway.provider === 'POLAR');
  useEffect(() => {
    if (polar) setEnabled(polar.enabled);
  }, [polar]);
  const { mutateAsync: save, isLoading } = trpc.paymentGateways.savePolar.useMutation({
    onSuccess: () => toaster.success({ title: 'Polar gateway saved and synchronized' }),
    onError: (error) => toaster.error({ title: 'Polar setup failed', description: error.message }),
  });

  return (
    <Dialog.Root open={open} onOpenChange={({ open: next }) => onOpenChange(next)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="560px">
          <Dialog.Header><Dialog.Title>Payment gateways</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <Stack gap={5}>
              <Text color="fg.muted">Credentials are encrypted before they are stored in the database and are never returned to this screen.</Text>
              <Field.Root>
                <Field.Label>Polar access token {polar?.hasCredentials ? '(leave blank to keep current token)' : ''}</Field.Label>
                <Input type="password" autoComplete="new-password" value={accessToken} onChange={(event) => setAccessToken(event.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Webhook URL</Field.Label>
                <Input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
              </Field.Root>
              <Switch.Root checked={enabled} onCheckedChange={({ checked }) => setEnabled(Boolean(checked))}>
                <Switch.HiddenInput />
                <Switch.Control><Switch.Thumb /></Switch.Control>
                <Switch.Label>Enable Polar checkout</Switch.Label>
              </Switch.Root>
              <Text fontSize="sm" color="fg.muted">Environment: {polar?.environment === 'PRODUCTION' ? 'Production' : 'Sandbox'} · {polar?.products.length ?? 0} synchronized products</Text>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
            <Button colorPalette="purple" loading={isLoading} onClick={async () => {
              await save({ accessToken: accessToken || undefined, enabled, webhookUrl });
              setAccessToken('');
              await refetch();
            }}>Save and sync</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
