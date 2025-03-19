'use client';
import { Heading, VStack } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import web3 from 'web3';

import NetworkEthereum from '../../../../models/network/network.ethereum';
import { DailyQuota, useFormBridgeState } from '../context';

import ITV from '@/configs/time';
import { handleRequest } from '@/helpers/asyncHandlers';
import { formatNumber, fromWei } from '@/helpers/common';
import { NETWORK_NAME } from '@/models/network';
import NetworkMina from '@/models/network/network.mina';
import usersService from '@/services/usersService';
import { getWalletSlice, useAppSelector } from '@/store';

const initialData: DailyQuota = {
  max: '0',
  systemMax: '0',
  current: '0',
  systemCurrent: '0',
  asset: '',
};

const recheckInterval = ITV.M5;

export default function FormDailyQuota() {
  const { address, asset: currentAsset } = useAppSelector(getWalletSlice);
  const { dailyQuota, asset } = useFormBridgeState().state;
  const { updateQuota } = useFormBridgeState().methods;

  const interval = useRef<any>(null);

  async function getDailyQuota(address: string) {
    if (!asset) return;
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
      usersService.getDailyQuota({
        userAddress: address,
        tokenAddress: asset?.tokenAddr,
        // TODO: develop
        // address,
        // network: asset?.network === NETWORK_NAME.ETHEREUM ? 'eth' : 'mina',
        // token: asset?.tokenAddr || '',
      }),
    );
    if (error || !res) return updateQuota({ ...initialData });

    return updateQuota({
      max: formatNumber(res?.dailyQuotaPerAddress, 4),
      systemMax: formatNumber(res?.dailyQuotaSystem, 4),
      current: formatNumber(res?.curUserQuota, 4),
      systemCurrent: formatNumber(res?.curSystemQuota, 4),
      asset: asset?.symbol || '',
    });
  }

  useEffect(() => {
    if (!address || !asset) return;
    if (interval.current) clearInterval(interval.current);

    const isEthereumNetwork =
      web3.utils.isAddress(address) && asset?.network === NETWORK_NAME.ETHEREUM;
    const isMinaNetwork =
      !web3.utils.isAddress(address) && asset?.network === NETWORK_NAME.MINA;
    if (isEthereumNetwork || isMinaNetwork) getDailyQuota(address);

    interval.current = setInterval(() => {
      getDailyQuota(address);
    }, recheckInterval);
    return () => {
      clearInterval(interval.current);
    };
  }, [address, asset]);

  return (
    address && (
      <VStack gap={0}>
        <Heading
          as={'h4'}
          variant={'h4'}
          color={'text.900'}
          mt={{ base: '15px', md: '20px' }}
          textAlign={'center'}
        >
          Daily quota
        </Heading>
        <Heading
          as={'h4'}
          variant={'h4'}
          color={'text.900'}
          textAlign={'center'}
        >
          {dailyQuota.max} {dailyQuota.asset} per address ({dailyQuota.current}{' '}
          {dailyQuota.asset} / {dailyQuota.max} {dailyQuota.asset})
        </Heading>
        <Heading
          as={'h4'}
          variant={'h4'}
          color={'text.900'}
          textAlign={'center'}
        >
          {dailyQuota.systemMax} {dailyQuota.asset} system-wide (
          {dailyQuota.systemCurrent} {dailyQuota.asset} / {dailyQuota.systemMax}{' '}
          {dailyQuota.asset})
        </Heading>
      </VStack>
    )
  );
}
