'use client';
import {
  getPersistSlice,
  getWalletInstanceSlice,
  getWalletSlice,
  useAppSelector,
} from '@/store';
import { TokenType } from '@/store/slices/persistSlice';
import { Button, HStack, Image, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useModalSTState } from '../context';
import { Wallet } from '@/models/wallet';
import { Network } from '@/models/network';
import { NumericFormat } from 'react-number-format';
import { formatNumber } from '@/helpers/common';

type Props = { data: TokenType };

export default function DisplayAsset({ data }: Props) {
  const { listIcon } = useAppSelector(getPersistSlice);
  const { asset, address } = useAppSelector(getWalletSlice);
  const { walletInstance, networkInstance } = useAppSelector(
    getWalletInstanceSlice
  );

  const { handleCloseCurModal } = useModalSTState().methods;

  const [balance, setBalance] = useState<string>('0');

  const curAssetIcon = useMemo(
    () => listIcon.find((item) => item.symbol === data.symbol),
    [listIcon, data]
  );

  const isSelected = useMemo(
    () =>
      data.symbol === asset?.symbol &&
      data.tokenAddr === asset.tokenAddr &&
      data.decimals === asset.decimals,
    [data.symbol, asset]
  );

  async function handleSelectAsset() {
    if (isSelected) return handleCloseCurModal();
  }

  async function checkBalance(
    userAddr: string,
    asset: TokenType,
    wallet: Wallet,
    network: Network
  ) {
    const res = await wallet.getBalance(network, userAddr, asset);
    setBalance(formatNumber(res, asset.decimals));
  }

  useEffect(() => {
    if (!walletInstance || !networkInstance.src || !address) return;
    checkBalance(address, data, walletInstance, networkInstance.src);
  }, [data, walletInstance, networkInstance, address]);

  return (
    <Button
      variant={'_blank'}
      onClick={handleSelectAsset}
      w={'full'}
      p={'1px !important'}
      borderRadius={'10px'}
      bg={
        isSelected
          ? 'linear-gradient(270deg, #DE622E 0%, #8271F0 100%)'
          : 'green.500'
      }
      _active={{
        boxShadow: '0 0 0 3px #8271F04D',
      }}
    >
      <HStack
        justifyContent={'flex-start'}
        w={'full'}
        px={'20px'}
        py={'17px'}
        borderRadius={'9px'}
        bg={'green.25'}
        cursor={'pointer'}
        position={'relative'}
      >
        <Image src={curAssetIcon?.icon || ''} h={'36px'} />
        <VStack gap={'0'} alignItems={'flex-start'} justifyContent={'center'}>
          <Text variant={'xl_semiBold'}>{data.symbol.toUpperCase()}</Text>
          <Text
            variant={'md'}
            textTransform={'capitalize'}
            color={'text.500'}
            lineHeight={1}
          >
            {data.name || 'ethereum'}
          </Text>
        </VStack>

        <Text variant={'xl_semiBold'} color={'primary.purple'} ml={'auto'}>
          <NumericFormat
            value={balance}
            thousandSeparator={','}
            decimalScale={4}
            decimalSeparator={'.'}
            displayType={'text'}
            renderText={(value) => value + ' '}
          />
        </Text>
        {isSelected && (
          <Image
            src={'/assets/icons/icon.checked.svg'}
            w={'20px'}
            h={'20px'}
            position={'absolute'}
            top={'3px'}
            right={'3px'}
          />
        )}
      </HStack>
    </Button>
  );
}