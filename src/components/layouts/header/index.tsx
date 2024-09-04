'use client';
import { PropsWithChildren, useRef } from 'react';
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
  Text,
  VStack,
} from '@chakra-ui/react';
import { getWalletSlice, useAppSelector } from '@/store';
import useHeaderLogic from './useHeaderLogic';
import ROUTES from '@/configs/routes';
import { Link } from '@chakra-ui/next-js';
import Logo from '../../elements/logo';
import { useOutsideCheck } from "@/hooks/useOutsideCheck";
// import { useOutsideCheck } from '@/hooks/useOutsiteCheck';

type Props = PropsWithChildren<{}>;

export default function Header({}: Props) {
  // const isConnected = true;
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

  return (
    <Flex
      w={"full"}
      maxH={75}
      px={{
        base: '15px',
        lg: '100px',
        xl: '150px',
      }}
      py={"18px"}
      bg={"white"}
    >
      <VStack justifyContent={"center"} gap={0}>
        <Link href={ROUTES.HOME}>
          <Logo />
        </Link>
      </VStack>

      <HStack ml={"auto"} gap={{ base: '10px', md: '16px' }}>
        {isConnected && isMdSize && (
          <Link href={ROUTES.HISTORY} mr={"32px"}>
            <Text variant={"lg_semiBold"} color={"text.700"}>
              History
            </Text>
          </Link>
        )}
        {!isMdSize && isConnected && <Button {...btnBurgerMenuProps} />}
        <Button
          {...btnSelectNetworkProps}
          {...(isMdSize ? {} : { children: null })}
        />

        <Box position={"relative"} ref={disconnectBtnRef}>
          <Button
            {...btnConnectWalletProps}
            {...(isMdSize || (!isMdSize && !isConnected)
              ? {}
              : { children: null })}
          />
          {isMenuOpened ? (
            <Button
              variant={"disconnect.solid"}
              position={"absolute"}
              h={"42px"}
              minW={"130px"}
              bottom={"-120%"}
              right={0}
              onClick={disconnectWallet}
              zIndex={"10"}
              leftIcon={
                <Image
                  src={"/assets/icons/icon.link-broken.svg"}
                  w={"24px"}
                  h={"24px"}
                />
              }
              gap={"0"}
              alignItems={"center"}
            >
              <Text as={"span"} variant={"md_medium"} lineHeight={1} pt={"3px"}>
                Disconnect
              </Text>
            </Button>
          ) : null}
        </Box>
      </HStack>
      <Drawer placement={"right"} onClose={closeDrawer} isOpen={isDrawerOpened}>
        <DrawerOverlay bg={"text.900"} opacity={"0.5 !important"} />
        <DrawerContent w={"65% !important"}>
          <DrawerCloseButton top={"25px"} right={"30px"} />
          <DrawerBody pt={"100px"} px={"30px"} pb={"70px"} overflow={"auto"}>
            <VStack
              justifyContent={"space-between"}
              w={"full"}
              h={"full"}
              minH={"150px"}
            >
              <Link href={ROUTES.HISTORY} mr={"32px"} onClick={closeDrawer}>
                <Text variant={"lg_semiBold"} color={"text.700"}>
                  History
                </Text>
              </Link>
              <VStack w={"full"} position={"relative"}>
                <Button
                  {...btnSelectNetworkProps}
                  w={"full"}
                  sx={{
                    '.chakra-text': {
                      mr: 'auto',
                    },
                  }}
                />
                <Button
                  {...btnConnectWalletProps}
                  w={"full"}
                  onClick={toggleDrawerMenu}
                />
                {isDrawerMenuOpened && (
                  <Button
                    variant={"disconnect.solid"}
                    position={"absolute"}
                    h={"42px"}
                    minW={"130px"}
                    top={"110%"}
                    right={0}
                    onClick={() => {
                      closeDrawer();
                      disconnectWallet();
                    }}
                    zIndex={"10"}
                    leftIcon={
                      <Image
                        src={"/assets/icons/icon.link-broken.svg"}
                        alt={'icon.link-broken'}
                        w={"24px"}
                        h={"24px"}
                      />
                    }
                    gap={"0"}
                    alignItems={"center"}
                  >
                    <Text as={"span"} variant={"md_medium"} lineHeight={1} pt={"3px"}>
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
