'use client';
import { useCallback, useEffect, useRef } from 'react';
import Web3 from 'web3';

import { initPagingDataState, useHistoryState } from '../context';

import { handleException, handleRequest } from '@/helpers/asyncHandlers';
import { NETWORK_NAME } from '@/models/network';
import usersService from '@/services/usersService';
import { getWalletSlice, useAppSelector } from '@/store';

const recheckInterval = Number(process.env.NEXT_PUBLIC_INTERVAL_HISTORY);

export default function useHistoryLogic() {
  const { methods, state } = useHistoryState();
  const { address, networkName } = useAppSelector(getWalletSlice);

  const interval = useRef<any>(null);

  const getListHistory = useCallback(
    async (address: string, page: number) => {
      let addressArg = '';

      if (networkName.src === NETWORK_NAME.MINA) {
        addressArg = address;
      }
      if (networkName.src === NETWORK_NAME.ETHEREUM) {
        const [emitVal, evmError] = handleException(
          address,
          Web3.utils.toChecksumAddress
        );
        if (evmError) {
          methods.updateMetaData(initPagingDataState.pagingData);
          methods.updateData(initPagingDataState.data);
          return;
        }
        addressArg = emitVal!!;
      }
      const param = {
        address: addressArg,
        page,
        limit: 10,
      };

      const [res, error] = await handleRequest(
        usersService.getBridgeHistory(param)
      );
      if (error) {
        methods.updateMetaData(initPagingDataState.pagingData);
        methods.updateData(initPagingDataState.data);
      }
      methods.updateMetaData(res!!.meta);
      methods.updateData(res!!.data);
    },
    [methods, networkName]
  );

  useEffect(() => {
    if (!address || !state.pagingData.currentPage) {
      methods.updateMetaData(initPagingDataState.pagingData);
      methods.updateData([]);
      return;
    }
    if (interval.current) clearInterval(interval.current);
    getListHistory(address, state.pagingData.currentPage);

    interval.current = setInterval(() => {
      getListHistory(address, state.pagingData.currentPage!!);
    }, recheckInterval);
    return () => {
      clearInterval(interval.current);
    };
  }, [address, state.pagingData.currentPage]);
}
