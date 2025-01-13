import { MetaMaskInpageProvider, RequestArguments } from '@metamask/providers';
import Web3, { ProviderMessage, ProviderRpcError } from 'web3';

import Contract, {
  PROVIDER_TYPE,
  ProviderType,
} from '../contract/evm/contract';
import Network, {
  getZKChainIdName,
  NETWORK_NAME,
  NETWORK_TYPE,
} from '../network/network';

import Wallet, {
  URL_INSTALL_ANDROID,
  URL_INSTALL_EXTENSION,
  URL_INSTALL_IOS,
  WALLET_EVENT_NAME,
  WALLET_INJECT_OBJ,
  WALLET_NAME,
} from './wallet.abstract';

import ABICommonTokenErc20 from '@/configs/ABIs/evm/CommonTokenErc20';
import ITV from '@/configs/time';
import { IsServer } from '@/constants';
import { handleRequest } from '@/helpers/asyncHandlers';
import { fromWei } from '@/helpers/common';
import { getWeb3Instance } from '@/helpers/evmHandlers';
import { store } from '@/store';
import { TokenType } from '@/store/slices/persistSlice';

export type WalletMetamaskEvents =
  | {
      eventName: WALLET_EVENT_NAME.ACCOUNTS_CHANGED;
      handler: (accounts?: Array<string>) => void;
    }
  | {
      eventName: WALLET_EVENT_NAME.CHAIN_CHANGED;
      handler: (chainId?: string) => void;
    }
  | {
      eventName: WALLET_EVENT_NAME.DISCONNECT;
      handler: (error?: ProviderRpcError) => void;
    }
  | {
      eventName: WALLET_EVENT_NAME.MESSAGE;
      handler: (message?: ProviderMessage) => void;
    };
export default class WalletMetamask extends Wallet {
  errorList = {
    WALLET_NOT_INSTALLED: `Please install ${this.name} wallet`,
    WALLET_WRONG_CHAIN: 'You have connected to unsupported chain',
    WALLET_CONNECT_FAILED: 'Fail to connect wallet',
    WALLET_CONNECT_REJECTED: 'User rejected the request.',
    WALLET_GET_BALANCE_FAIL: "Can't get the current balance",
    MINA_UNKNOWN_SEND_ERROR: 'Unknown mina transaction error',
  };
  errorMessageList = {
    UNKNOWN_MINA_SEND_TX: "Couldn't send zkApp command",
  };

  constructor() {
    super({
      name: WALLET_NAME.METAMASK,
      metadata: {
        displayName: 'Metamask',
        supportedNetwork: [NETWORK_NAME.ETHEREUM],
        InjectedObject: WALLET_INJECT_OBJ.METAMASK,
        logo: {
          base: '/assets/logos/logo.metamask.png',
          checked: '/assets/logos/logo.metamask.png',
          supported: '/assets/logos/logo.metamask.png',
          unchecked: '/assets/logos/logo.metamask.png',
          unsupported: '/assets/logos/logo.metamask.png',
        },
        installationURL: {
          pc: URL_INSTALL_EXTENSION.METAMASK,
          android: URL_INSTALL_ANDROID.METAMASK,
          ios: URL_INSTALL_IOS.METAMASK,
        },
        supportedDevices: {
          [NETWORK_TYPE.EVM]: ['desktop', 'smartphone', 'tablet'],
          [NETWORK_TYPE.ZK]: ['desktop'],
        },
      },
    });
  }

  getInjectedObject(): MetaMaskInpageProvider {
    if (IsServer) {
      throw new Error('Server rendering error');
    }
    const metadata = store.getState().walletObj.metamask;
    if (!metadata.isInjected)
      throw new Error(this.errorList.WALLET_NOT_INSTALLED);
    return metadata.ethereum!!;
  }

  getProvider() {
    return new Web3(this.getInjectedObject());
  }

  async sendRequest<T = unknown>(args: RequestArguments): Promise<T> {
    return (await this.getInjectedObject().request<T>(args)) as T;
  }

