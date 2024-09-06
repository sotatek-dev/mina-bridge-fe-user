'use client';
import { HStack, Image, StackProps, Text } from '@chakra-ui/react';

type Props = { isDisplayed: boolean } & Pick<StackProps, ChakraBoxSizeProps>;

export default function WarningDefault({ isDisplayed, ...props }: Props) {
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
      <Text variant={'md'} color={'primary.orange'}>
        Your destination address will be your receiving address, please switch
        the network to check your balance after completion.
      </Text>
    </HStack>
  ) : null;
}
