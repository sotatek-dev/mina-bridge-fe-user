'use client';
import { PropsWithChildren } from 'react';
import { Box, Center, Container } from '@chakra-ui/react';
import UnmatchedChain from '../banners/unmatchedChain';
import Modals from '@/components/modules/modals';
import NotiReporter from '@/components/modules/notiReporter';
import ROUTES from '@/configs/routes';
import { useZKContractState } from '@/providers/zkBridgeInitalize';
import { usePathname } from 'next/navigation';
import LoadingWithText from '@/components/elements/loading/spinner.text';
import Header from '../header';
import useWeb3Injected from '@/hooks/useWeb3Injected';
import useLoadWalletInstances from '@/hooks/useLoadWalletInstances';
import useInitPersistData from '@/hooks/useInitPersistData';
import useChakraTheme from '@/hooks/useChakraTheme';
import useWalletEvents from '@/hooks/useWalletEvents';
import useDeviceCheck from '@/hooks/useDeviceCheck';
import useRedirectRouter from '@/hooks/useRedirectRouter';

type Props = PropsWithChildren<{}>;

function WrapperLayout({ children }: Props) {
  useWeb3Injected();
  useLoadWalletInstances();
  useInitPersistData();
  useChakraTheme();
  useWalletEvents();
  useDeviceCheck();
  useRedirectRouter();

  const pathname = usePathname();
  const { isInitializing } = useZKContractState().state;
  const isNotPOAScreen = pathname !== ROUTES.PROOF_OF_ASSETS;
  const isNotHistoryScreen = pathname !== ROUTES.HISTORY;
  const isNotUserGuide = pathname !== ROUTES.USER_GUIDE;
  const isNotHomeScreen = pathname !== ROUTES.HOME;

  return (
    <div id={'wrapper-layout'}>
      {isInitializing ? (
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
