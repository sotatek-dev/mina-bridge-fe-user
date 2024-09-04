import { WALLET_NAME } from './wallet.abstract';
import WalletAuro from './wallet.auro';
import WalletMetamask from './wallet.metamask';

export type Wallet = WalletMetamask | WalletAuro;

const WALLETS: Record<WALLET_NAME, Wallet> = {
  [WALLET_NAME.METAMASK]: new WalletMetamask(),
  [WALLET_NAME.AURO]: new WalletAuro(),
};

export { WALLET_NAME } from './wallet.abstract';
export { default as WalletAuro } from './wallet.auro';
export { default as WalletMetamask } from './wallet.metamask';
export default WALLETS;
