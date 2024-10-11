'use client';
import { Link } from '@chakra-ui/next-js';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Image,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import Logo from '../../elements/logo';

import useHeaderLogic from './useHeaderLogic';

import { Theme } from '@/configs/constants';
import ROUTES from '@/configs/routes';
import { getEnvNetwork } from '@/constants';
import useChakraTheme from '@/hooks/useChakraTheme';
import { useOutsideCheck } from '@/hooks/useOutsideCheck';
import { getWalletSlice, useAppSelector } from '@/store';

type Props = PropsWithChildren<{}>;

export default function Header({}: Props) {
  const { isConnected } = useAppSelector(getWalletSlice);
  const disconnectBtnRef = useRef<any>(null);
  const {
    isMdSize,
    isDrawerOpened,
    isMenuOpened,
    isDrawerMenuOpened,
    disconnectWallet,
    btnConnectWalletProps,
    btnSelectNetworkProps,
    btnBurgerMenuProps,
    toggleDrawerMenu,
    closeDrawer,
    closeMenu,
  } = useHeaderLogic();

  useOutsideCheck(disconnectBtnRef, closeMenu);
  const { colorMode, onToggleTheme } = useChakraTheme();

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
      bg={'background.0'}
    >
      <HStack justifyContent={'center'} gap={1}>
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

        <Box position={'relative'} ref={disconnectBtnRef}>
          <Button
            {...btnConnectWalletProps}
            {...(isMdSize || (!isMdSize && !isConnected)
              ? {}
              : { children: null })}
          />
          {isMenuOpened ? (
            <Button
              variant={'disconnect.solid'}
              position={'absolute'}
              h={'42px'}
              minW={'130px'}
              bottom={'-120%'}
              right={0}
              onClick={disconnectWallet}
              zIndex={'10'}
              leftIcon={
                <Image
                  src={'/assets/icons/icon.link-broken.svg'}
                  w={'24px'}
                  h={'24px'}
                />
              }
              gap={'0'}
              alignItems={'center'}
            >
              <Text as={'span'} variant={'md_medium'} lineHeight={1} pt={'3px'}>
                Disconnect
              </Text>
            </Button>
          ) : null}
        </Box>

        {isMdSize && (
          <>
            <HStack gap={1} ml={3}>
              <Switch
                id={'theme'}
                isChecked={colorMode === Theme.DARK}
                onChange={onToggleTheme}
              />
            </HStack>

            <HStack gap={1} ml={3}>
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

                {isDrawerMenuOpened && (
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
                )}
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
