'use client';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import theme from '@/configs/theme';
import ZKContractProvider from '@/providers/zkBridgeInitalize';

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Provider store={store}>
        <ZKContractProvider>
          <ChakraProvider theme={theme}>{children}</ChakraProvider>
        </ZKContractProvider>
      </Provider>
    </>
  );
};

export default ClientProviders;
