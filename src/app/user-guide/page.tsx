'use client';
import { Box, Heading, VStack } from '@chakra-ui/react';
import { MDXProvider } from '@mdx-js/react';

import { useMDXComponents } from '../mdx-components';

import Introduction from '@/markdown/introduction.mdx';
import UserGuideContent from '@/markdown/user_guide.mdx';

export type SectionType = {
  key: number;
  title: string;
  type: string;
};

export default function UserGuide() {
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
          >
            Introduction
          </Heading>
          <Box bg={'white'} p={{ base: '20px', md: '24px 40px' }}>
            <Introduction />
          </Box>
        </Box>
        <Box>
          <Heading
            as={'h2'}
            variant={'h1'}
            fontSize={{ base: '32px', md: '40px' }}
            mb={'30px'}
            mt={'40px'}
          >
            Guideline For Users
          </Heading>
          <Box bg={'white'} p={{ base: '20px', md: '24px 40px' }}>
            <UserGuideContent />
          </Box>
        </Box>
      </VStack>
    </MDXProvider>
  );
}
