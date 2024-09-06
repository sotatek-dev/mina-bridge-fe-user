'use client';
import { ChakraProvider } from "@chakra-ui/react";
import React from "react";

import theme from "@/configs/theme";
import ZKContractProvider from "@/providers/zkBridgeInitalize";

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
      <ZKContractProvider>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </ZKContractProvider>
    </>
  );
};

export default ClientProviders;
