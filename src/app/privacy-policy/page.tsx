'use client';
import { Box, Heading, VStack } from '@chakra-ui/react';
import { MDXProvider } from '@mdx-js/react';
import { useEffect } from 'react';

import { useMDXComponents } from '../mdx-components';

import PrivacyContent from '@/markdown/privacy_policy.mdx';

export default function PricacyPolicy() {
  const components = useMDXComponents({});

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) return;
    const element = document?.querySelector(hash);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <MDXProvider components={components}>
      <VStack alignItems={'flex-start'} mb={'40px'}>
        <Box>
          <Heading
            as={'h2'}
            variant={'h1'}
            fontSize={{ base: '32px', md: '40px' }}
            mb={'30px'}
            mt={'40px'}
            color={'text.900'}
          >
            PRIVACY POLICY
          </Heading>
          <Box bg={'background.modal'} p={{ base: '20px', md: '24px 40px' }}>
            <PrivacyContent />
          </Box>
        </Box>
      </VStack>
    </MDXProvider>
  );
}
