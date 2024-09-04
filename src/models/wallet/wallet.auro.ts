import Network, { NETWORK_NAME, NETWORK_TYPE } from "../network/network";
import Wallet, {
  URL_INSTALL_ANDROID,
  URL_INSTALL_EXTENSION,
  URL_INSTALL_IOS,
  WALLET_EVENT_NAME,
  WALLET_INJECT_OBJ,
  WALLET_NAME
} from "./wallet.abstract";
import MinaProvider, { ChainInfoArgs } from "@aurowallet/mina-provider";
import { TokenType } from "@/store/slices/persistSlice";
import { getAccountInfoQuery } from "@/grapql/queries";
import { gql } from "@/grapql";
import { handleRequest } from "@/helpers/asyncHandlers";
import { formWei } from "@/helpers/common";
import { IsServer } from "@/constants";

type MinaRequestResType<T> = SplitType<T>[0];
type MinaRequestErrorType<T> = SplitType<T>[1];

export type WalletAuroEvents =
  | {
      eventName: WALLET_EVENT_NAME.ACCOUNTS_CHANGED;
      handler: (accounts?: Array<string>) => void;
    }
  | {
      eventName: WALLET_EVENT_NAME.CHAIN_CHANGED;
      handler: (chainId: ChainInfoArgs) => void;
    }
  | {
      eventName: WALLET_EVENT_NAME.DISCONNECT;
      handler: (error: unknown) => void;
    }
  | {
      eventName: WALLET_EVENT_NAME.MESSAGE;
      handler: (message: unknown) => void;
    };

export default class WalletAuro extends Wallet {
  errorList = {
    WALLET_NOT_INSTALLED: `Please install ${this.name} wallet`,
    WALLET_WRONG_CHAIN: 'You have connected to unsupported chain',
    WALLET_CONNECT_FAILED: 'Fail to connect wallet',
    WALLET_CONNECT_REJECTED: 'User rejected the request.',
    WALLET_GET_BALANCE_FAIL: "Can't get the current balance",
  };

  constructor() {
    super({
      name: WALLET_NAME.AURO,
      metadata: {
        displayName: 'Auro Wallet',
        supportedNetwork: [NETWORK_NAME.MINA],
        InjectedObject: WALLET_INJECT_OBJ.AURO,
        logo: {
          base: '/assets/logos/logo.auro.circle.svg',
          checked: '/assets/logos/logo.auro.circle.svg',
          supported: '/assets/logos/logo.auro.circle.svg',
          unchecked: '/assets/logos/logo.auro.circle.svg',
          unsupported: '/assets/logos/logo.auro.unsupported.svg',
        },
        installationURL: {
          pc: URL_INSTALL_EXTENSION.AURO,
          android: URL_INSTALL_ANDROID.AURO,
          ios: URL_INSTALL_IOS.AURO,
        },
        supportedDevices: {
          [NETWORK_TYPE.EVM]: [],
          [NETWORK_TYPE.ZK]: ['desktop'],
        },
      },
    });
  }

  get InjectedObject(): MinaProvider {
    if (IsServer) {
      throw new Error("Server rendering error");
    }
    // const auro = store.getState().walletObj.auro;
    // if (!auro.isInjected) throw new Error(this.errorList.WALLET_NOT_INSTALLED);
    // return auro.mina!!;

    if (!window || !window?.mina) {
      throw new Error(this.errorList.WALLET_NOT_INSTALLED);
    }
    return window.mina;
  }

  async handleRequestWithError<T>(
    cb: Promise<T>
  ): Promise<[MinaRequestResType<T>, null] | [null, MinaRequestErrorType<T>]> {
    try {
      return [await cb, null];
    } catch (error: unknown) {
      return [null, error as MinaRequestErrorType<T>];
    }
  }

  addListener(params: WalletAuroEvents) {
    this.InjectedObject.on(params.eventName, params.handler as any);
  }

  removeListener(eventName: WALLET_EVENT_NAME) {
    this.InjectedObject.removeAllListeners(eventName);
  }

  async connect(
    network: Network,
    onStart?: () => void,
    onFinish?: () => void,
    onError?: () => void,
    whileHandle?: () => void
  ) {
    onStart && onStart();

    const [res, error] = await this.handleRequestWithError(
      this.InjectedObject.requestAccounts()
    );

    if (error) throw error;

    if (!res || res.length === 0 || typeof res[0] === undefined) {
      throw new Error(this.errorList.WALLET_CONNECT_FAILED);
    }
    onFinish && onFinish();
    return res[0];
  }

  async createTx() {
    return '';
  }

  async signTx() {
    return '';
  }

  async sendTx(payload: any): Promise<void> {
    const [res, error] = await this.handleRequestWithError(
      this.InjectedObject.sendTransaction({ transaction: payload })
    );
    if (error) throw error;
    console.log('🚀 ~ WalletAuro ~ sendTx ~ res:', res);
  }

  async getNetwork() {
    const res = await this.InjectedObject.requestNetwork();
    // TODO: check type of old version
    // return res.name;
    return res.networkID;
  }

  async switchNetwork(network: Network): Promise<boolean> {
    const walletChainId = await this.getNetwork();
    if (walletChainId === network.metadata.chainId) return true;
    const [_, error] = await this.handleRequestWithError(
      this.InjectedObject.switchChain({
        // TODO: check type of old version
        // chainId: network.metadata.chainId.toLowerCase(),
        networkID: network.metadata.chainId.toLowerCase(),
      })
    );
    if (error) return false;
    return true;
  }

  async getBalance(
    network: Network,
    userAddr: string,
    asset: TokenType
  ): Promise<string> {
    const isNativeToken = network.nativeCurrency.symbol === asset.symbol;

    if (isNativeToken) {
      const query = getAccountInfoQuery;
      const variables = { publicKey: userAddr };
      if ('proxyUrl' in network.metadata && network.metadata.proxyUrl) {
        const [data, error] = await handleRequest(
          gql(network.metadata.proxyUrl, query, variables)
        );
        if (error || !data || !data.account) return '0';
        return formWei(data.account.balance.total, asset.decimals);
      }
    }
    throw new Error(this.errorList.WALLET_GET_BALANCE_FAIL);

    // const [ctr, initCtrError] = handleException(
    //   asset.tokenAddr,
    //   (addr) => new ERC20Contract(addr, network)
    // );
    // if (initCtrError || !ctr) return '0';
    //
    // const [blnWei, reqError] = await handleRequest(ctr.getBalance(userAddr));
    // if (reqError || !blnWei)
    //   throw new Error(this.errorList.WALLET_GET_BALANCE_FAIL);
    //
    // return formWei(blnWei!!.toString(), asset.decimals);
  }
}
