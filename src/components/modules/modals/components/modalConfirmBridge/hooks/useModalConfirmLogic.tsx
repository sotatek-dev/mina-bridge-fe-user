import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { MODAL_NAME } from '@/configs/modal';
import { IsServer } from '@/constants';
import { handleAsync, handleRequest } from '@/helpers/asyncHandlers';
import {
  formatNumber,
  formatNumber2,
  formWei,
  toWei,
  truncateMid,
} from '@/helpers/common';
import { getWeb3Instance } from '@/helpers/evmHandlers';
import useETHBridgeContract from '@/hooks/useETHBridgeContract';
import useNotifier from '@/hooks/useNotifier';
import { EVMBridgeTXLock } from '@/models/contract/evm/contract.bridge';
import { NETWORK_TYPE } from '@/models/network/network';
import { WALLET_NAME, WalletAuro } from '@/models/wallet';
import { useZKContractState } from '@/providers/zkBridgeInitalize';
import usersService from '@/services/usersService';
import {
  getPersistSlice,
  getUISlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { TokenType } from '@/store/slices/persistSlice';
import {
  ModalConfirmBridgePayload,
  uiSliceActions,
} from '@/store/slices/uiSlice';

type BridgePayload = {
  modalPayload: ModalConfirmBridgePayload;
  address: string;
};

export enum MODAL_CF_STATUS {
  IDLE = 'IDLE',
  INITIALIZE = 'INITIALIZE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

type Params = {
  modalName: MODAL_NAME;
};

export default function useModalConfirmLogic({ modalName }: Params) {
  const dispatch = useAppDispatch();
  const { sendNotification } = useNotifier();
  const { modals } = useAppSelector(getUISlice);
  const { listIcon } = useAppSelector(getPersistSlice);
  const { address, asset } = useAppSelector(getWalletSlice);
  const { networkInstance, walletInstance } = useAppSelector(
    getWalletInstanceSlice
  );

  const zkCtr = useZKContractState().state;

  const [isAgreeTerm, setIsAgreeTerm] = useState<boolean>(false);
  const [status, setStatus] = useState<MODAL_CF_STATUS>(MODAL_CF_STATUS.IDLE);
  // const [transferFee, setTransferFee] = useState<string>('0');
  const [gasFee, setGasFee] = useState<string>('0');
  const [tipFee, setTipFee] = useState<string>('0');

  const curModal = useMemo(() => modals[modalName], [modalName, modals]);

  const modalPayload = useMemo(
    () =>
      curModal.payload && 'destAddr' in curModal.payload
        ? curModal.payload
        : null,
    [curModal]
  );

  const bridgeEVMCtr = useETHBridgeContract({
    ctr: modalPayload?.asset
      ? {
          addr: modalPayload.asset.bridgeCtrAddr,
          network: modalPayload.asset.network,
        }
      : null,
    network: networkInstance.src,
  });

  const dpAmount = useMemo(() => {
    if (!modalPayload) return 0;
    const { asset, amount } = modalPayload;

    const minimumNumber =
      asset.decimals > 4
        ? new BigNumber(10).pow(-4)
        : new BigNumber(10).pow(-asset.decimals);
    if (new BigNumber(amount).lt(minimumNumber)) {
      return `~${new BigNumber(minimumNumber).toString(10)}`;
    }

    return formatNumber(
      new BigNumber(amount).toString(),
      asset.decimals,
      BigNumber.ROUND_DOWN
    );
  }, [modalPayload]);

  function getReceivedAmount(params: {
    balance: string;
    amount: string;
    asset: TokenType;
    tipFee: string;
    gasFee: string;
  }) {
    // const amBn = new BigNumber(params.amount);
    // const balBn = new BigNumber(params.balance);
    // const pFeeBn = new BigNumber(params.protocolFee);
    // const tFeeBn = new BigNumber(params.transferFee);
    // console.log('🚀 ~ useModalConfirmLogic ~ tFeeBn:', tFeeBn.toString());
    // const pFeeBn = new BigNumber(params.protocolFee);
    // console.log('🚀 ~ useModalConfirmLogic ~ pFeeBn:', pFeeBn.toString());
    //
    // const diffBalTFee = balBn.minus(tFeeBn); // compare balance with transaction fee
    // const diffBalTFeeAm = diffBalTFee.minus(amBn); // compare balance with amount and transfer fee
    // const isAmHasToOffset = diffBalTFeeAm.isNegative(); // check if amount have to pay for transfer fee
    // const feeBn = isAmHasToOffset
    //   ? pFeeBn.plus(diffBalTFeeAm.multipliedBy(-1))
    //   : pFeeBn;
    // const AmOffsetAmount = isAmHasToOffset
    //   ? diffBalTFeeAm.multipliedBy(-1)
    //   : '0';
    //
    // console.log('🚀 ~ useModalConfirmLogic ~ feeBn:', feeBn.toString());
    // return {
    //   receivedAmount: amBn.minus(feeBn).toString(),
    //   transferAmount: amBn.minus(AmOffsetAmount).toString(),
    //   fee: feeBn.toString(),
    // };

    const amountBn = new BigNumber(params.amount);
    const balanceBn = new BigNumber(params.balance);
    const tipFeeBn = new BigNumber(params.tipFee);
    const gasFeeBn = new BigNumber(params.gasFee);

    return {
      receivedAmount: amountBn.minus(tipFee).toString(),
      transferAmount: amountBn.toString(),
      tipFeeAmount: tipFeeBn.toString(),
      gasFeeAmount: gasFeeBn.toString()
    }
  }

  const displayValues = useMemo(() => {
    if (!modalPayload)
      return [
        {
          label: 'Asset:',
          value: '',
          affixIcon: '',
        },
        {
          label: 'Destination:',
          value: '',
          affixIcon: '',
        },
        {
          label: 'Tip fee:',
          value: '~',
          affixIcon: '',
        },
        {
          label: 'Gas fee:',
          value: '~',
          affixIcon: '',
        },
        {
          label: 'You will receive:',
          value: '~',
          affixIcon: '',
        },
      ];

    const { asset, amount, destAddr, balance } = modalPayload;
    const [addrStart, addrEnd] = truncateMid(destAddr, 4, 4);
    const assetIcon = listIcon.find((e) => e.symbol === asset.symbol);

    const { receivedAmount, tipFeeAmount, gasFeeAmount } = getReceivedAmount({
      balance,
      amount,
      asset,
      tipFee,
      gasFee,
    });

    return [
      {
        label: 'Asset:',
        value: asset.symbol.toUpperCase(),
        affixIcon: assetIcon?.icon || '',
      },
      {
        label: 'Destination:',
        value: `${addrStart}...${addrEnd}`,
        affixIcon: assetIcon?.icon || '',
      },
      {
        label: 'Tip fee:',
        value: `${formatNumber2(
          tipFeeAmount,
          asset.decimals,
          '~'
        )} ${asset.symbol.toUpperCase()}`,
        affixIcon: assetIcon?.icon || '',
      },
      {
        label: 'Unlocking fee:',
        value: `${formatNumber2(
          gasFeeAmount,
          asset.decimals,
          '~'
        )} ${asset.symbol.toUpperCase()}`,
        affixIcon: assetIcon?.icon || '',
      },
      {
        label: 'You will receive:',
        value: `${formatNumber2(
          receivedAmount,
          asset.decimals,
          '~'
        )} ${asset.symbol.toUpperCase()}`,
        affixIcon: assetIcon?.icon || '',
      },
    ];
  }, [modalPayload, listIcon, gasFee]);

  function toggleAgreeTerm() {
    setIsAgreeTerm((prev) => !prev);
  }

  function onSuccess(): true {
    modalPayload && modalPayload.onFinish();
    setIsAgreeTerm(false);
    setStatus(MODAL_CF_STATUS.SUCCESS);
    setGasFee('0');
    setTipFee('0');
    return true;
  }
  function onError(): false {
    modalPayload && modalPayload.onError();
    setIsAgreeTerm(false);
    setStatus(MODAL_CF_STATUS.ERROR);
    setGasFee('0');
    setTipFee('0');
    return false;
  }

  function onDismiss() {
    modalPayload && modalPayload.onFinish();
    setStatus(MODAL_CF_STATUS.IDLE);
    setIsAgreeTerm(false);
    setGasFee('0');
    setTipFee('0');
  }

  const handleCloseModal = useCallback(() => {
    dispatch(uiSliceActions.closeModal({ modalName }));
  }, [modalName, dispatch]);

  async function getProtocolFee(modalPayload: ModalConfirmBridgePayload) {
    const [res, error] = await handleRequest(
      usersService.getProtocolFee({
        pairId: modalPayload.asset.pairId,
      })
    );
    if (error || !res) {
      setGasFee("0");
      setTipFee('0');
      return;
    }
    setGasFee(formWei(res.gasFee, res.decimal));
    setTipFee(new BigNumber(modalPayload.amount).times(res.tipRate).div(100).toString())
  }

  function buildEVMBridgeTX(
    params: ModalConfirmBridgePayload
  ): EVMBridgeTXLock | null {
    if (!bridgeEVMCtr) return null;
    console.log('🚀 ~ useModalConfirmLogic ~ params.amount:', params.amount);
    return bridgeEVMCtr.buildTxLock({
      desAddr: params.destAddr,
      tkAddr: params.asset.tokenAddr,
      amount: params.amount,
      asset: params.asset,
    });
  }

  // async function EVMBridgeTXGasEstimate(
  //   modalPayload: ModalConfirmBridgePayload,
  //   userAddr: string
  // ) {
  //   if (!modalPayload.isNativeCurrency || !bridgeEVMCtr)
  //     return setTransferFee('0');
  //   const tx = buildEVMBridgeTX(modalPayload);
  //   if (!tx) return setTransferFee('0');
  //   const [res, error] = await handleAsync(
  //     {
  //       tx,
  //       userAddr,
  //     },
  //     async (params) => {
  //       // const sendValue = modalPayload.isNativeCurrency
  //       //   ? toWei(modalPayload.amount, modalPayload.asset.decimals)
  //       //   : '0';
  //       // console.log('🚀 ~ sendValue:', sendValue);
  //       const gasPrice = await getWeb3Instance(
  //         bridgeEVMCtr.provider
  //       ).eth.getGasPrice();
  //       console.log('🚀 ~ gasPrice:', gasPrice);
  //       // const gasAmount = await params.tx.estimateGas({
  //       //   from: params.userAddr,
  //       //   value: sendValue,
  //       // });
  //       const gasAmount = process.env.NEXT_PUBLIC_ESTIMATE_GAS_AMOUNT || '50000';
  //       return { gasPrice, gasAmount };
  //     }
  //   );
  //
  //   if (error || !res) return setTransferFee('0');
  //   const priceBN = new BigNumber(res.gasPrice?.toString() || '0').multipliedBy(
  //     process.env.NEXT_PUBLIC_ESTIMATE_PRICE_RATIO || 10
  //   );
  //   console.log('🚀 ~ useModalConfirmLogic ~ priceBN:', priceBN.toString());
  //   const amountBN = new BigNumber(res.gasAmount.toString());
  //   console.log('🚀 ~ useModalConfirmLogic ~ amountBN:', amountBN.toString());
  //   console.log(
  //     '🚀 ~ useModalConfirmLogic ~ amountBN multiple:',
  //     amountBN.multipliedBy(priceBN).toString()
  //   );
  //
  //   return setTransferFee(
  //     formWei(
  //       amountBN.multipliedBy(priceBN).toString(),
  //       modalPayload.asset.decimals
  //     )
  //   );
  // }

  async function handleEVMBridge(
    tx: EVMBridgeTXLock,
    { modalPayload, address }: BridgePayload
  ): Promise<boolean> {
    if (!bridgeEVMCtr) return onError();
    const [_, error] = await handleRequest(
      bridgeEVMCtr.sendTxLock(tx, {
        amount: modalPayload.amount,
        userAddr: address,
        asset: modalPayload.asset,
        isNativeToken: modalPayload.isNativeCurrency,
      })
    );
    if (error) return onError();
    return onSuccess();
  }

  async function handleZKBridge({ modalPayload, address }: BridgePayload) {
    if (IsServer) return onError();

    if (!walletInstance || !zkCtr.erc20Contract || !zkCtr.bridgeContract)
      return onError();
    if (!walletInstance || !networkInstance.src) return onError();

    try {
      const { PublicKey, AccountUpdate, UInt64 } = await import('o1js');

      // first we need to prove tx
      setStatus(MODAL_CF_STATUS.INITIALIZE);

      // fetch involve into the process accounts
      await zkCtr.erc20Contract.fetchInvolveAccount(
        address,
        modalPayload.asset.bridgeCtrAddr
      );

      const update = await AccountUpdate.create(
        zkCtr.bridgeContract.bridgeAddress,
        zkCtr.erc20Contract.contractInstance?.tokenId
      );
      const accountIsNew = await update.account.isNew.getAndRequireEquals();

      // check balance before transaction
      if (walletInstance.name === WALLET_NAME.AURO && asset) {
        const balance = await (walletInstance as WalletAuro).getNativeBalance(
          networkInstance.src,
          address,
          asset
        );
        if (new BigNumber(balance).lt(0.1)) {
          sendNotification({
            toastType: 'error',
            options: {
              title: 'Insufficient MINA to handle transaction',
            },
          });
          throw new Error('Insufficient MINA to handle transaction');
        }
      }

      // register account for the first time
      if (accountIsNew.toBoolean()) {
        const tx1 = await zkCtr.bridgeContract.provider.transaction(
          {
            sender: PublicKey.fromBase58(address),
            fee: UInt64.from(Number(0.1) * 1e9),
          },
          async () => {
            AccountUpdate.fundNewAccount(PublicKey.fromBase58(address), 1);
            await zkCtr.bridgeContract!!.lock('1', '200000000');
          }
        );

        await tx1.prove();
        // send tx via wallet instances
        switch (walletInstance.name) {
          case WALLET_NAME.AURO:
            await walletInstance.sendTx(tx1.toJSON());
            break;
          case WALLET_NAME.METAMASK:
            await walletInstance.sendTx({
              transaction: tx1.toJSON(),
              fee: Number(0.1),
            });
            break;
          default:
            break;
        }
      }

      // check balance before transaction
      if (walletInstance.name === WALLET_NAME.AURO && asset) {
        const balance = await (walletInstance as WalletAuro).getNativeBalance(
          networkInstance.src,
          address,
          asset
        );
        if (new BigNumber(balance).lt(0.1)) {
          sendNotification({
            toastType: 'error',
            options: {
              title: 'Insufficient MINA to handle transaction',
            },
          });
          throw new Error('Insufficient MINA to handle transaction');
        }
      }

      // end register account
      // build tx
      const tx = await zkCtr.bridgeContract.provider.transaction(
        // const tx = await ctr.provider.transaction(
        {
          sender: PublicKey.fromBase58(address),
          fee: UInt64.from(Number(0.1) * 1e9),
        },
        async () => {
          await zkCtr.bridgeContract!!.lock(
            modalPayload.destAddr,
            toWei(modalPayload.amount, modalPayload.asset.decimals)
          );
        }
      );

      // prove tx
      await tx.prove();

      // only when a tx is proved then system will start send payment request
      setStatus(MODAL_CF_STATUS.LOADING);

      // send tx via wallet instances
      switch (walletInstance.name) {
        case WALLET_NAME.AURO:
          await walletInstance.sendTx(tx.toJSON());
          break;
        case WALLET_NAME.METAMASK:
          await walletInstance.sendTx({
            transaction: tx.toJSON(),
            fee: Number(0.1),
          });
          break;
        default:
          break;
      }
      return onSuccess();
    } catch (error) {
      console.log('🚀 ~ useModalConfirmLogic ~ error:', error);
      return onError();
    }
  }

  async function handleConfirm() {
    if (
      !networkInstance.src ||
      !modalPayload ||
      !address ||
      status !== MODAL_CF_STATUS.IDLE
    )
      return false;
    const { asset, amount, balance } = modalPayload;

    switch (networkInstance.src.type) {
      case NETWORK_TYPE.EVM:
        setStatus(MODAL_CF_STATUS.LOADING);
        if (modalPayload.isNativeCurrency) {
          const { transferAmount } = getReceivedAmount({
            balance,
            amount,
            asset,
            tipFee,
            gasFee
          });
          console.log('🚀 ~ handleConfirm ~ receivedAmount:', transferAmount);
          const emitTx = buildEVMBridgeTX({
            ...modalPayload,
            amount: transferAmount,
          });
          console.log('🚀 ~ handleConfirm ~ emitTx:', emitTx);
          if (!emitTx) return onError();
          emitTx;
          return await handleEVMBridge(emitTx, {
            modalPayload: {
              ...modalPayload,
              amount: transferAmount,
            },
            address,
          });
        }
        const emitTx = buildEVMBridgeTX(modalPayload);
        if (!emitTx) return onError();
        return await handleEVMBridge(emitTx, { modalPayload, address });
      case NETWORK_TYPE.ZK:
        return await handleZKBridge({ modalPayload, address });
      default:
        return onSuccess();
    }
  }

  // get transaction fee in evm chain
  // useEffect(() => {
  //   if (
  //     !modalPayload ||
  //     !address ||
  //     !curModal.isOpen ||
  //     !networkInstance.src ||
  //     networkInstance.src.type !== NETWORK_TYPE.EVM
  //   )
  //     return;
  //   EVMBridgeTXGasEstimate(modalPayload, address);
  // }, [modalPayload, address, curModal.isOpen, networkInstance.src]);

  // get protocol fee
  useEffect(() => {
    if (!modalPayload || !curModal.isOpen) return;
    getProtocolFee(modalPayload);
  }, [curModal.isOpen, modalPayload]);

  return {
    // transferFee,
    dpAmount,
    status,
    modalPayload,
    networkInstance,
    displayValues,
    isAgreeTerm,
    toggleAgreeTerm,
    handleConfirm,
    onDismiss,
    handleCloseModal,
  };
}
