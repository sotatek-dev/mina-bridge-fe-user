'use client';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { Provider } from 'react-redux';

import theme from '@/configs/theme';
import ZKContractProvider from '@/providers/zkBridgeInitalize';
import { store } from '@/store';

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const cookies = Cookie.get('isConnected', context.req.headers.cookie);

//   if (cookies !== 'true') {
//     return {
//       redirect: {
//         destination: '/',
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {},
//   };
// };

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
