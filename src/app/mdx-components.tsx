import { Link } from '@chakra-ui/next-js';
import { Flex, Heading, Image, Text } from '@chakra-ui/react';
import type { MDXComponents } from 'mdx/types';

import { getPxFromUrl } from '@/helpers/common';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    strong: ({ children }) => (
      <Text display={'inline-block'} color={'text.700'} fontWeight={'bold'}>
        {children}
      </Text>
    ),
    h5: ({ children }) => (
      <Heading
        as={'h5'}
        variant={'h5'}
        color={'text.700'}
        fontSize={'18px'}
        fontWeight={'bold'}
        mt={'8px'}
      >
        {children}
      </Heading>
    ),
    h4: ({ children }) => (
      <Heading as={'h4'} variant={'h4'} color={'text.700'}>
        {children}
      </Heading>
    ),
    h3: ({ children }) => (
      <Heading as={'h3'} variant={'h3'} color={'text.700'}>
        {children}
      </Heading>
    ),
    p: ({ children }) => (
      <Text py={'10px'} variant={'xl'} color={'text.700'}>
        {children}
      </Text>
    ),
    img: (props) => (
      <Flex w={'full'} justifyContent={'center'}>
        <Image
          width={getPxFromUrl(props.src)}
          border={'1px solid'}
          borderColor={'text.200'}
          {...props}
        />
      </Flex>
    ),
    ul: ({ children }) => <ul style={{ marginBottom: '8px' }}>{children}</ul>,
    li: ({ children }) => <li style={{ marginLeft: '30px' }}>{children}</li>,
    a: ({ href, children, ...props }) => (
      <Link href={href || '/'} color={'blue.500'} {...props}>
        {children}
      </Link>
    ),
    hr: ({}) => <hr style={{ margin: '30px 0' }} />,

    ...components,
  };
}
