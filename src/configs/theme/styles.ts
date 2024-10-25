import { StyleProps } from '@chakra-ui/react';

const styles: Record<string, Record<string, StyleProps>> = {
  global: {
    body: {
      transition: 'all 0.3s ease-in-out',
    },
    '::-webkit-scrollbar': {
      w: '5px',
      bgColor: 'transparent',
      h: '5px',
    },
    '::-webkit-scrollbar-thumb': {
      bgColor: 'var(--text-300)',
      borderRadius: '5px',
    },
    '::-webkit-scrollbar-track': {
      w: '0',
    },
  },
};

export default styles;
