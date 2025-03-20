import axiosService, { AxiosService } from './axiosService';
import { PROOF_ENDPOINT } from './config';

export enum EJobStatus {
  STARTED = 'started',
  FINISHED = 'finished',
  FAILED = 'failed',
}

export type ProveTxParams = {
  tokenAddress: string;
  address: string;
  amount: string;
};

export type ProveTxResponse = {
  success: boolean;
  jobId: string;
};

export type ProveCheckedResponse = {
  jobId: string;
  jobStatus: EJobStatus;
  result: string;
};

class ProofService {
  readonly service: AxiosService;
  readonly baseURL: string = '/proof';

  constructor() {
    this.service = axiosService;
  }

  proveTx(params: ProveTxParams) {
    return this.service.post<ProveTxResponse>(
      `${this.baseURL}/${PROOF_ENDPOINT.USER_LOCK}`,
      {},
      { params },
    );
  }

  checkProve({ jobId }: { jobId: string }) {
    return this.service.get<ProveCheckedResponse>(
      `${this.baseURL}/${PROOF_ENDPOINT.USER_LOCK_CHECK_JOB}/${jobId}`,
    );
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new ProofService();
