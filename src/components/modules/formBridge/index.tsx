'use client';
import { Box, Text } from '@chakra-ui/react';

import FormBridgeContent from './content';
import FormBridgeProvider from './context';
import FormDailyQuota from './partials/form.dailyQuota';

export type FormBridgeProps = {};

export default function FormBridge({}: FormBridgeProps) {
  return (
    <FormBridgeProvider>
      <Box
        maxW={'500px'}
        w={'full'}
        mt={{ base: '15px', md: '20px' }}
        px={{ base: '20px', md: '50px' }}
        py={'32px'}
        bg={'background.0'}
        borderRadius={'20px'}
        boxShadow={'0px 4px 50px 0px rgba(0, 0, 0, 0.05)'}
      >
        <FormBridgeContent />
      </Box>
    </FormBridgeProvider>
  );
}
