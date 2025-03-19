'use client';
import { Box, Center, Container } from '@chakra-ui/react';
import cookie from 'cookiejs';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

import LoadingWithText from '@/components/elements/loading/spinner.text';
import UnmatchedChain from '@/components/layouts/banners/unmatchedChain';
import Header from '@/components/layouts/header';
import Modals from '@/components/modules/modals';
import NotiReporter from '@/components/modules/notiReporter';
import { Theme } from '@/configs/constants';
import ROUTES, { PROTECTED_ROUTES } from '@/configs/routes';
import useChakraTheme from '@/hooks/useChakraTheme';
import useDeviceCheck from '@/hooks/useDeviceCheck';
import useInitPersistData from '@/hooks/useInitPersistData';
import useLoadWalletInstances from '@/hooks/useLoadWalletInstances';
import useWalletEvents from '@/hooks/useWalletEvents';
import useWeb3Injected from '@/hooks/useWeb3Injected';
import { useZKContractState } from '@/providers/zkBridgeInitalize';
import {
  getUISlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { BANNER_NAME } from '@/store/slices/uiSlice';
import { walletSliceActions } from '@/store/slices/walletSlice';

type Props = PropsWithChildren<{}>;

function WrapperLayout({ children }: Props) {
  useWeb3Injected();
  useLoadWalletInstances();
  useInitPersistData();
  useWalletEvents();
  useDeviceCheck();

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { banners } = useAppSelector(getUISlice);
  const { isConnected } = useAppSelector(getWalletSlice);

  const { isInitializing } = useZKContractState().state;
  const isNotPOAScreen = pathname !== ROUTES.PROOF_OF_ASSETS;
  const isNotHistoryScreen = pathname !== ROUTES.HISTORY;
  const isNotUserGuide = pathname !== ROUTES.USER_GUIDE;
  const isNotTerm = pathname !== ROUTES.TERMS_OF_SERVICE;
  const isNotPrivacy = pathname !== ROUTES.PRIVACY_POLICY;
  const isNotHomeScreen = pathname !== ROUTES.HOME;
  const { colorMode } = useChakraTheme();

  const [isClient, setIsClient] = useState(false);

  const curBanner = banners[BANNER_NAME.UNMATCHED_CHAIN_ID];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const isCookie = cookie.get('address');
    if (!isCookie || !isConnected) {
      dispatch(walletSliceActions.disconnect());
      if (PROTECTED_ROUTES.includes(pathname as ROUTES))
        router.replace(ROUTES.HOME);
      return;
    }
  }, [isConnected, pathname]);

  return (
    <div id={'wrapper-layout'}>
      {isInitializing || !isClient ? (
        <LoadingWithText
          id={'zk_contract_initialize_loading'}
          label={'Loading'}
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
              isNotPOAScreen &&
              isNotHistoryScreen &&
              isNotUserGuide &&
              isNotTerm &&
              isNotPrivacy
                ? `url("/assets/images/image.main-${colorMode === Theme.DARK ? 'dark' : 'light'}.jpg")`
                : ''
            }
            bgSize={'cover'}
            bgPosition={'left top'}
            bgRepeat={'no-repeat'}
            bgAttachment={'fixed'}
            overflow={'auto'}
            pt={curBanner.isDisplay && curBanner.payload ? '50px' : ''}
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
