'use client';
import { HStack, Image, StackProps, Text, VStack } from '@chakra-ui/react';
import { capitalize } from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

import { useFormBridgeState } from '../context';

import ITV from '@/configs/time';
import { handleAsync, handleRequest } from '@/helpers/asyncHandlers';
import { formatNumber, fromWei } from '@/helpers/common';
import { Network, NETWORK_NAME } from '@/models/network';
import { NETWORK_TYPE } from '@/models/network/network';
import { useZKContractState } from '@/providers/zkBridgeInitalize';
import usersService, { GetListSpPairsResponse } from '@/services/usersService';
import {
  getPersistSlice,
  getWalletInstanceSlice,
  useAppDispatch,
  useAppSelector,
} from '@/store';
import { persistSliceActions, TokenType } from '@/store/slices/persistSlice';

type Props = { isDisplayed: boolean } & Pick<StackProps, ChakraBoxSizeProps>;

function Content({ ...props }: Omit<Props, 'isDisplayed'>) {
  const dispatch = useAppDispatch();
  const { asset, assetRange } = useFormBridgeState().state;
  const { bridgeCtr } = useFormBridgeState().constants;
  const { updateAssetRage, updateStatus } = useFormBridgeState().methods;
  const zkCtr = useZKContractState().state;
  const { networkInstance } = useAppSelector(getWalletInstanceSlice);
  const [supportedPairs, setSupportedPairs] =
    useState<GetListSpPairsResponse | null>(null);

  const { lastAsset } = useAppSelector(getPersistSlice);
  const [runCount, setRunCount] = useState<number>(0);

  const tarAsset = useMemo<TokenType | null>(() => {
    if (!supportedPairs || !networkInstance.src) {
      return null;
    }

    const pair = supportedPairs?.find(
      (v) => `${v.id}` === `${asset?.pairId || ''}`,
    );
    if (!pair) return null;

    const targetAsset: TokenType = {
      pairId: `${pair.id}`,
      bridgeCtrAddr: pair.toScAddress,
      tokenAddr: pair.toAddress,
      des: 'tar',
      symbol: pair.toSymbol.toUpperCase(),
      name: '',
      decimals: pair.toDecimal,
      network:
        pair.toChain === 'eth'
          ? NETWORK_NAME.ETHEREUM
          : pair.toChain === NETWORK_NAME.MINA
            ? NETWORK_NAME.MINA
            : NETWORK_NAME.MINA,
    };

    return targetAsset;
  }, [supportedPairs, networkInstance, asset]);

  function cacheAssetMaxMin(asset: TokenType, range: string[]) {
    dispatch(
      persistSliceActions.setLastAsset({
        asset,
        range,
        timestamp: moment.now(),
      }),
    );
  }

  // get asset min max
  async function getAssetMaxMin(nw: Network, asset: TokenType): Promise<any> {
    updateStatus('isLoading', true);
    let persistedAsset;
    // if exist last asset and it was updated within 5 minute
    if (lastAsset) {
      persistedAsset = lastAsset.find(
        (e) =>
          e.asset.pairId === asset.pairId &&
          e.asset.symbol === asset.symbol &&
          e.asset.network === asset.network,
      );
      if (persistedAsset) {
        if (
          persistedAsset.timestamp &&
          moment(moment.now()).diff(
            moment(persistedAsset.timestamp),
            'minute',
          ) <= 5
        ) {
          updateStatus('isLoading', false);
          return updateAssetRage(persistedAsset.range);
        }
      }
    }
    switch (nw.type) {
      case NETWORK_TYPE.EVM:
        if (!bridgeCtr) {
          return setTimeout(() => setRunCount((prev) => prev + 1), ITV.S1);
        }

        // update last asset if last update greater than 5 minute
        const [evmRange, evmRangeError] = await handleAsync(
          undefined,
          async () => ({
            min: await bridgeCtr.getMinAmount(),
            max: await bridgeCtr.getMaxAmount(),
          }),
        );

        // handle if have error
        if (evmRangeError || !evmRange) {
          updateStatus('isLoading', false);

          // if persist store didn't existed
          if (!lastAsset) return updateAssetRage(['0', '0']);

          // if can't find persisted record
          if (!persistedAsset) return updateAssetRage(['0', '0']);
          // if have record
          return updateAssetRage(persistedAsset.range);
        }

        // handle if success fetched
        updateStatus('isLoading', false);
        const evmRes = [
          fromWei(evmRange.min.toString(), asset.decimals),
          fromWei(evmRange.max.toString(), asset.decimals),
        ].map((e) => formatNumber(e, asset.decimals));

        cacheAssetMaxMin(asset, evmRes);
        return updateAssetRage(evmRes);

      case NETWORK_TYPE.ZK:
        // updateStatus('isLoading', false);
        // return updateAssetRage(['0', '1000']);

        if (!zkCtr.bridgeContract) {
          updateStatus('isLoading', false);
          return updateAssetRage(['0', '0']);
        }
        await zkCtr.bridgeContract.fetchInvolveAccount();

        const [zkRange, zkRangeError] =
          await zkCtr.bridgeContract.fetchMinMax();

        // handle if have error
        if (zkRangeError || !zkRange) {
          updateStatus('isLoading', false);

          // if persist store didn't existed
          if (!lastAsset) return updateAssetRage(['0', '0']);

          // if can't find persisted record
          if (!persistedAsset) return updateAssetRage(['0', '0']);
          // if have record
          return updateAssetRage(persistedAsset.range);
        }

        // handle if success fetched
        updateStatus('isLoading', false);
        const zkRes = [
          fromWei(zkRange.min.toString(), asset.decimals),
          fromWei(zkRange.max.toString(), asset.decimals),
        ].map((e) => formatNumber(e, asset.decimals));

        cacheAssetMaxMin(asset, zkRes);
        return updateAssetRage(zkRes);
      default:
        updateStatus('isLoading', false);
        return updateAssetRage(['0', '0']);
    }
  }

  useEffect(() => {
    if (runCount > 0) getAssetMaxMin(networkInstance.src!!, asset!!);
  }, [runCount]);

  // get asset max min when have network and change asset
  useEffect(() => {
    if (!networkInstance.src || !asset) return;
    if (networkInstance.src.type === NETWORK_TYPE.ZK && !zkCtr.isInitialized)
      return;
    getAssetMaxMin(networkInstance.src, asset);
  }, [networkInstance.src, asset, zkCtr.isInitialized]);

  useEffect(() => {
    (async () => {
      const [listPair, error] = await handleRequest(
        usersService.getListSupportedPairs(),
      );
      setSupportedPairs(listPair);
    })();
  }, []);

  return (
    <HStack
      alignItems={'flex-start'}
      bg={'primary.purple.06'}
      gap={'10px'}
      p={'15px 20px'}
      borderRadius={'8px'}
      {...props}
    >
      <Image src={'/assets/icons/icon.buzz.circle.purple.svg'} />
      <VStack alignItems={'flex-start'} gap={'5px'}>
        <Text variant={'md_semiBold'} color={'text.700'} pb={'5px'}>
          I want to bridge {asset?.symbol || ''} from{' '}
          {capitalize(networkInstance.src?.name)} to{' '}
          {capitalize(networkInstance?.tar?.name)} and receive{' '}
          {tarAsset?.symbol}
        </Text>
        <Text variant={'md'} color={'text.500'}>
          1. Minimum amount is {assetRange[0] || 'unknown'}{' '}
          {asset?.symbol || ''}
        </Text>
        <Text variant={'md'} color={'text.500'}>
          2. Maximum amount is {assetRange[1] || 'unknown'}{' '}
          {asset?.symbol || ''}
        </Text>
      </VStack>
    </HStack>
  );
}

export default function WarningMinMax({ isDisplayed, ...props }: Props) {
  return isDisplayed ? <Content {...props} /> : null;
}
