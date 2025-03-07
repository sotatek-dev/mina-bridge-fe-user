'use client';
import { Box, Heading, VStack } from '@chakra-ui/react';
import { MDXProvider } from '@mdx-js/react';
import { useEffect } from 'react';

import { useMDXComponents } from '../mdx-components';

import { MDX_REDIRECT, MINA_SERCURITY_DIAGRAM } from '@/configs/routes';
import AdditionalInformation from '@/markdown/additional_information.mdx';
import Introduction from '@/markdown/introduction.mdx';
import SercurityDiagram from '@/markdown/sercurity_diagram.mdx';
import UserGuideContent from '@/markdown/user_guide.mdx';

export type SectionType = {
  key: number;
  title: string;
  type: string;
};

export default function UserGuide() {
  const components = useMDXComponents({});

  useEffect(() => {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;

    // Waiting for all image to load successfully
    const handleImageLoad = () => {
      loadedCount += 1;
      if (loadedCount === images.length) {
        const hash = window.location.hash;
        if (hash === `#${MDX_REDIRECT}`) {
          const element = document.getElementById(MDX_REDIRECT);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
        if (hash === `#${MINA_SERCURITY_DIAGRAM}`) {
          const element = document.getElementById(MINA_SERCURITY_DIAGRAM);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });

    return () => {
      images.forEach((img) => img.removeEventListener('load', handleImageLoad));
    };
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
            Introduction
          </Heading>
          <Box bg={'background.modal'} p={{ base: '20px', md: '24px 40px' }}>
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
            color={'text.900'}
          >
            Guideline For Users
          </Heading>
          <Box bg={'background.modal'} p={{ base: '20px', md: '24px 40px' }}>
            <UserGuideContent />
          </Box>
        </Box>
        <Box>
          <Heading
            as={'h2'}
            variant={'h1'}
            fontSize={{ base: '32px', md: '40px' }}
            mb={'30px'}
            mt={'40px'}
            color={'text.900'}
          >
            Additional Information
          </Heading>
          <Box bg={'background.modal'} p={{ base: '20px', md: '24px 40px' }}>
            <AdditionalInformation />
          </Box>
        </Box>
        <Box w={'full'} id={MINA_SERCURITY_DIAGRAM}>
          <Heading
            as={'h2'}
            variant={'h1'}
            fontSize={{ base: '32px', md: '40px' }}
            mb={'30px'}
            mt={'40px'}
            color={'text.900'}
          >
            Mina Sercurity Diagram
          </Heading>
          <Box bg={'background.modal'} p={{ base: '20px', md: '24px 40px' }}>
            <SercurityDiagram />
          </Box>
        </Box>
      </VStack>
    </MDXProvider>
  );
}
