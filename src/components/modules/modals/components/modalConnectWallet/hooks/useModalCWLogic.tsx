import { ButtonProps } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';

import { useModalCWState } from '../context';
import Card, { CARD_STATUS } from '../partials/card';

import NETWORKS, { NETWORK_NAME } from '@/models/network';
import WALLETS, {
  MOBILE_SUPPORTS,
  OS,
  WALLET_NAME,
  Wallet,
} from '@/models/wallet';
import { getPersistSlice, getWalletSlice, useAppSelector } from '@/store';

const networkOrder = [NETWORK_NAME.MINA, NETWORK_NAME.ETHEREUM];
const walletOrder = [WALLET_NAME.METAMASK, WALLET_NAME.AURO];

export default function useModalCWLogic() {
  const { state, methods } = useModalCWState();
  const { userDevice } = useAppSelector(getPersistSlice);
  const { isConnected, networkName } = useAppSelector(getWalletSlice);

  const getNetworkCardStatus = useCallback(
    (key: NETWORK_NAME) => {
      if (!state.isAcceptTerm || !userDevice) return CARD_STATUS.UNSUPPORTED;

      // Check mobile wallet support
      if (
        MOBILE_SUPPORTS.includes(userDevice.os?.name as OS) &&
        key === NETWORK_NAME.ETHEREUM &&
        window?.mina
      )
        return CARD_STATUS.UNSUPPORTED;

      switch (true) {
        case state.selectedNetwork === key:
          return CARD_STATUS.CHECKED;
        default:
          return CARD_STATUS.SUPPORTED;
      }
    },
    [state.selectedNetwork, state.isAcceptTerm],
  );

  const networkOptionsRendered = useMemo(() => {
    return networkOrder.map((key) => {
      const network = NETWORKS[key];
      const status = getNetworkCardStatus(key as NETWORK_NAME);
      function handleClick() {
        switch (status) {
          case CARD_STATUS.CHECKED:
          case CARD_STATUS.UNSUPPORTED:
            return;

          default:
            methods.onSelectNetwork(key);
            break;
        }
      }
      return (
        <Card
          key={`select_network_${key}`}
          status={status}
          onClick={handleClick}
          data={{
            title: network.name,
            logo: network.metadata.logo.base || '',
          }}
        />
      );
    });
  }, [getNetworkCardStatus, methods.onSelectNetwork, state.isAcceptTerm]);

  const getWalletCardStatus = useCallback(
    (key: WALLET_NAME, data: Wallet) => {
      if (!state.isAcceptTerm || !userDevice) return CARD_STATUS.UNSUPPORTED;

      const isSnap =
        key === WALLET_NAME.METAMASK &&
        state.selectedNetwork === NETWORK_NAME.MINA;

      const nwInstance = NETWORKS[state.selectedNetwork];
      const isSelected = state.selectedWallet === key;
      const isSupported =
        (data.metadata.supportedNetwork.includes(state.selectedNetwork) &&
          data.metadata.supportedDevices[nwInstance.type].includes(
            userDevice.device?.type || '',
          )) ||
        (MOBILE_SUPPORTS.includes(userDevice.os?.name as OS) &&
          !isSnap &&
          window?.[key === WALLET_NAME.METAMASK ? 'ethereum' : 'mina']);

      switch (true) {
        case isSelected:
          return CARD_STATUS.CHECKED;
        case !isSupported:
          return CARD_STATUS.UNSUPPORTED;
        case isSupported && !isSelected:
          return CARD_STATUS.UNCHECKED;
        default:
          return CARD_STATUS.SUPPORTED;
      }
    },
    [
      state.selectedWallet,
      state.selectedNetwork,
      state.isAcceptTerm,
      userDevice,
    ],
  );

  const walletOptionsRendered = useMemo(() => {
    return walletOrder.map((key) => {
      const wallet = WALLETS[key];
      if (!wallet) return;

      const status = getWalletCardStatus(key as WALLET_NAME, wallet);
      function handleClick() {
        switch (status) {
          case CARD_STATUS.CHECKED:
          case CARD_STATUS.UNSUPPORTED:
            return;
          default:
            methods.onSelectWallet(key);
            break;
        }
      }
      return (
        <Card
          key={`select_wallet_${key}`}
          status={status}
          onClick={handleClick}
          data={{
            title: wallet.metadata.displayName,
            logo: wallet.metadata.logo,
          }}
        />
      );
    });
  }, [
    getWalletCardStatus,
    methods.onSelectWallet,
    state.selectedNetwork,
    state.isAcceptTerm,
  ]);

  const connectBtnProps = useMemo<ButtonProps>(() => {
    const { isAcceptTerm, selectedNetwork } = state;
    const isDisable = !isAcceptTerm || !userDevice;
    const isCurActiveNw = isConnected && selectedNetwork === networkName.src;

    let content = 'Connect Wallet';
    if (!isDisable) {
      if (isCurActiveNw) {
        content =
          selectedNetwork === NETWORK_NAME.ETHEREUM
            ? 'Metamask Connected'
            : 'Auro Connected';
      } else {
        content =
          selectedNetwork === NETWORK_NAME.ETHEREUM
            ? 'Connect Metamask'
            : 'Connect Auro';
      }
    }

    const wallet =
      selectedNetwork === NETWORK_NAME.ETHEREUM
        ? WALLET_NAME.METAMASK
        : WALLET_NAME.AURO;

    return {
      w: 'full',
      disabled: isDisable || isCurActiveNw,
      variant:
        isDisable || isCurActiveNw
          ? isConnected
            ? 'connected'
            : 'ghost'
          : 'primary.orange.solid',
      children: content,
      onClick: () =>
        (!isConnected || !isCurActiveNw) && methods.onSelectWallet(wallet),
    };
  }, [
    state.isAcceptTerm,
    state.selectedNetwork,
    userDevice,
    networkName.src,
    isConnected,
  ]);

  return {
    state,
    methods,
    networkOptionsRendered,
    walletOptionsRendered,
    connectBtnProps,
  };
}
