'use client';
import { Heading } from '@chakra-ui/react';
import { max } from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useRef } from 'react';
import web3 from 'web3';

import NetworkEthereum from '../../../../models/network/network.ethereum';
import { DailyQuota, useFormBridgeState } from '../context';

import ITV from '@/configs/time';
import { handleRequest } from '@/helpers/asyncHandlers';
import { formatNumber, fromWei } from '@/helpers/common';
import NetworkMina from '@/models/network/network.mina';
import usersService from '@/services/usersService';
import {
  getPreviewDQSlice,
  getWalletSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { previewDQSliceActions } from '@/store/slices/previewDailyQuotalSlice';

const initialData: DailyQuota = {
  max: '0',
  current: '0',
  asset: '',
};

const recheckInterval = ITV.M5;

export default function FormDailyQuota() {
  const { address } = useAppSelector(getWalletSlice);
  const { dailyQuota, asset } = useFormBridgeState().state;
  const { updateQuota } = useFormBridgeState().methods;
  const { previewDQs } = useAppSelector(getPreviewDQSlice);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (previewDQs.length === 0) return;
    const storeDate = 'previewDQs[0].updatedAt';
    const isNotToday = !moment(storeDate).isSame(moment(), 'day');
    if (isNotToday) {
      dispatch(previewDQSliceActions.updatePreviewDQ([]));
    }
  }, []);

  const previewDQ = useMemo(() => {
    if (!previewDQs) return 0;
    const findPreviewDQ = previewDQs.find(
      (item: { address: string }) => item.address === address
    );
    if (!findPreviewDQ) return 0;
    return Number(findPreviewDQ.value);
  }, [previewDQs, address]);

  const interval = useRef<any>(null);

  async function getDailyQuota(address: string) {
    let decimal = asset!!.decimals;

    if (web3.utils.isAddress(address)) {
      decimal = NetworkEthereum.nativeCurrency.decimals;
    } else {
      try {
        const { PublicKey } = await import('o1js');
        PublicKey.fromBase58(address).toBase58();
        decimal = NetworkMina.nativeCurrency.decimals;
      } catch (e) {}
    }

    const [res, error] = await handleRequest(
      usersService.getDailyQuota({ address })
    );
    if (error || !res) return updateQuota({ ...initialData });
    return updateQuota({
      max: formatNumber(res.dailyQuota.dailyQuota, 4),
      current: formatNumber(
        fromWei(`${res.totalAmountOfToDay}`, decimal),
        asset!!.decimals
      ),
      asset: res.dailyQuota.asset,
    });
  }

  useEffect(() => {
    if (!address || !asset) return;
    if (interval.current) clearInterval(interval.current);
    getDailyQuota(address);

    interval.current = setInterval(() => {
      getDailyQuota(address);
    }, recheckInterval);
    return () => {
      clearInterval(interval.current);
    };
  }, [address, asset]);

  return (
    address && (
      <Heading
        as={'h4'}
        variant={'h4'}
        color={'text.900'}
        mt={{ base: '15px', md: '20px' }}
        textAlign={'center'}
      >
        Daily quota {dailyQuota.max} {dailyQuota.asset} per address (
        {max([Number(dailyQuota.current), previewDQ])} {dailyQuota.asset} /{' '}
        {dailyQuota.max} {dailyQuota.asset}){' '}
        {previewDQ > Number(dailyQuota.current) && 'Pending'}
      </Heading>
    )
  );
}
