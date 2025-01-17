'use client';
import {
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  Image,
  Text,
} from '@chakra-ui/react';
import { useMemo } from 'react';

import { useModalSNState } from '../context';

import useNotifier from '@/hooks/useNotifier';
import NETWORKS, { NETWORK_NAME } from '@/models/network';
import WALLETS, { WALLET_NAME } from '@/models/wallet';
import {
  getPersistSlice,
  getUISlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { persistSliceActions } from '@/store/slices/persistSlice';
import { ModalSNPayload } from '@/store/slices/uiSlice';
import { NETWORK_KEY, walletSliceActions } from '@/store/slices/walletSlice';

type CardProps = { nwKey: NETWORK_NAME };

export default function Card({ nwKey }: CardProps) {
  const dispatch = useAppDispatch();
  const { lastNetworkName } = useAppSelector(getPersistSlice);
  const { networkName, isConnected } = useAppSelector(getWalletSlice);
  const {
    modals: {
      select_network: { payload },
    },
  } = useAppSelector(getUISlice);

  const { curNetworkKey } = useModalSNState().constants;
  const { hasSupportedNetwork, handleCloseCurModal, handleCloseLoadingModal } =
    useModalSNState().methods;

  const { sendNotification } = useNotifier();

  const network = NETWORKS[nwKey];
  const isSelected = useMemo(() => {
    switch (curNetworkKey) {
      case NETWORK_KEY.SRC:
        return lastNetworkName === nwKey;
      case NETWORK_KEY.TAR:
        return networkName.tar === nwKey;
      default:
        return false;
    }
  }, [nwKey]);

  async function handleSelectNetwork() {
    if ((payload as ModalSNPayload)?.isDisable && !isSelected) return;
    if (isSelected) return handleCloseCurModal();

    if (!isConnected) {
      handleCloseCurModal();
      dispatch(persistSliceActions.setLastNetworkName(network.name));
      return;
    }

    handleCloseCurModal();

    // walletInstance!!.removeListener(WALLET_EVENT_NAME.ACCOUNTS_CHANGED);
    // walletInstance!!.removeListener(WALLET_EVENT_NAME.CHAIN_CHANGED);
    // walletInstance!!.removeListener(WALLET_EVENT_NAME.DISCONNECT);
    // walletInstance!!.removeListener(WALLET_EVENT_NAME.MESSAGE);

    // retry get wallet account
    const res = await dispatch(
      walletSliceActions.connectWallet({
        wallet:
          WALLETS[
            network.name === NETWORK_NAME.ETHEREUM
              ? WALLET_NAME.METAMASK
              : WALLET_NAME.AURO
          ]!,
        network: network,
      })
    );
    //  when fail to connect
    if (walletSliceActions.connectWallet.rejected.match(res)) {
      sendNotification({
        toastType: 'error',
        options: {
          title: res.error.message || null,
        },
      });
      handleCloseLoadingModal();
      return;
    }
    // when connect success
    dispatch(persistSliceActions.setLastNetworkName(network.name));
    return;
  }

  const containerProps: ButtonProps = {
    w: 'full',
    h: '70px',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '10px',
    cursor:
      !isSelected && (payload as ModalSNPayload)?.isDisable
        ? 'not-allowed'
        : 'pointer',
    bg: !isSelected
      ? 'text.500'
      : 'linear-gradient(270deg, #DE622E 0%, #8271F0 100%)',
    mb: '22px',
    onClick: handleSelectNetwork,
    _active: {
      boxShadow: hasSupportedNetwork(nwKey) ? '0 0 0 3px #8271F04D' : '',
    },
  };

  const borderWidth = isSelected ? 2 : 1;

  const contentProps: FlexProps = {
    w: `calc(100% - ${borderWidth * 2}px)`,
    h: `calc(100% - ${borderWidth * 2}px)`,
    padding: '16px 19px',
    borderRadius: 10 - borderWidth + 'px',
    bg: 'background.modal',
    justifyContent: 'space-between',
    alignItems: 'center',
    _hover: {
      bg: 'text.100',
    },
  };

  return (
    <Button variant={'_blank'} key={nwKey} {...containerProps}>
      <Flex {...contentProps}>
        <Image
          w={'36px'}
          h={'36px'}
          src={network.metadata.logo.base}
          filter={
            !isSelected && (payload as ModalSNPayload)?.isDisable
              ? 'grayscale(100%)'
              : undefined
          }
        />
        <Text textTransform={'capitalize'} variant={'xl_semiBold'}>
          {network.name} Network
        </Text>
      </Flex>
    </Button>
  );
}
