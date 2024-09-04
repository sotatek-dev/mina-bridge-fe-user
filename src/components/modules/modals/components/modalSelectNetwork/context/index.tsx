import { MODAL_NAME } from '@/configs/modal';
import { handleRequest } from '@/helpers/asyncHandlers';
import useNotifier from '@/hooks/useNotifier';
import NETWORKS, { NETWORK_NAME, Network } from '@/models/network';
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
import {
  ModalController,
  TITLE,
  ToastType,
  uiSliceActions,
} from '@/store/slices/uiSlice';
import { NETWORK_KEY, walletSliceActions } from '@/store/slices/walletSlice';
import React, { useCallback, useMemo } from 'react';

export type ModalSNState = {
  selectedNetwork: NETWORK_NAME | null;
};

export type ModalSNCtxValueType = {
  methods: {
    handleOpenLoadingModal: () => void;
    handleCloseCurModal: () => void;
    handleCloseLoadingModal: () => void;
    hasSupportedNetwork: (e: NETWORK_NAME) => boolean;
  };
  constants: {
    modalName: MODAL_NAME;
    curModal: ModalController;
    curNetworkKey: NETWORK_KEY;
  };
};
export type ModalSNProviderProps = React.PropsWithChildren<{
  modalName: MODAL_NAME;
}>;

export const ModalSNContext = React.createContext<ModalSNCtxValueType | null>(
  null
);

export function useModalSNState() {
  return React.useContext(ModalSNContext) as ModalSNCtxValueType;
}

export default function ModalSNProvider({
  children,
  modalName,
}: ModalSNProviderProps) {
  const dispatch = useAppDispatch();
  const { modals } = useAppSelector(getUISlice);
  const { networkName, isConnected } = useAppSelector(getWalletSlice);
  const { walletInstance } = useAppSelector(getWalletInstanceSlice);
  const { sendNotification } = useNotifier();

  const curModal = useMemo(() => modals[modalName], [modals, modalName]);

  const modalPayload = useMemo(() => curModal.payload, [curModal]);

  const curNetworkKey = useMemo(() => {
    if (!modalPayload || !('networkKey' in modalPayload))
      return NETWORK_KEY.SRC;
    return modalPayload.networkKey;
  }, [modalPayload]);

  const hasSupportedNetwork = useCallback(
    (key: NETWORK_NAME) => {
      if (!walletInstance) return true;
      switch (curNetworkKey) {
        case NETWORK_KEY.SRC:
          return walletInstance.metadata.supportedNetwork.includes(key);
        case NETWORK_KEY.TAR:
          return key !== networkName.src;
        default:
          return true;
      }
    },
    [isConnected, networkName, modalPayload, walletInstance]
  );

  const handleOpenLoadingModal = useCallback(() => {
    dispatch(
      uiSliceActions.openModal({
        modalName: MODAL_NAME.LOADING,
        payload: { titleLoading: 'Waiting for confirmation' },
      })
    );
  }, [dispatch]);

  const handleCloseModal = useCallback(
    (modalName: MODAL_NAME) => {
      dispatch(uiSliceActions.closeModal({ modalName }));
    },
    [dispatch]
  );

  const handleCloseCurModal = useCallback(() => {
    handleCloseModal(modalName);
  }, [handleCloseModal]);

  const handleCloseLoadingModal = useCallback(() => {
    handleCloseModal(MODAL_NAME.LOADING);
  }, [handleCloseModal]);

  const value = useMemo<ModalSNCtxValueType>(
    () => ({
      methods: {
        handleOpenLoadingModal,
        handleCloseCurModal,
        handleCloseLoadingModal,
        hasSupportedNetwork,
      },
      constants: {
        curModal,
        modalName,
        curNetworkKey,
      },
    }),
    [
      handleOpenLoadingModal,
      handleCloseCurModal,
      handleCloseLoadingModal,
      hasSupportedNetwork,
      curModal,
      modalName,
      curNetworkKey,
    ]
  );

  return (
    <ModalSNContext.Provider value={value}>{children}</ModalSNContext.Provider>
  );
}
