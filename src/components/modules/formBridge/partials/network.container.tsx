'use client';
import { StackProps, VStack } from '@chakra-ui/react';

import NetworkCard from './network.card';
import NetworkSwitch from './network.switch';

import { NETWORK_KEY } from '@/store/slices/walletSlice';

type Props = Pick<StackProps, ChakraBoxSizeProps>;

export default function NetworkContainer(props: Props) {
  return (
    <VStack w={'full'} {...props}>
      <VStack w={'full'} gap={'0'} position={'relative'}>
        <NetworkCard label={'From'} networkKey={NETWORK_KEY.SRC} />
        <NetworkSwitch
          position={'absolute'}
          bottom={'-2px'}
          left={'50%'}
          zIndex={'10'}
          transform={'translate(-50%,50%)'}
        />
      </VStack>
      <NetworkCard label={'To'} networkKey={NETWORK_KEY.TAR} />
    </VStack>
  );
}
