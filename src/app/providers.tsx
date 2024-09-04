'use client';
import Loading from '@/components/elements/loading/spinner';
import ZKContractProvider from '@/providers/zkBridgeInitalize';
import { persistor, store } from '@/store';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import theme from '@/configs/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          loading={<Loading id={'main_screen_loading'} />}
        >
          <ZKContractProvider>{children}</ZKContractProvider>
        </PersistGate>
      </Provider>
    </ChakraProvider>
  );
}
