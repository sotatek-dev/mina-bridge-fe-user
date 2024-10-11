'use client';
import { Box, Center, Container } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

import LoadingWithText from '@/components/elements/loading/spinner.text';
import UnmatchedChain from '@/components/layouts/banners/unmatchedChain';
import Header from '@/components/layouts/header';
import Modals from '@/components/modules/modals';
import NotiReporter from '@/components/modules/notiReporter';
import ROUTES, { PROTECTED_ROUTES } from '@/configs/routes';
import useChakraTheme from '@/hooks/useChakraTheme';
import useDeviceCheck from '@/hooks/useDeviceCheck';
import useInitPersistData from '@/hooks/useInitPersistData';
import useLoadWalletInstances from '@/hooks/useLoadWalletInstances';
import useWalletEvents from '@/hooks/useWalletEvents';
import useWeb3Injected from '@/hooks/useWeb3Injected';
import { useZKContractState } from '@/providers/zkBridgeInitalize';
import { getWalletSlice, useAppSelector } from '@/store';

type Props = PropsWithChildren<{}>;

function WrapperLayout({ children }: Props) {
  useWeb3Injected();
  useLoadWalletInstances();
  useInitPersistData();
  useWalletEvents();
  useDeviceCheck();

  const pathname = usePathname();
  const router = useRouter();
  const { isConnected } = useAppSelector(getWalletSlice);
  const { isInitializing } = useZKContractState().state;
  const isNotPOAScreen = pathname !== ROUTES.PROOF_OF_ASSETS;
  const isNotHistoryScreen = pathname !== ROUTES.HISTORY;
  const isNotUserGuide = pathname !== ROUTES.USER_GUIDE;
  const isNotHomeScreen = pathname !== ROUTES.HOME;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isConnected && PROTECTED_ROUTES.includes(pathname as ROUTES))
      router.replace(ROUTES.HOME);
  }, [isConnected, pathname]);

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
            h={'calc(100vh - 75px)'}
            minH={'calc(100vh - 75px)'}
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
