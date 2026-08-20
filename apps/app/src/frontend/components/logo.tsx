import type { IconProps } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useCurrentOrganization } from '@/hooks/use-current-organization';

interface Props extends IconProps {
  hideText?: boolean;
  asLink?: boolean;
}

export const Logo = ({ hideText = false, asLink = true, ...props }: Props) => {
  const id = useId();
  const gradientId = `${id}-insight-gradient`;
  const logo = (
    <Icon asChild width="auto" height="44px" fill="none" color="logo" aria-label="Insight.info" {...props}>
      <svg viewBox={hideText ? '0 0 256 256' : '0 0 850 256'} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="42" y1="35" x2="216" y2="224" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <path
          d="M21 128C52 76 91 48 128 48s76 28 107 80c-31 52-70 80-107 80S52 180 21 128Z"
          fill={`url(#${gradientId})`}
        />
        <circle cx="128" cy="128" r="52" fill="white" fillOpacity="0.95" />
        <circle cx="128" cy="94" r="10" fill="#7c3aed" />
        <rect x="117" y="113" width="22" height="58" rx="11" fill="#7c3aed" />
        {!hideText && (
          <text
            x="278"
            y="166"
            fill="currentColor"
            fontFamily="Inter, ui-sans-serif, system-ui"
            fontSize="112"
            fontWeight="750"
            letterSpacing="-6"
          >
            Insight<tspan fill="#7c3aed">.info</tspan>
          </text>
        )}
      </svg>
    </Icon>
  );

  const { organizationId, firstOrganization } = useCurrentOrganization();
  const resolvedOrganizationId = organizationId || firstOrganization?.id;
  if (asLink && resolvedOrganizationId) {
    return (
      <Link to="/o/$organizationId" params={{ organizationId: resolvedOrganizationId }} aria-label="Open dashboard">
        {logo}
      </Link>
    );
  }
  return logo;
};
