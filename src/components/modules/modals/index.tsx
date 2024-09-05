'use client';
import React from 'react';
import ModalConnectWallet from './components/modalConnectWallet';
import ModalConnectWalletError from './components/modalConnectWalletError';
import ModalSelectNetwork from './components/modalSelectNetwork';
import ModalSuccessAction from './components/modalSuccessAction';
import ModalSelectToken from './components/modalSelectToken';
import ModalConfirmBridge from './components/modalConfirmBridge';
import ModalLoading from './components/modalLoading';

type Props = {};

export default function Modals({}: Props) {
  return (
    <>
      <ModalConfirmBridge />
      <ModalConnectWallet />
      <ModalConnectWalletError />
      <ModalSelectNetwork />
      <ModalSuccessAction />
      <ModalSelectToken />
      <ModalLoading />
    </>
  );
}
