import axiosService, { AxiosService } from './axiosService';

import { USERS_ENDPOINT } from '@/services/config';

export type SupportedPairResponse = {
  id: number;
  fromChain: string;
  fromSymbol: string;
  fromAddress: string;
  fromDecimal: number;
  fromScAddress: string;
  toChain: string;
  toSymbol: string;
  toAddress: string;
  toDecimal: number;
  toScAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
export type GetListSpPairsResponse = SupportedPairResponse[];

export type HistoryResponse = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  senderAddress: string;
  amountFrom: string;
  tokenFromAddress: string;
  networkFrom: string;
  tokenFromName: string;
  txHashLock: string;
  receiveAddress: string;
  amountReceived: string | null;
  tokenReceivedAddress: string;
  networkReceived: string;
  tokenReceivedName: string | null;
  txHashUnlock: string | null;
  blockNumber: string;
  blockTimeLock: string;
  protocolFee: string | null;
  tip: string;
  gasFee: string;
  event: string;
  returnValues: string;
  errorDetail: string | null;
  status: string;
  retry: number;
};

export type MetaDataHistory = {
  total: number;
  totalOfPages: number;
  perPage?: number;
  currentPage?: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ListHistoryResponse = {
  data: HistoryResponse[];
  meta: MetaDataHistory;
};

export type ParamHistory = {
  address: string;
  limit?: number;
  page?: number;
};

export type GetDailyQuotaResponse = {
  dailyQuota: {
    id: number;
    dailyQuota: string;
    tip: string;
    asset: string;
  };
  totalAmountOfToDay: number;
};

class UsersService {
  readonly service: AxiosService;
  readonly baseURL: string = `/users`;

  constructor() {
    this.service = axiosService;
  }

  async getListSupportedPairs() {
    const res = await this.service.get<GetListSpPairsResponse>(
      `${this.baseURL}/${USERS_ENDPOINT.SP_PAIRS}`
    );

    // TODO: remove fake data if data from BE is updated
    for (let i = 0; i < res.length; i++) {
      if (res[i].fromAddress === '0x0000000000000000000000000000000000000000') {
        process.env.NEXT_PUBLIC_ZK_WETH_TOKEN_ADDRESS &&
          (res[i].toAddress = process.env.NEXT_PUBLIC_ZK_WETH_TOKEN_ADDRESS);
        process.env.NEXT_PUBLIC_ZK_BRIDGE_CONTRACT_ADDRESS &&
          (res[i].toScAddress =
            process.env.NEXT_PUBLIC_ZK_BRIDGE_CONTRACT_ADDRESS);
      }
      if (res[i].toAddress === '0x0000000000000000000000000000000000000000') {
        process.env.NEXT_PUBLIC_ZK_WETH_TOKEN_ADDRESS &&
          (res[i].fromAddress = process.env.NEXT_PUBLIC_ZK_WETH_TOKEN_ADDRESS);
        process.env.NEXT_PUBLIC_ZK_BRIDGE_CONTRACT_ADDRESS &&
          (res[i].fromScAddress =
            process.env.NEXT_PUBLIC_ZK_BRIDGE_CONTRACT_ADDRESS);
      }
    }

    console.log('fake asset', { ...res });
    return res;
  }

  getBridgeHistory(query: ParamHistory) {
    return this.service.get<ListHistoryResponse>(
      `${this.baseURL}/${USERS_ENDPOINT.HISTORY}/${query.address}`,
      {
        params: { limit: query.limit, page: query.page },
      }
    );
  }

  getDailyQuota(query: { address: string }) {
    return this.service.get<GetDailyQuotaResponse>(
      `${this.baseURL}/${USERS_ENDPOINT.DAILY_QUOTA}/${query.address}`
    );
  }

  getProtocolFee(payload: { pairId: string | number }) {
    return this.service.post<{ gasFee: string, tipRate: string, decimal: string }>(
      `${this.baseURL}/${USERS_ENDPOINT.BRIDGE}/${USERS_ENDPOINT.PROTOCOL_FEE}`,
      {
        pairId: Number(payload.pairId),
      }
    );
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new UsersService();
