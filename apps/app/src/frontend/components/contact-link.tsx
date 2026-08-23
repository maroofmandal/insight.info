import type { LinkProps } from '@chakra-ui/react';
import { Link } from '@chakra-ui/react';
import { BRAND } from '@vemetric/common/brand';

export const ContactLink = (props: LinkProps) => (
  <Link
    href={`mailto:${BRAND.contactEmail}`}
    textDecor="underline"
    textUnderlineOffset="3px"
    transition="opacity 0.2s ease-in-out"
    _hover={{ opacity: 0.7 }}
    {...props}
  />
);