  addListener(params: WalletMetamaskEvents, nwType?: NETWORK_TYPE) {
    const isZK = nwType === NETWORK_TYPE.ZK;
    const isChainChangedEv =
      params.eventName === WALLET_EVENT_NAME.CHAIN_CHANGED;
    if (isZK && isChainChangedEv) {
      const root = this;
      async function cb() {
        const [chainId] = await handleRequest(root.getNetwork(nwType));
        isChainChangedEv && params.handler(chainId || '');
      }
      return setInterval(cb, ITV.S5);
    }

    this.getInjectedObject().on(params.eventName, params.handler as any);
  }
  removeListener(e: WALLET_EVENT_NAME, nwType?: NETWORK_TYPE, id?: any) {
    const isZK = nwType === NETWORK_TYPE.ZK;
    const isChainChangedEv = e === WALLET_EVENT_NAME.CHAIN_CHANGED;
    if (isZK && isChainChangedEv && id) {
      return clearInterval(id);
    }
    this.getInjectedObject().removeAllListeners(e);
  }
  async connect(
    network: Network,
    onStart?: () => void,
    onFinish?: () => void,
    onError?: () => void,
    whileHandle?: () => void
  ) {
    let account: string = '';
    switch (network.type) {
      case NETWORK_TYPE.EVM:
        const accountArr = await this.sendRequest<string[]>({
          method: 'eth_requestAccounts',
        });
        // throw error if cannot get account
        if (
          !accountArr ||
          accountArr.length === 0 ||
          typeof accountArr[0] === 'undefined'
        ) {
          throw new Error(this.errorList.WALLET_CONNECT_FAILED);
        }
        // set account if could get correct account
        account = Web3.utils.toChecksumAddress(accountArr[0]);
        break;

      case NETWORK_TYPE.ZK:
        const snap = await this.sendRequest<GetSnapResponse>({
          method: 'wallet_getSnaps',
        });
        // console.log('🚀 ~ WalletMetamask ~ snap:', snap);
        const snapId: string = process.env.NEXT_PUBLIC_REQUIRED_SNAP_ID || '';
        const version: string =
          process.env.NEXT_PUBLIC_REQUIRED_SNAP_VERSION || '';

        if (!snap.hasOwnProperty(snapId) || snap[snapId].version !== version) {
          onStart && onStart();
          const [req, reqError] = await handleRequest(
            this.sendRequest({
              method: 'wallet_requestSnaps',
              params: {
                [snapId]: {
                  version: `^${version}`,
                },
              },
            })
          );
          whileHandle && whileHandle();
          if (reqError) throw reqError;
        }

        const accountInfo = await this.sendRequest<ResponseAccountInfo>({
          method: 'wallet_invokeSnap',
          params: {
            snapId,
            request: {
              method: 'mina_accountInfo',
              params: {},
            },
          },
        });

        onFinish && onFinish();
        account = accountInfo.publicKey;
        break;

      default:
        break;
    }
    return account;
  }

  async createTx() {
    return '';
  }

  async signTx() {
    return '';
  }

  async getNetwork(nwType?: NETWORK_TYPE) {
    if (!nwType || nwType === NETWORK_TYPE.EVM)
      return this.sendRequest<string>({
        method: 'eth_chainId',
      });
    if (nwType && nwType === NETWORK_TYPE.ZK) {
      const { name } = await this.sendRequest<Promise<ResponseNetworkConfig>>({
        method: 'wallet_invokeSnap',
        params: {
          snapId: 'npm:mina-portal',
          request: {
            method: 'mina_networkConfig',
          },
        },
      });
      return name;
    }
    return '0';
  }

