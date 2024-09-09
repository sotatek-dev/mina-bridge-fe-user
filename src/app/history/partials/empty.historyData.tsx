'use client';
import { Box, Heading, Image, VStack } from '@chakra-ui/react';

type Props = {};

export default function EmptyHistoryData({}: Props) {
  return (
    <VStack w={'full'} justifyContent={'center'} mt={'66px'}>
      <Box w={{ base: '345px', md: '490px' }}>
        <Image w={'full'} src={'/assets/images/image.empty-history.svg'} />
      </Box>
      <Heading
        as={'h3'}
        variant={'h3'}
        fontSize={{ base: '16px', md: '24px' }}
        mt={'25px'}
        color={'text.500'}
      >
        Sorry! No transaction has been made
      </Heading>
    </VStack>
  );
}
