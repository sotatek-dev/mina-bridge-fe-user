'use client';
import { StackProps, VStack } from '@chakra-ui/react';

import NetworkCard from './network.card';

import { NETWORK_KEY } from '@/store/slices/walletSlice';

type Props = Pick<StackProps, ChakraBoxSizeProps>;

export default function NetworkContainer(props: Props) {
  return (
    <VStack w={'full'} {...props}>
      <NetworkCard label={'From'} networkKey={NETWORK_KEY.SRC} />
      <NetworkCard label={'To'} networkKey={NETWORK_KEY.TAR} />
    </VStack>
  );
}
