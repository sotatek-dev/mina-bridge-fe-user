import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookie from 'cookiejs';

import { createAppThunk } from '..';

import { persistSliceActions, TokenType } from './persistSlice';
import { walletInstanceSliceActions } from './walletInstanceSlice';

import NETWORKS, { Network, NETWORK_NAME } from '@/models/network';
import WALLETS, { Wallet, WALLET_NAME } from '@/models/wallet';
import { WALLET_EVENT_NAME } from '@/models/wallet/wallet.abstract';

export enum NETWORK_KEY {
  SRC = 'src',
  TAR = 'tar',
}

// state type
export type WalletStateConnected = {
  isConnected: true;
  address: string;
  walletKey: WALLET_NAME;
  networkName: Record<NETWORK_KEY, NETWORK_NAME>;
  asset?: TokenType;
};
export type WalletStateDisConnected = {
  address?: undefined;
  isConnected: false;
  walletKey: null;
  networkName: Record<NETWORK_KEY, null>;
  asset?: TokenType;
};
export type WalletState = WalletStateConnected | WalletStateDisConnected;

// payload type
export type connectWalletPayload = {
  wallet: Wallet;
  network: Network;

  onCnStart?: () => void;
  onCnFinish?: () => void;
  whileCnHandle?: () => void;
};

export type connectedPayload = Required<
  Omit<WalletStateConnected, 'isConnected' | 'asset'>
>;

// init state
const initialState: WalletState = {
  isConnected: false,
  walletKey: null,
  networkName: {
    src: null,
    tar: null,
  },
};

// thunk action
const connectWallet = createAppThunk<{
  message: string;
}>()(
  'wallet/connectWallet',
  async (
    {
      wallet,
      network,
      onCnStart,
      onCnFinish,
      whileCnHandle,
    }: connectWalletPayload,
    { dispatch, getState }
  ) => {
    const res = await wallet.connect(
      network,
      onCnStart,
      onCnFinish,
      undefined,
      whileCnHandle
    );
    // const curTarNetwork = getState().wallet.networkName.tar;
    // const isCurTarMatchSrc = curTarNetwork === network.name;
    const availTarNetwork = (Object.keys(NETWORKS) as NETWORK_NAME[]).filter(
      (key) => key !== network.name
    )[0];

    // store wallet and network key which contain serialize data that could use persist
    dispatch(
      walletSlicePrvActions.connected({
        walletKey: wallet.name,
        networkName: {
          src: network.name,
          // tar: isCurTarMatchSrc ? availTarNetwork : curTarNetwork,
          tar: availTarNetwork,
        },
        address: res,
      })
    );
    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() + Number(process.env.NEXT_PUBLIC_EXPIRE_COOKIE)
    );
    Cookie.set('address', res, {
      expires: expirationDate,
    });

    // store wallet and network instance which contain non-serialize data that couldn't use persist
    dispatch(
      walletInstanceSliceActions.initializeInstance({
        walletKey: wallet.name,
        networkName: {
          src: network.name,
          // tar: isCurTarMatchSrc ? availTarNetwork : curTarNetwork,
          tar: availTarNetwork,
        },
      })
    );

    // store last network key
    dispatch(persistSliceActions.setLastNetworkName(network.name));
    return true;
  }
);

// sync instance data with persisted wallet and network key when reload, revisit site
const rehydrateNetworkInstance = createAppThunk()(
  'wallet/rehydrateNetworkInstance',
  async (_, { dispatch, getState }) => {
    const { networkName, isConnected } = getState().wallet;
    if (!isConnected) return true;
    dispatch(
      walletInstanceSliceActions.changeNetwork({
        key: NETWORK_KEY.SRC,
        value: networkName.src,
      })
    );
    dispatch(
      walletInstanceSliceActions.changeNetwork({
        key: NETWORK_KEY.TAR,
        value: networkName.tar,
      })
    );

    return true;
  }
);
type ChangeNetworkPayload = { key: NETWORK_KEY; network: Network };

// when update network, also store network key to related states
const changeNetwork = createAppThunk()(
  'wallet/thunk/changeNetwork',
  async ({ key, network }: ChangeNetworkPayload, { dispatch, getState }) => {
    const curTarNetwork = getState().wallet.networkName.tar;
    const curSrcNetwork = getState().wallet.networkName.src;

    switch (key) {
      case NETWORK_KEY.SRC:
        const isCurTarMatchSrc = curTarNetwork === network.name;
        const availTarNetwork = (
          Object.keys(NETWORKS) as NETWORK_NAME[]
        ).filter((key) => key !== network.name)[0];
        // change src network
        const srcNWPayload = { key, value: network.name };
        dispatch(walletSlicePrvActions.changeNetwork(srcNWPayload));
        dispatch(walletInstanceSliceActions.changeNetwork(srcNWPayload));
        dispatch(persistSliceActions.setLastNetworkName(network.name)); // store key to persist slice
        // change tar network if src and tar is the same
        if (isCurTarMatchSrc) {
          const tarNWPayload = {
            key: NETWORK_KEY.TAR,
            value: availTarNetwork,
          };
          dispatch(walletSlicePrvActions.changeNetwork(tarNWPayload));
          dispatch(walletInstanceSliceActions.changeNetwork(tarNWPayload));
        }
        break;
      case NETWORK_KEY.TAR:
        const isCurSrcMatchTar = curSrcNetwork === network.name;
        // throw error if src network is equal tar network
        if (isCurSrcMatchTar)
          throw new Error('Source network couldn\'t be Target network');
        // change tar network
        const payload = { key, value: network.name };

        dispatch(walletSlicePrvActions.changeNetwork(payload));
        dispatch(walletInstanceSliceActions.changeNetwork(payload));
        break;
      default:
        break;
    }

    return true;
  }
);

