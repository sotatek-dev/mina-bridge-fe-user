'use client';

import { VStack } from '@chakra-ui/layout';
import { Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

// import FormBridge from '@/components/modules/formBridge';
import Faq from '@/components/modules/faq';
import ROUTES, { MDX_REDIRECT } from '@/configs/routes';

const FormBridge = dynamic(() => import('@/components/modules/formBridge'), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();

  const handleReadMore = () => {
    window.open(`${ROUTES.USER_GUIDE}#${MDX_REDIRECT}`, '_blank');
  };

  useEffect(() => {
    router.prefetch(`${ROUTES.USER_GUIDE}#${MDX_REDIRECT}`);
  }, []);

  return (
    <VStack
      w={'full'}
      pb={{ base: '80px', lg: '110px' }}
      pt={{ base: '0', md: '20px' }}
      gap={'0'}
    >
      <FormBridge />
      <VStack
        maxW={'500px'}
        w={'full'}
        mt={'16px'}
        px={'50px'}
        py={'15px'}
        gap={0}
        bg={'background.0'}
        borderRadius={'12px'}
        boxShadow={'0px 4px 50px 0px rgba(0, 0, 0, 0.05)'}
      >
        <Link href={ROUTES.PROOF_OF_ASSETS} className={'form-link'}>
          <Text
            as={'span'}
            variant={'md_bold'}
            color={'primary.purple'}
            sx={{
              '.form-link:hover &': {
                textDecor: 'underline',
                color: 'primary.purple.05',
              },
            }}
          >
            View proof of assets
          </Text>
        </Link>
        <Link href={ROUTES.USER_GUIDE} className={'form-link'}>
          <Text
            as={'span'}
            variant={'md_bold'}
            color={'primary.purple'}
            sx={{
              '.form-link:hover &': {
                textDecor: 'underline',
                color: 'primary.purple.05',
              },
            }}
          >
            User guide
          </Text>
        </Link>
        <Text
          cursor={'pointer'}
          onClick={handleReadMore}
          as={'span'}
          variant={'md_bold'}
          color={'primary.purple'}
          _hover={{ textDecor: 'underline', color: 'primary.purple.05' }}
        >
          Fee information
        </Text>
      </VStack>
      <Faq />
    </VStack>
  );
}
