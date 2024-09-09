import { Heading, VStack } from '@chakra-ui/react';

import Content from './content';
import ProofOfAssetsProvider from './context';

const ProofOfAsset = () => {
  return (
    <ProofOfAssetsProvider>
      <VStack
        w={'full'}
        // h={'full'}
        // style={{ height: 'calc(100vh - 70px)' }}
        alignItems={'flex-start'}
        mt={'40px'}
        gap={'30px'}
      >
        <Heading as={'h1'} variant={'h1'} color={'text.900'}>
          Proof of asset
        </Heading>
        <VStack w={'full'} gap={0}>
          <Content />
        </VStack>
      </VStack>
    </ProofOfAssetsProvider>
  );
};

export default ProofOfAsset;
