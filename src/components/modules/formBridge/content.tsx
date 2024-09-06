'use client';
import { useMemo } from 'react';

import { FORM_BRIDGE_STATUS, useFormBridgeState } from './context';
import FormAssetSelect from './partials/form.assetSelect';
import FormBridgeAmount from './partials/form.bridgeAmount';
import FormConfirmButton from './partials/form.confirmButton';
import FormConnectButton from './partials/form.connectButton';
import FormDailyQuota from './partials/form.dailyQuota';
import FormDesAddress from './partials/form.desAddress';
import NetworkContainer from './partials/network.container';
import WarningDefault from './partials/warning.default';
import WarningMinMax from './partials/warning.minmax';

type FormBridgeContentProps = {};

export default function FormBridgeContent({}: FormBridgeContentProps) {
  const { status, desAddr } = useFormBridgeState().state;

  return (
    <>
      <NetworkContainer />
      <FormAssetSelect mt={'18px'} />
      <FormDesAddress isDisplayed={status.isConnected} mt={'18px'} />
      <FormBridgeAmount mt={'18px'} />
      <WarningDefault
        isDisplayed={status.isConnected && desAddr.length > 0}
        mt={'25px'}
      />
      <FormConnectButton isDisplayed={!status.isConnected} mt={'26px'} />
      <FormConfirmButton isDisplayed={status.isConnected} mt={'25px'} />
      <WarningMinMax isDisplayed={status.isConnected} mt={'25px'} />
    </>
  );
}
