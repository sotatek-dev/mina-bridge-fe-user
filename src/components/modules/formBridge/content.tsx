'use client';

import { useFormBridgeState } from './context';
import FormAssetSelect from './partials/form.assetSelect';
import FormBridgeAmount from './partials/form.bridgeAmount';
import FormConfirmButton from './partials/form.confirmButton';
import FormConnectButton from './partials/form.connectButton';
import FormDesAddress from './partials/form.desAddress';
import NetworkContainer from './partials/network.container';
import WarningAuro from './partials/warning.auro';
import WarningMinMax from './partials/warning.minmax';

import { NETWORK_TYPE } from '@/models/network/network';
import { getWalletInstanceSlice, useAppSelector } from '@/store';

type FormBridgeContentProps = {};

export default function FormBridgeContent({}: FormBridgeContentProps) {
  const { status, desAddr } = useFormBridgeState().state;

  const { networkInstance } = useAppSelector(getWalletInstanceSlice);

  const isDisplay =
    status.isConnected &&
    desAddr.length > 0 &&
    networkInstance?.tar?.type === NETWORK_TYPE.ZK;

  return (
    <>
      <NetworkContainer />
      <FormAssetSelect mt={'18px'} />
      <FormDesAddress isDisplayed={status.isConnected} mt={'18px'} />
      <WarningAuro isDisplayed={isDisplay} mt={3} />
      <FormBridgeAmount mt={'18px'} />
      <FormConnectButton isDisplayed={!status.isConnected} mt={'26px'} />
      <FormConfirmButton isDisplayed={status.isConnected} mt={'25px'} />
      <WarningMinMax isDisplayed={status.isConnected} mt={'25px'} />
    </>
  );
}
