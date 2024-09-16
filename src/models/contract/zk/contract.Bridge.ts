import { FungibleToken } from "mina-fungible-token";
import type { fetchAccount, Field, Mina, PublicKey, UInt64 } from "o1js";

import { Bridge } from "@/configs/ABIs/zk/Bridge";
import { handleAsync } from "@/helpers/asyncHandlers";
import { Network } from "@/models/network";

export default class BridgeContract {
  tokenAddress!: PublicKey;
  bridgeAddress!: PublicKey;
  provider!: typeof Mina;
  bridgeInstance!: Bridge;
  tokenInstance!: FungibleToken;

  constructor() {}

  async setInfo(bridgeAddress: string, tokenAddress: string, network: Network) {
    const { Mina, PublicKey } = await import('o1js');

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
    this.bridgeAddress = PublicKey.fromBase58(bridgeAddress);

    this.tokenInstance = new FungibleToken(this.tokenAddress);
    this.bridgeInstance = new Bridge(this.bridgeAddress);
  }

  static async init() {
    // const [cacheBridgeFiles] = await Promise.all([
    //   fetchFiles(ZkContractType.BRIDGE),
    // ]);
    // console.log('-----compile bridge');
    // await Bridge.compile({
    //   cache: fileSystem(cacheBridgeFiles),
    // });
  }

  async changeInstance(bridgeAddress: string, tokenAddress: string) {
    const { PublicKey } = await import('o1js');

    this.tokenAddress = PublicKey.fromBase58(tokenAddress);
    this.bridgeAddress = PublicKey.fromBase58(bridgeAddress);
    this.tokenInstance = new FungibleToken(this.tokenAddress);
    this.bridgeInstance = new Bridge(
      this.bridgeAddress,
      this.tokenInstance.tokenId
    );
  }

  async fetchInvolveAccount() {
    const { fetchAccount, PublicKey } = await import('o1js');

    console.log('-----fetch token account', this.tokenAddress.toBase58());
    await fetchAccount({ publicKey: this.tokenAddress });

    console.log('-----fetch bridge account', this.bridgeAddress.toBase58());
    await fetchAccount({ publicKey: this.bridgeAddress });

    console.log('-----fetch bridge account with token', {bridgeAddress:this.bridgeAddress.toBase58(), tokenId: this.tokenInstance.tokenId.toConstant()});
    await fetchAccount({
      publicKey: this.bridgeAddress,
      tokenId: this.tokenInstance.tokenId,
    });
  }

  async fetchMinMax() {
    const bridgeInstance = this.bridgeInstance;

    return handleAsync(null, async () => ({
      // TODO: get min and max amount
      // min: await bridgeInstance.minAmount.get(),
      // max: await bridgeInstance.maxAmount.get(),
      min: 0,
      max: 1000000
    }));
  }

  async lock(receipt: string, amount: string) {
    const { UInt64, Field } = await import('o1js');

    if (!this.bridgeInstance) return;
    return this.bridgeInstance.lock(UInt64.from(amount), Field.from(receipt), this.tokenAddress);
  }
}
