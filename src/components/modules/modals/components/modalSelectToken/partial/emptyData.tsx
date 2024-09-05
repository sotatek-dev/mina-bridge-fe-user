'use client';
import { Image, Text, VStack } from '@chakra-ui/react';

type Props = {};

export default function EmptyData({}: Props) {
  return (
    <VStack
      h={'243px'}
      w={'full'}
      justifyContent={'flex-start'}
      alignItems={'center'}
      gap={'15px'}
    >
      <Image
        src={'assets/images/image.empty-data.svg'}
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
