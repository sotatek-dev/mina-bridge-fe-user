import { StackProps, VStack } from '@chakra-ui/react';
import ProofOfAssetsProvider from './context';
import Content from './content';

export type POAContentWrapperProps = {} & Pick<StackProps, ChakraBoxSizeProps>;

export default function POAContentWrapper({
  ...props
}: POAContentWrapperProps) {
  return (
    <ProofOfAssetsProvider>
      <VStack w={"full"} gap={0} {...props}>
        <Content />
      </VStack>
    </ProofOfAssetsProvider>
  );
}
