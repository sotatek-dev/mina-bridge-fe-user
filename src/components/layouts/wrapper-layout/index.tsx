'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import ROUTES from '@/configs/routes';
import { usePathname } from 'next/navigation';
import LoadingWithText from '@/components/elements/loading/spinner.text';
import { Box, Center, Container } from '@chakra-ui/react';
import UnmatchedChain from '@/components/layouts/banners/unmatchedChain';
import useInitPersistData from '@/hooks/useInitPersistData';
import useChakraTheme from '@/hooks/useChakraTheme';
import useDeviceCheck from '@/hooks/useDeviceCheck';
import Header from '@/components/layouts/header';
import Modals from '@/components/modules/modals';
import NotiReporter from '@/components/modules/notiReporter';
import useWeb3Injected from '@/hooks/useWeb3Injected';
import useLoadWalletInstances from '@/hooks/useLoadWalletInstances';
import useWalletEvents from '@/hooks/useWalletEvents';
import { useZKContractState } from '@/providers/zkBridgeInitalize';

type Props = PropsWithChildren<{}>;

function WrapperLayout({ children }: Props) {
  useWeb3Injected();
  useLoadWalletInstances();
  useInitPersistData();
  useChakraTheme();
  useWalletEvents();
  useDeviceCheck();

  const pathname = usePathname();
  const { isInitializing } = useZKContractState().state;
  const isNotPOAScreen = pathname !== ROUTES.PROOF_OF_ASSETS;
  const isNotHistoryScreen = pathname !== ROUTES.HISTORY;
  const isNotUserGuide = pathname !== ROUTES.USER_GUIDE;
  const isNotHomeScreen = pathname !== ROUTES.HOME;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div id={'wrapper-layout'}>
      {isInitializing || !isClient ? (
        <LoadingWithText
          id={'zk_contract_initialize_loading'}
          label={'Waiting for initialize instances'}
        />
      ) : (
        <>
          <Header />
          <Box
            as={'section'}
            w={'full'}
            h={'full'}
            bgColor={'text.100'}
            bgImage={
              isNotPOAScreen && isNotHistoryScreen && isNotUserGuide
                ? 'url("/assets/images/image.main-bg.jpg")'
                : ''
            }
            bgSize={'cover'}
            bgPosition={'left top'}
            bgRepeat={'no-repeat'}
            bgAttachment={'fixed'}
            overflow={'auto'}
          >
            {!isNotHomeScreen && <UnmatchedChain />}
            <Container
              maxW={{
                sm: 'container.sm',
                md: 'container.md',
                lg: 'container.lg',
                xl: 'container.xl',
              }}
            >
              <Center w={'full'}>{children}</Center>
            </Container>
          </Box>
        </>
      )}
      <Modals />
      <NotiReporter />
    </div>
  );
}

export default WrapperLayout;
