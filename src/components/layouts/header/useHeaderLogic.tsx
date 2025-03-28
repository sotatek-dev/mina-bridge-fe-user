'use client';
import {
  AspectRatio,
  ButtonProps,
  HStack,
  Image,
  Text,
  useToken,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { MODAL_NAME } from '@/configs/modal';
import { getEnvNetwork } from '@/constants';
import { truncateMid } from '@/helpers/common';
import useWindowSize from '@/hooks/useWindowSize';
import NETWORKS from '@/models/network';
import {
  getPersistSlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { uiSliceActions } from '@/store/slices/uiSlice';
import { NETWORK_KEY, walletSliceActions } from '@/store/slices/walletSlice';
import ArrowDownIcon from '@public/assets/icons/icon.arrow.down.svg';
import MenuIcon from '@public/assets/icons/icon.burger-menu.right.svg';
import EnvIcon from '@public/assets/icons/icon.env.network.svg';

export default function useHeaderLogic(extractFnc: boolean = false) {
  const dispatch = useAppDispatch();
  const { lastNetworkName } = useAppSelector(getPersistSlice);
  const { walletInstance, networkInstance } = useAppSelector(
    getWalletInstanceSlice,
  );
  const { isConnected, address } = useAppSelector(getWalletSlice);

  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);
  const [isDrawerOpened, setIsDrawerOpened] = useState<boolean>(false);
  const [isDrawerMenuOpened, setIsDrawerMenuOpened] = useState<boolean>(false);

  const [md] = useToken('breakpoints', ['md']);

  const { width } = useWindowSize();
  const isMdSize = useMemo(
    () => width / 16 >= Number(md.replace('em', '')),
    [width, md],
  );

  const toggleMenu = useCallback(() => {
    if (address) {
      setIsMenuOpened((prev) => !prev);
    }
  }, [address, setIsMenuOpened]);

  const toggleDrawerMenu = useCallback(() => {
    setIsDrawerMenuOpened((prev) => !prev);
  }, [setIsDrawerMenuOpened]);

  const closeMenu = useCallback(() => {
    setIsMenuOpened(false);
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpened(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpened(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    if (!address) return;
    dispatch(walletSliceActions.disconnect());
    closeMenu();
    closeDrawer();
  }, [dispatch, address, closeMenu, closeDrawer]);

  const openConnectWalletModal = useCallback(() => {
    dispatch(
      uiSliceActions.openModal({ modalName: MODAL_NAME.CONNECT_WALLET }),
    );
  }, [dispatch]);

  const openSelectNetworkModal = useCallback(() => {
    closeDrawer();
    dispatch(
      uiSliceActions.openModal({
        modalName: MODAL_NAME.SELECT_NETWORK,
        payload: {
          networkKey: NETWORK_KEY.SRC,
          isValidate: true,
        },
      }),
    );
  }, [closeDrawer]);

  const btnBurgerMenuProps = useMemo<ButtonProps>(() => {
    return {
      iconSpacing: 0,
      py: '10px',
      px: '12px',
      leftIcon: <MenuIcon />,
      onClick: openDrawer,
      border: 'none',
      bg: 'rgba(244, 111, 78, 0.15)',
    };
  }, [openDrawer]);

  const btnSelectNetworkProps = useMemo<ButtonProps>(() => {
    if (!lastNetworkName) return { variant: '_blank', children: null };
    const nw = NETWORKS[lastNetworkName];

    return {
      leftIcon: (
        <AspectRatio w={'24px'} h={'24px'} ratio={1}>
          <Image src={nw.metadata.logo.header} />
        </AspectRatio>
      ),
      iconSpacing: 0,
      textOverflow: 'ellipsis',
      py: '10px',
      px: '12px',
      bg: 'background.0',
      onClick: openSelectNetworkModal,
      children: (
        <>
          <Text
            as={'span'}
            textTransform={'capitalize'}
            display={'inline-block'}
            textOverflow={'ellipsis'}
            whiteSpace={'nowrap'}
            overflow={'hidden'}
          >
            {nw.name} Network
          </Text>
          <ArrowDownIcon color={'text.500'} height={'16'} width={'16'} />
        </>
      ),
    };
  }, [lastNetworkName, openSelectNetworkModal, isMdSize]);

  const btnConnectWalletProps = useMemo<ButtonProps>(() => {
    // if extract function only, this jsx is redundant
    if (extractFnc) return <></>;

    return {
      variant: 'primary.orange.solid',
      onClick: openConnectWalletModal,
      children: 'Connect Wallet',
    };
  }, [openConnectWalletModal]);

  const btnWalletInforProps = useMemo<ButtonProps>(() => {
    // if extract function only, this jsx is redundant
    if (extractFnc) return <></>;

    const [fSlice, sSlice] = truncateMid(address!!, 4, 4); // truncate adddress

    return {
      bg: 'background.0',
      color: 'primary.orange',
      onClick: openConnectWalletModal,
      iconSpacing: 0,
      children: fSlice + '...' + sSlice,
      leftIcon: (
        <AspectRatio w={'24px'} h={'24px'} ratio={1}>
          <Image src={walletInstance?.metadata.logo.base} />
        </AspectRatio>
      ),
      rightIcon: isMdSize ? (
        <HStack gap={1} ml={2}>
          <EnvIcon />
          <Text color={'text.700'} fontWeight={'400'}>
            {getEnvNetwork(process.env.NEXT_PUBLIC_ENV!)}
          </Text>
        </HStack>
      ) : undefined,
    };
  }, [walletInstance, address, extractFnc, isMdSize]);

  // close everything when drawer closed
  useEffect(() => {
    if (!isDrawerOpened) {
      setIsDrawerMenuOpened(false);
    }
  }, [isDrawerOpened]);

  return {
    isMdSize,
    isMenuOpened,
    isDrawerOpened,
    isDrawerMenuOpened,
    toggleDrawerMenu,
    disconnectWallet,
    closeDrawer,
    closeMenu,
    btnConnectWalletProps,
    openConnectWalletModal,
    btnSelectNetworkProps,
    btnWalletInforProps,
    openSelectNetworkModal,
    btnBurgerMenuProps,
  };
}
