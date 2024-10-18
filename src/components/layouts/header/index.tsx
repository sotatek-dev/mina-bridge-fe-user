'use client';
import { Link } from '@chakra-ui/next-js';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { PropsWithChildren, useRef } from 'react';

import Logo from '../../elements/logo';

import useHeaderLogic from './useHeaderLogic';

import ROUTES from '@/configs/routes';
import { getEnvNetwork } from '@/constants';
import { useOutsideCheck } from '@/hooks/useOutsideCheck';
import { getWalletSlice, useAppSelector } from '@/store';

type Props = PropsWithChildren<{}>;

export default function Header({}: Props) {
  const { isConnected } = useAppSelector(getWalletSlice);
  const disconnectBtnRef = useRef<any>(null);
  const {
    isMdSize,
    isDrawerOpened,
    disconnectWallet,
    btnConnectWalletProps,
    btnSelectNetworkProps,
    btnBurgerMenuProps,
    toggleDrawerMenu,
    closeDrawer,
    closeMenu,
  } = useHeaderLogic();

  useOutsideCheck(disconnectBtnRef, closeMenu);

  return (
    <Flex
      w={'full'}
      maxH={75}
      px={{
        base: '15px',
        lg: '100px',
        xl: '150px',
      }}
      py={'18px'}
      bg={'white'}
    >
      <HStack justifyContent={'center'} gap={1} mr={2}>
        <Link href={ROUTES.HOME}>
          <Logo />
        </Link>
      </HStack>

      <HStack ml={'auto'} gap={{ base: '10px', md: '16px' }}>
        {isConnected && isMdSize && (
          <Link href={ROUTES.HISTORY} mr={'32px'}>
            <Text variant={'lg_semiBold'} color={'text.700'}>
              History
            </Text>
          </Link>
        )}
        {!isMdSize && isConnected && <Button {...btnBurgerMenuProps} />}
        <Button
          {...btnSelectNetworkProps}
          {...(isMdSize ? {} : { children: null })}
        />

        <Button
          {...btnConnectWalletProps}
          {...(isMdSize || (!isMdSize && !isConnected)
            ? {}
            : { children: null })}
        />

        {isMdSize && (
          <>
            <Button w={10} p={'10px'}>
              <Image width={'22px'} src={'/assets/icons/icon.sun.svg'} />
            </Button>

            {isConnected && (
              <Button w={10} p={'10px'} onClick={disconnectWallet}>
                <Image width={'22px'} src={'/assets/icons/icon.log-out.svg'} />
              </Button>
            )}
            <HStack gap={1}>
              <Image
                width={'22px'}
                src={'/assets/icons/icon.env.network.svg'}
              />
              <Text color={'text.500'}>
                {getEnvNetwork(process.env.NEXT_PUBLIC_ENV!)}
              </Text>
            </HStack>
          </>
        )}
      </HStack>
      <Drawer placement={'right'} onClose={closeDrawer} isOpen={isDrawerOpened}>
        <DrawerOverlay bg={'text.900'} opacity={'0.5 !important'} />
        <DrawerContent w={'65% !important'}>
          <HStack gap={1} mt={'36px'} ml={'30px'}>
            <Image width={'22px'} src={'/assets/icons/icon.env.network.svg'} />
            <Text color={'text.500'}>
              {getEnvNetwork(process.env.NEXT_PUBLIC_ENV!)}
            </Text>
          </HStack>
          <DrawerCloseButton top={'25px'} right={'30px'} />
          <DrawerBody pt={'100px'} px={'30px'} pb={'70px'} overflow={'auto'}>
            <VStack
              justifyContent={'space-between'}
              w={'full'}
              h={'full'}
              minH={'150px'}
            >
              <Link href={ROUTES.HISTORY} mr={'32px'} onClick={closeDrawer}>
                <Text variant={'lg_semiBold'} color={'text.700'}>
                  History
                </Text>
              </Link>
              <VStack w={'full'} position={'relative'}>
                <Button
                  {...btnSelectNetworkProps}
                  w={'full'}
                  sx={{
                    '.chakra-text': {
                      mr: 'auto',
                    },
                  }}
                />
                <Button
                  {...btnConnectWalletProps}
                  w={'full'}
                  onClick={toggleDrawerMenu}
                />

                <Button
                  w={'100%'}
                  leftIcon={
                    <Image width={'22px'} src={'/assets/icons/icon.sun.svg'} />
                  }
                >
                  Light Mode
                </Button>

                {isConnected && (
                  <Button
                    w={'100%'}
                    onClick={disconnectWallet}
                    leftIcon={
                      <Image
                        width={'22px'}
                        src={'/assets/icons/icon.log-out.svg'}
                      />
                    }
                  >
                    Disconnect
                  </Button>
                )}

                {/* {isDrawerMenuOpened && (
                  <Button
                    variant={'disconnect.solid'}
                    position={'absolute'}
                    h={'42px'}
                    minW={'130px'}
                    top={'110%'}
                    right={0}
                    onClick={() => {
                      closeDrawer();
                      disconnectWallet();
                    }}
                    zIndex={'10'}
                    leftIcon={
                      <Image
                        src={'/assets/icons/icon.link-broken.svg'}
                        alt={'icon.link-broken'}
                        w={'24px'}
                        h={'24px'}
                      />
                    }
                    gap={'0'}
                    alignItems={'center'}
                  >
                    <Text
                      as={'span'}
                      variant={'md_medium'}
                      lineHeight={1}
                      pt={'3px'}
                    >
                      Disconnect
                    </Text>
                  </Button>
                )} */}
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
