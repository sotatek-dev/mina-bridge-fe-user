import { MODAL_NAME } from '@/configs/modal';
import { handleAsync, handleRequest } from '@/helpers/asyncHandlers';
import {
  formWei,
  formatNumber,
  formatNumber2,
  toWei,
  truncateMid,
} from '@/helpers/common';
import { getWeb3Instance } from '@/helpers/evmHandlers';
import useETHBridgeContract from '@/hooks/useETHBridgeContract';
import { EVMBridgeTXLock } from '@/models/contract/evm/contract.bridge';
// import ERC20Contract from '@/models/contract/zk/contract.ERC20';
import { NETWORK_TYPE } from '@/models/network/network';
import { WALLET_NAME } from '@/models/wallet';
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
import BigNumber from 'bignumber.js';
import { AccountUpdate, PublicKey, UInt64 } from 'o1js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const { modals } = useAppSelector(getUISlice);
  const { listIcon } = useAppSelector(getPersistSlice);
  const { address } = useAppSelector(getWalletSlice);
  const { networkInstance, walletInstance } = useAppSelector(
    getWalletInstanceSlice
  );

  const zkCtr = useZKContractState().state;

  const [isAgreeTerm, setIsAgreeTerm] = useState<boolean>(false);
  const [status, setStatus] = useState<MODAL_CF_STATUS>(MODAL_CF_STATUS.IDLE);
  const [transferFee, setTransferFee] = useState<string>('0');
  const [protocolFee, setProtocolFee] = useState<string>('0');

  const initCount = useRef<number>(0);

  const curModal = useMemo(() => modals[modalName], [modalName, modals]);

  const handleCloseModal = useCallback(() => {
    dispatch(uiSliceActions.closeModal({ modalName }));
  }, [modalName, dispatch]);

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
    return formatNumber(new BigNumber(amount).toString(), asset.decimals);
  }, [modalPayload]);

  function getReceivedAmount(params: {
    balance: string;
    transferFee: string;
    protocolFee: string;
    amount: string;
    asset: TokenType;
  }) {
    const amBn = new BigNumber(params.amount);
    const balBn = new BigNumber(params.balance);
    const tFeeBn = new BigNumber(params.transferFee);
    console.log('🚀 ~ useModalConfirmLogic ~ tFeeBn:', tFeeBn.toString());
    const pFeeBn = new BigNumber(params.protocolFee);
    console.log('🚀 ~ useModalConfirmLogic ~ pFeeBn:', pFeeBn.toString());

    const diffBalTFee = balBn.minus(tFeeBn); // compare balance with transaction fee
    const diffBalTFeeAm = diffBalTFee.minus(amBn); // compare balance with amount and transfer fee
    const isAmHasToOffset = diffBalTFeeAm.isNegative(); // check if amount have to pay for transfer fee
    const feeBn = isAmHasToOffset
      ? pFeeBn.plus(diffBalTFeeAm.multipliedBy(-1))
      : pFeeBn;
    const AmOffsetAmount = isAmHasToOffset
      ? diffBalTFeeAm.multipliedBy(-1)
      : '0';

    console.log('🚀 ~ useModalConfirmLogic ~ feeBn:', feeBn.toString());
    return {
      receivedAmount: amBn.minus(feeBn).toString(),
      transferAmount: amBn.minus(AmOffsetAmount).toString(),
      fee: feeBn.toString(),
    };
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
          label: 'Protocol fee:',
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

    const { receivedAmount, fee } = getReceivedAmount({
      amount,
      balance,
      transferFee,
      protocolFee,
      asset,
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
        label: 'Protocol fee:',
        value: `${formatNumber2(
          fee,
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
  }, [modalPayload, listIcon, transferFee, protocolFee]);

  function toggleAgreeTerm() {
    setIsAgreeTerm((prev) => !prev);
  }

  function onSuccess(): true {
    modalPayload && modalPayload.onFinish();
    setIsAgreeTerm(false);
    setStatus(MODAL_CF_STATUS.SUCCESS);
    setTransferFee('0');
    setProtocolFee('0');
    return true;
  }
  function onError(): false {
    modalPayload && modalPayload.onError();
    setIsAgreeTerm(false);
    setStatus(MODAL_CF_STATUS.ERROR);
    setTransferFee('0');
    setProtocolFee('0');
    return false;
  }

  function onDismiss() {
    modalPayload && modalPayload.onFinish();
    setStatus(MODAL_CF_STATUS.IDLE);
    setIsAgreeTerm(false);
    setTransferFee('0');
    setProtocolFee('0');
  }

  async function getProtocolFee(modalPayload: ModalConfirmBridgePayload) {
    const [res, error] = await handleRequest(
      usersService.getProtocolFee({
        pairId: modalPayload.asset.pairId,
        amount: toWei(modalPayload.amount, modalPayload.asset.decimals),
      })
    );
    if (error || !res) return setProtocolFee('0');
    return setProtocolFee(formWei(res.amount, modalPayload.asset.decimals));
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

  async function EVMBridgeTXGasEstimate(
    modalPayload: ModalConfirmBridgePayload,
    userAddr: string
  ) {
    if (!modalPayload.isNativeCurrency || !bridgeEVMCtr)
      return setTransferFee('0');
    const tx = buildEVMBridgeTX(modalPayload);
    if (!tx) return setTransferFee('0');
    const [res, error] = await handleAsync(
      {
        tx,
        userAddr,
      },
      async (params) => {
        // const sendValue = modalPayload.isNativeCurrency
        //   ? toWei(modalPayload.amount, modalPayload.asset.decimals)
        //   : '0';
        // console.log('🚀 ~ sendValue:', sendValue);
        const gasPrice = await getWeb3Instance(
          bridgeEVMCtr.provider
        ).eth.getGasPrice();
        console.log('🚀 ~ gasPrice:', gasPrice);
        // const gasAmount = await params.tx.estimateGas({
        //   from: params.userAddr,
        //   value: sendValue,
        // });
        const gasAmount = '100000';
        return { gasPrice, gasAmount };
      }
    );

    if (error || !res) return setTransferFee('0');
    const priceBN = new BigNumber(res.gasPrice?.toString() || '0').multipliedBy(
      10
    );
    console.log('🚀 ~ useModalConfirmLogic ~ priceBN:', priceBN.toString());
    const amountBN = new BigNumber(res.gasAmount.toString());
    console.log('🚀 ~ useModalConfirmLogic ~ amountBN:', amountBN.toString());
    console.log(
      '🚀 ~ useModalConfirmLogic ~ amountBN multiple:',
      amountBN.multipliedBy(priceBN).toString()
    );

    return setTransferFee(
      formWei(
        amountBN.multipliedBy(priceBN).toString(),
        modalPayload.asset.decimals
      )
    );
  }

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

  async function handleZKBridge({
    modalPayload,
    address,
  }: BridgePayload): Promise<boolean> {
    if (!walletInstance || !zkCtr.erc20Contract || !zkCtr.bridgeContract)
      return onError();
    // if (!walletInstance || !networkInstance.src) return onError();
    try {
      // first we need to prove tx
      setStatus(MODAL_CF_STATUS.INITIALIZE);

      // const ctr = new ERC20Contract(
      //   modalPayload.asset.tokenAddr,
      //   networkInstance.src
      // );
      // fetch involve into the process accounts
      await zkCtr.erc20Contract.fetchInvolveAccount(
        address,
        modalPayload.asset.bridgeCtrAddr
      );
      // await ctr.fetchInvolveAccount(address, modalPayload.asset.bridgeCtrAddr);
      const update = await AccountUpdate.create(
        zkCtr.bridgeContract.bridgeAddress,
        zkCtr.erc20Contract.contractInstance?.tokenId
      );
      const accountIsNew = await update.account.isNew.getAndRequireEquals();

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
      // end register account
      // build tx
      const tx = await zkCtr.bridgeContract.provider.transaction(
        // const tx = await ctr.provider.transaction(
        {
          sender: PublicKey.fromBase58(address),
          fee: UInt64.from(Number(0.1) * 1e9),
        },
        // PublicKey.fromBase58(address),
        async () => {
          await zkCtr.bridgeContract!!.lock(
            modalPayload.destAddr,
            toWei(modalPayload.amount, modalPayload.asset.decimals)
          );
        }
      );

      // prove tx
      await tx.prove();
      console.log('🚀 ~ useModalConfirmLogic ~ tx:', tx.toPretty());

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

  async function handleConfirm(): Promise<boolean> {
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
            transferFee,
            protocolFee,
            amount,
            asset,
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

  // async function handleInitZKCtr() {
  //   setStatus(MODAL_CF_STATUS.INITIALIZE);
  //   await ERC20Contract.init();
  //   setStatus(MODAL_CF_STATUS.IDLE);
  // }

  // initialize zk contract only one time each time user open this modal
  // useEffect(() => {
  //   if (
  //     !networkInstance.src ||
  //     networkInstance.src.type !== NETWORK_TYPE.ZK ||
  //     !curModal.isOpen ||
  //     initCount.current > 0
  //   )
  //     return;
  //   initCount.current += 1;
  //   handleInitZKCtr();
  // }, [networkInstance.src, curModal.isOpen]);

  // get transaction fee in evm chain
  useEffect(() => {
    if (
      !modalPayload ||
      !address ||
      !curModal.isOpen ||
      !networkInstance.src ||
      networkInstance.src.type !== NETWORK_TYPE.EVM
    )
      return;
    EVMBridgeTXGasEstimate(modalPayload, address);
  }, [modalPayload, address, curModal.isOpen, networkInstance.src]);

  // get protocol fee
  useEffect(() => {
    if (!modalPayload || !curModal.isOpen) return;
    getProtocolFee(modalPayload);
  }, [curModal.isOpen, modalPayload]);

  return {
    transferFee,
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
