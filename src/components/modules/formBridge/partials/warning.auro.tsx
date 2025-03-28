'use client';
import { HStack, Image, StackProps, Text, VStack } from '@chakra-ui/react';

type Props = { isDisplayed: boolean } & Pick<StackProps, ChakraBoxSizeProps>;

export default function WarningAuro({ isDisplayed, ...props }: Props) {
  return isDisplayed ? (
    <HStack
      alignItems={'flex-start'}
      bg={'primary.orange.01'}
      gap={'10px'}
      p={'15px 20px'}
      borderRadius={'8px'}
      {...props}
    >
      <Image src={'/assets/icons/icon.alert.circle.orange.svg'} />
      <VStack alignItems={'flex-start'} gap={0}>
        <Text variant={'md'} fontWeight={'bold'} color={'primary.orange'}>
          Only AURO wallet supports bridged tokens
        </Text>
        <Text variant={'md'} color={'primary.orange'}>
          Using other wallets or exchange addresses may make your tokens
          inaccessible.
        </Text>
      </VStack>
    </HStack>
  ) : null;
}
