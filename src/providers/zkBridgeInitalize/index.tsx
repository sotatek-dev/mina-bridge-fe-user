import { Bridge } from '@/configs/ABIs/zk/Bridge';
import { MODAL_NAME } from '@/configs/modal';
import BridgeContract from '@/models/contract/zk/contract.Bridge';
import ERC20Contract from '@/models/contract/zk/contract.ERC20';
import Network, { NETWORK_NAME, NETWORK_TYPE } from '@/models/network/network';
import {
  getUISlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppSelector,
} from '@/store';
import { TokenType } from '@/store/slices/persistSlice';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type ZKContractCtxValueType = {
  state: {
    isInitialized: boolean;
    isInitializing: boolean;
    erc20Contract: ERC20Contract | null;
    bridgeContract: BridgeContract | null;
  };
  constants: {};
  methods: {};
};

export type ZKContractInitializeProps = React.PropsWithChildren<{}>;

const initialValue: ZKContractCtxValueType = {
  state: {
    isInitialized: false,
    isInitializing: false,
    erc20Contract: null,
    bridgeContract: null,
  },
  constants: {},
  methods: {},
};

export const ZKContractCtx =
  React.createContext<ZKContractCtxValueType>(initialValue);

export function useZKContractState() {
  return React.useContext(ZKContractCtx);
}

export default function ZKContractProvider({
  children,
}: ZKContractInitializeProps) {
  const { networkInstance } = useAppSelector(getWalletInstanceSlice);
  const { modals } = useAppSelector(getUISlice);
  const { asset } = useAppSelector(getWalletSlice);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [erc20Contract, setErc20Contract] = useState<ERC20Contract | null>(
    null
  );
  const [bridgeContract, setBridgeContract] = useState<BridgeContract | null>(
    null
  );

  const modalConnectWallet = useMemo(
    () => modals[MODAL_NAME.CONNECT_WALLET],
    [modals]
  );
  const modalConnectWalletSuccess = useMemo(
    () => modals[MODAL_NAME.SUCCESS_ACTION],
    [modals]
  );
  async function handleInitializeScripts(
    asset: TokenType,
    nwInstance: Network
  ) {
    if (isInitializing || isInitialized) return;
    setIsInitializing(true);
    await ERC20Contract.init();
    await BridgeContract.init();
    console.log('🚀 ~ asset:', asset);
    const erc20Ctr = new ERC20Contract(asset.tokenAddr, nwInstance);
    const bridgeCtr = new BridgeContract(
      asset.bridgeCtrAddr,
      asset.tokenAddr,
      nwInstance
    );
    setIsInitialized(true);
    setIsInitializing(false);
    setErc20Contract(erc20Ctr);
    setBridgeContract(bridgeCtr);
  }

  function handleChangeInstance(asset: TokenType) {
    if (!erc20Contract || !bridgeContract) return;
    // only change when token change
    if (
      asset.network === NETWORK_NAME.MINA &&
      asset.tokenAddr !== erc20Contract.tokenAddress.toBase58()
    ) {
      erc20Contract.changeInstance(asset.tokenAddr);
      bridgeContract.changeInstance(asset.bridgeCtrAddr, asset.tokenAddr);
    }
  }

  // initialize instances
  useEffect(() => {
    if (
      !networkInstance.src ||
      networkInstance.src.type !== NETWORK_TYPE.ZK ||
      !asset ||
      isInitialized ||
      modalConnectWallet.isOpen ||
      modalConnectWalletSuccess.isOpen
    )
      return;
    handleInitializeScripts(asset, networkInstance.src);
  }, [
    networkInstance.src,
    asset,
    isInitialized,
    modalConnectWallet.isOpen,
    modalConnectWalletSuccess.isOpen,
  ]);

  // change instances when asset change and isInitialized
  useEffect(() => {
    if (
      !networkInstance.src ||
      networkInstance.src.type !== NETWORK_TYPE.ZK ||
      !asset ||
      !isInitialized
    )
      return;
    handleChangeInstance(asset);
  }, [networkInstance.src, asset, isInitialized]);

  const value = useMemo<ZKContractCtxValueType>(
    () => ({
      state: { isInitialized, isInitializing, erc20Contract, bridgeContract },
      constants: {},
      methods: {},
    }),
    [isInitialized, isInitializing, erc20Contract, bridgeContract]
  );

  return (
    <ZKContractCtx.Provider value={value}>{children}</ZKContractCtx.Provider>
  );
}
