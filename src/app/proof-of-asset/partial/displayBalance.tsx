'use client';
import {
  Badge,
  Button,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import Web3 from 'web3';

import { handleRequest } from '@/helpers/asyncHandlers';
import { formatNumber, fromWei, truncateMid } from '@/helpers/common';
import useNotifier from '@/hooks/useNotifier';
import { Network } from '@/models/network';
import { NETWORK_NAME, NETWORK_TYPE } from '@/models/network/network';
import { getEtherAccountScan } from '@/models/network/network.ethereum';
import { getMinaAccountScan } from '@/models/network/network.mina';
import { TokenType } from '@/store/slices/persistSlice';

type Props = {
  asset: TokenType;
  network: Network;
  isLastItem?: boolean;
  // contractAddr?: string;
};

export default function DisplayBalance({
  asset,
  // contractAddr,
  network,
  isLastItem,
}: Props) {
  const { sendNotification, checkNotifyActive } = useNotifier();
  const [balance, setBalance] = useState<string>('');

  const copyNotifyRef = useRef<any>(null);

  const isNativeCurrency = useMemo(
    () => network.nativeCurrency.symbol === asset.symbol,
    [network, asset],
  );

  const dpAddress = useMemo(() => {
    const [f, l] = truncateMid(asset.bridgeCtrAddr, 7, 7);
    return f + '...' + l;
  }, [asset]);

  async function getNativeTokenBalance(addr: string) {
    switch (network.type) {
      case NETWORK_TYPE.EVM:
        const web3Instance = new Web3(
          new Web3.providers.HttpProvider(network.metadata.provider.uri),
        );

        const [res, error] = await handleRequest(
          web3Instance.eth.getBalance(addr),
        );
        if (error || !res) {
          return setBalance('0');
        }
        return setBalance(fromWei(res.toString(), asset.decimals));
      case NETWORK_TYPE.ZK:
        return setBalance('0');

      // const tokenCtr = new ERC20Contract(asset.tokenAddr);
      // const [blnWei, fetchError] = await handleRequest(
      //   tokenCtr.getBalance(addr)
      // );
      // if (fetchError || !blnWei) {
      //   return setBalance('0');
      // }
      // return setBalance(formWei(blnWei, asset.decimals));
      default:
        break;
    }
  }

  async function getERC20TokenBalance(addr: string) {
    switch (network.type) {
      case NETWORK_TYPE.EVM:
        return setBalance('0');
      case NETWORK_TYPE.ZK:
        const ERC20Module = await import('@/models/contract/zk/contract.ERC20');
        const ERC20Contract = ERC20Module.default;
        const ctr = new ERC20Contract();
        await ctr.setInfo(asset.tokenAddr, network);
        const circulating = await ctr.getCirculatingAmount();
        return setBalance(fromWei(circulating, asset.decimals));

      // return setBalance('0');
      // const tokenCtr = new ERC20Contract(asset.tokenAddr);
      // const [blnWei, fetchError] = await handleRequest(
      //   tokenCtr.getBalance(addr)
      // );
      // if (fetchError || !blnWei) {
      //   return setBalance('0');
      // }
      default:
        break;
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(asset.bridgeCtrAddr);
    if (
      copyNotifyRef.current !== null &&
      checkNotifyActive(copyNotifyRef.current)
    ) {
      return;
    }
    copyNotifyRef.current = sendNotification({
      toastType: 'success',
      options: {
        title: 'Bridge contract address copied',
      },
    });
  }

  function openNewPage() {
    let url: string = '';
    switch (asset.network) {
      case NETWORK_NAME.ETHEREUM:
        url = getEtherAccountScan(asset.bridgeCtrAddr);
        break;
      case NETWORK_NAME.MINA:
        url = getMinaAccountScan(asset.bridgeCtrAddr);
        break;
      default:
        break;
    }
    window.open(url, '_blank');
  }

  useEffect(() => {
    if (!isNativeCurrency) return;
    getNativeTokenBalance(asset.bridgeCtrAddr);
  }, [isNativeCurrency, asset.bridgeCtrAddr]);

  useEffect(() => {
    if (isNativeCurrency) return;
    getERC20TokenBalance(asset.bridgeCtrAddr);
  }, [isNativeCurrency, asset.bridgeCtrAddr]);

  return (
    <HStack
      w={'full'}
      {...(!isLastItem
        ? {
            borderBottom: '1px solid',
            borderColor: 'text.200',
            pb: '20px',
            mb: '20px',
          }
        : {})}
    >
      <VStack alignItems={'flex-start'} mr={'auto'} gap={'4px'}>
        {balance && (
          <Text variant={'xl_semiBold'} color={'text.900'}>
            {/*<NumericFormat*/}
            {/*  value={balance}*/}
            {/*  thousandSeparator={','}*/}
            {/*  decimalScale={4}*/}
            {/*  decimalSeparator={'.'}*/}
            {/*  displayType={'text'}*/}
            {/*  renderText={(value) => value + ' '}*/}
            {/*/>*/}
            {`${formatNumber(balance, asset.decimals, BigNumber.ROUND_DOWN)} ${asset.symbol}`}
          </Text>
        )}

        <Flex
          flexDir={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'flex-start', md: 'center' }}
          gap={'8px'}
        >
          <Text variant={'md'} color={'text.500'} lineHeight={1}>
            {dpAddress}
          </Text>
          <Badge>
            <Text
              as={'span'}
              variant={'sm_semiBold'}
              textTransform={'capitalize'}
              lineHeight={1}
              color={'text.0'}
            >
              {isNativeCurrency ? 'Native' : network.name}
            </Text>
          </Badge>
        </Flex>
      </VStack>
      <Button
        variant={'icon.orange.solid'}
        w={'40px'}
        h={'40px'}
        onClick={handleCopy}
      >
        <Image
          src={'assets/icons/icon.copy.orange.svg'}
          w={'22px'}
          h={'22px'}
        />
      </Button>
      <Button
        variant={'icon.orange.solid'}
        w={'40px'}
        h={'40px'}
        onClick={openNewPage}
      >
        <Image
          src={'assets/icons/icon.redirect.orange.svg'}
          w={'22px'}
          h={'22px'}
        />
      </Button>
    </HStack>
  );
}
