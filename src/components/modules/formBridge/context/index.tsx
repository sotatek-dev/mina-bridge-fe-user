import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DesAddrRef } from '../partials/form.desAddress';

import useETHBridgeContract from '@/hooks/useETHBridgeContract';
import BridgeContract from '@/models/contract/evm/contract.bridge';
import { Network } from '@/models/network';
import { NetworkEVMProviderType } from '@/models/network/network';
import {
  getPersistSlice,
  getUISlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { TokenType } from '@/store/slices/persistSlice';
import { walletSliceActions } from '@/store/slices/walletSlice';

export enum FORM_BRIDGE_STATUS {
  DISCONNECTED = 'disconnected',
  CONNECTED = 'connected',
  NETWORK_NOT_MATCHED = 'network_not_matched',
  INVALID_DATA = 'invalid_submit_data',
}

export type DailyQuota = {
  max: string;
  current: string;
  asset: string;
};

export type FormBridgeState = {
  status: {
    isConnected: boolean;
    isValidData: boolean;
    isMatchedNetwork: boolean;
    isLoading: boolean;
    // willRefetchBln: boolean;
  };
  dailyQuota: DailyQuota;
  srcNetwork: Network | null;
  tarNetwork: Network | null;
  amount: string;
  desAddr: string;
  asset: TokenType | null;
  assetRange: string[];
  balance: string;
  txEmitCount: number;
};

export type FormBridgeCtxValueType = {
  state: FormBridgeState;
  constants: {
    isNativeCurrency: boolean;
    desAddrRef: React.MutableRefObject<DesAddrRef>;
    amountRef: React.MutableRefObject<DesAddrRef>;
    bridgeCtr: BridgeContract | null;
    nwProvider: NetworkEVMProviderType | undefined;
  };
  methods: {
    updateQuota: (quota: DailyQuota) => void;
    updateDesAddr: (addr: string) => void;
    updateAmount: (val: string) => void;
    updateStatus: (
      key: keyof FormBridgeState['status'],
      value: boolean
    ) => void;
    updateAsset: (asset: TokenType) => void;
    updateAssetRage: (assetRange: string[]) => void;
    updateBalance: (val: string) => void;
    // refetchBalance: () => void;
    updateTxEmitCount: () => void;
    resetFormValues: () => void;
  };
};
export type FormBridgeProviderProps = React.PropsWithChildren<{}>;

export const initModalCWState: FormBridgeState = {
  status: {
    isConnected: false,
    isValidData: false,
    isMatchedNetwork: true,
    isLoading: false,
    // willRefetchBln: false,
  },
  dailyQuota: {
    max: '0',
    current: '0',
    asset: '',
  },
  srcNetwork: null,
  tarNetwork: null,
  amount: '',
  desAddr: '',
  asset: null,
  assetRange: ['0', '0'],
  balance: '0',
  txEmitCount: 0,
};

export const FormBridgeContext =
  React.createContext<FormBridgeCtxValueType | null>(null);

export function useFormBridgeState() {
  return React.useContext(FormBridgeContext) as FormBridgeCtxValueType;
}

export default function FormBridgeProvider({
  children,
}: FormBridgeProviderProps) {
  const dispatch = useAppDispatch();
  const { isConnected, asset } = useAppSelector(getWalletSlice);
  const { isLoading } = useAppSelector(getUISlice);
  const { networkInstance } = useAppSelector(getWalletInstanceSlice);
  const { listAsset } = useAppSelector(getPersistSlice);

  const [state, setState] = useState<FormBridgeState>(initModalCWState);
  const desAddrRef = useRef<DesAddrRef>(null);
  const amountRef = useRef<DesAddrRef>(null);

  const nwProvider = useMemo(
    () =>
      networkInstance.src?.metadata &&
      'provider' in networkInstance.src?.metadata
        ? networkInstance.src.metadata.provider
        : undefined,
    [networkInstance.src]
  );
  const bridgeCtrAsset = useMemo(
    () =>
      asset ? { addr: asset.bridgeCtrAddr, network: asset.network } : null,
    [asset]
  );
  const bridgeCtr = useETHBridgeContract({
    network: networkInstance.src,
    provider: nwProvider,
    ctr: bridgeCtrAsset,
  });

  const isNativeCurrency = useMemo(
    () =>
      networkInstance.src?.nativeCurrency.symbol.toLowerCase() ===
      state.asset?.symbol.toLowerCase(),
    [state.asset, networkInstance.src]
  );

  // update partial state
  const updateNetwork = useCallback(
    (srcNetwork: Network, tarNetwork: Network) => {
      setState((prev) => ({
        ...prev,
        srcNetwork,
        tarNetwork,
      }));
    },
    [setState]
  );

  // update partial state
  const updateStatus = useCallback(
    (key: keyof FormBridgeState['status'], value: boolean) => {
      setState((prev) =>
        prev.status[key] !== value
          ? {
              ...prev,
              status: {
                ...prev.status,
                [key]: value,
              },
            }
          : prev
      );
    },
    [setState]
  );

  // const refetchBalance = useCallback(() => {
  //   updateStatus('willRefetchBln', true);
  //   setTimeout(() => updateStatus('willRefetchBln', false), 2000);
  // }, [updateStatus]);

  // update partial state
  const updateTxEmitCount = useCallback(() => {
    setState((prev) => ({
      ...prev,
      txEmitCount: prev.txEmitCount + 1,
    }));
  }, [setState]);

  // update partial state
  const updateDesAddr = useCallback(
    (address: string) => {
      setState((prev) =>
        prev.desAddr !== address
          ? {
              ...prev,
              desAddr: address,
            }
          : prev
      );
    },
    [setState]
  );

  // update partial state
  const updateAmount = useCallback(
    (amount: string) => {
      setState((prev) =>
        prev.amount !== amount
          ? {
              ...prev,
              amount,
            }
          : prev
      );
    },
    [setState]
  );

  // update partial state
  const updateAsset = useCallback(
    (asset: TokenType | null) => {
      setState((prev) =>
        !isEqual(prev.asset, asset)
          ? {
              ...prev,
              asset,
            }
          : prev
      );
    },
    [setState]
  );

  // update min max
  const updateAssetRage = useCallback(
    (assetRange: string[]) => {
      setState((prev) =>
        !isEqual(prev.assetRange, assetRange)
          ? {
              ...prev,
              assetRange,
            }
          : prev
      );
    },
    [setState]
  );

  // update balance
  const updateBalance = useCallback((balance: string) => {
    setState((prev) =>
      !isEqual(prev.balance, balance)
        ? {
            ...prev,
            balance,
          }
        : prev
    );
  }, []);

  // update balance
  const updateQuota = useCallback((dailyQuota: DailyQuota) => {
    setState((prev) =>
      !isEqual(prev.dailyQuota, dailyQuota)
        ? {
            ...prev,
            dailyQuota,
          }
        : prev
    );
  }, []);

  // execute when click confirm btn
  const resetFormValues = useCallback(() => {
    desAddrRef.current && desAddrRef.current.resetValue();
    amountRef.current && amountRef.current.resetValue();
    updateDesAddr('');
    updateAmount('');
  }, []);

  // check and update status to state
  const checkFormStatus = useCallback(
    (
      isConnected: boolean,
      isGlobalLoading: boolean,
      desAddr: string,
      amount: string
    ) => {
      // check connected
      updateStatus('isConnected', isConnected);

      // check data valid
      updateStatus('isValidData', desAddr.length > 0 && amount.length > 0);

      // sync loading with global loadin
      updateStatus('isLoading', isGlobalLoading);
    },
    [updateStatus]
  );

  // init assets
  useEffect(() => {
    if (!networkInstance.src || listAsset[networkInstance.src.name].length < 1)
      return;
    const assets = listAsset[networkInstance.src.name].filter(
      (asset) => asset.des === 'src'
    );
    if (!asset || asset.network !== networkInstance.src.name) {
      dispatch(
        walletSliceActions.changeAsset(
          assets.length > 0 ? assets[0] : undefined
        )
      );
      return;
    }

    updateAsset(asset);
  }, [asset, listAsset, networkInstance.src]);

  // reset form values each time change app status or change from network
  useEffect(() => {
    resetFormValues();
  }, [isConnected, state.srcNetwork]);

  // update form status when sth change
  useEffect(() => {
    checkFormStatus(isConnected, isLoading, state.desAddr, state.amount);
  }, [isConnected, isLoading, state.desAddr, state.amount]);

  // update state following global state
  useEffect(() => {
    if (!networkInstance.src || !networkInstance.tar) return;
    updateNetwork(networkInstance.src, networkInstance.tar);
  }, [networkInstance]);

  // remove asset when disconnect
  useEffect(() => {
    if (!isConnected) {
      updateAsset(null);
    }
  }, [isConnected]);

  // final value
  const value = useMemo<FormBridgeCtxValueType>(
    () => ({
      state,
      constants: {
        isNativeCurrency,
        desAddrRef,
        amountRef,
        bridgeCtr,
        nwProvider,
      },
      methods: {
        updateQuota,
        updateDesAddr,
        updateAmount,
        updateStatus,
        updateAsset,
        resetFormValues,
        updateAssetRage,
        updateBalance,
        updateTxEmitCount,
        // refetchBalance,
      },
    }),
    [
      state,
      amountRef,
      nwProvider,
      desAddrRef,
      isNativeCurrency,
      updateQuota,
      updateDesAddr,
      updateAmount,
      updateStatus,
      updateAsset,
      updateBalance,
      updateAssetRage,
      // refetchBalance,
      updateTxEmitCount,
      resetFormValues,
      bridgeCtr,
    ]
  );

  // return statement
  return (
    <FormBridgeContext.Provider value={value}>
      {children}
    </FormBridgeContext.Provider>
  );
}