const switchSrcTarNetwork = createAppThunk()(
  'wallet/thunk/switchSrcTarNetwork',
  async (_, { dispatch, getState }) => {
    const curTarNetwork = getState().wallet.networkName.tar;
    const curSrcNetwork = getState().wallet.networkName.src;
    const curWallet = getState().walletInstance.walletInstance;

    if (!curWallet || !curSrcNetwork || !curTarNetwork)
      throw new Error('You must connect to a wallet to use this feature');

    if (curWallet.metadata.supportedNetwork.includes(curTarNetwork)) {
      const res = await curWallet.connect(NETWORKS[curTarNetwork]);

      // store wallet and network key which contain serialize data that could use persist
      dispatch(
        walletSlicePrvActions.connected({
          walletKey: curWallet.name,
          networkName: {
            src: curTarNetwork,
            tar: curSrcNetwork,
          },
          address: res,
        })
      );

      // store wallet and network instance which contain non-serialize data that couldn't use persist
      dispatch(
        walletInstanceSliceActions.initializeInstance({
          walletKey: curWallet.name,
          networkName: {
            src: curTarNetwork,
            tar: curSrcNetwork,
          },
        })
      );
      dispatch(persistSliceActions.setLastNetworkName(curTarNetwork)); // store key to persist slice
      return true;
    }
    throw new Error(
      'Your wallet doesn\'t support this network. Please change the wallet connected'
    );
  }
);

const disconnect = createAppThunk()(
  'wallet/disconnect',
  async (_, { dispatch, getState }) => {
    const { walletInstance } = getState().walletInstance;
    // remove all listener before disconnect
    walletInstance!!.removeListener(WALLET_EVENT_NAME.ACCOUNTS_CHANGED);
    walletInstance!!.removeListener(WALLET_EVENT_NAME.CHAIN_CHANGED);
    walletInstance!!.removeListener(WALLET_EVENT_NAME.DISCONNECT);
    walletInstance!!.removeListener(WALLET_EVENT_NAME.MESSAGE);
    dispatch(walletSlicePrvActions.disconnectWallet());
    dispatch(walletInstanceSliceActions.removeInstances());
    Cookie.remove('address');
    return true;
  }
);

const reconnectWallet = createAppThunk()(
  'wallet/reconnectWallet',
  async (_, { dispatch, getState }) => {
    const { walletKey, networkName, asset } = getState().wallet;
    const { listAsset } = getState().persist;

    if (!walletKey || !WALLETS[walletKey])
      throw new Error(
        'You haven\'t connected to any wallet or network just yet'
      );
    dispatch(
      walletInstanceSliceActions.initializeInstance({
        walletKey,
        networkName,
      })
    );
    const res = await dispatch(
      connectWallet({
        wallet: WALLETS[walletKey],
        network: NETWORKS[networkName.src],
      })
    );

    if (
      connectWallet.rejected.match(res) &&
      res.error.message === WALLETS[walletKey].errorList.WALLET_CONNECT_REJECTED
    ) {
      dispatch(disconnect());
      return false;
    }

    const swRes = await WALLETS[walletKey].switchNetwork(
      NETWORKS[networkName.src]
    );

    // rehydrate asset
    if (asset) {
      const assetPersisted = listAsset[networkName.src].find(
        (item) => item.pairId === asset.pairId && item.symbol === asset.symbol
      );
      const assetReplacement = listAsset[networkName.src].find(
        (item) => item.pairId === asset.pairId && item.symbol === asset.symbol
      );
      if (!assetPersisted && !assetReplacement) {
        dispatch(walletSlicePrvActions.changeAsset());
      }
      if (!assetPersisted && assetReplacement) {
        dispatch(walletSlicePrvActions.changeAsset(assetReplacement));
      }
      if (assetPersisted) {
        dispatch(walletSlicePrvActions.changeAsset(assetPersisted));
      }
    }
    return swRes;
  }
);

// slice create
export const WalletSlice = createSlice({
  name: 'wallet',
  initialState: initialState as WalletState,
  reducers: {
    updateAccount(state, action: PayloadAction<string>) {
      state.address = action.payload;
    },
    changeNetwork(
      state,
      action: PayloadAction<{ key: 'src' | 'tar'; value: NETWORK_NAME }>
    ) {
      state.networkName[action.payload.key] = action.payload.value;
    },
    connected(state, action: PayloadAction<connectedPayload>) {
      state.isConnected = true;
      state.walletKey = action.payload.walletKey;
      state.networkName = action.payload.networkName;
      state.address = action.payload.address;
    },
    disconnectWallet(state) {
      state.address = undefined;
      state.isConnected = false;
      state.walletKey = null;
      state.networkName = { src: null, tar: null };
      state.asset = undefined;
    },
    changeAsset(state, action: PayloadAction<TokenType | undefined>) {
      state.asset = action.payload;
    },
  },
});

// normal flow action
const walletSlicePrvActions = WalletSlice.actions;
export const walletSliceActions = {
  changeAsset: walletSlicePrvActions.changeAsset,
  updateAccount: walletSlicePrvActions.updateAccount,
  connectWallet,
  rehydrateNetworkInstance,
  changeNetwork,
  switchSrcTarNetwork,
  disconnect,
  reconnectWallet,
};

// export
export default WalletSlice.reducer;
