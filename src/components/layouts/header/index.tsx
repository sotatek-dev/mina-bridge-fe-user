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
  Text,
  VStack,
} from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

import Logo from '../../elements/logo';

import useHeaderLogic from './useHeaderLogic';

import { Theme } from '@/configs/constants';
import ROUTES from '@/configs/routes';
import { getEnvNetwork } from '@/constants';
import useChakraTheme from '@/hooks/useChakraTheme';
import { getWalletSlice, useAppSelector } from '@/store';
import EnvIcon from '@public/assets/icons/icon.env.network.svg';
import LogoutIcon from '@public/assets/icons/icon.log-out.svg';
import MoonIcon from '@public/assets/icons/icon.moon.svg';
import SunIcon from '@public/assets/icons/icon.sun.svg';

type Props = PropsWithChildren<{}>;

export default function Header({}: Props) {
  const { isConnected } = useAppSelector(getWalletSlice);
  const {
    isMdSize,
    isDrawerOpened,
    disconnectWallet,
    btnConnectWalletProps,
    btnSelectNetworkProps,
    btnBurgerMenuProps,
    toggleDrawerMenu,
    closeDrawer,
  } = useHeaderLogic();

  const { colorMode, toggleTheme } = useChakraTheme();

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
      <HStack justifyContent={'center'} gap={1} mr={2}>
        <Link href={ROUTES.HOME}>
          <Logo />
        </Link>
      </HStack>

      <HStack ml={'auto'} gap={{ base: '10px', md: '16px' }}>
        {isConnected && isMdSize && (
          <HStack mr={'32px'}>
            <Link href={ROUTES.HISTORY}>
              <Text variant={'lg_semiBold'} color={'text.700'}>
                History
              </Text>
            </Link>
            <HStack
              w={'20px'}
              h={'20px'}
              bg={'var(--red-500)'}
              borderRadius={'50%'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Text color={'white'} fontSize={'12px'}>
                0
              </Text>
            </HStack>
          </HStack>
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
            <Button
              w={10}
              p={'10px'}
              bg={'background.1'}
              onClick={toggleTheme}
              title={colorMode === Theme.DARK ? 'Dark Mode' : 'Light Mode'}
            >
              {colorMode === Theme.DARK ? <MoonIcon /> : <SunIcon />}
            </Button>

            {isConnected && (
              <Button
                w={10}
                p={'10px'}
                bg={'background.1'}
                onClick={disconnectWallet}
                title={'Disconnect'}
              >
                <LogoutIcon color={'var(--logo-color)'} />
              </Button>
            )}
            <HStack gap={1}>
              <EnvIcon />
              <Text color={'text.700'}>
                {getEnvNetwork(process.env.NEXT_PUBLIC_ENV!)}
              </Text>
            </HStack>
          </>
        )}
      </HStack>
      <Drawer placement={'right'} onClose={closeDrawer} isOpen={isDrawerOpened}>
        <DrawerOverlay bg={'text.900'} opacity={'0.5 !important'} />
        <DrawerContent w={'65% !important'} bg={'background.0'}>
          <HStack gap={1} mt={'36px'} ml={'30px'}>
            <EnvIcon />
            <Text color={'text.700'}>
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
                  bg={'background.1'}
                  leftIcon={
                    colorMode === Theme.DARK ? (
                      <MoonIcon width={'22px'} />
                    ) : (
                      <SunIcon width={'22px'} />
                    )
                  }
                  onClick={toggleTheme}
                >
                  {colorMode === Theme.DARK ? 'Dark' : 'Light'} Mode
                </Button>

                {isConnected && (
                  <Button
                    w={'100%'}
                    bg={'background.1'}
                    onClick={disconnectWallet}
                    leftIcon={
                      <LogoutIcon color={'var(--logo-color)'} width={'22px'} />
                    }
                  >
                    Disconnect
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