  async getBalance(
    network: Network,
    userAddr: string,
    asset: TokenType
  ): Promise<string> {
    const isNativeToken = network.nativeCurrency.symbol === asset.symbol;

    switch (network.type) {
      case NETWORK_TYPE.EVM:
        // native
        if (isNativeToken) {
          const provider: ProviderType = {
            type: PROVIDER_TYPE.WALLET,
            injectObject: WALLET_INJECT_OBJ.METAMASK,
          };
          const web3 = getWeb3Instance(provider);
          const [blnWei, error] = await handleRequest(
            web3.eth.getBalance(userAddr)
          );
          if (error) throw new Error(this.errorList.WALLET_GET_BALANCE_FAIL);
          return fromWei(blnWei!!.toString(), asset.decimals);
        }
        return '';
      case NETWORK_TYPE.ZK:
        const snapId = process.env.NEXT_PUBLIC_REQUIRED_SNAP_ID || '';
        // check balance as native token
        if (isNativeToken) {
          const accountInfo = await this.sendRequest<ResponseAccountInfo>({
            method: 'wallet_invokeSnap',
            params: {
              snapId,
              request: {
                method: 'mina_accountInfo',
              },
            },
          });
          return fromWei(accountInfo.balance.total, asset.decimals);
        }
        // check balance as ERC20 token
        // const [tokenPub, convertPubError] = handleException(
        //   asset.tokenAddr,
        //   PublicKey.fromBase58
        // );

        // if (convertPubError || !tokenPub) return '0';

        // console.log(
        //   '🚀 ~ WalletMetamask ~ TokenId.toBase58(TokenId.derive(tokenPub)):',
        //   TokenId.toBase58(TokenId.derive(tokenPub))
        // );
        // const [account, reqError] = await handleRequest(
        //   this.sendRequest<ResponseAccountInfo>({
        //     method: 'wallet_invokeSnap',
        //     params: {
        //       snapId,
        //       request: {
        //         method: 'mina_accountInfo',
        //         params: {
        //           tokenId: TokenId.toBase58(TokenId.derive(tokenPub)),
        //         },
        //       },
        //     },
        //   })
        // );
        // if (reqError || !account)
        //   throw new Error(this.errorList.WALLET_GET_BALANCE_FAIL);
        // console.log('🚀 ~ WalletMetamask ~ account:', account);
        // return formWei(account.balance.total, asset.decimals);

        const ERC20Module = await import('@/models/contract/zk/contract.ERC20');
        const ERC20Contract = ERC20Module.default;

        // const [ctr, initCtrError] = await handleException(
        //   asset.tokenAddr,
        //   async (addr) => {
        //     const erc20ctr = new ERC20Contract()
        //     await erc20ctr.setInfo(addr, network)
        //     return erc20ctr
        //   }
        // );
        // if (initCtrError || !ctr) return '0';

        if (asset.network === NETWORK_NAME.ETHEREUM) {
          return '';
        }
        const ctr = new ERC20Contract();
        await ctr.setInfo(asset.tokenAddr, network);

        const [blnWei, reqError] = await handleRequest(
          ctr.getBalance(userAddr)
        );
        if (reqError || !blnWei)
          throw new Error(this.errorList.WALLET_GET_BALANCE_FAIL);

        return fromWei(blnWei!!.toString(), asset.decimals);

      default:
        return '';
    }
  }

  async getBalanceERC20(
    network: Network,
    userAddr: string,
    asset: TokenType,
    provider: ProviderType
  ): Promise<string> {
    switch (network.type) {
      case NETWORK_TYPE.EVM:
        const contract = new Contract({
          address: asset.tokenAddr,
          contractABI: ABICommonTokenErc20,
          provider: provider,
        });
        const [blnWei, error] = await handleRequest(
          contract.contractInstance.methods.balanceOf(userAddr).call()
        );
        if (error) throw new Error(this.errorList.WALLET_GET_BALANCE_FAIL);
        return fromWei(blnWei!!.toString(), asset.decimals);

      case NETWORK_TYPE.ZK:
        return '';

      default:
        return '';
    }
  }

  async switchNetwork(network: Network) {
    switch (network.type) {
      case NETWORK_TYPE.EVM:
        const chainId = await this.getNetwork();
        if (chainId !== network.metadata.chainId) {
          const [_, error] = await handleRequest(
            this.sendRequest({
              method: 'wallet_switchEthereumChain',
              params: [
                {
                  chainId: network.metadata.chainId,
                },
              ],
            })
          );
          if (error) return false;
        }
        return true;
      case NETWORK_TYPE.ZK:
        const { name } = await this.sendRequest<Promise<ResponseNetworkConfig>>(
          {
            method: 'wallet_invokeSnap',
            params: {
              snapId: 'npm:mina-portal',
              request: {
                method: 'mina_networkConfig',
              },
            },
          }
        );
        if (name !== network.metadata.chainId) {
          await this.sendRequest({
            method: 'wallet_invokeSnap',
            params: {
              snapId: 'npm:mina-portal',
              request: {
                method: 'mina_changeNetwork',
                params: {
                  networkName: getZKChainIdName(network.metadata.chainId),
                },
              },
            },
          });
        }
        return true;
      default:
        return false;
    }
  }

  async watchToken(params: {
    type: 'ERC20';
    options: {
      address: string;
      symbol: string;
      decimals: number;
      image?: string;
    };
  }) {
    return await this.sendRequest({ method: 'wallet_watchAsset', params });
  }

  async sendTx(payload: any): Promise<void> {
    const snapId: string = process.env.NEXT_PUBLIC_REQUIRED_SNAP_ID || '';

    const res = await this.getInjectedObject().request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: snapId,
        request: {
          method: 'mina_sendTransaction',
          params: {
            transaction: payload.transaction,
            feePayer: {
              fee: payload.fee,
            },
          },
        },
      },
    });
    // recheck when sent tx success, currently res return null
    if (
      !res ||
      (typeof res === 'string' &&
        res.includes(this.errorMessageList.UNKNOWN_MINA_SEND_TX))
    ) {
      throw new Error(this.errorList.MINA_UNKNOWN_SEND_ERROR);
    }
  }
}
