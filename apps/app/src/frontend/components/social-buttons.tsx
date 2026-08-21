import { Box, Button, Icon } from '@chakra-ui/react';
import { TbMail } from 'react-icons/tb';

export const SocialButtons = () => {
  return (
    <Button
      asChild
      size="2xs"
      rounded="full"
      className="group"
      display="flex"
      alignItems="center"
      gap="0"
      px="1"
      variant="surface"
    >
      <a href="mailto:info@insight.info">
        <Icon as={TbMail} transition="all .3s ease-in-out" _groupHover={{ transform: 'rotate(-20deg)' }} />
        <Box
          overflow="hidden"
          textAlign="right"
          whiteSpace="nowrap"
          opacity="0"
          w="0px"
          _groupHover={{ w: '78px', opacity: '1' }}
          transition="all .3s ease-in-out"
        >
          Contact
        </Box>
      </a>
    </Button>
  );
};
