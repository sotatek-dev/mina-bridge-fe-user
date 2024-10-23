'use client';
import { Image, Text, VStack } from '@chakra-ui/react';

import { Theme } from '@/configs/constants';
import useChakraTheme from '@/hooks/useChakraTheme';

type Props = {};

export default function EmptyData({}: Props) {
  const { colorMode } = useChakraTheme();
  return (
    <VStack
      h={'243px'}
      w={'full'}
      justifyContent={'flex-start'}
      alignItems={'center'}
      gap={'15px'}
    >
      <Image
        src={`assets/images/image.empty-data-${colorMode === Theme.DARK ? 'dark' : 'light'}.svg`}
        w={'123px'}
        h={'110px'}
        mt={'28px'}
      />
      <Text variant={'lg'} color={'text.500'}>
        Not Found
      </Text>
    </VStack>
  );
}
