import { createFileRoute, redirect } from '@tanstack/react-router';
import { getLegacyPublicDashboardRedirect } from '@vemetric/common/public-dashboard';

export const Route = createFileRoute('/public/$domain')({
  beforeLoad: ({ params, location }) => {
    throw redirect({ href: getLegacyPublicDashboardRedirect(params.domain, location.searchStr), replace: true });
  },
});
