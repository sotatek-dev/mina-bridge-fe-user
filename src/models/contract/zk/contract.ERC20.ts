'use client';
import { FungibleToken } from 'mina-fungible-token';
import type { Mina, PublicKey } from 'o1js';

import { Bridge } from '@/configs/ABIs/zk/Bridge';
import { ZkContractType } from '@/configs/constants';
import { gql } from '@/grapql';
import { getAccountInfoTokenQuery } from '@/grapql/queries';
import { handleRequest } from '@/helpers/asyncHandlers';
import { fetchFiles, fileSystem } from '@/helpers/common';
import { Network } from '@/models/network';

export default class ERC20Contract {
  tokenAddress!: PublicKey;
  contractInstance!: FungibleToken | null;
  provider!: typeof Mina;
  hooks!: PublicKey;
  network!: Network;

  constructor() {}

  async setInfo(tokenAddress: string, network: Network) {
    const { Mina, PublicKey } = await import('o1js');
    this.network = network;
    if ('proxyUrl' in network.metadata && network.metadata.proxyUrl) {
      Mina.setActiveInstance(
        Mina.Network({
          mina: network.metadata.proxyUrl,
          archive:
            network.metadata.archiveUrl ||
            'https://api.minascan.io/archive/berkeley/v1/graphql/',
        })
      );
    }
    this.provider = Mina;
    this.tokenAddress = PublicKey.fromBase58(tokenAddress);
    this.contractInstance = new FungibleToken(this.tokenAddress);
  }

  static async init() {
    try {
      console.log('-----fetch files');
      console.time('fetch files');
      const [cacheTokenFiles, cacheBridgeFiles] = await Promise.all([
        fetchFiles(ZkContractType.TOKEN),
        fetchFiles(ZkContractType.BRIDGE),
      ]);
      console.log('-----fetch files done');
      console.timeEnd('fetch files');
      console.time('compile contracts');

      console.log('-----compile contracts Bridge');
      await Bridge.compile({
        cache: fileSystem(cacheBridgeFiles),
      });
      console.log('-----compile contracts FungibleToken');

      await FungibleToken.compile({
        cache: fileSystem(cacheTokenFiles),
      });
      console.log('-----compile contracts done');
      console.timeEnd('compile contracts');
    } catch (error) {
      console.log('error', error);
    }
  }

  async changeInstance(tokenAddress: string) {
    const { PublicKey } = await import('o1js');
    this.tokenAddress = PublicKey.fromBase58(tokenAddress);
    this.contractInstance = new FungibleToken(this.tokenAddress);
  }

  async fetchInvolveAccount(userAddr: string, bridgeAddress: string) {
    const { fetchAccount, PublicKey } = await import('o1js');
    console.log('-----fetch user account', userAddr);
    await fetchAccount({ publicKey: PublicKey.fromBase58(userAddr) });

    console.log('-----fetch token account', this.tokenAddress.toBase58());
    await fetchAccount({ publicKey: this.tokenAddress });

    console.log('-----fetch bridge account', bridgeAddress);
    console.log('bridgeAddress', this.contractInstance);
    await fetchAccount({
      publicKey: PublicKey.fromBase58(bridgeAddress),
    });

    console.log('-----fetch bridge account with token', {bridgeAddress, tokenId: this.contractInstance!!.tokenId.toConstant()});
    await fetchAccount({
      publicKey: PublicKey.fromBase58(bridgeAddress),
      tokenId: this.contractInstance!!.tokenId,
    });
  }

  async getBalance(userAddr: string) {
    const { TokenId, PublicKey } = await import('o1js');

    // Direct access to mina gql
    const query = getAccountInfoTokenQuery;
    const params = {
      publicKey: userAddr,
      token: TokenId.toBase58(TokenId.derive(this.tokenAddress)),
    };

    if ('proxyUrl' in this.network.metadata && this.network.metadata.proxyUrl) {
      const [data, error] = await handleRequest(
        gql(this.network.metadata.proxyUrl, query, params)
      );
      if (error || !data || !data.account) return '0';
      return data.account.balance.total;
    }
    return '0';

    // using o1js function
    // if (!this.contractInstance) return;

    // const [account, error] = handleException(userAddr, PublicKey.fromBase58);
    // if (error || !account) return;

    // await fetchAccount({
    //   publicKey: account,
    //   tokenId: this.contractInstance.token.id,
    // });
    // return this.provider
    //   .getBalance(account, this.contractInstance.token.id)
    //   .toString();
  }

  // lock(receipt: string, bridgeAddr: string, amount: string) {
  //   if (!this.contractInstance) return;
  //   console.log('-------tx payload', receipt, amount);

  //   this.contractInstance.lock(
  //     Field.from(receipt),
  //     PublicKey.fromBase58(bridgeAddr),
  //     UInt64.from(amount)
  //   );
  // }
}
