'use client';
import { Button, ButtonProps } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import React, { useMemo, useState } from 'react';
import Web3 from 'web3';

import { useFormBridgeState } from '../context';

import Loading from '@/components/elements/loading/spinner';
import ABICommonTokenErc20 from '@/configs/ABIs/evm/CommonTokenErc20';
import { MODAL_NAME } from '@/configs/modal';
import ITV from '@/configs/time';
import { formatNumber } from '@/helpers/common';
import useETHBridgeContract from '@/hooks/useETHBridgeContract';
import Contract, { PROVIDER_TYPE } from '@/models/contract/evm/contract';
import { NETWORK_TYPE } from '@/models/network/network';
import { WALLET_INJECT_OBJ } from '@/models/wallet/wallet.abstract';
import {
  getUISlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import {
  BANNER_NAME,
  ModalConfirmBridgePayload,
  uiSliceActions,
} from '@/store/slices/uiSlice';

type Props = { isDisplayed: boolean } & Pick<ButtonProps, ChakraBoxSizeProps>;

// component content
function Content(props: Omit<Props, 'isDisplayed'>) {
  const dispatch = useAppDispatch();
  const { status, asset, amount, desAddr, balance, isInsufficient } =
    useFormBridgeState().state;
  const { isNativeCurrency } = useFormBridgeState().constants;
  const { updateStatus, resetFormValues, updateTxEmitCount } =
    useFormBridgeState().methods;

  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const { networkInstance } = useAppSelector(getWalletInstanceSlice);
  const { address, asset: assetWallet } = useAppSelector(getWalletSlice);

  const { banners } = useAppSelector(getUISlice);

  const curBanner = banners[BANNER_NAME.UNMATCHED_CHAIN_ID];

  const isClickable =
    status.isValidData &&
    status.isMatchedNetwork &&
    !isInsufficient &&
    !(curBanner.isDisplay && curBanner.payload);

  // only token in evm chains need to get allowance
  const isNeedApprove =
    isClickable &&
    !isAllowed &&
    !isNativeCurrency &&
    networkInstance.src &&
    networkInstance.src.type === NETWORK_TYPE.EVM;

  const bridgeEVMCtr = useETHBridgeContract({
    ctr: asset ? { addr: asset.bridgeCtrAddr, network: asset.network } : null,
    network: networkInstance.src,
  });

  // get user allowance if spending token
  async function getAllowance(amount: string) {
    // console.log(
    //   '🚀 ~ file: form.confirmButton.tsx:15 ~ getAllowance ~ amount:',
    //   amount
    // );
    if (!assetWallet || !asset) return;

    const contract = new Contract({
      address: assetWallet.tokenAddr,
      contractABI: ABICommonTokenErc20,
      provider: {
        type: PROVIDER_TYPE.WALLET,
        injectObject: WALLET_INJECT_OBJ.METAMASK,
      },
    });

    const approve = await contract.contractInstance.methods
      .approve(
        assetWallet.bridgeCtrAddr,
        BigNumber(amount).multipliedBy(`1e${asset.decimals}`).toString(),
      )
      .send({ from: address });

    // if allowance < amount => request approve
    const allowance = await contract.contractInstance.methods
      .allowance(address, assetWallet.bridgeCtrAddr)
      .call();

    console.log('Address: ', { assetWallet, address, allowance, approve });

    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     setIsAllowed(true);
    //     resolve(null);
    //   }, 1000);
    // });
  }

  // finish action
  async function handleClick() {
    //  prevent perform actions when the btn is not clickable, currently performing other tasks
    if (
      !isClickable ||
      status.isLoading ||
      !networkInstance.src ||
      !asset ||
      !address
    )
      return;
    updateStatus('isLoading', true);

    // finalize
    function onFinish() {
      setTimeout(() => {
        updateStatus('isLoading', false);
        updateTxEmitCount();
      }, ITV.S2);
      resetFormValues();
    }

    function onError() {
      updateStatus('isLoading', false);
    }

    let payload: ModalConfirmBridgePayload | undefined;

    switch (networkInstance.src.type) {
      case NETWORK_TYPE.EVM:
        if (!bridgeEVMCtr) return onError();

        // if not native token, ask user permission before execute any else requests
        if (isNeedApprove) await getAllowance(amount);

        payload = {
          amount,
          asset: asset,
          destAddr: desAddr,
          isNativeCurrency,
          // fee: '0.0018394',
          balance: formatNumber(balance, asset.decimals),
          onFinish,
          onError,
        };
        // const res = await bridgeEVMCtr.lock({
        // desAddr,
        // tkAddr: asset.tokenAddr,
        // amount,
        // userAddr: address,
        // asset,
        // isNativeToken: isNativeCurrency,
        // });

        // console.log(
        //   '🚀 ~ file: form.confirmButton.tsx:73 ~ handleClick ~ res:',
        //   res
        // );

        break;

      case NETWORK_TYPE.ZK:
        payload = {
          amount,
          asset: asset,
          destAddr: desAddr,
          isNativeCurrency,
          balance,
          onFinish,
          onError,
        };
        break;

      default:
        break;
    }
    if (!payload) return;

    dispatch(
      uiSliceActions.openModal({
        modalName: MODAL_NAME.CONFIRM_BRIDGE,
        payload,
      }),
    );
  }

  // children rendered jsx following component status
  const childrenRendered = useMemo(() => {
    if (status.isLoading)
      return (
        <Loading
          id={'bridge-cf-btn-loading'}
          w={'24px'}
          h={'24px'}
          bgOpacity={0}
          spinnerSize={24}
          spinnerThickness={8}
        />
      );
    if (isNeedApprove) return 'Approve';
    return 'Next';
  }, [status.isLoading, isNeedApprove]);

  // final
  return (
    <Button
      variant={isClickable ? 'primary.orange.solid' : 'ghost'}
      w={'full'}
      h={'44px'}
      {...props}
      onClick={handleClick}
    >
      {childrenRendered}
    </Button>
  );
}

// container, it duty is to remove all effect, memo when component is not displayed
function FormConfirmButton({ isDisplayed, ...props }: Props) {
  return isDisplayed ? <Content {...props} /> : null;
}

export default FormConfirmButton;
