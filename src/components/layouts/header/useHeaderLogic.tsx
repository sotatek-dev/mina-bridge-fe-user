"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AspectRatio, ButtonProps, Image, Text, useToken } from "@chakra-ui/react";
import {
  getPersistSlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector
} from "@/store";
import { uiSliceActions } from "@/store/slices/uiSlice";
import { MODAL_NAME } from "@/configs/modal";
import { truncateMid } from "@/helpers/common";
import { NETWORK_KEY, walletSliceActions } from "@/store/slices/walletSlice";
import NETWORKS from "@/models/network";
import useWindowSize from "@/hooks/useWindowSize";

export default function useHeaderLogic(extractFnc: boolean = false) {
  const dispatch = useAppDispatch();
  const { lastNetworkName } = useAppSelector(getPersistSlice);
  const { walletInstance, networkInstance } = useAppSelector(
    getWalletInstanceSlice
  );
  const { isConnected, address } = useAppSelector(getWalletSlice);

  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);
  const [isDrawerOpened, setIsDrawerOpened] = useState<boolean>(false);
  const [isDrawerMenuOpened, setIsDrawerMenuOpened] = useState<boolean>(false);

  const [md] = useToken('breakpoints', ['md']);

  const { width } = useWindowSize();
  const isMdSize = useMemo(
    () => width / 16 >= Number(md.replace('em', '')),
    [width, md]
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
      uiSliceActions.openModal({ modalName: MODAL_NAME.CONNECT_WALLET })
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
      })
    );
  }, [closeDrawer]);

  const btnBurgerMenuProps = useMemo<ButtonProps>(() => {
    return {
      iconSpacing: 0,
      py: '10px',
      px: '12px',
      leftIcon: <Image src={"/assets/icons/icon.burger-menu.right.svg"} />,
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
        <AspectRatio w={"24px"} h={"24px"} ratio={1}>
          <Image src={nw.metadata.logo.header} />
        </AspectRatio>
      ),
      iconSpacing: 0,
      textOverflow: 'ellipsis',
      py: '10px',
      px: '12px',
      onClick: openSelectNetworkModal,
      children: (
        <>
          <Text
            as={"span"}
            textTransform={"capitalize"}
            display={"inline-block"}
            textOverflow={"ellipsis"}
            whiteSpace={"nowrap"}
            overflow={"hidden"}
          >
            {nw.name} Network
          </Text>
          <Image src={"/assets/icons/icon.arrow.down.svg"} w={"16px"} h={"16px"} />
        </>
      ),
    };
  }, [lastNetworkName, openSelectNetworkModal, isMdSize]);

  const btnConnectWalletProps = useMemo<ButtonProps>(() => {
    // if extract function only, this jsx is redundant
    if (extractFnc) return <></>;

    // when no wallet connected
    if (!isConnected)
      return {
        variant: 'primary.orange.solid',
        onClick: openConnectWalletModal,
        children: 'Connect Wallet',
      };

    // when have a wallet connect
    const [fSlice, sSlice] = truncateMid(address!!, 4, 4); // truncate adddress

    return {
      variant: 'primary.orange',
      leftIcon: (
        <AspectRatio w={"24px"} h={"24px"} ratio={1}>
          <Image src={walletInstance?.metadata.logo.base} />
        </AspectRatio>
      ),
      onClick: toggleMenu,
      iconSpacing: 0,
      children: fSlice + '...' + sSlice,
    };
  }, [
    openConnectWalletModal,
    toggleMenu,
    walletInstance,
    address,
    isConnected,
    extractFnc,
  ]);

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
    openSelectNetworkModal,
    btnBurgerMenuProps,
  };
}
