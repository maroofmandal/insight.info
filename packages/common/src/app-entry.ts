export type AppEntryDestination =
  | { type: 'organization'; organizationId: string }
  | { type: 'organization-onboarding' };

export function resolveAppEntry(organizations: readonly { id: string }[]): AppEntryDestination {
  const firstOrganization = organizations[0];
  if (!firstOrganization) return { type: 'organization-onboarding' };
  return { type: 'organization', organizationId: firstOrganization.id };
}
