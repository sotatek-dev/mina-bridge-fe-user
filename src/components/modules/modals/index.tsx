'use client';
import React from 'react';

import ModalConfirmBridge from './components/modalConfirmBridge';
import ModalConnectWallet from './components/modalConnectWallet';
import ModalConnectWalletError from './components/modalConnectWalletError';
import ModalLoading from './components/modalLoading';
import ModalSelectNetwork from './components/modalSelectNetwork';
import ModalSelectToken from './components/modalSelectToken';
import ModalSuccessAction from './components/modalSuccessAction';

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
