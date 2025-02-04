'use client';
import { Box, Heading, VStack } from '@chakra-ui/react';
import { MDXProvider } from '@mdx-js/react';

import { useMDXComponents } from '../mdx-components';

import TermContent from '@/markdown/term_of_service.mdx';

export default function TermOfService() {
  const components = useMDXComponents({});

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
            TERMS OF SERVICE
          </Heading>
          <Box bg={'background.modal'} p={{ base: '20px', md: '24px 40px' }}>
            <TermContent />
          </Box>
        </Box>
      </VStack>
    </MDXProvider>
  );
}
