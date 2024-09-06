import { uniqBy } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { MODAL_NAME } from '@/configs/modal';
import { handleRequest } from '@/helpers/asyncHandlers';
import NETWORKS, { NETWORK_NAME } from '@/models/network';
import WALLETS, { WALLET_NAME } from '@/models/wallet';
import {
  getPersistSlice,
  getUISlice,
  getWalletInstanceSlice,
  getWalletObjSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { PersistState, TokenType } from '@/store/slices/persistSlice';
import { TITLE, uiSliceActions } from '@/store/slices/uiSlice';
import { walletSliceActions } from '@/store/slices/walletSlice';

export type ModalSTState = {
  isLoading: boolean;
  listToken: TokenType[];
  listTokenDisplay: TokenType[];
};

export type ModalSTCtxValueType = {
  state: ModalSTState;
  methods: {
    updateAsset: (asset: TokenType) => void;
    startLoading: () => void;
    stopLoading: () => void;
    updateDpList: (list: TokenType[]) => void;
    handleCloseCurModal: () => void;
  };
};
export type ModalSTProviderProps = React.PropsWithChildren<{
  modalName: MODAL_NAME;
}>;

export const initModalSTState: ModalSTState = {
  isLoading: false,
  listToken: [],
  listTokenDisplay: [],
};

export const ModalSTContext = React.createContext<ModalSTCtxValueType | null>(
  null
);

export function useModalSTState() {
  return React.useContext(ModalSTContext) as ModalSTCtxValueType;
}

export default function ModalSTProvider({
  children,
  modalName,
}: ModalSTProviderProps) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<ModalSTState>(initModalSTState);
  const { modals } = useAppSelector(getUISlice);
  const { networkName } = useAppSelector(getWalletSlice);
  const { listAsset } = useAppSelector(getPersistSlice);

  const curModal = useMemo(() => modals[modalName], [modals, modalName]);

  const getListToken = useCallback(
    (nw: NETWORK_NAME, list: PersistState['listAsset']) => {
      const listSrc = list[nw].filter((asset) => asset.des === 'src');
      const listToken = uniqBy(listSrc, (e) =>
        [e.tokenAddr, e.symbol, e.decimals].join()
      );
      setState((prev) => ({
        ...prev,
        listToken,
        listTokenDisplay: listToken,
      }));
    },
    [setState]
  );

  const startLoading = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
  }, [setState]);

  const stopLoading = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: false }));
  }, [setState]);

  const updateAsset = useCallback((asset: TokenType) => {
    dispatch(walletSliceActions.changeAsset(asset));
  }, []);

  const updateDpList = useCallback(
    (listTokenDisplay: TokenType[]) => {
      setState((prev) => ({ ...prev, listTokenDisplay }));
    },
    [setState]
  );

  const handleCloseModal = useCallback(
    (modalName: MODAL_NAME) => {
      dispatch(uiSliceActions.closeModal({ modalName }));
    },
    [modalName]
  );

  const handleCloseCurModal = useCallback(() => {
    handleCloseModal(modalName);
  }, [handleCloseModal]);

  useEffect(() => {
    if (!networkName.src) return;
    getListToken(networkName.src, listAsset);
  }, [networkName.src, listAsset]);

  const value = useMemo<ModalSTCtxValueType>(
    () => ({
      state,
      methods: {
        updateAsset,
        startLoading,
        stopLoading,
        updateDpList,
        handleCloseCurModal,
      },
    }),
    [
      state,
      updateAsset,
      startLoading,
      stopLoading,
      updateDpList,
      handleCloseCurModal,
    ]
  );

  return (
    <ModalSTContext.Provider value={value}>{children}</ModalSTContext.Provider>
  );
}
