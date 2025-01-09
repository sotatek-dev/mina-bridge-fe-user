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
  deletedAt: null;
  dailyQuota: string;
  bridgeFee: string;
  mintingFee: string;
  unlockingFee: string;
  asset: string;
  totalWethMinted: string;
  totalWethBurnt: string;
  isHidden: false;
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

export type GetPriceUsdResponse = {
  ethPriceInUsd: string;
  minaPriceInUsd: string;
};

export type GetPoAResponse = {
  totalWethInCirculation: string;
};
export type GetExpectedTimesResponse = {
  receivedNetwork: string;
  completeTimeEstimated: number;
};

class UsersService {
  readonly service: AxiosService;
  readonly baseURL: string = '/users';

  constructor() {
    this.service = axiosService;
  }

  async getListSupportedPairs() {
    const res = await this.service.get<GetListSpPairsResponse>(
      `${this.baseURL}/${USERS_ENDPOINT.SP_PAIRS}`
    );
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

  getDailyQuota(query: { userAddress: string; tokenAddress: string }) {
    return this.service.get<GetDailyQuotaResponse>(
      `${this.baseURL}/${USERS_ENDPOINT.DAILY_QUOTA}/${query.userAddress}/${query.tokenAddress}`
    );
  }

  // getProtocolFee(payload: { pairId: string | number }) {
  //   return this.service.post<{
  //     gasFee: string;
  //     tipRate: string;
  //     decimal: string;
  //   }>(
  //     `${this.baseURL}/${USERS_ENDPOINT.BRIDGE}/${USERS_ENDPOINT.PROTOCOL_FEE}`,
  //     {
  //       pairId: Number(payload.pairId),
  //     }
  //   );
  // }

  getPriceUsd() {
    return this.service.get<GetPriceUsdResponse>(
      `${this.baseURL}/token/${USERS_ENDPOINT.PRICE_USD}`
    );
  }

  getProofOfAsset() {
    return this.service.get<GetPoAResponse>(
      `${this.baseURL}/${USERS_ENDPOINT.PROOF_OF_ASSETS}`
    );
  }

  getExpectedTimes(query: { network: string }) {
    return this.service.get<GetExpectedTimesResponse>(
      `${this.baseURL}/${USERS_ENDPOINT.EXPECTED_TIMES}`,
      {
        params: { receivedNetwork: query.network },
      }
    );
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new UsersService();
