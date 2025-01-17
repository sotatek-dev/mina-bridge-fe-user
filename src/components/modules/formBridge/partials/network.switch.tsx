'use client';
import { Button, ButtonProps, Spinner } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import { useFormBridgeState } from '../context';

import useNotifier from '@/hooks/useNotifier';
import NETWORKS, { NETWORK_NAME } from '@/models/network';
import WALLETS from '@/models/wallet';
import { WALLET_NAME } from '@/models/wallet/wallet.abstract';
import { getWalletSlice, useAppDispatch, useAppSelector } from '@/store';
import { walletSliceActions } from '@/store/slices/walletSlice';
import SwitchVerticalIcon from '@public/assets/icons/icon.switch.vertical.svg';

type Props = ButtonProps & {};

export default function NetworkSwitch({ ...props }: Props) {
  const dispatch = useAppDispatch();
  const { status } = useFormBridgeState().state;
  const { updateStatus } = useFormBridgeState().methods;
  const { sendNotification, checkNotifyActive } = useNotifier();
  const { networkName } = useAppSelector(getWalletSlice);
  const notifyRef = useRef<any>(null);

  async function handleClick() {
    if (status.isLoading || !status.isConnected || status.isFetchingBalance)
      return;

    updateStatus('isLoading', true);

    // retry get wallet account
    const res = await dispatch(
      walletSliceActions.connectWallet({
        wallet:
          WALLETS[
            networkName.tar === NETWORK_NAME.ETHEREUM
              ? WALLET_NAME.METAMASK
              : WALLET_NAME.AURO
          ]!,
        network: NETWORKS[networkName.tar!],
      }),
    );
    //  when fail to connect
    if (walletSliceActions.connectWallet.rejected.match(res)) {
      updateStatus('isLoading', false);
      if (notifyRef.current !== null && checkNotifyActive(notifyRef.current))
        return;
      sendNotification({
        toastType: 'error',
        options: {
          title: res.error.message || null,
        },
      });
      return;
    }

    // handle on success
    updateStatus('isLoading', false);
  }

  useEffect(() => {
    if (!status.isConnected) {
      updateStatus('isLoading', false);
    }
  }, [status.isConnected]);

  return (
    <Button
      variant={'_blank'}
      w={'40px'}
      h={'40px'}
      {...props}
      bg={'var(--background-0)'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      border={'1px solid'}
      borderRadius={50}
      borderColor={'var(--text-200)'}
      cursor={'default'}
      // onClick={handleClick}
    >
      {status.isLoading || status.isFetchingBalance ? (
        <Spinner position={'absolute'} color={'var(--text-600)'} />
      ) : (
        <SwitchVerticalIcon color={'var(--text-1000)'} />
      )}
    </Button>
  );
}
