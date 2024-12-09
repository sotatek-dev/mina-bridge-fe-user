import { useEffect, useRef } from 'react';

import ITV from '@/configs/time';
import { getWalletObjSlice, useAppDispatch, useAppSelector } from '@/store';
import { walletObjSliceActions } from '@/store/slices/walletObjSlice';

const maxIntervalPeriod = 5000;

export default function useWeb3Injected() {
  const dispatch = useAppDispatch();
  const { metamask, auro } = useAppSelector(getWalletObjSlice);
  const interval = useRef<any>(null);
  const intervalPeriod = useRef<number>(0);

  // Multi inject provider (Metamask / Trust wallet / ...)
  useEffect(() => {
    window.addEventListener('eip6963:announceProvider', (event: any) => {
      const provider = event.detail.provider;

      if (provider.isMetaMask) {
        console.log('🚀 ~ Exist metamask inject provider!');
        dispatch(walletObjSliceActions.injectMetamask({ ethereum: provider }));
      }
      if (provider.isTrust) {
        console.log('🚀 ~ Exist trustwallet inject provider!');
        // Using trustwallet inject provider
      }
    });

    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }, []);

  //   Detecting web3 or ethereum injected
  useEffect(() => {
    interval.current = setInterval(() => {
      intervalPeriod.current += ITV.MS1;
      // if (window.ethereum) {
      //   dispatch(
      //     walletObjSliceActions.injectMetamask({ ethereum: window.ethereum })
      //   );
      // }
      if (window.mina) {
        dispatch(walletObjSliceActions.injectMina({ mina: window.mina }));
      }
      if (intervalPeriod.current === maxIntervalPeriod) {
        clearInterval(interval.current);
        interval.current = null;
      }
    }, ITV.MS1);
    return () => {
      clearInterval(interval.current);
    };
  }, []);

  //   clearInterval if injected
  useEffect(() => {
    if (metamask.isInjected && auro.isInjected && interval.current)
      clearInterval(interval.current);
  }, [metamask.isInjected, auro.isInjected]);

  return;
}
