import type { ImageProps } from '@chakra-ui/react';
import { Box, Center, Image, Skeleton, Icon } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { TbWorldQuestion } from 'react-icons/tb';

interface Props extends ImageProps {
  fallbackSrc?: string;
}

export const LoadingImage = ({ fallbackSrc, src, onError, onLoad, ...props }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
    setLoading(true);
  }, [src]);

  return (
    <Box position="relative" flexShrink="0">
      {(loading || error) && (
        <Center pos="absolute" inset="0">
          {error ? <Icon as={TbWorldQuestion} boxSize="100%" color="#838383" /> : <Skeleton boxSize="90%" />}
        </Center>
      )}
      <Image
        {...props}
        src={currentSrc}
        opacity={loading || error ? 0 : 1}
        onLoad={(event) => {
          setLoading(false);
          onLoad?.(event);
        }}
        onError={(event) => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setError(false);
            setLoading(true);
          } else {
            setError(true);
          }
          onError?.(event);
        }}
      />
    </Box>
  );
};
