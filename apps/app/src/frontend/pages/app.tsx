import { createFileRoute, redirect } from '@tanstack/react-router';
import { resolveAppEntry } from '@vemetric/common/app-entry';
import { SplashScreen } from '@/components/splash-screen';
import { requireAuthentication } from '@/utils/auth-guards';

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    const session = await requireAuthentication();
    const destination = resolveAppEntry(session.organizations);
    if (destination.type === 'organization-onboarding') {
      throw redirect({ to: '/onboarding/organization', search: (search) => search, replace: true });
    }
    throw redirect({
      to: '/o/$organizationId',
      params: { organizationId: destination.organizationId },
      search: (search) => search,
      replace: true,
    });
  },
  pendingComponent: SplashScreen,
  component: () => <SplashScreen />,
});
