'use client';
import React from 'react';
import { Button, ButtonProps, Text } from '@chakra-ui/react';
import { MODAL_NAME } from '@/configs/modal';
import { getWalletSlice, useAppDispatch, useAppSelector } from '@/store';
import { uiSliceActions } from '@/store/slices/uiSlice';
import { useFormBridgeState } from '../context';

type Props = { isDisplayed: boolean } & Pick<ButtonProps, ChakraBoxSizeProps>;

function Content(props: Omit<Props, 'isDisplayed'>) {
  const dispatch = useAppDispatch();
  const { status } = useFormBridgeState().state;

  function openConnectWalletModal() {
    if (status.isLoading) return;

    dispatch(
      uiSliceActions.openModal({ modalName: MODAL_NAME.CONNECT_WALLET })
    );
  }
  return (
    <Button
      variant={'primary.orange.solid'}
      h={'44px'}
      w={'full'}
      {...props}
      onClick={openConnectWalletModal}
    >
      <Text
        as={'span'}
        display={'inline-block'}
        variant={'lg_medium'}
        lineHeight={1}
      >
        Connect Wallet
      </Text>
    </Button>
  );
}

export default function FormConnectButton({ isDisplayed, ...props }: Props) {
  return isDisplayed ? <Content {...props} /> : null;
}
