import { MetaMaskInpageProvider } from "@metamask/providers";
import MinaProvider from "@aurowallet/mina-provider";

declare global {
  interface Window{
    ethereum?: MetaMaskInpageProvider;
    mina?: MinaProvider;
  }
}
